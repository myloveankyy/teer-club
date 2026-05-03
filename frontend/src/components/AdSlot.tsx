"use client";

import { useEffect, useRef } from "react";

interface AdSlotProps {
  /** Your AdSense ad slot ID, e.g. "1234567890" */
  slot?: string;
  /** Ad format: "auto", "rectangle", "horizontal", "vertical" */
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  /** Responsive sizing */
  responsive?: boolean;
  /** Additional className for the wrapper div */
  className?: string;
  /** Visual style variant */
  variant?: "inline" | "banner" | "sidebar";
}

/**
 * Reusable Google AdSense ad slot component.
 * 
 * Usage:
 *   <AdSlot slot="YOUR_SLOT_ID" format="auto" />
 * 
 * To activate: Replace the data-ad-client and slot values
 * with your actual AdSense credentials.
 * 
 * In development, shows a placeholder instead of real ads.
 */
export function AdSlot({
  slot = "",
  format = "auto",
  responsive = true,
  className = "",
  variant = "inline",
}: AdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const isProduction = typeof window !== "undefined" && window.location.hostname === "teer.club";

  useEffect(() => {
    if (!isProduction || !slot) return;

    try {
      // Push ad only if adsbygoogle is available
      const adsbygoogle = (window as any).adsbygoogle;
      if (adsbygoogle) {
        adsbygoogle.push({});
      }
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, [isProduction, slot]);

  const variantStyles = {
    inline: "my-8 mx-auto max-w-4xl",
    banner: "my-6 w-full",
    sidebar: "my-4",
  };

  // Development placeholder
  if (!isProduction || !slot) {
    return (
      <div
        className={`${variantStyles[variant]} ${className}`}
        style={{ minHeight: format === "horizontal" ? 90 : 250 }}
      >
        <div className="w-full h-full rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 flex items-center justify-center">
          <div className="text-center px-4">
            <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Ad Slot</p>
            <p className="text-[10px] text-gray-300 mt-1">{slot || "No slot configured"} • {format}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${variantStyles[variant]} ${className}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-XXXXXXXXXX"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}

/**
 * Minimal separator ad — sits between content sections.
 * Non-intrusive, blends with the page flow.
 */
export function InlineAd({ slot, className = "" }: { slot?: string; className?: string }) {
  return (
    <div className={`border-t border-b border-gray-100 bg-gray-50/30 py-1 ${className}`}>
      <div className="max-w-5xl mx-auto px-4">
        <AdSlot slot={slot} format="horizontal" variant="banner" className="!my-2" />
      </div>
    </div>
  );
}
