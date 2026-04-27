import { Section, Container } from "./ui/Grid";
import { Badge } from "./ui/Badge";

interface GameHeroProps {
  game: string;
  location: string;
  description: string;
  status?: string;
  lastUpdated?: string;
}

export function GameHero({ game, location, description, status = "Operational", lastUpdated }: GameHeroProps) {
  return (
    <Section background="white" className="!py-20 md:!py-32 border-b border-gray-100 bg-[radial-gradient(#f1f5f9_1.5px,transparent_1.5px)] [background-size:32px:32px]">
      <Container className="text-center">
        <div className="mb-8 flex flex-wrap justify-center gap-4">
          <Badge variant="success" pulse>
            Live Teer Results
          </Badge>
          {lastUpdated && (
            <span className="inline-flex items-center rounded-full px-4 py-1.5 text-[10px] font-bold text-gray-400 border border-gray-200 bg-white/50 uppercase tracking-widest backdrop-blur-sm">
              Latest Update: {lastUpdated}
            </span>
          )}
        </div>
        <h1 className="mb-8 text-h1 text-gray-900">
          {game} <span className="text-blue-600">Teer Result Today</span>
        </h1>
        <p className="mx-auto mb-12 max-w-2xl text-body text-gray-500">
          {description}
        </p>
        <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-gray-50 border border-gray-200 text-gray-900 shadow-sm transition-all hover:bg-white hover:border-blue-200">
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">Official Game</span>
            <span className="text-xs font-bold text-gray-900 uppercase tracking-tight">{location}</span>
          </div>
        </div>
      </Container>
    </Section>
  );
}
