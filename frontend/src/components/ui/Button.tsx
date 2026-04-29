import React from "react";
import Link from 'next/link';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    href?: string;
    variant?: "primary" | "secondary" | "outline" | "ghost";
    className?: string;
    fullWidth?: boolean;
}

export const Button = ({
    children,
    onClick,
    href,
    variant = "primary",
    className = "",
    fullWidth = false,
}: ButtonProps) => {
    const baseStyles = "inline-flex items-center justify-center min-h-[44px] rounded-xl px-7 py-3.5 text-sm font-semibold transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]";

    const variants = {
        primary: "bg-primary text-white hover:bg-primary/95 shadow-lg shadow-primary/10 hover:shadow-primary/20 border border-primary/10",
        secondary: "bg-white text-gray-900 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm",
        outline: "bg-transparent border border-primary/20 text-primary hover:bg-primary/5 hover:border-primary",
        ghost: "bg-transparent text-gray-600 hover:bg-gray-100/80 hover:text-gray-900",
    };

    const combinedClasses = `${baseStyles} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`;

    if (href) {
        return (
            <Link href={href} className={combinedClasses}>
                {children}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={combinedClasses}>
            {children}
        </button>
    );
};
