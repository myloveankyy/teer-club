import React from 'react';

interface ProofCardProps {
    gameName: string;
    fr: string;
    sr: string;
    status: 'hit' | 'matched' | 'pending';
}

export const ProofCard = ({ gameName, fr, sr, status }: ProofCardProps) => {
    const statusConfig = {
        hit: {
            label: 'Direct Hit',
            color: 'text-success-text',
            bgColor: 'bg-success-bg',
            dot: 'bg-success'
        },
        matched: {
            label: 'Matched',
            color: 'text-info-text',
            bgColor: 'bg-info-bg',
            dot: 'bg-info'
        },
        pending: {
            label: 'Awaiting',
            color: 'text-neutral-text',
            bgColor: 'bg-neutral-bg',
            dot: 'bg-neutral'
        },
    };

    const currentStatus = statusConfig[status];

    return (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-gray-100 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all group">
            <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{gameName}</span>
                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${currentStatus.bgColor} ${currentStatus.color} w-fit`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${currentStatus.dot} ${status === 'pending' ? 'animate-pulse' : ''}`} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">{currentStatus.label}</span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex items-center bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 group-hover:bg-white group-hover:border-blue-500/20 transition-all">
                    <span className="text-[10px] font-bold text-gray-400 mr-2">FR</span>
                    <span className="text-sm font-black text-gray-900">{fr}</span>
                </div>
                <div className="flex items-center bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 group-hover:bg-white group-hover:border-blue-500/20 transition-all">
                    <span className="text-[10px] font-bold text-gray-400 mr-2">SR</span>
                    <span className="text-sm font-black text-gray-900">{sr}</span>
                </div>
            </div>
        </div>
    );
};
