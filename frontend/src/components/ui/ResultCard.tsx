import React from "react";

interface ResultCardProps {
    label: string;
    value: string;
    variant?: "success" | "purple" | "neutral";
}

export const ResultCard = ({ label, value, variant = "success" }: ResultCardProps) => {
    const variants = {
        success: "bg-green-50/50 text-green-700 border-green-100 transition-all hover:bg-green-50 hover:border-green-200 shadow-sm",
        purple: "bg-purple-50/50 text-purple-700 border-purple-100 transition-all hover:bg-purple-50 hover:border-purple-200 shadow-sm",
        neutral: "bg-gray-50/50 text-gray-400 border-gray-100 transition-all",
    };

    const isValueValid = value !== "--" && value !== "";

    return (
        <div className={`rounded-xl lg:rounded-2xl py-4 lg:py-7 text-center border transition-all duration-300 ${isValueValid ? variants[variant] : variants.neutral}`}>
            <p className="text-[10px] lg:text-[11px] font-bold uppercase tracking-widest opacity-60 mb-1 lg:mb-2">{label}</p>
            <p className="text-2xl lg:text-4xl font-bold tracking-tight">{value || "--"}</p>
        </div>
    );
};
