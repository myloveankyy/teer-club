'use client';

import { useState } from 'react';
import { Target, Search, ArrowRight, BarChart3, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PatternAnalyzer() {
    const [number, setNumber] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        if (!number || number.length !== 2) {
            setError('Please enter a valid 2-digit number');
            return;
        }

        setError('');
        setLoading(true);
        try {
            const res = await fetch(`/api/tools/pattern/${number}`);
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
        <div className="bg-white/60 backdrop-blur-md border border-slate-100/60 rounded-[32px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] relative overflow-hidden h-full flex flex-col group hover:shadow-[0_8px_32px_rgba(59,130,246,0.08)] transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-10 h-10 rounded-[14px] bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Pattern Analyzer</h3>
                    <p className="text-sm text-slate-500 font-medium">Breakdown numbers by attributes</p>
                </div>
            </div>

            <div className="flex-1 space-y-4 relative z-10">
                <div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            maxLength={2}
                            value={number}
                            onChange={(e) => setNumber(e.target.value.replace(/\D/g, ''))}
                            className={cn(
                                "w-full h-14 bg-white border rounded-[16px] pl-11 pr-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:font-medium text-lg",
                                error ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500" : "border-slate-200"
                            )}
                            placeholder="Enter 2-digit number (e.g. 45)"
                        />
                        <button
                            onClick={handleAnalyze}
                            disabled={loading || number.length !== 2}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-[12px] flex items-center justify-center transition-all shadow-sm active:scale-95"
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
                    "mt-4 transition-all duration-500 overflow-hidden",
                    result ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
                )}>
                    {result && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 rounded-[16px] p-4 border border-slate-100/50 hover:bg-white hover:shadow-sm transition-all">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">House</span>
                                    <span className="text-2xl font-black text-blue-600">{result.house}</span>
                                </div>
                                <div className="bg-slate-50 rounded-[16px] p-4 border border-slate-100/50 hover:bg-white hover:shadow-sm transition-all">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Ending</span>
                                    <span className="text-2xl font-black text-orange-500">{result.ending}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {result.attributes.map((attr: string, i: number) => (
                                    <span key={i} className="px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                        {attr}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
