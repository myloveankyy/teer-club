import React from 'react';

interface ProofCardProps {
    gameName: string;
    fr: string;
    sr: string;
    status: 'jackpot' | 'hit' | 'matched' | 'missed' | 'pending';
}

export const ProofCard = ({ gameName, fr, sr, status }: ProofCardProps) => {
    const statusConfig = {
        jackpot: {
            label: '🔥 Jackpot',
            color: 'text-amber-600',
            bgColor: 'bg-gradient-to-r from-amber-50 to-orange-50',
            dot: 'bg-amber-500',
            border: 'border-amber-200 shadow-md shadow-amber-100/50'
        },
        hit: {
            label: 'Direct Hit',
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            dot: 'bg-emerald-500',
            border: 'border-emerald-200 shadow-sm shadow-emerald-100/50'
        },
        matched: {
            label: 'Matched',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            dot: 'bg-blue-500',
            border: 'border-blue-200'
        },
        missed: {
            label: 'Missed',
            color: 'text-red-500',
            bgColor: 'bg-red-50',
            dot: 'bg-red-400',
            border: 'border-red-100'
        },
        pending: {
            label: 'Awaiting',
            color: 'text-gray-500',
            bgColor: 'bg-gray-50',
            dot: 'bg-gray-400',
            border: 'border-gray-100'
        },
    };

    const currentStatus = statusConfig[status];

    return (
        <div className={`flex items-center justify-between p-3.5 rounded-2xl bg-white border ${currentStatus.border} hover:shadow-lg transition-all group`}>
            <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{gameName}</span>
                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${currentStatus.bgColor} ${currentStatus.color} w-fit`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${currentStatus.dot} ${status === 'pending' ? 'animate-pulse' : ''}`} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">{currentStatus.label}</span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className={`flex items-center bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 group-hover:bg-white transition-all ${
                    status === 'jackpot' || status === 'hit' ? 'group-hover:border-emerald-200' : 'group-hover:border-blue-500/20'
                }`}>
                    <span className="text-[10px] font-bold text-gray-400 mr-2">FR</span>
                    <span className={`text-sm font-black ${status === 'missed' ? 'text-red-400' : 'text-gray-900'}`}>{fr}</span>
                </div>
                <div className={`flex items-center bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 group-hover:bg-white transition-all ${
                    status === 'jackpot' || status === 'hit' ? 'group-hover:border-emerald-200' : 'group-hover:border-blue-500/20'
                }`}>
                    <span className="text-[10px] font-bold text-gray-400 mr-2">SR</span>
                    <span className={`text-sm font-black ${status === 'missed' ? 'text-red-400' : 'text-gray-900'}`}>{sr}</span>
                </div>
            </div>
        </div>
    );
};

