'use client';

import { useState, useEffect } from 'react';
import { Gift, Search, AlertCircle, CheckCircle2, Send, ShieldCheck, User as UserIcon, Loader2 } from 'lucide-react';
import api from '@/lib/api';

type ResolvedUser = {
    id: number;
    username: string;
    status: string;
    created_at: string;
} | null;

export default function RewardsPage() {
    const [username, setUsername] = useState('');
    const [debouncedUsername, setDebouncedUsername] = useState('');
    const [resolvedUser, setResolvedUser] = useState<ResolvedUser>(null);
    const [isResolving, setIsResolving] = useState(false);
    const [resolveError, setResolveError] = useState('');

    const [amount, setAmount] = useState<number | ''>('');
    const [message, setMessage] = useState('');

    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const presetAmounts = [100, 500, 1000, 5000];

    // Debounce username input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedUsername(username);
        }, 600);
        return () => clearTimeout(handler);
    }, [username]);

    // Resolve User via API (UPI Style)
    useEffect(() => {
        const resolveUser = async () => {
            if (!debouncedUsername.trim()) {
                setResolvedUser(null);
                setResolveError('');
                return;
            }

            setIsResolving(true);
            setResolveError('');
            setResolvedUser(null);
            setErrorMsg('');
            setSuccessMsg('');

            try {
                const res = await api.get(`/admin/users/${debouncedUsername.trim()}/resolve`);
                if (res.data.success) {
                    setResolvedUser(res.data.data);
                }
            } catch (err: any) {
                if (err.response?.status === 404) {
                    setResolveError('User not found. Please check spelling.');
                } else {
                    setResolveError('Error verifying user.');
                }
            } finally {
                setIsResolving(false);
            }
        };

        resolveUser();
    }, [debouncedUsername]);

    const handleGift = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (!resolvedUser || resolvedUser.status !== 'ACTIVE') {
            setErrorMsg('Cannot dispatch funds. Target user is invalid or not active.');
            return;
        }

        if (!amount || amount <= 0) {
            setErrorMsg('Please select a valid injection amount.');
            return;
        }

        const isConfirmed = window.confirm(`Are you sure you want to instantly inject ₹${amount} into @${resolvedUser.username}'s wallet?`);
        if (!isConfirmed) return;

        setLoading(true);
        try {
            const res = await api.post('/admin/gifts/user', {
                username: resolvedUser.username,
                amount: Number(amount),
                message: message.trim() || undefined
            });

            if (res.data.success) {
                setSuccessMsg(`Successfully credited ₹${amount} to @${resolvedUser.username}. Transaction Ref: ${res.data.data.transaction_ref}`);
                setUsername('');
                setAmount('');
                setMessage('');
                setResolvedUser(null);
            }
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.response?.data?.error || 'Failed to process gift transaction.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Gift className="w-8 h-8 text-indigo-500" />
                        Moderator Gifts & Rewards
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm font-medium">Instantly inject promotional wallet funds directly to a user account bypassing standard deposits.</p>
                </div>
            </div>

            {/* Main Action Card */}
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 bg-gradient-to-br from-indigo-50/50 to-white border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-indigo-600" /> Secure Dispatch
                        </h2>
                        <p className="text-slate-500 text-sm">Select a verified user and amount to execute an atomic wallet injection.</p>
                    </div>
                </div>

                <form onSubmit={handleGift} className="p-6 md:p-8 space-y-8">

                    {errorMsg && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 animate-in fade-in zoom-in-95 duration-200">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-bold">{errorMsg}</p>
                        </div>
                    )}

                    {successMsg && (
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3 text-emerald-600 animate-in fade-in zoom-in-95 duration-200">
                            <CheckCircle2 className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-bold">{successMsg}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Target User */}
                        <div className="space-y-3 relative">
                            <label className="text-sm font-bold text-slate-700 tracking-wide uppercase">Target Receiver <span className="text-red-500">*</span></label>

                            <div className="relative group">
                                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${resolvedUser ? 'text-emerald-500' : resolveError ? 'text-red-400' : 'text-slate-400'}`} />
                                <input
                                    type="text"
                                    placeholder="e.g. teer_guru"
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                        if (e.target.value === '') {
                                            setResolvedUser(null);
                                            setResolveError('');
                                        }
                                    }}
                                    className={`w-full pl-11 pr-12 py-3 bg-slate-50 border-2 rounded-xl text-slate-900 font-bold focus:outline-none focus:bg-white transition-all ${isResolving ? 'border-indigo-300'
                                            : resolvedUser ? 'border-emerald-400 focus:border-emerald-500 ring-4 ring-emerald-500/10'
                                                : resolveError ? 'border-red-300 focus:border-red-400 ring-4 ring-red-500/10'
                                                    : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                                        }`}
                                    required
                                />
                                {isResolving && (
                                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500 animate-spin" />
                                )}
                                {!isResolving && resolvedUser && (
                                    <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                                )}
                            </div>

                            {/* Receiver Info Card (UPI Style) */}
                            {resolvedUser && (
                                <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl shadow-sm flex items-center gap-4 animate-in slide-in-from-top-2 fade-in duration-200 z-10">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200">
                                        <UserIcon className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-900">@{resolvedUser.username}</span>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${resolvedUser.status === 'ACTIVE' ? 'bg-emerald-200 text-emerald-800' : 'bg-red-200 text-red-800'}`}>
                                                {resolvedUser.status}
                                            </span>
                                        </div>
                                        <span className="text-xs font-medium text-slate-500 mt-0.5">Verified Teer Club Member</span>
                                    </div>
                                </div>
                            )}

                            {resolveError && !isResolving && username.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-red-50 border border-red-200 rounded-xl shadow-sm flex items-center gap-3 animate-in fade-in duration-200 z-10">
                                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                                    <span className="text-xs font-bold text-red-700">{resolveError}</span>
                                </div>
                            )}

                        </div>

                        {/* Amount */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700 tracking-wide uppercase">Injection Amount (₹) <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold transition-colors ${amount ? 'text-emerald-600' : 'text-slate-400'}`}>₹</span>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="0"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value) || '')}
                                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-bold text-lg focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-8"></div> {/* Spacer for absolute cards above */}

                    {/* Quick Chips */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-500">Quick Select Amount</label>
                        <div className="flex flex-wrap gap-2">
                            {presetAmounts.map(preset => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setAmount(preset)}
                                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all border ${amount === preset
                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                                        }`}
                                >
                                    + ₹{preset}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Message */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700 tracking-wide uppercase">Internal Memo (Optional)</label>
                        <input
                            type="text"
                            placeholder="e.g. VIP Referral Bonus"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-[13px] font-semibold text-slate-500 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            Transactions are final and logged system-wide.
                        </p>
                        <button
                            type="submit"
                            disabled={loading || !resolvedUser || isResolving || resolvedUser.status !== 'ACTIVE' || !amount}
                            className={`w-full md:w-auto px-10 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${loading || !resolvedUser || isResolving || resolvedUser.status !== 'ACTIVE' || !amount
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-600/30'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Dispatch Funds
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>

        </div>
    );
}
