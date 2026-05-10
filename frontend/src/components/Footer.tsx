import Link from "next/link";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/live", label: "Live Results" },
  { href: "/results", label: "Previous Results" },
  { href: "/common-numbers", label: "Common Numbers" },
  { href: "/dreams", label: "Dream Meanings" },
  { href: "/teer-guide", label: "Teer Guide" },
  { href: "/number/00", label: "Number Analytics" },
  { href: "/tools/widget", label: "Embed Widget" },
];

const games = [
  { href: "/live/shillong", label: "Shillong Teer" },
  { href: "/live/khanapara", label: "Khanapara Teer" },
  { href: "/live/juwai", label: "Juwai Teer" },
  { href: "/live/laitlyngkot", label: "Laitlyngkot Teer" },
];

const legal = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/about", label: "About Us" },
  { href: "/how-to-use", label: "How to Use" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-secondary">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="mb-4 block text-xl font-bold text-foreground">
              teer<span className="text-primary">.club</span>
            </Link>
            <p className="text-sm text-foreground/50 leading-relaxed max-w-xs">
              Your leading platform for the fastest Teer Result Today. Access official morning and evening results, common numbers, and previous result archives with 100% verification.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/60 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
              Teer Games
            </h3>
            <ul className="space-y-2">
              {games.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/60 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
              Legal
            </h3>
            <ul className="space-y-2">
              {legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/60 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center sm:flex sm:items-center sm:justify-between">
          <p className="text-sm text-foreground/40 font-medium">
            © 2026 teer.club — Professional Results & Analytics
          </p>
          <div className="mt-4 flex justify-center space-x-6 sm:mt-0">
            <span className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest">Official Result Feed</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
