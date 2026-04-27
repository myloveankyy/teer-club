import { Section, Container } from "./ui/Grid";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";

interface PreviousResult {
  date: string;
  fr: string;
  sr: string;
  tr?: string;
}

interface GamePreviousResultsProps {
  game: string;
  gameName: string;
  results: PreviousResult[];
  hasRound3?: boolean;
}

export function GamePreviousResults({ game, gameName, results, hasRound3 = false }: GamePreviousResultsProps) {
  return (
    <Section background="white" className="!py-16">
      <Container>
        <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-border/50 pb-8">
          <div className="text-center md:text-left">
            <h2 className="text-h2 text-foreground uppercase tracking-tight">
              {game} Historical Results
            </h2>
            <p className="mt-2 text-sm font-medium text-foreground/40 uppercase tracking-widest">
              Verified database results for the last 10 games
            </p>
          </div>
          <Button
            variant="ghost"
            href={`/results/${gameName.toLowerCase()}/previous-results`}
            className="text-[10px] font-bold border border-border/50 hover:bg-surface-secondary"
          >
            VIEW ALL HISTORY →
          </Button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/50 bg-surface shadow-sm">
          <div className="grid grid-cols-3 md:grid-cols-4 bg-surface-secondary/50 px-6 py-4 border-b border-border/50">
            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Date</span>
            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest text-center">First Round</span>
            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest text-center">Second Round</span>
            {hasRound3 && <span className="hidden md:block text-[10px] font-bold text-foreground/40 uppercase tracking-widest text-center">Special TR</span>}
          </div>

          <div className="divide-y divide-border/50">
            {results.length === 0 ? (
              <div className="px-6 py-20 text-center">
                <p className="text-sm font-medium text-foreground/40">No results found for this game yet.</p>
              </div>
            ) : (
              results.map((result, idx) => (
                <div key={idx} className="grid grid-cols-3 md:grid-cols-4 px-6 py-4 hover:bg-surface-secondary/20 transition-colors items-center">
                  <span className="text-sm font-bold text-foreground">{result.date}</span>
                  <div className="flex justify-center">
                    <Badge variant="info" className="min-w-[40px] justify-center font-black !py-1">{result.fr}</Badge>
                  </div>
                  <div className="flex justify-center">
                    <Badge variant="info" className="min-w-[40px] justify-center font-black !py-1">{result.sr}</Badge>
                  </div>
                  {hasRound3 && (
                    <div className="hidden md:flex justify-center">
                      <Badge variant="warning" className="min-w-[40px] justify-center font-black !py-1">{result.tr || "--"}</Badge>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-10 p-6 rounded-2xl bg-primary/5 border border-primary/10">
          <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="text-xs font-medium text-foreground/70 leading-relaxed">
                Results are updated automatically within 60 seconds of official publication.
                Historical data is verified against 3 independent sources for 100% accuracy.
              </p>
            </div>
            <Badge variant="success" className="text-[10px]">VERIFIED FEED</Badge>
          </div>
        </div>
      </Container>
    </Section>
  );
}
