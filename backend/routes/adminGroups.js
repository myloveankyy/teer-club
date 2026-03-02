const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// @route   GET /api/admin/groups
// @desc    Get all groups and their current wallet balances
// @access  Private (Admin Only)
router.get('/', async (req, res) => {
    try {
        const groupsRes = await db.query(`
            SELECT id, name, short_description, icon_url, is_public, email, whatsapp, wallet_balance, created_at
            FROM groups
            ORDER BY created_at DESC
        `);

        // Get member counts
        const memberCounts = await db.query(`
            SELECT group_id, COUNT(*) as count 
            FROM group_members 
            GROUP BY group_id
        `);

        const memberMap = {};
        memberCounts.rows.forEach(r => {
            memberMap[r.group_id] = parseInt(r.count, 10);
        });

        const groups = groupsRes.rows.map(g => ({
            ...g,
            member_count: memberMap[g.id] || 0
        }));

        res.json({ success: true, count: groups.length, data: groups });
    } catch (err) {
        console.error('Error fetching groups:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   POST /api/admin/groups
// @desc    Create a new group
// @access  Private (Admin Only)
router.post('/', async (req, res) => {
    try {
        const { name, short_description, description, icon_url, is_public, email, whatsapp, adminUsername = 'Admin' } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, error: 'Group name is required' });
        }

        const newGroup = await db.query(`
            INSERT INTO groups (name, short_description, description, icon_url, is_public, email, whatsapp)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [name, short_description, description, icon_url, is_public, email, whatsapp]);

        // Audit Log
        await db.query(`
            INSERT INTO admin_logs (username, action, status, device_info)
            VALUES ($1, $2, $3, $4)
        `, [adminUsername, `CREATED_GROUP_${newGroup.rows[0].id}_(${name})`, 'SUCCESS', req.headers['user-agent'] || 'Unknown']);

        res.json({ success: true, message: 'Group created successfully', data: newGroup.rows[0] });

    } catch (err) {
        console.error('Error creating group:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   POST /api/admin/groups/:id/recharge
// @desc    Manually recharge a group's wallet balance
// @access  Private (Admin Only)
router.post('/:id/recharge', async (req, res) => {
    const client = await db.connect();
    try {
        const { id } = req.params;
        const { amount, adminUsername = 'Admin' } = req.body;

        const rechargeAmount = parseFloat(amount);
        if (isNaN(rechargeAmount) || rechargeAmount <= 0 || rechargeAmount > 100000) {
            return res.status(400).json({ success: false, error: 'Invalid recharge amount (must be between 1 and 100,000)' });
        }

        await client.query('BEGIN');

        // Check group exists
        const groupRes = await client.query('SELECT name, wallet_balance FROM groups WHERE id = $1 FOR UPDATE', [id]);
        if (groupRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, error: 'Group not found' });
        }

        const groupName = groupRes.rows[0].name;

        // Generate unique receipt ID (TRX-TIMESTAMP-RANDOM)
        const receiptId = `TRX-${Date.now()}-${uuidv4().substring(0, 6).toUpperCase()}`;

        // 1. Insert into group_recharges
        await client.query(`
            INSERT INTO group_recharges (group_id, amount, receipt_id)
            VALUES ($1, $2, $3)
        `, [id, rechargeAmount, receiptId]);

        // 2. Update groups wallet_balance
        const updateRes = await client.query(`
            UPDATE groups 
            SET wallet_balance = wallet_balance + $1 
            WHERE id = $2 
            RETURNING wallet_balance
        `, [rechargeAmount, id]);

        const newBalance = updateRes.rows[0].wallet_balance;

        // 3. Audit Log
        await client.query(`
            INSERT INTO admin_logs (username, action, status, device_info)
            VALUES ($1, $2, $3, $4)
        `, [adminUsername, `RECHARGED_GROUP_${id}_(${groupName})_WALLET_BY_${rechargeAmount}_(RECEIPT:${receiptId})`, 'SUCCESS', req.headers['user-agent'] || 'Unknown']);

        await client.query('COMMIT');

        res.json({
            success: true,
            message: `Successfully recharged ₹${rechargeAmount} to ${groupName}`,
            receipt_id: receiptId,
            new_balance: newBalance
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error recharging wallet:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    } finally {
        client.release();
    }
});

// @route   GET /api/admin/groups/:id/recharges
// @desc    Get the recharge transaction history for a specific group
// @access  Private (Admin Only)
router.get('/:id/recharges', async (req, res) => {
    try {
        const { id } = req.params;

        const historyRes = await db.query(`
            SELECT id, amount, receipt_id, created_at 
            FROM group_recharges 
            WHERE group_id = $1 
            ORDER BY created_at DESC
        `, [id]);

        res.json({ success: true, count: historyRes.rows.length, data: historyRes.rows });
    } catch (err) {
        console.error('Error fetching recharge history:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   GET /api/admin/groups/:id/members
// @desc    Get all members of a specific group
// @access  Private (Admin Only)
router.get('/:id/members', async (req, res) => {
    try {
        const { id } = req.params;
        const membersRes = await db.query(`
            SELECT u.id, u.username, u.email, gm.role, gm.joined_at
            FROM group_members gm
            JOIN users u ON gm.user_id = u.id
            WHERE gm.group_id = $1
            ORDER BY u.username ASC
        `, [id]);

        res.json({ success: true, count: membersRes.rows.length, data: membersRes.rows });
    } catch (err) {
        console.error('Error fetching group members:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   PUT /api/admin/groups/:id/members/:userId/role
// @desc    Toggle a user's role between MEMBER and MODERATOR
// @access  Private (Admin Only)
router.put('/:id/members/:userId/role', async (req, res) => {
    try {
        const { id, userId } = req.params;
        const { role, adminUsername = 'Admin' } = req.body;

        if (role !== 'MEMBER' && role !== 'MODERATOR') {
            return res.status(400).json({ success: false, error: 'Invalid role. Must be MEMBER or MODERATOR.' });
        }

        const updateRes = await db.query(`
            UPDATE group_members
            SET role = $1
            WHERE group_id = $2 AND user_id = $3
            RETURNING *
        `, [role, id, userId]);

        if (updateRes.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'User is not a member of this group.' });
        }

        // Audit Log
        await db.query(`
            INSERT INTO admin_logs (username, action, status, device_info)
            VALUES ($1, $2, $3, $4)
        `, [adminUsername, `UPDATED_USER_${userId}_TO_${role}_IN_GROUP_${id}`, 'SUCCESS', req.headers['user-agent'] || 'Unknown']);

        res.json({ success: true, message: `User role updated to ${role}` });

    } catch (err) {
        console.error('Error updating member role:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   GET /api/admin/groups/:id/topups
// @desc    Get top-up history made by moderators for a specific group
// @access  Private (Admin Only)
router.get('/:id/topups', async (req, res) => {
    try {
        const { id } = req.params;
        const historyRes = await db.query(`
            SELECT 
                gt.id, gt.transaction_id, gt.amount, gt.created_at,
                m.username as moderator_username,
                u.username as target_username
            FROM group_topups gt
            JOIN users m ON gt.moderator_id = m.id
            JOIN users u ON gt.user_id = u.id
            WHERE gt.group_id = $1
            ORDER BY gt.created_at DESC
        `, [id]);

        res.json({ success: true, count: historyRes.rows.length, data: historyRes.rows });
    } catch (err) {
        console.error('Error fetching group topup history:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   PUT /api/admin/groups/:id
// @desc    Update group details
// @access  Private (Admin Only)
router.put('/:id', async (req, res) => {
    console.log(`[AdminGroups] PUT received for ID: ${req.params.id}`);
    try {
        const { id } = req.params;
        const groupId = parseInt(id, 10);
        if (isNaN(groupId)) {
            return res.status(400).json({ success: false, error: 'Invalid Group ID' });
        }
        const { name, short_description, description, icon_url, is_public, email, whatsapp, adminUsername = 'Admin' } = req.body;

        const updateRes = await db.query(`
            UPDATE groups
            SET name = $1, short_description = $2, description = $3, icon_url = $4, is_public = $5, email = $6, whatsapp = $7
            WHERE id = $8
            RETURNING *
        `, [name, short_description, description, icon_url, is_public, email, whatsapp, groupId]);

        if (updateRes.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Group not found' });
        }

        // Audit Log
        await db.query(`
            INSERT INTO admin_logs (username, action, status, device_info)
            VALUES ($1, $2, $3, $4)
        `, [adminUsername, `UPDATED_GROUP_${id}_(${name})`, 'SUCCESS', req.headers['user-agent'] || 'Unknown']);

        res.json({ success: true, message: 'Group updated successfully', data: updateRes.rows[0] });

    } catch (err) {
        console.error('Error updating group:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
