'use client';

import { useState, useEffect } from 'react';
import { Wallet, CheckCircle2, XCircle, Clock, RefreshCw, IndianRupee, Landmark, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

type WithdrawalRequest = {
    id: number;
    amount: string;
    status: string;
    admin_note: string | null;
    created_at: string;
    username: string;
    email: string;
    bank_name: string | null;
    account_holder_name: string | null;
    account_number: string | null;
    ifsc_code: string | null;
};

type DepositRequest = {
    id: number;
    amount: string;
    utr_number: string | null;
    status: string;
    admin_note: string | null;
    created_at: string;
    username: string;
    email: string;
};

export default function FinancePage() {
    const [activeTab, setActiveTab] = useState<'withdrawals' | 'deposits'>('withdrawals');
    const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
    const [deposits, setDeposits] = useState<DepositRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionNote, setActionNote] = useState('');
    const [processingId, setProcessingId] = useState<number | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [wRes, dRes] = await Promise.all([
                api.get('/admin/finance/withdrawals'),
                api.get('/admin/finance/deposits')
            ]);
            setWithdrawals(wRes.data.data || []);
            setDeposits(dRes.data.data || []);
        } catch (err) {
            toast.error('Failed to fetch finance data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleWithdrawal = async (id: number, action: 'approve' | 'reject') => {
        setProcessingId(id);
        try {
            const res = await api.put(`/admin/finance/withdrawals/${id}/${action}`, { admin_note: actionNote });
            toast.success(res.data.message || `Withdrawal ${action}d successfully`);
            setActionNote('');
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.error || `Failed to ${action} withdrawal`);
        } finally {
            setProcessingId(null);
        }
    };

    const handleDeposit = async (id: number, action: 'approve' | 'reject') => {
        setProcessingId(id);
        try {
            const res = await api.put(`/admin/finance/deposits/${id}/${action}`, { admin_note: actionNote });
            toast.success(res.data.message || `Deposit ${action}d successfully`);
            setActionNote('');
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.error || `Failed to ${action} deposit`);
        } finally {
            setProcessingId(null);
        }
    };

    const statusBadge = (status: string) => {
        switch (status) {
            case 'PENDING': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100"><Clock className="w-2.5 h-2.5" /> Pending</span>;
            case 'APPROVED': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100"><CheckCircle2 className="w-2.5 h-2.5" /> Approved</span>;
            case 'REJECTED': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-100"><XCircle className="w-2.5 h-2.5" /> Rejected</span>;
            default: return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">{status}</span>;
        }
    };

    const pendingCount = (arr: any[]) => arr.filter(x => x.status === 'PENDING').length;

    return (
        <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                            <Wallet className="w-5 h-5 text-emerald-600" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">Finance Control</h1>
                    </div>
                    <p className="text-slate-500 font-medium">Approve or reject user withdrawal and deposit requests.</p>
                </div>
                <button
                    onClick={fetchData}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm text-sm"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('withdrawals')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'withdrawals' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <ArrowUpRight className="w-4 h-4" />
                    Withdrawals
                    {pendingCount(withdrawals) > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-700 font-black">{pendingCount(withdrawals)}</span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('deposits')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'deposits' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <ArrowDownLeft className="w-4 h-4" />
                    Deposits
                    {pendingCount(deposits) > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-700 font-black">{pendingCount(deposits)}</span>
                    )}
                </button>
            </div>

            {/* Withdrawals Table */}
            {activeTab === 'withdrawals' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                        <Landmark className="w-4 h-4 text-slate-400" />
                        <h2 className="text-sm font-bold text-slate-700">Withdrawal Requests</h2>
                        <span className="text-xs text-slate-400 font-medium">({withdrawals.length} total)</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/30">
                                    <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">User</th>
                                    <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                                    <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bank Details</th>
                                    <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                    <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading ? (
                                    <tr><td colSpan={6} className="py-10 text-center text-slate-400 font-medium text-sm">Loading...</td></tr>
                                ) : withdrawals.length === 0 ? (
                                    <tr><td colSpan={6} className="py-10 text-center text-slate-400 font-medium text-sm">No withdrawal requests found.</td></tr>
                                ) : (
                                    withdrawals.map(wr => (
                                        <tr key={wr.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-5">
                                                <p className="font-bold text-slate-900 text-sm">{wr.username}</p>
                                                <p className="text-xs text-slate-400">{wr.email}</p>
                                            </td>
                                            <td className="py-4 px-5">
                                                <span className="font-black text-slate-900 text-base">₹{Number(wr.amount).toLocaleString('en-IN')}</span>
                                            </td>
                                            <td className="py-4 px-5">
                                                {wr.bank_name ? (
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-700">{wr.bank_name}</p>
                                                        <p className="text-xs font-mono text-slate-400">**** {wr.account_number?.slice(-4)} · {wr.ifsc_code}</p>
                                                    </div>
                                                ) : <span className="text-xs text-slate-300">No bank linked</span>}
                                            </td>
                                            <td className="py-4 px-5">{statusBadge(wr.status)}</td>
                                            <td className="py-4 px-5 text-xs text-slate-500">{new Date(wr.created_at).toLocaleDateString('en-GB')}</td>
                                            <td className="py-4 px-5">
                                                {wr.status === 'PENDING' ? (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleWithdrawal(wr.id, 'approve')}
                                                            disabled={processingId === wr.id}
                                                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                                        >
                                                            {processingId === wr.id ? '...' : 'Approve'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleWithdrawal(wr.id, 'reject')}
                                                            disabled={processingId === wr.id}
                                                            className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
                                                        >
                                                            Reject + Refund
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-300 font-medium">{wr.admin_note || '—'}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Deposits Table */}
            {activeTab === 'deposits' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                        <IndianRupee className="w-4 h-4 text-slate-400" />
                        <h2 className="text-sm font-bold text-slate-700">Deposit Requests</h2>
                        <span className="text-xs text-slate-400 font-medium">({deposits.length} total)</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/30">
                                    <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">User</th>
                                    <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                                    <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">UTR / Reference</th>
                                    <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                    <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading ? (
                                    <tr><td colSpan={6} className="py-10 text-center text-slate-400 font-medium text-sm">Loading...</td></tr>
                                ) : deposits.length === 0 ? (
                                    <tr><td colSpan={6} className="py-10 text-center text-slate-400 font-medium text-sm">No deposit requests found.</td></tr>
                                ) : (
                                    deposits.map(dr => (
                                        <tr key={dr.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-5">
                                                <p className="font-bold text-slate-900 text-sm">{dr.username}</p>
                                                <p className="text-xs text-slate-400">{dr.email}</p>
                                            </td>
                                            <td className="py-4 px-5">
                                                <span className="font-black text-slate-900 text-base">₹{Number(dr.amount).toLocaleString('en-IN')}</span>
                                            </td>
                                            <td className="py-4 px-5">
                                                <span className="font-mono text-sm text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                                    {dr.utr_number || '—'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-5">{statusBadge(dr.status)}</td>
                                            <td className="py-4 px-5 text-xs text-slate-500">{new Date(dr.created_at).toLocaleDateString('en-GB')}</td>
                                            <td className="py-4 px-5">
                                                {dr.status === 'PENDING' ? (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleDeposit(dr.id, 'approve')}
                                                            disabled={processingId === dr.id}
                                                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                                        >
                                                            {processingId === dr.id ? '...' : 'Approve + Credit'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeposit(dr.id, 'reject')}
                                                            disabled={processingId === dr.id}
                                                            className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-300 font-medium">{dr.admin_note || '—'}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
