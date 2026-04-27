import React from "react";

interface BadgeProps {
    children: React.ReactNode;
    variant?: "success" | "info" | "warning" | "error" | "neutral" | "purple";
    pulse?: boolean;
    className?: string;
}

export const Badge = ({ children, variant = "neutral", pulse = false, className = "" }: BadgeProps) => {
    const styles = {
        success: "bg-success-bg text-success-text border-success/10 dot-bg-success",
        info: "bg-info-bg text-info-text border-info/10 dot-bg-info",
        warning: "bg-warning-bg text-warning-text border-warning/10 dot-bg-warning",
        error: "bg-error-bg text-error-text border-error/10 dot-bg-error",
        neutral: "bg-neutral-bg text-neutral-text border-neutral/10 dot-bg-neutral",
        purple: "bg-purple-bg text-purple-text border-purple/10 dot-bg-purple",
    };

    const selected = styles[variant];
    const dotColor = selected.split("dot-")[1];

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] lg:text-[11px] font-bold uppercase tracking-wider border transition-all duration-200 shadow-sm ${selected.split("dot-")[0]} ${className}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${dotColor} ${pulse ? "animate-pulse" : ""}`} />
            {children}
        </span>
    );
};
