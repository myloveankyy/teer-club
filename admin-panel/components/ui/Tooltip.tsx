"use client";

import { ReactNode, useState, useRef } from "react";
import { useSidebar } from "../SidebarContext";

interface TooltipProps {
    children: ReactNode;
    label: string;
}

export function Tooltip({ children, label }: TooltipProps) {
    const { isCollapsed } = useSidebar();
    const [show, setShow] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const handleMouseEnter = () => {
        timeoutRef.current = setTimeout(() => setShow(true), 200);
    };

    const handleMouseLeave = () => {
        clearTimeout(timeoutRef.current);
        setShow(false);
    };

    if (!isCollapsed) return <>{children}</>;

    return (
        <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            {show && (
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 px-2 py-1 bg-gray-900 text-white text-sm rounded-md whitespace-nowrap shadow-lg animate-in fade-in zoom-in-95 duration-100">
                    {label}
                </div>
            )}
        </div>
    );
}
