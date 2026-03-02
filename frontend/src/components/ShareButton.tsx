'use client';

import { Share2 } from 'lucide-react';

interface ShareButtonProps {
    title: string;
    excerpt: string;
    slug: string;
}

export function ShareButton({ title, excerpt, slug }: ShareButtonProps) {
    const handleShare = async () => {
        const url = `https://teer.club/blog/${slug}`;
        const shareData = { title, text: excerpt, url };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(url);
                // Brief visual feedback (no toast needed)
                const btn = document.getElementById('share-btn-blog');
                if (btn) {
                    btn.textContent = 'Copied!';
                    setTimeout(() => { btn.innerHTML = ''; }, 1500);
                }
            }
        } catch { /* User cancelled */ }
    };

    return (
        <button
            id="share-btn-blog"
            onClick={handleShare}
            className="bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95 flex items-center gap-2"
        >
            <Share2 className="w-4 h-4" />
            Share Post
        </button>
    );
}
