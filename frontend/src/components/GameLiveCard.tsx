"use client";

import React, { useRef, useState } from "react";
import { Download } from "lucide-react";
import { Badge } from "./ui/Badge";
import * as htmlToImage from "html-to-image";

interface GameLiveCardProps {
  game: string;
  location: string;
  startTime: string;
  frTime: string;
  srTime: string;
  closeTime: string;
  first: string;
  second: string;
  third?: string;
  trTime?: string;
  hasRound3?: boolean;
  status: "result_declared" | "open" | "closed" | "coming_soon";
  lastUpdateMessage?: string;
}

const statusConfig: Record<string, { label: string; variant: "success" | "info" | "neutral" | "warning" }> = {
  result_declared: { label: "Result Declared", variant: "success" },
  open: { label: "Live Update", variant: "info" },
  closed: { label: "Counter Closed", variant: "neutral" },
  coming_soon: { label: "Upcoming", variant: "warning" },
};

export function GameLiveCard({
  game,
  location,
  frTime,
  srTime,
  trTime,
  first,
  second,
  third = "XX",
  hasRound3 = false,
  status,
  lastUpdateMessage = "Result updated just now"
}: GameLiveCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Normalize fallback values
  const r1 = first === "--" ? "XX" : first;
  const r2 = second === "--" ? "XX" : second;
  const r3 = third === "--" ? "XX" : third;

  const isPending = r1 === "XX" && r2 === "XX" && (!hasRound3 || r3 === "XX");
  const statusInfo = statusConfig[status];

  const downloadImage = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const btn = cardRef.current.querySelector(".download-btn") as HTMLElement;
      if (btn) btn.style.display = "none";

      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        style: { transform: "scale(1)", transformOrigin: "top left" }
      });

      if (btn) btn.style.display = "flex";

      const link = document.createElement('a');
      link.download = `${game.replace(/\s+/g, '-')}-Live-Result.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download image", err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Aesthetic Themes
  let themeClasses = "bg-white border-gray-100 shadow-xl shadow-gray-100/50 text-gray-900";
  let roundBoxClasses = "bg-gray-50/50 border-gray-100 text-gray-900";
  let labelClasses = "text-gray-400";
  let fgAccent = "text-gray-900";
  let activeGlow = "";

  if (status === "result_declared") {
    themeClasses = "bg-gradient-to-br from-slate-900 to-indigo-950 border-indigo-900/50 shadow-2xl shadow-indigo-900/40 text-white";
    roundBoxClasses = "bg-white/5 border-white/10 text-white shadow-inner";
    labelClasses = "text-indigo-200/70";
    fgAccent = "text-white drop-shadow-md";
    activeGlow = "absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-400/20 via-transparent to-transparent opacity-60";
  } else if (status === "open") {
    themeClasses = "bg-gradient-to-br from-white to-blue-50/30 border-blue-100 shadow-xl shadow-blue-100/50 text-gray-900";
    roundBoxClasses = "bg-white border-blue-50 text-gray-900 shadow-sm";
    labelClasses = "text-blue-400";
    fgAccent = "text-blue-600";
  } else if (status === "closed") {
    themeClasses = "bg-slate-50 border-slate-200 shadow-none text-slate-500";
    roundBoxClasses = "bg-transparent border-slate-200 text-slate-500 border-dashed";
    labelClasses = "text-slate-400";
  }

  return (
    <div ref={cardRef} className={`relative flex flex-col mx-auto max-w-4xl border hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden ${themeClasses} rounded-2xl`}>
      {activeGlow && <div className={activeGlow} />}
      {/* Results Hero Section */}
      <div className="relative z-10 p-6 lg:p-10">
        <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-current/10 pb-6">
          <div>
            <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${labelClasses}`}>Official Winning Numbers</h3>
            {status === 'result_declared' && (
              <p className="mt-1 text-[11px] font-bold text-indigo-300 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                {lastUpdateMessage}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Badge variant={statusInfo.variant} pulse={status === 'open'} className="!text-[10px] py-1 px-3 shadow-none">
              {statusInfo.label}
            </Badge>

            <button
              onClick={downloadImage}
              disabled={isDownloading}
              className={`download-btn flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${status === "result_declared" ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`}
              title="Download Live Result Card"
            >
              <Download size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
          <div className={`flex flex-col items-center justify-center p-6 lg:p-10 rounded-2xl border transition-all ${r1 !== "XX" ? roundBoxClasses : 'bg-gray-50/20 border-current/10 border-dashed'}`}>
            <span className={`text-[10px] lg:text-xs font-black uppercase tracking-[0.15em] mb-3 ${labelClasses}`}>FR ({frTime})</span>
            <span className={`text-6xl md:text-7xl font-black tracking-tighter ${r1 === "XX" ? "text-current opacity-20" : fgAccent}`}>{r1}</span>
          </div>

          <div className={`flex flex-col items-center justify-center p-6 lg:p-10 rounded-2xl border transition-all ${r2 !== "XX" ? roundBoxClasses : 'bg-gray-50/20 border-current/10 border-dashed'}`}>
            <span className={`text-[10px] lg:text-xs font-black uppercase tracking-[0.15em] mb-3 ${labelClasses}`}>SR ({srTime})</span>
            <span className={`text-6xl md:text-7xl font-black tracking-tighter ${r2 === "XX" ? "text-current opacity-20" : fgAccent}`}>{r2}</span>
          </div>

          {hasRound3 && (
            <div className={`col-span-2 md:col-span-1 flex flex-col items-center justify-center p-6 lg:p-10 rounded-2xl border transition-all ${r3 !== "XX" ? roundBoxClasses : 'bg-gray-50/20 border-current/10 border-dashed'}`}>
              <span className={`text-[10px] lg:text-xs font-black uppercase tracking-[0.15em] mb-3 ${labelClasses}`}>
                TR {trTime ? `(${trTime})` : "(Special)"}
              </span>
              <span className={`text-6xl md:text-7xl font-black tracking-tighter ${r3 === "XX" ? "text-current opacity-20" : fgAccent}`}>{r3}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 px-6 py-5 border-t border-current/10 flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className={`text-[9px] font-black uppercase tracking-[0.15em] ${labelClasses}`}>Next Refresh</span>
            <span className={`text-[11px] font-bold ${status === 'result_declared' ? 'text-indigo-100' : 'text-gray-900'}`}>{status === 'closed' || status === 'result_declared' ? 'Game Ended' : 'In 30 seconds'}</span>
          </div>
          <div className="h-8 w-px bg-current opacity-10 hidden md:block" />
          <div className="flex flex-col">
            <span className={`text-[9px] font-black uppercase tracking-[0.15em] ${labelClasses}`}>Verification Status</span>
            <span className="text-[11px] font-bold text-emerald-500 drop-shadow-sm flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              Results Verified
            </span>
          </div>
        </div>

        <div className="text-right">
          <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${labelClasses}`}>Official Verification</p>
          <p className={`text-[11px] font-bold tracking-tight ${status === 'result_declared' ? 'text-white/40' : 'text-gray-400'}`}>teer.club</p>
        </div>
      </div>
    </div>
  );
}
