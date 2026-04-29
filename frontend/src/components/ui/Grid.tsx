/* Feed Version: 1.0.1 */
import React from "react";

interface GridProps {
    children: React.ReactNode;
    className?: string;
    cols?: 1 | 2 | 3 | 4;
}

export const Grid = ({ children, className = "", cols = 3 }: GridProps) => {
    const colClasses = {
        1: "grid-cols-1",
        2: "grid-cols-1 sm:grid-cols-2",
        3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
        4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    };

    return (
        <div className={`grid gap-3 md:gap-6 ${colClasses[cols]} ${className}`}>
            {children}
        </div>
    );
};

export const Container = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
        {children}
    </div>
);

export const Section = ({
    children,
    className = "",
    background = "default",
    id,
}: {
    children: React.ReactNode;
    className?: string;
    background?: "default" | "white" | "gray" | "dark";
    id?: string;
}) => {
    const backgrounds = {
        default: "",
        white: "bg-surface",
        gray: "bg-surface-secondary",
        dark: "bg-foreground text-background",
    };

    return (
        <section id={id} className={`py-10 md:py-16 ${backgrounds[background]} ${className}`}>
            {children}
        </section>
    );
};
