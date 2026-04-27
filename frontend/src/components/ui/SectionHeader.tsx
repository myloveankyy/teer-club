import React from "react";
import { Badge } from "./Badge";

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    badge?: string;
    centered?: boolean;
    className?: string;
}

export const SectionHeader = ({
    title,
    subtitle,
    badge,
    centered = false,
    className = "",
}: SectionHeaderProps) => {
    return (
        <div className={`mb-12 lg:mb-20 ${centered ? "text-center" : "text-left"} ${className}`}>
            {badge && (
                <div className={`mb-6 lg:mb-8 ${centered ? "flex justify-center" : ""}`}>
                    <Badge variant="info" pulse>
                        {badge}
                    </Badge>
                </div>
            )}
            <h2 className="mb-6 text-h2 text-gray-900 leading-tight">
                {title}
            </h2>
            {subtitle && (
                <p className="mx-auto max-w-2xl text-body text-gray-500 leading-relaxed font-medium">
                    {subtitle}
                </p>
            )}
        </div>
    );
};
