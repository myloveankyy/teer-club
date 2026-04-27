import { Section, Container, Grid } from "./ui/Grid";
import { SectionHeader } from "./ui/SectionHeader";
import { Card } from "./ui/Card";

const features = [
  {
    title: "Verified Results",
    description: "Fastest updates for Shillong and Khanapara Teer result today",
    icon: "🛡️",
  },
  {
    title: "Fast Live Feed",
    description: "Real-time archery result updates from official counters",
    icon: "⚡",
  },
  {
    title: "Common Numbers",
    description: "Daily Teer common numbers and high-probability target forecasts",
    icon: "📊",
  },
  {
    title: "Result Archive",
    description: "Comprehensive list of previous Teer results for all markets",
    icon: "📜",
  },
];

export function WhyTeerPopular() {
  return (
    <Section background="gray" className="!py-20 border-y border-gray-100">
      <Container>
        <SectionHeader
          title="Why Teer Results are Followed Daily"
          subtitle="Beyond the game, it's a cultural phenomenon that has captivated millions across Shillong and Khanapara."
          centered={true}
        />
        <Grid cols={4}>
          {features.map((feature) => (
            <Card
              key={feature.title}
              hover={true}
              className="p-6 !rounded-3xl border-transparent hover:border-blue-100 transition-all duration-300"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl shadow-sm">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-sm font-medium text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
