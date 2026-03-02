'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function InvitePage() {
    const router = useRouter();
    const params = useParams();
    const code = params.code as string;

    useEffect(() => {
        if (code) {
            // Store referral code in session or local storage for registration
            localStorage.setItem('referralCode', code);
            console.log('Saved referral code:', code);

            // Redirect to signup
            router.push('/signup?ref=' + code);
        } else {
            router.push('/signup');
        }
    }, [code, router]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl animate-bounce mb-8">
                T
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter mb-2">You've been invited!</h1>
            <p className="text-slate-500 font-medium text-sm animate-pulse uppercase tracking-widest text-[10px]">Preparing your Teer Club experience...</p>
        </div>
    );
}
