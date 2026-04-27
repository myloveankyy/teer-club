"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  WhatsAppIcon,
  TelegramIcon,
  YouTubeIcon,
  CloseIcon,
  HomeIcon,
  ResultsIcon,
  CommonNumbersIcon,
  GuideIcon,
  AboutIcon,
  BlogIcon,
  DreamIcon,
} from "@/components/navigation/NavIcons";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/results", label: "Results", icon: ResultsIcon },
  { href: "/common-numbers", label: "Common Numbers", icon: CommonNumbersIcon },
  { href: "/dream-numbers", label: "Dream Numbers", icon: DreamIcon },
  { href: "/teer-guide", label: "Guide", icon: GuideIcon },
  { href: "/about", label: "About", icon: AboutIcon },
  { href: "/blogs", label: "Blogs", icon: BlogIcon },
];

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const { settings } = useSiteSettings();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => firstLinkRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute bottom-0 right-0 top-0 flex w-[85%] max-w-[320px] flex-col bg-surface shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border/50 px-6 py-5">
              <Link
                href="/"
                className="text-xl font-bold text-foreground transition-transform hover:scale-105"
                onClick={onClose}
              >
                teer<span className="text-primary">.club</span>
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-foreground/50 transition-all hover:scale-105 hover:bg-surface-secondary hover:text-foreground"
                aria-label="Close menu"
              >
                <CloseIcon />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-6">
              <ul className="space-y-1">
                {navItems.map((item, index) => (
                  <li key={item.href}>
                    <Link
                      ref={index === 0 ? firstLinkRef : undefined}
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-semibold text-foreground/70 transition-all hover:bg-surface-secondary hover:text-primary"
                    >
                      <item.icon className="h-5 w-5 opacity-60" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="border-t border-border/50 px-6 py-6 bg-surface-secondary/30">
              <p className="mb-6 text-center text-[10px] font-bold uppercase tracking-widest text-foreground/30">
                Join our community
              </p>
              <div className="flex items-center justify-center gap-4">
                {settings?.whatsappEnabled && (
                  <a
                    href={settings.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-lg shadow-green-100 transition-all hover:scale-110"
                    aria-label="WhatsApp"
                  >
                    <WhatsAppIcon className="h-5 w-5" />
                  </a>
                )}
                {settings?.telegramEnabled && (
                  <a
                    href={settings.telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#229ED9] text-white shadow-lg shadow-blue-100 transition-all hover:scale-110"
                    aria-label="Telegram"
                  >
                    <TelegramIcon className="h-5 w-5" />
                  </a>
                )}
                {settings?.youtubeEnabled && (
                  <a
                    href={settings.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF0000] text-white shadow-lg shadow-red-100 transition-all hover:scale-110"
                    aria-label="YouTube"
                  >
                    <YouTubeIcon className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
