"use client";

import { useEffect, useRef } from "react";
import { useSettings } from "@/components/Providers";

interface AdSlotProps {
  slotType: "header" | "inFeed" | "stickyFooter";
  className?: string;
  format?: "auto" | "fluid" | "rectangle";
  responsive?: boolean;
}

export default function AdSlot({ slotType, className = "", format = "auto", responsive = true }: AdSlotProps) {
  const settings = useSettings();
  const adRef = useRef<HTMLModElement>(null);

  // Map slotType to the actual setting property
  const getSlotId = () => {
    if (!settings) return null;
    switch (slotType) {
      case "header": return settings.headerAdUnit;
      case "inFeed": return settings.inFeedAdUnit;
      case "stickyFooter": return settings.stickyFooterAdUnit;
      default: return null;
    }
  };

  const adSlotId = getSlotId();

  useEffect(() => {
    // Only attempt to push the ad if it hasn't been initialized yet
    if (settings?.isAdsEnabled && settings?.googleAdsenseClientId && adSlotId && adRef.current) {
      if (!adRef.current.getAttribute('data-ad-status')) {
        try {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
          console.error("AdSense error", e);
        }
      }
    }
  }, [settings, adSlotId]);

  if (!settings?.isAdsEnabled || !settings?.googleAdsenseClientId || !adSlotId) {
    return null; // Don't render anything if ads are disabled or missing config
  }

  return (
    <div className={`flex justify-center items-center overflow-hidden my-4 ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", minHeight: "100px", width: "100%" }}
        data-ad-client={settings.googleAdsenseClientId}
        data-ad-slot={adSlotId}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
