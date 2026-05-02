"use client";

import { useSiteSettings } from "@/hooks/useSiteSettings";

export function TelegramBanner() {
    const { settings } = useSiteSettings();

    if (!settings?.telegramEnabled || !settings?.telegramUrl) {
        return null;
    }

    return (
        <a
            href={settings.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 text-white shadow-lg transition-all hover:scale-[1.01] hover:shadow-xl sm:px-6 sm:py-4"
        >
            <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="flex shrink-0 items-center justify-center rounded-full bg-white/20 p-2">
                <svg
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-18 8a2.25 2.25 0 0 0 .122 4.148l4.482 1.493 2.13 6.91c.218.708 1.077 1.002 1.663.568l3.6-2.662 4.975 3.731c.642.482 1.554.195 1.776-.581l4-18a2.25 2.25 0 0 0-3.726-2.822Zm-2.8 3.528-9.488 8.683-1.036-3.376 10.524-5.307Z" />
                </svg>
            </div>
            <div className="flex flex-col text-left">
                <span className="text-sm font-bold leading-tight sm:text-base">
                    Join VIP Telegram Community
                </span>
                <span className="text-xs font-medium text-blue-100 sm:text-sm">
                    Get 100% Sure Target Numbers & Fast Live Results
                </span>
            </div>
        </a>
    );
}
