import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Teer Education Hub | Learn How to Play & Win',
    description: 'Master the game of Teer. Learn the rules, understand how results are calculated, and explore the complete Teer Dream Number Chart for Shillong, Khanapara, and Juwai.',
    openGraph: {
        title: 'Teer Education Hub | Learn How to Play',
        description: 'Master the game of Teer. Learn the rules, understand calculations, and see the Dream Chart.',
        type: 'website',
    }
};

export default function EducationLayout({ children }: { children: React.ReactNode }) {
    const topics = [
        { title: 'Teer Dream Number Chart', href: '/education/teer-dream-number-chart', icon: '🌙' },
        { title: 'What is Teer?', href: '/education/what-is-teer', icon: '🏹' },
        { title: 'Official Teer Rules', href: '/education/teer-rules', icon: '📜' },
        { title: 'How Calculation Works', href: '/education/how-calculation-works', icon: '🧮' },
    ];

    return (
        <main className="min-h-screen bg-[#F8FAFC] text-slate-800 pb-32 pt-24 font-sans relative z-10 selection:bg-indigo-500/20">
            <div className="max-w-[1200px] mx-auto px-4 md:px-8">

                <div className="mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-indigo-100/50">
                        <span>📚</span> Core Hub
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Education <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 animate-gradient">Center</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg mt-4 max-w-2xl leading-relaxed">
                        Everything you need to know about traditional archery lotteries in Meghalaya. From basic rules to advanced statistical probability.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-10 items-start">

                    {/* Sidebar Navigation */}
                    <aside className="w-full lg:w-72 shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sticky top-24 z-20">
                        {topics.map((topic, i) => (
                            <Link
                                key={i} href={topic.href}
                                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 hover:bg-slate-50 transition-all group flex items-center gap-4"
                            >
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-lg border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors shadow-sm">
                                    {topic.icon}
                                </div>
                                <span className="font-bold text-slate-700 text-sm group-hover:text-indigo-700 transition-colors">{topic.title}</span>
                            </Link>
                        ))}
                    </aside>

                    {/* Content Area */}
                    <article className="flex-1 w-full relative">
                        <div className="absolute inset-0 bg-white shadow-xl shadow-slate-200/20 rounded-[32px] border border-slate-100/80" />
                        <div className="relative z-10 p-6 sm:p-10 lg:p-12">
                            {children}
                        </div>
                    </article>

                </div>
            </div>
        </main>
    );
}
