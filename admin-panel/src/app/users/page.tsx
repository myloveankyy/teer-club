"use client";

import { useState, useEffect } from 'react';
import { Users, Search, Ban, ShieldAlert, ShieldCheck, ShieldBan, Trash2, MoreVertical, Eye, Clock, Wallet, History, Network } from 'lucide-react';
import api from '@/lib/api';

type User = {
    id: number;
    username: string;
    email: string;
    status: 'ACTIVE' | 'BLOCKED' | 'BANNED' | 'DEACTIVATED';
    reputation: number;
    profile_picture: string | null;
    created_at: string;
};

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users');
            if (res.data.success) {
                setUsers(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch users', err);
            setError('Failed to load users. Ensure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAction = async (id: number, action: 'ACTIVE' | 'BLOCKED' | 'BANNED' | 'DELETE') => {
        setActionLoading(id);
        setOpenMenuId(null);
        try {
            if (action === 'DELETE') {
                if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
                    setActionLoading(null);
                    return;
                }
                await api.delete(`/admin/users/${id}`);
                setUsers(prev => prev.filter(u => u.id !== id));
            } else {
                await api.put(`/admin/users/${id}/action`, { status: action });
                setUsers(prev => prev.map(u => u.id === id ? { ...u, status: action } : u));
            }
        } catch (err) {
            console.error('Failed to perform action', err);
            alert('Failed to update user. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    const fetchUserDetails = async (id: number) => {
        setDetailLoading(true);
        setIsModalOpen(true);
        setOpenMenuId(null);
        try {
            const res = await api.get(`/admin/users/${id}/details`);
            if (res.data.success) {
                setSelectedUser(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch user details', err);
            alert('Failed to load user details.');
        } finally {
            setDetailLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'BANNED': return 'bg-rose-50 text-rose-600 border-rose-200';
            case 'BLOCKED': return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'DEACTIVATED': return 'bg-slate-50 text-slate-600 border-slate-200';
            default: return 'bg-slate-50 text-slate-600 border-slate-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ACTIVE': return <ShieldCheck className="w-3.5 h-3.5" />;
            case 'BANNED': return <ShieldBan className="w-3.5 h-3.5" />;
            case 'BLOCKED': return <ShieldAlert className="w-3.5 h-3.5" />;
            default: return <Ban className="w-3.5 h-3.5" />;
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                        <Users className="w-8 h-8 text-blue-600" />
                        User Management
                    </h2>
                    <p className="text-slate-500 mt-1">Monitor, block, and manage registered players and forum members.</p>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-100 flex items-center font-medium">
                    {error}
                </div>
            )}

            {/* Controls */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by username or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    />
                </div>
                <div className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-bold text-slate-600 whitespace-nowrap">
                    Total: {users.length}
                </div>
            </div>

            {/* DataGrid */}
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100 hidden md:table-row">
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 rounded-tl-[24px]">User</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Reputation</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Joined</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right rounded-tr-[24px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                        <p className="mt-4 text-sm">Loading user database...</p>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-16 text-center">
                                        <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
                                            <Users className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900">No users found</h3>
                                        <p className="text-sm text-slate-500 mt-1">Could not find any matching accounts.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors flex flex-col md:table-row py-4 md:py-0 border-b md:border-b-0 relative group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden shadow-md border-2 border-white">
                                                    <img
                                                        src={user.profile_picture || '/default-avatar.png'}
                                                        alt={user.username}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{user.username}</p>
                                                    <p className="text-xs text-slate-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">
                                                {user.reputation} pts
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(user.status)}`}>
                                                {getStatusIcon(user.status)}
                                                {user.status}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm font-medium text-slate-600">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="relative inline-block text-left">
                                                <button
                                                    onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                                                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                                    disabled={actionLoading === user.id}
                                                >
                                                    {actionLoading === user.id ? (
                                                        <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                                                    ) : (
                                                        <MoreVertical className="w-5 h-5" />
                                                    )}
                                                </button>

                                                {/* Action Dropdown Menu */}
                                                {openMenuId === user.id && (
                                                    <div className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-20 overflow-hidden divide-y divide-slate-100 border border-slate-100">
                                                        <div className="p-1.5">
                                                            <button
                                                                onClick={() => fetchUserDetails(user.id)}
                                                                className="w-full text-left px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 group"
                                                            >
                                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                                    <Eye className="w-4 h-4" />
                                                                </div>
                                                                View Full Profile
                                                            </button>
                                                        </div>
                                                        <div className="p-1.5">
                                                            {user.status !== 'ACTIVE' && (
                                                                <button
                                                                    onClick={() => handleAction(user.id, 'ACTIVE')}
                                                                    className="w-full text-left px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 rounded-xl flex items-center gap-2"
                                                                >
                                                                    <ShieldCheck className="w-4 h-4" /> Unban / Activate
                                                                </button>
                                                            )}
                                                            {user.status !== 'BLOCKED' && (
                                                                <button
                                                                    onClick={() => handleAction(user.id, 'BLOCKED')}
                                                                    className="w-full text-left px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 rounded-xl flex items-center gap-2"
                                                                >
                                                                    <ShieldAlert className="w-4 h-4" /> Block Account
                                                                </button>
                                                            )}
                                                            {user.status !== 'BANNED' && (
                                                                <button
                                                                    onClick={() => handleAction(user.id, 'BANNED')}
                                                                    className="w-full text-left px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 rounded-xl flex items-center gap-2"
                                                                >
                                                                    <ShieldBan className="w-4 h-4" /> Ban User
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="p-1.5 bg-slate-50">
                                                            <button
                                                                onClick={() => handleAction(user.id, 'DELETE')}
                                                                className="w-full text-left px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-100 rounded-xl flex items-center gap-2"
                                                            >
                                                                <Trash2 className="w-4 h-4" /> Delete Permanently
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Click outside to close dropdown mask */}
            {openMenuId && (
                <div
                    className="fixed inset-0 z-10"
                    onClick={() => setOpenMenuId(null)}
                />
            )}

            {/* Profile Detail Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        {detailLoading ? (
                            <div className="p-20 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-4 font-bold text-slate-500">Retrieving Deep Intelligence...</p>
                            </div>
                        ) : selectedUser ? (
                            <div className="flex flex-col h-full overflow-hidden">
                                {/* Modal Header */}
                                <div className="p-8 pb-0 flex items-start justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-3xl shadow-xl overflow-hidden border-4 border-white">
                                            <img
                                                src={selectedUser.user.profile_picture || '/default-avatar.png'}
                                                alt={selectedUser.user.username}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black text-slate-900">{selectedUser.user.username}</h3>
                                            <p className="text-slate-500 font-medium">{selectedUser.user.email} • ID: {selectedUser.user.id}</p>
                                            <div className="flex gap-2 mt-2">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(selectedUser.user.status)}`}>
                                                    {selectedUser.user.status}
                                                </span>
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                                                    Joined {new Date(selectedUser.user.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                                        <Trash2 className="w-6 h-6 text-slate-300" />
                                    </button>
                                </div>

                                <div className="p-8 flex-1 overflow-y-auto no-scrollbar grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {/* Column 1: Profile & Bio */}
                                    <div className="space-y-6">
                                        <section>
                                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <ShieldCheck className="w-3.5 h-3.5" /> Identity & Bio
                                            </h4>
                                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                                <p className="text-sm text-slate-700 leading-relaxed italic">
                                                    "{selectedUser.user.bio || "No professional bio set."}"
                                                </p>
                                            </div>
                                        </section>

                                        <section>
                                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <Wallet className="w-3.5 h-3.5" /> Financial Health
                                            </h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                                                    <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Balance</p>
                                                    <p className="text-xl font-black text-emerald-700">₹{Number(selectedUser.user.wallet_balance).toLocaleString()}</p>
                                                </div>
                                                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                                                    <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Reputation</p>                                                    <p className="text-xl font-black text-blue-700">{selectedUser.user.reputation} XP</p>
                                                </div>
                                            </div>
                                        </section>
                                    </div>

                                    {/* Column 2: Connections (Social Graph) */}
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Network className="w-3.5 h-3.5" /> Social Network (L1-L5)
                                        </h4>
                                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                                            {selectedUser.connections.length === 0 ? (
                                                <p className="text-center py-10 text-slate-400 text-xs font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">No network growth detected.</p>
                                            ) : (
                                                selectedUser.connections.map((conn: any) => (
                                                    <div key={conn.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 group">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 overflow-hidden">
                                                                <img
                                                                    src={conn.profile_picture || '/default-avatar.png'}
                                                                    alt={conn.username}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-900">{conn.username}</p>
                                                                <p className="text-[9px] text-slate-400">Joined {new Date(conn.created_at).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <span className="px-2 py-0.5 rounded bg-blue-600 text-[8px] font-black text-white">LVL {conn.level}</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Column 3: Activity Log */}
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5" /> Intelligence Feed
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Recent Transactions</p>
                                                <div className="space-y-2">
                                                    {selectedUser.activity.transactions.slice(0, 5).map((tx: any) => (
                                                        <div key={tx.id} className="flex items-center justify-between text-[11px]">
                                                            <span className="font-medium text-slate-600 truncate max-w-[120px]">{tx.description}</span>
                                                            <span className={tx.amount > 0 ? "font-bold text-emerald-600" : "font-bold text-rose-600"}>
                                                                {tx.amount > 0 ? "+" : ""} ₹{Math.abs(tx.amount)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Recent Predictions</p>
                                                <div className="space-y-2">
                                                    {selectedUser.activity.bets.slice(0, 5).map((bet: any) => (
                                                        <div key={bet.id} className="flex items-center justify-between text-[11px]">
                                                            <span className="font-bold text-slate-900">{bet.game_type} [{bet.number}]</span>
                                                            <span className="font-medium text-slate-400">₹{bet.amount}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-20 text-center text-rose-500 font-bold">Failed to load user intelligence.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

