"use client";

import React, { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api, { TodayGameResult } from "@/lib/api";
import { Section, Container } from "./ui/Grid";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { ProofCard } from "./ProofCard";
import { Download } from "lucide-react";

interface MatchProofWidgetProps {
  initialGames?: TodayGameResult[];
}

function MatchProofWidget({ initialGames }: MatchProofWidgetProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["todays-results-proofs"],
    queryFn: () => api.results.getToday(),
    refetchInterval: 15 * 1000,
    ...(initialGames
      ? {
        initialData: {
          data: {
            success: true,
            data: {
              date: new Date().toISOString().split("T")[0],
              games: initialGames,
            },
          },
        } as any,
      }
      : {}),
  });

  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadImage = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const btn = cardRef.current.querySelector(".download-btn") as HTMLElement;
      if (btn) btn.style.display = "none";

      const htmlToImage = await import("html-to-image");
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        style: { transform: "scale(1)", transformOrigin: "top left" }
      });

      if (btn) btn.style.display = "flex";

      const link = document.createElement('a');
      const dStr = new Date().toISOString().split("T")[0];
      link.download = `Todays-Result-Matches-${dStr}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download image", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const showSkeleton = isLoading && !initialGames;

  if (showSkeleton) {
    return <div className="h-[300px] w-full lg:max-w-sm rounded-[2rem] bg-gray-50/10 animate-pulse border border-gray-100" />;
  }

  const allGames = data?.data?.data?.games || [];
  const proofGames = allGames
    .filter((g: TodayGameResult) => g.isEnabled && (g.status === "declared" || g.status === "partial" || g.status === "waiting"))
    .sort((a: TodayGameResult, b: TodayGameResult) => {
      if (a.status === "declared" && b.status !== "declared") return -1;
      if (b.status === "declared" && a.status !== "declared") return 1;
      return 0;
    })
    .slice(0, 3);

  const getStatus = (game: TodayGameResult): "hit" | "matched" | "pending" => {
    if (game.status === "waiting" || !game.result) return "pending";
    if (game.prediction?.directMatch) return "hit";
    if (game.prediction?.houseMatch || game.prediction?.endingMatch) return "matched";
    return "pending";
  };

  return (
    <div className="w-full lg:max-w-sm">
      <div ref={cardRef} className="rounded-2xl border border-gray-100 bg-white p-7 lg:p-8 shadow-xl shadow-blue-900/5 transition-all hover:shadow-2xl hover:-translate-y-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex flex-col">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest leading-tight">
              Today&apos;s Result<br />Matches
            </h2>
            <div className="h-0.5 w-8 bg-blue-600 mt-3" />
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest border border-blue-100">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              Official Results
            </span>
            <button
              onClick={downloadImage}
              disabled={isDownloading}
              className="download-btn flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 transition-all border border-gray-100"
              title="Download Proof Card"
            >
              <Download size={12} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="space-y-4 mb-8">
          {showSkeleton ? (
            <>
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse border border-gray-100" />
              ))}
            </>
          ) : proofGames.length > 0 ? (
            proofGames.map((game: TodayGameResult) => (
              <ProofCard
                key={game.id}
                gameName={game.displayName}
                fr={game.result?.round1 || "XX"}
                sr={game.result?.round2 || "XX"}
                status={getStatus(game)}
              />
            ))
          ) : (
            <div className="py-12 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Awaiting today&apos;s results...</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="download-btn">
          <Button
            variant="primary"
            href="/results"
            fullWidth
            className="text-[11px] font-bold uppercase tracking-widest py-3 rounded-xl shadow-xl shadow-blue-500/10"
          >
            View All Results
          </Button>
        </div>

        {/* Brand Stamp for downloaded image */}
        <div className="hidden mt-4 pt-4 border-t border-gray-100 text-right [div:not(.download-btn)_~_&]:block !opacity-0 [div:not(.download-btn)_~_&]:!opacity-100 transition-opacity">
          <p className="text-[11px] font-bold tracking-tight text-gray-400">teer.club verification</p>
        </div>
      </div>
    </div>
  );
}

interface HeroProps {
  initialGames?: TodayGameResult[];
}

export function Hero({ initialGames }: HeroProps) {
  return (
    <Section background="white" className="!py-12 md:!py-20 border-b border-gray-100 bg-[radial-gradient(#f1f5f9_1.5px,transparent_1.5px)] [background-size:32px_32px]">
      <Container>
        <div className="flex flex-col gap-12 md:gap-16 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 text-center lg:text-left max-w-2xl">
            <div className="mb-8 inline-flex">
              <Badge variant="info" pulse>
                Official Teer Results
              </Badge>
            </div>
            <h1 className="mb-8 text-h1 text-gray-900 leading-[1.1]">
              Shillong & Khanapara <br />
              <span className="text-blue-600">Teer Result Today</span>
            </h1>
            <p className="mb-12 max-w-lg text-body text-gray-500 mx-auto lg:mx-0">
              Access the fastest live Teer results and highly accurate common numbers daily. Our platform provides verified morning and evening results for all major teer games.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-5">
              <Button variant="primary" href="/live" className="!px-12 shadow-2xl shadow-blue-500/10">
                Check Teer Result
              </Button>
              <Button variant="secondary" href="/common-numbers" className="!px-12">
                Common Numbers
              </Button>
            </div>
          </div>

          <div className="w-full lg:w-auto flex justify-center lg:block">
            <MatchProofWidget initialGames={initialGames} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
