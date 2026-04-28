import { Section, Container, Grid } from "./ui/Grid";
import { SectionHeader } from "./ui/SectionHeader";
import { Card } from "./ui/Card";
import Link from "next/link";

const features = [
  {
    title: "Teer Guide",
    description: "Learn how Teer works",
    href: "/teer-guide",
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    title: "YouTube",
    description: "Watch tutorials",
    href: "https://youtube.com/@teerclub",
    external: true,
    icon: (
      <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    title: "Blogs",
    description: "Latest Teer insights",
    href: "/blogs",
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.282a2 2 0 00-.586-1.414l-4.5-4.5a2 2 0 00-.586-1.414" />
      </svg>
    ),
  },
  {
    title: "Dream Numbers",
    description: "Interpret your dreams",
    href: "/dreams",
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
];

export function MoreByTeerClub() {
  return (
    <Section background="gray" className="!py-20 border-y border-gray-100">
      <Container>
        <SectionHeader
          title="Teer ecosystem"
          subtitle="Explore our range of tools and guides designed to enhance your teer experience."
          centered={true}
        />

        <Grid cols={4}>
          {features.map((feature) => {
            const Content = (
              <Card hover={true} className="flex flex-col items-center p-8 text-center !rounded-theme border-transparent hover:border-primary/10 group transition-all duration-300 shadow-sm hover:shadow-xl bg-surface">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:shadow-xl group-hover:shadow-primary/20">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-lg font-bold text-foreground uppercase tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm font-medium text-foreground/50 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );

            if (feature.external) {
              return (
                <a key={feature.title} href={feature.href} target="_blank" rel="noopener noreferrer">
                  {Content}
                </a>
              );
            }

            return (
              <Link key={feature.title} href={feature.href}>
                {Content}
              </Link>
            );
          })}
        </Grid>
      </Container>
    </Section>
  );
}
