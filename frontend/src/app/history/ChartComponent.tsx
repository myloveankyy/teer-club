'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';
import { useMemo } from 'react';

interface HistoryItem {
    date: string;
    shillong: { round1: string; round2: string; };
    khanapara: { round1: string | null; round2: string | null; };
    juwai: { round1: string | null; round2: string | null; };
}

interface ChartComponentProps {
    history: HistoryItem[];
    year: string;
    month: string;
}

export default function ChartComponent({ history, year, month }: ChartComponentProps) {
    const chartData = useMemo(() => {
        if (!history || history.length === 0) return [];

        const frequency: Record<string, number> = {};

        history.forEach(item => {
            const add = (val: string | null) => {
                if (val && val !== '--') {
                    frequency[val] = (frequency[val] || 0) + 1;
                }
            };
            add(item.shillong.round1);
            add(item.shillong.round2);
        });

        // Convert to array and sort by frequency
        const sorted = Object.entries(frequency)
            .map(([name, Hits]) => ({ name, Hits }))
            .sort((a, b) => b.Hits - a.Hits)
            .slice(0, 15); // Top 15 numbers

        return sorted;
    }, [history]);

    const handleDownload = () => {
        // Implement PDF download functionality later using html2canvas/jsPDF
        // This button acts as the backlink magnet CTA specified in PRD
        alert('Statistics Report Download (PDF) functionality will be compiled here.');
    };

    if (chartData.length === 0) return null;

    const displayMonth = month ? new Date(2020, parseInt(month)).toLocaleString('default', { month: 'long' }) : 'All Months';

    return (
        <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-slate-100 shadow-sm mb-8 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1">Frequency Distribution</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Top 15 Most Frequent Numbers &bull; {displayMonth} {year}
                    </p>
                </div>
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors border border-indigo-100"
                >
                    <Download className="w-4 h-4" />
                    Download PDF Report
                </button>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            dx={-10}
                        />
                        <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            labelStyle={{ color: '#0f172a', fontWeight: 'bold', marginBottom: '4px' }}
                        />
                        <Bar
                            dataKey="Hits"
                            fill="#4f46e5"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={40}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
