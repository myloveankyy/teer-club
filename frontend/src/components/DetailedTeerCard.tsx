import Link from "next/link";
import { Badge } from "./ui/Badge";

interface DetailedTeerCardProps {
  name: string;
  location: string;
  startTime: string;
  frTime: string;
  srTime: string;
  closeTime: string;
  first: string;
  second: string;
  status: "result_declared" | "open" | "closed" | "coming_soon" | "off";
  href: string;
  commonNumbersHref: string;
}

const statusConfig = {
  result_declared: { label: "Result Announced", bg: "bg-emerald-50 text-emerald-700 border-emerald-100", text: "text-emerald-700" },
  open: { label: "Live Round", bg: "bg-orange-50 animate-pulse border border-orange-100", text: "text-orange-700" },
  closed: { label: "Closed", bg: "bg-gray-100 border-gray-200", text: "text-gray-600" },
  coming_soon: { label: "Wait", bg: "bg-blue-50 border-blue-100", text: "text-blue-600" },
  off: { label: "Sunday Off", bg: "bg-red-50 border-red-100", text: "text-red-700" },
};

const cardGradient = {
  result_declared: "bg-white border-emerald-100 shadow-sm",
  open: "bg-white border-orange-100 shadow-md ring-1 ring-orange-50",
  closed: "bg-white border-gray-100 opacity-60 grayscale",
  coming_soon: "bg-white border-blue-100",
  off: "bg-white border-red-100 opacity-80 backdrop-grayscale",
};

export function DetailedTeerCard({
  name,
  location,
  startTime,
  frTime,
  srTime,
  closeTime,
  first,
  second,
  status,
  href,
  commonNumbersHref,
}: DetailedTeerCardProps) {
  const isPending = first === "--" && second === "--";
  const statusInfo = statusConfig[status];

  return (
    <article className={`rounded-[2.5rem] border p-6 lg:p-10 transition-all duration-300 hover:shadow-2xl ${cardGradient[status]}`}>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h3 className="text-xl lg:text-3xl font-bold tracking-tight text-gray-900 leading-tight">{name}</h3>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-[10px] lg:text-[11px] font-bold text-gray-400 uppercase tracking-widest">{location} Game</span>
          </div>
        </div>
        <Badge variant={status === "result_declared" ? "success" : status === "open" ? "warning" : "neutral"} pulse={status === "open"}>
          {statusInfo.label}
        </Badge>
      </div>

      <div className="mb-8 p-5 lg:p-8 rounded-3xl bg-gray-50/50 border border-gray-100/50 shadow-inner">
        <h4 className="mb-5 text-[10px] lg:text-[11px] font-extrabold uppercase tracking-widest text-gray-400">Teer Result Schedule</h4>
        <div className="grid grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-5 text-xs lg:text-sm">
          <div className="flex justify-between items-center border-b border-gray-100/80 pb-2.5">
            <span className="text-gray-500 font-bold uppercase tracking-tight">Game Start</span>
            <span className="font-bold text-gray-900">{startTime}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-100/80 pb-2.5">
            <span className="text-gray-500 font-bold uppercase tracking-tight">First Round</span>
            <span className="font-bold text-gray-900">{frTime}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-100/80 pb-2.5">
            <span className="text-gray-500 font-bold uppercase tracking-tight">Second Round</span>
            <span className="font-bold text-gray-900">{srTime}</span>
          </div>
          <div className="flex justify-between items-center pb-1">
            <span className="text-gray-500 font-bold uppercase tracking-tight">Booking End</span>
            <span className="font-bold text-gray-900">{closeTime}</span>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <h4 className="mb-5 text-[10px] lg:text-[11px] font-extrabold uppercase tracking-widest text-gray-400">Today&apos;s Result Board</h4>
        {status === "off" ? (
          <div className="py-16 text-center rounded-3xl bg-gray-50/50 border border-dashed border-gray-200">
            <span className="text-2xl mb-4 block grayscale opacity-40 italic">Market Closed</span>
            <p className="font-bold text-gray-400 text-[10px] lg:text-[11px] uppercase tracking-widest">Archery Terminal Standby</p>
          </div>
        ) : isPending ? (
          <div className="flex gap-4 lg:gap-6">
            <div className="flex-1 rounded-3xl bg-gray-50/50 border border-gray-100/50 py-12 text-center shadow-inner">
              <p className="text-[10px] lg:text-[11px] font-bold tracking-widest uppercase text-gray-300">FR Result</p>
              <p className="text-4xl lg:text-5xl mt-3 font-bold text-gray-200 animate-pulse">--</p>
            </div>
            <div className="flex-1 rounded-3xl bg-gray-50/50 border border-gray-100/50 py-12 text-center shadow-inner">
              <p className="text-[10px] lg:text-[11px] font-bold tracking-widest uppercase text-gray-300">SR Result</p>
              <p className="text-4xl lg:text-5xl mt-3 font-bold text-gray-200 animate-pulse">--</p>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 lg:gap-6">
            <div className="flex-1 rounded-3xl border border-gray-100 bg-white py-12 text-center shadow-lg shadow-gray-200/20">
              <p className="text-[10px] lg:text-[11px] font-bold tracking-widest uppercase text-gray-400">FR Result</p>
              <p className="text-5xl lg:text-6xl mt-4 font-bold text-gray-900 tracking-tighter">{first}</p>
            </div>
            <div className="flex-1 rounded-3xl border border-gray-100 bg-white py-12 text-center shadow-lg shadow-gray-200/20">
              <p className="text-[10px] lg:text-[11px] font-bold tracking-widest uppercase text-gray-400">SR Result</p>
              <p className="text-5xl lg:text-6xl mt-4 font-bold text-gray-900 tracking-tighter">{second}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <Link
          href={href}
          className="flex-1 rounded-2xl border border-gray-200 bg-white px-6 py-4 text-center text-[13px] font-bold uppercase tracking-widest text-gray-600 transition-all hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98]"
        >
          View Archive
        </Link>
        <Link
          href={commonNumbersHref}
          className="flex-1 rounded-2xl bg-blue-600 px-6 py-4 text-center text-[13px] font-bold uppercase tracking-widest text-white shadow-xl shadow-blue-500/20 transition-all hover:bg-blue-700 hover:shadow-blue-500/30 active:scale-[0.98]"
        >
          Common Numbers
        </Link>
      </div>
    </article>
  );
}
