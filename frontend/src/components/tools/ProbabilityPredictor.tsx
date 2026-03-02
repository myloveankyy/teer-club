'use client';

import { useState } from 'react';
import { Sparkles, Search, ArrowRight, Activity, Zap, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProbabilityPredictor() {
    const [number, setNumber] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePredict = async () => {
        if (!number || number.length !== 2) {
            setError('Please enter a valid 2-digit number');
            return;
        }

        setError('');
        setLoading(true);
        try {
            const res = await fetch(`/api/tools/probability/${number}`);
            if (!res.ok) throw new Error('Analysis failed');
            const data = await res.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/60 backdrop-blur-md border border-slate-100/60 rounded-[32px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] relative overflow-hidden h-full flex flex-col group hover:shadow-[0_8px_32px_rgba(244,63,94,0.08)] transition-all duration-500">
            <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-10 h-10 rounded-[14px] bg-rose-50 border border-rose-100 flex items-center justify-center shadow-sm">
                    <Sparkles className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Probability Engine</h3>
                    <p className="text-sm text-slate-500 font-medium">AI-driven winning likelihood</p>
                </div>
            </div>

            <div className="flex-1 space-y-4 relative z-10 flex flex-col">
                <div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                        <input
                            type="text"
                            maxLength={2}
                            value={number}
                            onChange={(e) => setNumber(e.target.value.replace(/\D/g, ''))}
                            className={cn(
                                "w-full h-14 bg-white border rounded-[16px] pl-11 pr-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:font-medium text-lg",
                                error ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500" : "border-slate-200"
                            )}
                            placeholder="Check number (00-99)"
                        />
                        <button
                            onClick={handlePredict}
                            disabled={loading || number.length !== 2}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-[12px] flex items-center justify-center transition-all shadow-sm active:scale-95"
                        >
                            {loading ? (
                                <Activity className="w-5 h-5 animate-spin" />
                            ) : (
                                <ArrowRight className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                    {error && <p className="text-xs font-bold text-rose-500 mt-2 px-1">{error}</p>}
                </div>

                {/* Result Section */}
                <div className={cn(
                    "mt-4 transition-all duration-500 overflow-hidden flex-1 flex flex-col",
                    result ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
                )}>
                    {result && (
                        <div className="space-y-3 flex-1 flex flex-col justify-end">
                            <div className="flex items-center justify-between mb-2">
                                <span className={cn(
                                    "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5",
                                    result.trend === 'Hot' ? "bg-orange-100 text-orange-600" :
                                        result.trend === 'Cold' ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"
                                )}>
                                    {result.trend === 'Hot' && <Zap className="w-3.5 h-3.5 fill-current" />}
                                    {result.trend} Trend
                                </span>
                                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                    <Info className="w-3.5 h-3.5" /> Est. {result.confidence}% Confidence
                                </span>
                            </div>

                            <div className="bg-slate-50 rounded-[20px] p-5 border border-slate-100/50 flex flex-col items-center justify-center relative overflow-hidden">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Calculated Probability</span>
                                <div className="text-4xl font-black text-slate-900 tracking-tight flex items-baseline gap-1">
                                    {result.probabilityPercentage}
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium mt-1">Base: {result.baseProbability}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
