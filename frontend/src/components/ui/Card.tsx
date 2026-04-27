import React from "react";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "glass" | "gradient-green" | "gradient-blue" | "gradient-red" | "gradient-rose";
    hover?: boolean;
}

export const Card = ({ children, className = "", variant = "default", hover = true }: CardProps) => {
    const variants = {
        default: "bg-surface border-border",
        glass: "bg-surface/70 backdrop-blur-sm border-white/50",
        "gradient-green": "border-success/20 bg-gradient-to-br from-success/5 to-success/10",
        "gradient-blue": "border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10",
        "gradient-red": "border-rose-200 bg-gradient-to-br from-rose-50/50 to-rose-50/30",
        "gradient-rose": "border-rose-200 bg-gradient-to-br from-rose-50/50 to-red-50/30",
    };

    const baseClasses = "rounded-theme border p-3 lg:p-6 transition-all duration-300";
    const hoverClasses = hover ? "hover:shadow-xl hover:-translate-y-1 hover:border-primary/30" : "shadow-sm";

    return (
        <div className={`${baseClasses} ${hoverClasses} ${variants[variant]} ${className}`}>
            {children}
        </div>
    );
};
