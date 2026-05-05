import Link from "next/link";
import { Breadcrumb } from "./Breadcrumb";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface DarkHeroProps {
    breadcrumbs: BreadcrumbItem[];
    title: React.ReactNode;
    badges?: React.ReactNode;
    cta?: {
        label: string;
        href: string;
        showLiveDot?: boolean;
    };
    children?: React.ReactNode;
}

export function DarkHero({ breadcrumbs, title, badges, cta, children }: DarkHeroProps) {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
            {/* Decorative background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-32 w-[500px] h-[500px] bg-blue-500/8 rounded-full blur-3xl" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
                <Breadcrumb items={breadcrumbs} variant="dark" />

                <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter leading-[1.05] mb-3">
                            {title}
                        </h1>
                        {badges && (
                            <div className="flex flex-wrap items-center gap-3">
                                {badges}
                            </div>
                        )}
                    </div>
                    {cta && (
                        <Link
                            href={cta.href}
                            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-[11px] font-bold uppercase tracking-widest transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5"
                        >
                            {cta.showLiveDot && (
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                                </span>
                            )}
                            {cta.label}
                        </Link>
                    )}
                </div>
                {children}
            </div>
        </section>
    );
}

/**
 * Standard hero badge for dark backgrounds
 */
export function HeroBadge({
    children,
    variant = "default"
}: {
    children: React.ReactNode;
    variant?: "default" | "amber" | "emerald";
}) {
    const styles = {
        default: "bg-white/5 border-white/10 text-white/50",
        amber: "bg-amber-500/10 border-amber-500/20 text-amber-300/70",
        emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300/70",
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest ${styles[variant]}`}>
            {children}
        </span>
    );
}
