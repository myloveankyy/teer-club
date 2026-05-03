import Link from "next/link";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    variant?: "dark" | "light";
}

export function Breadcrumb({ items, variant = "dark" }: BreadcrumbProps) {
    const isDark = variant === "dark";

    const baseClass = isDark
        ? "text-white/30"
        : "text-gray-400";

    const hoverClass = isDark
        ? "hover:text-white/60"
        : "hover:text-gray-700";

    const activeClass = isDark
        ? "text-indigo-300/70"
        : "text-gray-900";

    return (
        <nav
            aria-label="Breadcrumb"
            className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${baseClass} mb-8`}
        >
            {items.map((item, idx) => {
                const isLast = idx === items.length - 1;

                return (
                    <span key={idx} className="flex items-center gap-2">
                        {idx > 0 && <span aria-hidden="true">→</span>}
                        {isLast || !item.href ? (
                            <span className={activeClass}>{item.label}</span>
                        ) : (
                            <Link
                                href={item.href}
                                className={`${hoverClass} transition-colors`}
                            >
                                {item.label}
                            </Link>
                        )}
                    </span>
                );
            })}
        </nav>
    );
}
