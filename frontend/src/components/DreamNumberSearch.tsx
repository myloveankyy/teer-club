"use client";

import { useState, useMemo } from "react";
import { dreamNumbersData } from "@/data/dreamNumbers";

interface DreamNumberSearchProps {
  onSearch?: (results: typeof dreamNumbersData) => void;
}

export function DreamNumberSearch({ onSearch }: DreamNumberSearchProps) {
  const [query, setQuery] = useState("");

  const filteredDreams = useMemo(() => {
    if (!query.trim()) return dreamNumbersData.slice(0, 8);
    const lowerQuery = query.toLowerCase();
    return dreamNumbersData.filter((item) =>
      item.dream.toLowerCase().includes(lowerQuery)
    );
  }, [query]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6b7280]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch?.(
              e.target.value.trim()
                ? dreamNumbersData.filter((item) =>
                    item.dream.toLowerCase().includes(e.target.value.toLowerCase())
                  )
                : dreamNumbersData.slice(0, 8)
            );
          }}
          placeholder="Search dream (example: snake, water, fire)"
          className="w-full rounded-xl border border-[#e5e7eb] bg-white py-3.5 pl-12 pr-4 text-[#111827] placeholder-[#9ca3af] transition-all focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
        />
      </div>
      {query.trim() && filteredDreams.length === 0 && (
        <p className="text-center text-sm text-[#6b7280]">
          No dream numbers found for &quot;{query}&quot;
        </p>
      )}
    </div>
  );
}

export { dreamNumbersData };
