'use client';

import { useState, useEffect } from 'react';
import { Shield, Wallet, Search, ArrowRight, Building2, UserCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ModeratorHub() {
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Transfer State
    const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Active Transfer
    const [recipient, setRecipient] = useState<any | null>(null);
    const [transferAmount, setTransferAmount] = useState('');
    const [isTransferring, setIsTransferring] = useState(false);

    useEffect(() => {
        fetchModGroups();
    }, []);

    const fetchModGroups = async () => {
        try {
            const res = await fetch('/api/moderator/groups');
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setGroups(data.groups);
                }
            }
        } catch (error) {
            console.error("Failed to fetch mod groups", error);
        } finally {
            setLoading(false);
        }
    };

    // Debounced Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setIsSearching(true);
                try {
                    const res = await fetch(`/api/moderator/users/search?q=${encodeURIComponent(searchQuery)}`);
                    if (res.ok) {
                        const data = await res.json();
                        setSearchResults(data.users || []);
                    }
                } catch (e) {
                    console.error("Search failed", e);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGroup || !recipient || !transferAmount) return;

        setIsTransferring(true);
        try {
            const res = await fetch(`/api/moderator/groups/${selectedGroup.id}/transfer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiverId: recipient.id,
                    amount: transferAmount
                })
            });
            const data = await res.json();

            if (data.success) {
                alert(data.message); // Successful toast alternative
                // Reset flow & refresh
                setRecipient(null);
                setSearchQuery('');
                setTransferAmount('');
                fetchModGroups(); // Get updated wallet balance
                setSelectedGroup(null);
            } else {
                alert(data.message || 'Transfer failed');
            }
        } catch (err) {
            console.error(err);
            alert("Network error.");
        } finally {
            setIsTransferring(false);
        }
    };

    const formatCurrency = (val: string | number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(val));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (groups.length === 0) {
        return (
            <div className="min-h-[80vh] bg-slate-50 p-6 flex items-center justify-center">
                <div className="bg-white max-w-md w-full p-8 rounded-3xl border border-slate-200 shadow-xl text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-8 h-8 text-slate-400" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Access Denied</h2>
                    <p className="text-slate-500 font-medium mb-8">You have not been assigned as a Moderator to any community groups.</p>
                    <Link href="/groups">
                        <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all">
                            Return to Groups
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20 pt-6 px-4 md:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-[32px] p-8 md:p-12 relative overflow-hidden shadow-2xl shadow-indigo-900/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl -mr-32 -mt-32 opacity-20"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500 rounded-full blur-3xl -ml-32 -mb-32 opacity-20"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-1.5">
                                    <Shield className="w-3.5 h-3.5 text-indigo-300" />
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Moderator Protocol</span>
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Delegation Hub</h1>
                            <p className="text-indigo-200 font-medium mt-2 max-w-md line-clamp-2 leading-relaxed">
                                Manage your assigned community groups, oversee members, and strictly delegate group funds to active players.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Groups Grid */}
                <div>
                    <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-indigo-600" /> Assigned Territories
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {groups.map(group => (
                            <div key={group.id} className="bg-white border border-slate-200 rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group h-full">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center shrink-0">
                                            <Shield className="w-6 h-6 text-indigo-600" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 line-clamp-1">{group.name}</h3>

                                    <div className="mt-6 p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Available Group Funds</p>
                                        <p className="text-2xl font-black text-emerald-600 tracking-tight">{formatCurrency(group.wallet_balance)}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <button
                                        onClick={() => { setSelectedGroup(group); setRecipient(null); setSearchQuery(''); }}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-600/20">
                                        Distribute Funds <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Transfer Section Modal / Expansion */}
                {selectedGroup && (
                    <div className="fixed inset-0 z-50 flex flex-col md:items-center md:justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-white w-full max-w-xl flex-1 md:flex-none md:rounded-[32px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                            {/* Modal Header */}
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-600">
                                <div className="text-white">
                                    <p className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-1">Distributing From</p>
                                    <h3 className="text-xl font-black">{selectedGroup.name}</h3>
                                </div>
                                <button onClick={() => setSelectedGroup(null)} className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 flex-1 overflow-y-auto space-y-6">
                                {/* Group Balance Readout */}
                                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                    <span className="font-bold text-slate-500">Available Balance:</span>
                                    <span className="font-black text-xl text-emerald-600">{formatCurrency(selectedGroup.wallet_balance)}</span>
                                </div>

                                {!recipient ? (
                                    /* User Search Phase */
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Search user by exact username..."
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                                className="w-full bg-white border-2 border-slate-200 pl-12 pr-4 py-4 rounded-xl font-bold focus:border-indigo-600 focus:ring-0 outline-none transition-colors"
                                            />
                                            {isSearching && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            {searchResults.map(user => (
                                                <div key={user.id}
                                                    onClick={() => setRecipient(user)}
                                                    className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-indigo-600 hover:bg-indigo-50 cursor-pointer transition-colors group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-slate-100 group-hover:bg-indigo-100 rounded-full flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                                                            <UserCircle2 className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900">@{user.username}</p>
                                                            <p className="text-xs font-semibold text-slate-500">Reputation: {user.reputation}</p>
                                                        </div>
                                                    </div>
                                                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                                </div>
                                            ))}
                                            {searchQuery.length > 1 && searchResults.length === 0 && !isSearching && (
                                                <p className="text-center text-slate-500 font-medium py-8">No matching active users found.</p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    /* Transfer Phase */
                                    <form onSubmit={handleTransfer} className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                                        <div className="flex items-center justify-between p-4 rounded-2xl border border-indigo-100 bg-indigo-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-sm">
                                                    <UserCircle2 className="w-7 h-7" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Sending To</p>
                                                    <p className="font-black text-slate-900 text-lg">@{recipient.username}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setRecipient(null)}
                                                className="text-indigo-600 hover:text-indigo-800 text-sm font-bold underline"
                                            >Change</button>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Amount to Transfer (₹)</label>
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                max={selectedGroup.wallet_balance}
                                                value={transferAmount}
                                                onChange={e => setTransferAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full bg-white border-2 border-slate-200 px-4 py-4 rounded-xl font-black text-3xl text-slate-900 focus:border-emerald-500 focus:ring-0 outline-none transition-colors"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isTransferring || !transferAmount}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-lg py-4 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                                        >
                                            {isTransferring ? (
                                                <div className="w-6 h-6 border-4 border-emerald-200 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <Wallet className="w-5 h-5" /> Confirm Transfer
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
