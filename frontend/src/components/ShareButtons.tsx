'use client';

import { useEffect, useState } from 'react';

interface ShareButtonsProps {
    title: string;
    description: string;
}

export default function ShareButtons({ title, description }: ShareButtonsProps) {
    const [currentUrl, setCurrentUrl] = useState('');

    useEffect(() => {
        setCurrentUrl(window.location.href);
    }, []);

    if (!currentUrl) return null;

    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedTitle = encodeURIComponent(title);
    const encodedDesc = encodeURIComponent(description);

    const whatsappUrl = `https://api.whatsapp.com/send?text=*${encodedTitle}*%0A${encodedDesc}%0A%0A${encodedUrl}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

    return (
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full my-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest shrink-0">Share Result:</span>
            <div className="flex gap-3 w-full sm:w-auto">
                <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-transform hover:-translate-y-0.5 shadow-sm shadow-[#25D366]/20"
                >
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" /></svg>
                    WhatsApp
                </a>
                <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-transform hover:-translate-y-0.5 shadow-sm shadow-[#1877F2]/20"
                >
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                    Facebook
                </a>
            </div>
        </div>
    );
}
