interface ResultHistoryCardProps {
  game: string;
  date: string;
  fr: string;
  sr: string;
  href: string;
}

export function ResultHistoryCard({ game, date, fr, sr, href }: ResultHistoryCardProps) {
  return (
    <a
      href={href}
      className="group block rounded-xl border border-[#e5e7eb] bg-white p-5 transition-all hover:border-[#2563eb]/30 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-[#111827]">{game}</h3>
          <p className="text-sm text-[#6b7280]">{date}</p>
        </div>
        <svg
          className="h-5 w-5 text-[#9ca3af] transition-transform group-hover:translate-x-1 group-hover:text-[#2563eb]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
      <div className="flex gap-4">
        <div className="flex-1 rounded-lg bg-[#dbeafe] py-3 text-center">
          <p className="text-xs font-medium text-[#1d4ed8]">FR</p>
          <p className="text-2xl font-bold text-[#1e40af]">{fr}</p>
        </div>
        <div className="flex-1 rounded-lg bg-[#dbeafe] py-3 text-center">
          <p className="text-xs font-medium text-[#1d4ed8]">SR</p>
          <p className="text-2xl font-bold text-[#1e40af]">{sr}</p>
        </div>
      </div>
    </a>
  );
}
