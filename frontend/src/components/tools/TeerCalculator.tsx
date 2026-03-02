'use client';

import { useState } from 'react';
import { Calculator, ArrowRight, IndianRupee } from 'lucide-react';

export function TeerCalculator() {
    const [amount, setAmount] = useState<string>('10');
    const [type, setType] = useState<'direct' | 'house' | 'ending'>('direct');
    const [result, setResult] = useState<{ amount: number; betType: string; multiplier: number; estimatedReturn: number } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCalculate = async () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;

        setLoading(true);
        try {
            const res = await fetch('/api/tools/calculator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, type })
            });
            const data = await res.json();
            setResult(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/60 backdrop-blur-md border border-slate-100/60 rounded-[32px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] relative overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-10 h-10 rounded-[14px] bg-purple-50 border border-purple-100 flex items-center justify-center shadow-sm">
                    <Calculator className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Return Calculator</h3>
                    <p className="text-sm text-slate-500 font-medium">Estimate direct, house & ending returns</p>
                </div>
            </div>

            <div className="flex-1 space-y-4 relative z-10">
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Stake Amount (₹)</label>
                    <div className="relative">
                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="number"
                            min="1"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full h-14 bg-white border border-slate-200 rounded-[16px] pl-11 pr-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:font-medium placeholder:text-slate-300"
                            placeholder="Enter amount"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Target Type</label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['direct', 'house', 'ending'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setType(t)}
                                className={`h-12 rounded-[14px] text-sm font-bold capitalize transition-all duration-300 ${type === t
                                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        onClick={handleCalculate}
                        disabled={loading || !amount}
                        className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-[16px] font-bold shadow-[0_4px_14px_rgba(0,0,0,0.1)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                    >
                        {loading ? 'Calculating...' : 'Calculate Return'}
                        {!loading && <ArrowRight className="w-4 h-4" />}
                    </button>
                </div>

                {/* Result Section */}
                <div className={`mt-4 overflow-hidden transition-all duration-500 ${result ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                    {result && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-emerald-100/50 rounded-[20px] p-5">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-bold text-emerald-700/70 uppercase tracking-wider">Estimated Return</span>
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-100/50 px-2 py-1 rounded-md">{result.multiplier}x Multiplier</span>
                            </div>
                            <div className="text-3xl font-black text-emerald-600 tracking-tight flex items-baseline">
                                <span>₹</span>{result.estimatedReturn.toLocaleString()}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
