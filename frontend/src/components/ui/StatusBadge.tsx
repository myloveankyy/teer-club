import React from "react";
import { Badge } from "./Badge";

interface StatusBadgeProps {
    status: "waiting" | "declared" | "partial" | "off" | "searching" | "failed" | "delayed";
    customLabels?: {
        waiting?: string;
        declared?: string;
        partial?: string;
        off?: string;
        searching?: string;
        failed?: string;
        delayed?: string;
    };
}

export const StatusBadge = ({ status, customLabels }: StatusBadgeProps) => {
    const configs = {
        declared: { label: customLabels?.declared || "Result Declared", variant: "success" as const, pulse: false },
        partial: { label: customLabels?.partial || "Live Result", variant: "info" as const, pulse: true },
        waiting: { label: customLabels?.waiting || "Result Awaited", variant: "error" as const, pulse: true },
        off: { label: customLabels?.off || "Sunday Off", variant: "neutral" as const, pulse: false },
        searching: { label: "Live Result", variant: "info" as const, pulse: true },
        failed: { label: "Source Timeout", variant: "error" as const, pulse: false },
        delayed: { label: "Result Delayed", variant: "warning" as const, pulse: true },
    };

    const config = configs[status] || { label: status.toUpperCase(), variant: "neutral" as const, pulse: false };

    return (
        <Badge variant={config.variant} pulse={config.pulse}>
            {config.label}
        </Badge>
    );
};
