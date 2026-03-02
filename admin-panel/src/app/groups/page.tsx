"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Shield, Search, Mail, Phone, Wallet, LayoutGrid, RotateCcw, X, History } from "lucide-react";
import Link from 'next/link';
import api from "@/lib/api";

type Group = {
    id: number;
    name: string;
    short_description: string;
    icon_url: string;
    is_public: boolean;
    email: string;
    whatsapp: string;
    wallet_balance: string;
    member_count: number;
    created_at: string;
};

export default function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedEditGroup, setSelectedEditGroup] = useState<Group | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Manage Members State
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
    const [groupMembers, setGroupMembers] = useState<any[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);

    // Topup History State
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [topupHistory, setTopupHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        short_description: "",
        description: "",
        email: "",
        whatsapp: "",
        is_public: true
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/groups');
            if (res.data.success) {
                setGroups(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch groups", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchTopupHistory = async (groupId: number) => {
        setLoadingHistory(true);
        setSelectedGroupId(groupId);
        setShowHistoryModal(true);
        setTopupHistory([]);
        try {
            const res = await api.get(`/admin/groups/${groupId}/topups`);
            if (res.data.success) {
                setTopupHistory(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch topup history", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const fetchGroupMembers = async (groupId: number) => {
        setLoadingMembers(true);
        setSelectedGroupId(groupId);
        setShowMembersModal(true);
        try {
            const res = await api.get(`/admin/groups/${groupId}/members`);
            if (res.data.success) {
                setGroupMembers(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch group members", err);
        } finally {
            setLoadingMembers(false);
        }
    };

    const handleRoleChange = async (groupId: number, userId: number, newRole: 'MEMBER' | 'MODERATOR') => {
        try {
            const res = await api.put(`/admin/groups/${selectedGroupId}/members/${userId}/role`, { role: newRole });

            if (res.data.success) {
                // Optimistically update UI
                setGroupMembers(prev => prev.map(m => m.id === userId ? { ...m, role: newRole } : m));
            }
        } catch (err) {
            console.error("Failed to toggle role", err);
            alert("Failed to update user role.");
        }
    };

    const openCreateModal = () => {
        setEditMode(false);
        setFormData({ name: "", short_description: "", description: "", email: "", whatsapp: "", is_public: true });
        setShowCreateModal(true);
    };

    const openEditModal = (group: Group) => {
        setEditMode(true);
        setSelectedEditGroup(group);
        setFormData({
            name: group.name,
            short_description: group.short_description || "",
            description: "", // Description is typically in details, let's keep it empty or fetch if needed
            email: group.email || "",
            whatsapp: group.whatsapp || "",
            is_public: group.is_public
        });
        setShowCreateModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editMode && selectedEditGroup) {
                const res = await api.put(`/admin/groups/${selectedEditGroup.id}`, formData);
                if (res.data.success) {
                    setShowCreateModal(false);
                    fetchGroups();
                }
            } else {
                const res = await api.post('/admin/groups', formData);
                if (res.data.success) {
                    setShowCreateModal(false);
                    setFormData({ name: "", short_description: "", description: "", email: "", whatsapp: "", is_public: true });
                    fetchGroups();
                }
            }
        } catch (error) {
            console.error("Failed to save group", error);
            alert("Failed to save group. Please check your inputs.");
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (val: string) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(parseFloat(val));
    };

    const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                        <LayoutGrid className="w-8 h-8 text-indigo-600" />
                        Enterprise Groups
                    </h2>
                    <p className="text-slate-500 mt-1">Manage public/private groups, assign moderators, and control wallets.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5" />
                    Create New Group
                </button>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search groups..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    />
                </div>
                <div className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-bold text-slate-600">
                    Total Groups: {groups.length}
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                </div>
            ) : filteredGroups.length === 0 ? (
                <div className="bg-white border text-center border-slate-200 rounded-[24px] p-16 shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <Users className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No Groups Found</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mt-2">Create an enterprise level group to allow specialized communities to form and bet together.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredGroups.map(group => (
                        <div key={group.id} className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden group hover:border-indigo-200 transition-all flex flex-col h-full">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shrink-0">
                                        <Users className="w-7 h-7 text-indigo-600" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openEditModal(group)}
                                            className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${group.is_public ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                            {group.is_public ? 'Public' : 'Private'}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 line-clamp-1" title={group.name}>{group.name}</h3>
                                <p className="text-sm font-medium text-slate-500 mt-1 line-clamp-2 min-h-[40px]">{group.short_description || "No description provided."}</p>

                                <div className="mt-6 flex flex-col gap-2">
                                    {group.email && (
                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                            <Mail className="w-3.5 h-3.5 text-slate-400" /> <span className="truncate">{group.email}</span>
                                        </div>
                                    )}
                                    {group.whatsapp && (
                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/50">
                                            <Phone className="w-3.5 h-3.5 text-emerald-500" /> <span className="truncate">{group.whatsapp}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Members</p>
                                    <p className="text-lg font-black text-slate-900 flex items-center gap-1.5"><Shield className="w-4 h-4 text-slate-400" /> {group.member_count}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Wallet</p>
                                    <p className="text-lg font-black text-emerald-600 truncate" title={formatCurrency(group.wallet_balance)}>
                                        {formatCurrency(group.wallet_balance)}
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 bg-white border-t border-slate-100 flex flex-col gap-2">
                                <div className="flex gap-2">
                                    <Link href={`/groups/${group.id}/wallet`} className="flex-1">
                                        <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-sm transition-colors">
                                            <Wallet className="w-4 h-4" /> Fund Wallet
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => fetchGroupMembers(group.id)}
                                        className="flex-1 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-sm transition-colors text-center flex items-center justify-center gap-2">
                                        <Shield className="w-4 h-4" /> Manage Members
                                    </button>
                                </div>
                                <button
                                    onClick={() => fetchTopupHistory(group.id)}
                                    className="w-full px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl text-sm transition-colors text-center flex items-center justify-center gap-2 mt-1">
                                    <History className="w-4 h-4" /> Top-Up History
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
                    <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">{editMode ? 'Edit Group' : 'Create New Group'}</h2>
                                    <p className="text-slate-500 text-sm font-medium mt-1">Configure your enterprise Teer community.</p>
                                </div>
                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                                    <LayoutGrid className="w-6 h-6 text-indigo-600" />
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-700">Group Name <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-900 outline-none" placeholder="e.g. Shillong VIP Syndicate"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-700">Short Description</label>
                                    <input
                                        type="text"
                                        maxLength={100}
                                        value={formData.short_description}
                                        onChange={e => setFormData({ ...formData, short_description: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900 outline-none" placeholder="A brief catchphrase..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-slate-700">Support Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900 outline-none" placeholder="contact@vip.com"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-slate-700 font-orbitron">WhatsApp Direct Link</label>
                                        <input
                                            type="text"
                                            value={formData.whatsapp}
                                            onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900 outline-none" placeholder="https://wa.me/919999999999"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="is_public"
                                        checked={formData.is_public}
                                        onChange={e => setFormData({ ...formData, is_public: e.target.checked })}
                                        className="w-5 h-5 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="is_public" className="text-sm font-bold text-slate-700 cursor-pointer">
                                        Public Group <span className="text-slate-500 font-medium ml-1">(Anyone can join)</span>
                                    </label>
                                </div>

                                <div className="pt-6 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
                                    >
                                        {submitting ? 'Saving...' : (editMode ? 'Update Group' : 'Create Group')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Members Modal */}
            {showMembersModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowMembersModal(false)} />
                    <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">Manage Members</h2>
                                <p className="text-slate-500 text-sm font-medium mt-1">View and change roles for group members.</p>
                            </div>
                            <button onClick={() => setShowMembersModal(false)} className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full flex items-center justify-center transition-colors shrink-0">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 md:p-8 overflow-y-auto bg-slate-50/50">
                            {loadingMembers ? (
                                <div className="flex justify-center p-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                </div>
                            ) : groupMembers.length === 0 ? (
                                <p className="text-center text-slate-500 font-medium py-8 bg-white rounded-2xl border border-slate-100 shadow-sm">No members found in this group.</p>
                            ) : (
                                <div className="space-y-3">
                                    {groupMembers.map(member => (
                                        <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-200 transition-colors gap-3 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                                                    {member.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-900 truncate">@{member.username}</p>
                                                    <p className="text-xs text-slate-500 truncate">{member.email}</p>
                                                </div>
                                            </div>
                                            <div className="shrink-0">
                                                <select
                                                    value={member.role}
                                                    onChange={(e) => handleRoleChange(selectedGroupId!, member.id, e.target.value as 'MEMBER' | 'MODERATOR')}
                                                    className={`px-4 py-2 rounded-xl text-sm font-bold border outline-none appearance-none cursor-pointer pr-10 bg-white ${member.role === 'MODERATOR' ? 'text-indigo-700 border-indigo-200 shadow-[0_0_0_2px_rgba(99,102,241,0.1)]' : 'text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                                                >
                                                    <option value="MEMBER">Member</option>
                                                    <option value="MODERATOR">Moderator</option>
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Topup History Modal */}
            {showHistoryModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowHistoryModal(false)} />
                    <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-4xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2"><History className="w-6 h-6 text-indigo-500" /> Moderator Top-Up Ledger</h2>
                                <p className="text-slate-500 text-sm font-medium mt-1">Audit trail of all funds transferred by moderators to users in this group.</p>
                            </div>
                            <button onClick={() => setShowHistoryModal(false)} className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full flex items-center justify-center transition-colors shrink-0">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 md:p-8 overflow-y-auto bg-slate-50/50">
                            {loadingHistory ? (
                                <div className="flex justify-center p-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                </div>
                            ) : topupHistory.length === 0 ? (
                                <div className="text-center bg-white border border-slate-200 rounded-[24px] p-16 shadow-sm">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                        <Wallet className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">No Top-Ups Found</h3>
                                    <p className="text-slate-500 max-w-sm mx-auto mt-2">Moderators in this group haven't transferred any funds to users yet.</p>
                                </div>
                            ) : (
                                <div className="bg-white border text-left border-slate-200 rounded-[24px] shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-100">
                                                    <th className="px-6 py-4 font-bold tracking-wider text-slate-500 uppercase text-xs">Date</th>
                                                    <th className="px-6 py-4 font-bold tracking-wider text-slate-500 uppercase text-xs">Transaction ID</th>
                                                    <th className="px-6 py-4 font-bold tracking-wider text-slate-500 uppercase text-xs">Moderator</th>
                                                    <th className="px-6 py-4 font-bold tracking-wider text-slate-500 uppercase text-xs">Target User</th>
                                                    <th className="px-6 py-4 font-bold tracking-wider text-slate-500 uppercase text-xs text-right">Amount (₹)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {topupHistory.map(tx => (
                                                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                                                            {new Date(tx.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-400">
                                                            {tx.transaction_id}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                                                                <Shield className="w-3 h-3" /> @{tx.moderator_username}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-700">
                                                            @{tx.target_username}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right font-black text-emerald-600">
                                                            ₹{parseFloat(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
