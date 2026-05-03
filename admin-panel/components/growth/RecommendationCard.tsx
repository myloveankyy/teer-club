"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle, Info, ChevronRight, ShieldAlert } from "lucide-react";

interface RecommendationCardProps {
  id: string;
  title: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  actionText: string;
  actionHref: string;
  riskLevel: string;
  impact: string;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  title,
  description,
  priority,
  actionText,
  actionHref,
  riskLevel,
  impact,
}) => {
  const isHighPriority = priority === "HIGH";
  
  return (
    <div className={`p-6 rounded-2xl border ${isHighPriority ? 'border-indigo-100 bg-indigo-50/30' : 'border-gray-100 bg-white'} shadow-sm relative overflow-hidden transition-all hover:shadow-md group`}>
      {isHighPriority && (
        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-2xl" />
      )}
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2">
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
            priority === 'HIGH' ? 'bg-red-100 text-red-700' :
            priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            {priority} PRIORITY
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
            impact === 'High Impact' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-50 text-blue-600'
          }`}>
            {impact}
          </span>
        </div>
        <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
          {riskLevel.includes('Risk') ? <ShieldAlert size={14} className="text-amber-500" /> : <CheckCircle size={14} className="text-emerald-500" />}
          {riskLevel}
        </span>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">{title}</h3>
      <p className="text-sm text-gray-600 font-medium leading-relaxed mb-6">
        {description}
      </p>

      <Link 
        href={actionHref} 
        className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
          isHighPriority 
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5' 
            : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
        }`}
      >
        {actionText}
        <ChevronRight size={16} />
      </Link>
    </div>
  );
};
