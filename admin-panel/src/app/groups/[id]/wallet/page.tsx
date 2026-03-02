"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Wallet, ArrowLeft, ArrowUpRight, ArrowDownRight, IndianRupee, History, Building2, CheckCircle2 } from "lucide-react";
import Link from 'next/link';
import api from "@/lib/api";

type Group = {
    id: number;
    name: string;
    wallet_balance: string;
};

type RechargeLog = {
    id: number;
    amount: string;
    receipt_id: string;
    created_at: string;
};

export default function GroupWalletPage() {
    const params = useParams();
    const router = useRouter();
    const groupId = params.id as string;

    const [group, setGroup] = useState<Group | null>(null);
    const [history, setHistory] = useState<RechargeLog[]>([]);
    const [loading, setLoading] = useState(true);

    // Recharge Form
    const [amount, setAmount] = useState<string>('');
    const [recharging, setRecharging] = useState(false);
    const [successReceipt, setSuccessReceipt] = useState<{ id: string, amount: string } | null>(null);

    const fetchWalletData = async () => {
        try {
            // We fetch the specific group from the main list (or ideally a specific GET /group/:id endpoint, 
            // but for now we filter the main list since it has the balance)
            const gRes = await api.get('/admin/groups');
            const foundGroup = gRes.data.data.find((g: any) => g.id.toString() === groupId);

            if (foundGroup) {
                setGroup(foundGroup);
            }

            // Fetch History
            const hRes = await api.get(`/admin/groups/${groupId}/recharges`);
            if (hRes.data.success) {
                setHistory(hRes.data.data);
            }

        } catch (error) {
            console.error("Failed to load wallet data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWalletData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupId]);

    const handleRecharge = async (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);

        if (isNaN(numAmount) || numAmount < 1 || numAmount > 100000) {
            alert("Please enter a valid amount between ₹1 and ₹1,00,000");
            return;
        }

        setRecharging(true);
        setSuccessReceipt(null);

        try {
            const res = await api.post(`/admin/groups/${groupId}/recharge`, { amount: numAmount });
            if (res.data.success) {
                setSuccessReceipt({ id: res.data.receipt_id, amount: amount });
                setAmount('');
                // Refresh data to show new balance and log
                fetchWalletData();
            }
        } catch (err: any) {
            console.error("Recharge failed", err);
            alert(err.response?.data?.error || "Recharge failed.");
        } finally {
            setRecharging(false);
        }
    };

    const formatCurrency = (val: string | number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(val));
    };

    const predefinedAmounts = [500, 1000, 5000, 10000, 50000];

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="text-center p-12">
                <h2 className="text-2xl font-bold">Group Not Found</h2>
                <button onClick={() => router.back()} className="mt-4 text-emerald-600 hover:underline">Go Back</button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
            {/* Header */}
            <div>
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Groups
                </button>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{group.name}</h2>
                            <p className="text-slate-500 font-medium">Group Wallet Management</p>
                        </div>
                    </div>
                    <div className="text-right bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Balance</p>
                        <p className="text-4xl font-black text-emerald-600 tracking-tight">
                            {formatCurrency(group.wallet_balance || '0')}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Recharge Mechanism */}
                <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8 relative overflow-hidden h-fit">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none opacity-60"></div>

                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                            <ArrowDownRight className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900">Add Funds</h3>
                            <p className="text-slate-500 text-sm font-medium">Manual wallet injection bypassing gateways.</p>
                        </div>
                    </div>

                    {successReceipt && (
                        <div className="mb-8 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl animate-in zoom-in-95 duration-300">
                            <div className="flex items-center gap-3 mb-2 text-emerald-700">
                                <CheckCircle2 className="w-6 h-6" />
                                <h4 className="font-black text-lg">Recharge Successful!</h4>
                            </div>
                            <p className="text-sm font-medium text-emerald-600/80 mb-4">The funds have been instantly credited to the group wallet.</p>
                            <div className="bg-white px-4 py-3 rounded-xl border border-emerald-100 font-mono text-xs text-slate-600 flex justify-between">
                                <span>Receipt ID:</span>
                                <span className="font-bold text-slate-900">{successReceipt.id}</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleRecharge} className="space-y-6 relative z-10">
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700 block">Recharge Amount (₹)</label>
                            <div className="relative">
                                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                                <input
                                    type="number"
                                    min="1"
                                    max="100000"
                                    required
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 text-2xl font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                                    placeholder="0"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {predefinedAmounts.map(preset => (
                                    <button
                                        key={preset}
                                        type="button"
                                        onClick={() => setAmount(preset.toString())}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
                                    >
                                        +₹{preset}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={recharging || !amount}
                            className={`w-full py-4 rounded-2xl font-black text-lg transition-all shadow-lg flex items-center justify-center gap-2
                                ${recharging || !amount
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 hover:-translate-y-1'
                                }`}
                        >
                            {recharging ? (
                                <div className="w-6 h-6 border-4 border-emerald-200 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Wallet className="w-5 h-5" />
                                    Process Recharge
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Ledger History */}
                <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                                <History className="w-5 h-5 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900">Injection Ledger</h3>
                        </div>
                        <span className="bg-slate-200 px-3 py-1 rounded-full text-xs font-bold text-slate-700">
                            {history.length} Records
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2">
                        {history.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                                <Wallet className="w-12 h-12 mb-4 opacity-50" />
                                <p className="font-medium">No recharge history found.</p>
                                <p className="text-sm mt-1">Manual recharges will appear here.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {history.map((log) => (
                                    <li key={log.id} className="p-4 hover:bg-slate-50 transition-colors rounded-2xl flex items-center justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                                <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 mb-0.5 whitespace-nowrap">Admin Recharge</p>
                                                <p className="text-xs font-mono text-slate-400">{log.receipt_id}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-emerald-600">
                                                +{formatCurrency(log.amount)}
                                            </p>
                                            <p className="text-xs font-medium text-slate-500">
                                                {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
