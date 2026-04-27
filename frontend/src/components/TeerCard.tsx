"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "./ui/Badge";
import { Card } from "./ui/Card";

interface TeerCardProps {
  name: string;
  first: string;
  second: string;
  status: "waiting" | "declared" | "partial" | "expired" | "off";
  href: string;
  frTime?: string | null;
  srTime?: string | null;
}

function CountdownTimer({ targetTime }: { targetTime: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function calc() {
      const [h, m] = targetTime.split(":").map(Number);
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istNow = new Date(now.getTime() + istOffset);
      const target = new Date(istNow);
      target.setUTCHours(h, m, 0, 0);

      const diff = target.getTime() - istNow.getTime();
      if (diff <= 0) {
        setTimeLeft("Updating Results…");
        return;
      }

      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(hrs > 0 ? `${hrs}h ${mins}m ${secs}s` : `${mins}m ${secs}s`);
    }

    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  return <span className="font-mono text-[11px] font-bold tabular-nums opacity-70">{timeLeft}</span>;
}

export function TeerCard({ name, first, second, status, href, frTime, srTime }: TeerCardProps) {
  const isPending = first === "--" && second === "--";

  const statusMap: Record<string, { label: string; variant: "success" | "info" | "warning" | "error" | "neutral" | "purple" }> = {
    waiting: { label: "Checking Results", variant: "warning" },
    declared: { label: "Result Verified", variant: "success" },
    partial: { label: "FR Declared", variant: "info" },
    expired: { label: "Historical", variant: "neutral" },
    off: { label: "Game Off", variant: "error" },
  };

  const { label, variant } = statusMap[status] || statusMap.waiting;

  return (
    <Card hover className="!p-0 overflow-hidden">
      <Link href={href} className="flex flex-col h-full bg-white transition-all group/card">
        <div className="p-4 lg:p-6 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-base lg:text-lg font-bold text-gray-900 tracking-tight leading-tight">{name}</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Official Game</p>
          </div>
          <Badge variant={variant} pulse={status === "waiting" || status === "partial"}>
            {label}
          </Badge>
        </div>

        <div className="p-4 lg:p-6 flex-1 bg-gray-50/30">
          {status === "off" ? (
            <div className="py-8 lg:py-10 text-center flex flex-col items-center">
              <span className="text-xl lg:text-2xl mb-3 grayscale opacity-30">Game Off</span>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No results for today</p>
            </div>
          ) : status === "waiting" ? (
            <div className="space-y-3 lg:space-y-4">
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                <div className="bg-white/80 rounded-2xl py-5 lg:py-6 text-center border border-gray-100 shadow-sm backdrop-blur-sm">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 lg:mb-2">First Round</p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">--</p>
                </div>
                <div className="bg-white/80 rounded-2xl py-5 lg:py-6 text-center border border-gray-100 shadow-sm backdrop-blur-sm">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 lg:mb-2">Second Round</p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">--</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2.5 px-4 py-2 rounded-full border border-orange-100 bg-orange-50/30">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Next Pulse:</span>
                  {frTime && <CountdownTimer targetTime={frTime} />}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              <div className="bg-white rounded-2xl py-5 lg:py-6 text-center border border-gray-100 shadow-sm transition-all group-hover/card:border-blue-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 lg:mb-2">First Round</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">{first}</p>
              </div>
              <div className="bg-white rounded-2xl py-5 lg:py-6 text-center border border-gray-100 shadow-sm transition-all group-hover/card:border-blue-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 lg:mb-2">Second Round</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">{second}</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 lg:px-6 py-3 lg:py-4 border-t border-gray-50 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-blue-600 group-hover/card:bg-blue-50/50 transition-all">
          <span>Explore History</span>
          <svg className="h-3 w-3 transition-transform group-hover/card:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </Link>
    </Card>
  );
}
