"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MobileDrawer } from "@/components/navigation/MobileDrawer";
import {
  WhatsAppIcon,
  TelegramIcon,
  YouTubeIcon,
  MenuIcon,
} from "@/components/navigation/NavIcons";

import { useSiteSettings } from "@/hooks/useSiteSettings";

import { SiteSettings } from "@/hooks/useSiteSettings";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/live", label: "Live" },
  { href: "/results", label: "Results" },
  { href: "/common-numbers", label: "Common Numbers" },
  { href: "/dreams", label: "Dreams" },
];

export function Header({ initialSettings }: { initialSettings?: SiteSettings }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { settings } = useSiteSettings(initialSettings);

  return (
    <>
      {settings?.bannerVisible && (
        <div
          className="py-2.5 px-4 text-center text-white text-sm font-bold tracking-tight shadow-inner"
          style={{ backgroundColor: settings.bannerColor || settings.primaryColor || '#2563eb' }}
        >
          <div className="mx-auto max-w-7xl flex items-center justify-center gap-2">
            <span className="hidden sm:inline" role="img" aria-label="Announcement">📢</span>
            {settings.bannerText}
          </div>
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-surface/80 backdrop-blur-md shadow-sm">
        <nav aria-label="Main navigation" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-foreground transition-transform hover:scale-105"
          >
            teer<span className="text-primary">.club</span>
          </Link>

          <div className="hidden md:flex md:items-center md:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-foreground/70 transition-all hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            {settings?.whatsappEnabled && (
              <a
                href={settings.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-lg shadow-green-100 transition-all hover:scale-110 hover:-translate-y-0.5"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon />
              </a>
            )}
            {settings?.telegramEnabled && (
              <a
                href={settings.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#229ED9] text-white shadow-lg shadow-blue-100 transition-all hover:scale-110 hover:-translate-y-0.5"
                aria-label="Telegram"
              >
                <TelegramIcon />
              </a>
            )}
            {settings?.youtubeEnabled && (
              <a
                href={settings.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF0000] text-white shadow-lg shadow-red-100 transition-all hover:scale-110 hover:-translate-y-0.5"
                aria-label="YouTube"
              >
                <YouTubeIcon />
              </a>
            )}

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl p-2 text-foreground/70 transition-all hover:scale-110 hover:bg-surface-secondary md:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-expanded={mobileMenuOpen}
              aria-label="Open menu"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        </nav>
      </header>

      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}
