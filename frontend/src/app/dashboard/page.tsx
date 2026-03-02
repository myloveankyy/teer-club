'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

import { Wallet, Activity, History, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, XCircle, Gift, User as UserIcon, Shield, Target } from 'lucide-react';
import api from '@/lib/api';

// Types
type User = {
    username: string;
    email: string;
    wallet_balance: string;
    profile_picture: string | null;
};

type Bet = {
    id: number;
    game_type: string;
    round: string;
    number: string;
    amount: string;
    status: 'PENDING' | 'WON' | 'LOST';
    created_at: string;
};

type Transaction = {
    id: number;
    amount: string;
    type: string;
    status: string;
    description: string;
    created_at: string;
};

type TopupHistory = {
    id: number;
    transaction_id: string;
    amount: string;
    group_name: string;
    target_username: string;
    created_at: string;
};

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<'pending' | 'history' | 'ledger' | 'moderator'>('pending');

    const [pendingBets, setPendingBets] = useState<Bet[]>([]);
    const [historyBets, setHistoryBets] = useState<Bet[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [moderatorTopups, setModeratorTopups] = useState<TopupHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');
    const [depositUtr, setDepositUtr] = useState('');
    const [depositLoading, setDepositLoading] = useState(false);
    const [depositMsg, setDepositMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch User Profile
                const profileRes = await api.get('/auth/me');
                if (!profileRes.data.success) throw new Error('Not logged in');
                setUser(profileRes.data.user);

                // Fetch Pending Bets
                const pendingRes = await api.get('/bets/me?status=PENDING');
                setPendingBets(pendingRes.data.data || []);

                // Fetch Settled Bets
                const historyRes = await api.get('/bets/me?status=SETTLED');
                setHistoryBets(historyRes.data.data || []);

                // Fetch Wallet Ledger
                const ledgerRes = await api.get('/transactions/me');
                setTransactions(ledgerRes.data.data || []);

                // Fetch Moderator Ledger (Fails silently if not a mod, but endpoint just returns empty array usually)
                try {
                    const modRes = await api.get('/transactions/moderator-history');
                    setModeratorTopups(modRes.data.data || []);
                } catch (e) {
                    console.error('Failed to load mod history', e);
                }

            } catch (err) {
                console.error('Failed to load dashboard:', err);
                router.push('/login'); // Redirect to login if unauthorized
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [router]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-IN', {
            month: 'short', day: 'numeric',
            hour: 'numeric', minute: '2-digit', hour12: true
        });
    };

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        setDepositLoading(true);
        setDepositMsg(null);
        try {
            const res = await api.post('/finance/deposit', { amount: parseFloat(depositAmount), utr_number: depositUtr });
            if (res.data.success) {
                setDepositMsg({ type: 'success', text: res.data.message || 'Request submitted! Funds will be credited after verification.' });
                setDepositAmount('');
                setDepositUtr('');
            }
        } catch (err: any) {
            setDepositMsg({ type: 'error', text: err.response?.data?.error || 'Failed to submit deposit request.' });
        } finally {
            setDepositLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <main className="min-h-screen bg-slate-50 pb-[100px] md:pb-12 text-slate-800 font-sans">
            {/* Header removed as it is now global */}

            <div className="max-w-4xl mx-auto px-4 md:px-8 mt-6">

                {/* Profile & Wallet Hero Card */}
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[24px] p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-900/20 mb-8 border border-white/10">
                    <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl pointer-events-none">
                        <Wallet className="w-48 h-48 rotate-12" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 overflow-hidden backdrop-blur-md">
                                <img
                                    src={user.profile_picture || '/default-avatar.png'}
                                    alt={user.username}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
                                />
                            </div>
                            <div>
                                <p className="text-indigo-200 font-medium text-sm mb-1 uppercase tracking-wider">Player Account</p>
                                <h1 className="text-3xl tracking-tight font-extrabold text-white">@{user.username}</h1>
                                <p className="text-indigo-300 opacity-80 text-sm mt-0.5">{user.email}</p>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 md:min-w-[200px]">
                            <p className="text-indigo-200 font-medium text-xs uppercase tracking-wide mb-1">Available Balance</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold opacity-80">₹</span>
                                <span className="text-4xl font-black tracking-tight">{Number(user.wallet_balance).toLocaleString('en-IN')}</span>
                            </div>
                            <button
                                onClick={() => setShowDepositModal(true)}
                                className="w-full mt-4 bg-white text-indigo-900 font-bold py-2.5 rounded-xl hover:bg-indigo-50 transition-colors text-sm"
                            >
                                Deposit Funds
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dashboard Navigation Tabs */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2 border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-bold transition-colors whitespace-nowrap ${activeTab === 'pending' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                            }`}
                    >
                        <Clock className="w-4 h-4" /> Active Bets
                        <span className="bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs shrink-0 ml-1">{pendingBets.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-bold transition-colors whitespace-nowrap ${activeTab === 'history' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                            }`}
                    >
                        <History className="w-4 h-4" /> Bet History
                    </button>
                    <button
                        onClick={() => setActiveTab('ledger')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-bold transition-colors whitespace-nowrap ${activeTab === 'ledger' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                            }`}
                    >
                        <Activity className="w-4 h-4" /> Wallet Ledger
                    </button>
                    {moderatorTopups.length > 0 && (
                        <button
                            onClick={() => setActiveTab('moderator')}
                            className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-bold transition-colors whitespace-nowrap ${activeTab === 'moderator' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                                }`}
                        >
                            <Shield className="w-4 h-4" /> Moderator Ledger
                        </button>
                    )}
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[400px]">

                    {/* Active Bets Tab */}
                    {activeTab === 'pending' && (
                        <div className="p-6">
                            {pendingBets.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Target className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-700">No Active Bets</h3>
                                    <p className="text-slate-500 mt-1">Place a wager on the Live page to see it here.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {pendingBets.map(bet => (
                                        <div key={bet.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center font-black text-2xl text-indigo-600 tracking-tighter">
                                                    {bet.number.padStart(2, '0')}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-slate-800">{bet.game_type}</span>
                                                        <span className="text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                                                            {bet.round}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-500 font-medium">{formatDate(bet.created_at)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center gap-1 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    Wager
                                                </div>
                                                <span className="font-bold text-lg text-slate-800 font-mono">₹{parseFloat(bet.amount).toFixed(0)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Bet History Tab */}
                    {activeTab === 'history' && (
                        <div className="p-6">
                            {historyBets.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <History className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-700">No Settled Bets</h3>
                                    <p className="text-slate-500 mt-1">Your graded wagers will appear here after results are drawn.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {historyBets.map(bet => (
                                        <div key={bet.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border ${bet.status === 'WON' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
                                                    }`}>
                                                    {bet.number.padStart(2, '0')}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-slate-800 block">{bet.game_type}</span>
                                                    <span className="text-xs text-slate-500">{formatDate(bet.created_at)}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {bet.status === 'WON' ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-sm font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3" /> WON
                                                        </span>
                                                        <span className="font-bold text-emerald-700 mt-1">+{parseFloat(bet.amount) * 80}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-sm font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded flex items-center gap-1">
                                                            <XCircle className="w-3 h-3" /> LOST
                                                        </span>
                                                        <span className="font-bold text-red-700 mt-1">-₹{parseFloat(bet.amount)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Wallet Ledger Tab */}
                    {activeTab === 'ledger' && (
                        <div className="p-6">
                            {transactions.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-slate-500">No transactions recorded yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {transactions.map(trx => (
                                        <div key={trx.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${trx.description.includes('ADMIN_GIFT') ? 'bg-indigo-100 text-indigo-600' :
                                                    parseFloat(trx.amount) > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                                    }`}>
                                                    {trx.description.includes('ADMIN_GIFT') ? <Gift className="w-4 h-4" /> :
                                                        parseFloat(trx.amount) > 0 ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">{trx.description}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{trx.type}</span>
                                                        <span className="text-xs text-slate-400">•</span>
                                                        <span className="text-xs text-slate-400">{formatDate(trx.created_at)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="shrink-0 text-right pl-4">
                                                <span className={`font-bold font-mono ${parseFloat(trx.amount) > 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                                                    {parseFloat(trx.amount) > 0 ? '+' : ''}₹{Math.abs(parseFloat(trx.amount)).toFixed(0)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Moderator Top-Up Ledger Tab */}
                    {activeTab === 'moderator' && (
                        <div className="p-6">
                            {moderatorTopups.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Shield className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-700">No Top-Ups Yet</h3>
                                    <p className="text-slate-500 mt-1">You haven&apos;t transferred funds to any users yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {moderatorTopups.map(tx => (
                                        <div key={tx.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className="mt-0.5 w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                                    <Shield className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        <span className="font-bold text-slate-800 text-sm">Topped Up User:</span>
                                                        <span className="text-sm font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">@{tx.target_username}</span>
                                                    </div>

                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200">{tx.transaction_id}</span>
                                                        <span className="text-xs text-slate-400">•</span>
                                                        <span className="text-xs text-slate-400 font-medium">{formatDate(tx.created_at)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="shrink-0 text-left md:text-right pl-14 md:pl-4 border-t border-slate-100 md:border-t-0 pt-3 md:pt-0 mt-3 md:mt-0">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-0.5 mt-1">Amount Sent</span>
                                                <span className="font-bold font-mono text-xl text-emerald-600">
                                                    ₹{parseFloat(tx.amount).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>

            {/* Deposit Modal */}
            {showDepositModal && (
                <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center px-4 pb-4">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => { setShowDepositModal(false); setDepositMsg(null); }}
                    />
                    <div className="relative z-10 w-full max-w-sm bg-white rounded-[28px] p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">Deposit Funds</h3>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">Pay via UPI & submit UTR for verification</p>
                            </div>
                            <button
                                onClick={() => { setShowDepositModal(false); setDepositMsg(null); }}
                                className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>

                        {depositMsg ? (
                            <div className={`rounded-2xl p-4 mb-4 text-sm font-medium ${depositMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                                {depositMsg.text}
                            </div>
                        ) : null}

                        <form onSubmit={handleDeposit} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 block mb-1.5">Amount (₹)</label>
                                <input
                                    type="number"
                                    min="50"
                                    required
                                    value={depositAmount}
                                    onChange={e => setDepositAmount(e.target.value)}
                                    placeholder="e.g. 500"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 block mb-1.5">UPI UTR / Reference No.</label>
                                <input
                                    type="text"
                                    required
                                    value={depositUtr}
                                    onChange={e => setDepositUtr(e.target.value)}
                                    placeholder="12-digit UTR number"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                            </div>
                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-700 font-medium">
                                Pay to UPI: <strong>teer.club@upi</strong> → Submit UTR after payment. Verified within 30 min.
                            </div>
                            <button
                                type="submit"
                                disabled={depositLoading}
                                className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {depositLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                                {depositLoading ? 'Submitting...' : 'Submit Deposit Request'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </main >
    );
}
