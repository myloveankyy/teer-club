import Link from "next/link";

interface TrafficLink {
    href: string;
    label: string;
    subtitle: string;
    icon: React.ReactNode;
    color: "indigo" | "violet" | "emerald" | "amber";
}

const colorMap = {
    indigo: {
        iconBg: "bg-indigo-100 text-indigo-600",
        iconHover: "group-hover:bg-indigo-600 group-hover:text-white",
        borderHover: "hover:border-indigo-200 hover:bg-indigo-50/30",
        textHover: "group-hover:text-indigo-700",
    },
    violet: {
        iconBg: "bg-violet-100 text-violet-600",
        iconHover: "group-hover:bg-violet-600 group-hover:text-white",
        borderHover: "hover:border-violet-200 hover:bg-violet-50/30",
        textHover: "group-hover:text-violet-700",
    },
    emerald: {
        iconBg: "bg-emerald-100 text-emerald-600",
        iconHover: "group-hover:bg-emerald-600 group-hover:text-white",
        borderHover: "hover:border-emerald-200 hover:bg-emerald-50/30",
        textHover: "group-hover:text-emerald-700",
    },
    amber: {
        iconBg: "bg-amber-100 text-amber-600",
        iconHover: "group-hover:bg-amber-600 group-hover:text-white",
        borderHover: "hover:border-amber-200 hover:bg-amber-50/30",
        textHover: "group-hover:text-amber-700",
    },
};

/* ── Default SVG Icons ── */
const ChartIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const BoltIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const BookIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

const SparkleIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);

const TrophyIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 0 0 4 -14 0 0 -4zm2 4l0 8c0 2 2 3 5 3s5 -1 5 -3l0 -8" />
    </svg>
);

/**
 * Build the default 4 traffic links. Accepts an optional `gameId` to make
 * the "Live Results" link game-specific.
 */
export function getDefaultTrafficLinks(gameId?: string): TrafficLink[] {
    return [
        {
            href: "/common-numbers",
            label: "Common Numbers",
            subtitle: "Today's predictions",
            icon: <ChartIcon />,
            color: "indigo",
        },
        {
            href: gameId ? `/live/${gameId}` : "/live",
            label: "Live Results",
            subtitle: "Real-time updates",
            icon: <BoltIcon />,
            color: "violet",
        },
        {
            href: "/jackpot",
            label: "Jackpot Proofs",
            subtitle: "Verified accuracy",
            icon: <TrophyIcon />,
            color: "emerald",
        },
        {
            href: "/teer-guide",
            label: "Teer Guide",
            subtitle: "Learn how it works",
            icon: <BookIcon />,
            color: "indigo",
        },
        {
            href: "/dreams",
            label: "Dream Numbers",
            subtitle: "Interpret your dreams",
            icon: <SparkleIcon />,
            color: "amber",
        },
    ];
}

interface TrafficGridProps {
    links?: TrafficLink[];
    gameId?: string;
}

export function TrafficGrid({ links, gameId }: TrafficGridProps) {
    const items = links || getDefaultTrafficLinks(gameId);

    return (
        <section className="bg-white border-b border-gray-100">
            <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {items.map((item) => {
                        const colors = colorMap[item.color];
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-gray-200 ${colors.borderHover} hover:shadow-md hover:-translate-y-0.5 transition-all duration-300`}
                            >
                                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${colors.iconBg} ${colors.iconHover}`}>
                                    {item.icon}
                                </div>
                                <div className="min-w-0">
                                    <span className={`block text-xs font-bold text-gray-900 ${colors.textHover} transition-colors truncate`}>
                                        {item.label}
                                    </span>
                                    <span className="block text-[10px] text-gray-400 font-medium">
                                        {item.subtitle}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
