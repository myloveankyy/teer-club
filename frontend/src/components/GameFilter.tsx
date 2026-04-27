"use client";

interface GameFilterProps {
  games: string[];
  selectedGame: string;
  onSelect: (game: string) => void;
}

export function GameFilter({ games, selectedGame, onSelect }: GameFilterProps) {
  return (
    <div className="mb-8">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {games.map((game) => (
          <button
            key={game}
            onClick={() => onSelect(game)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${selectedGame === game
                ? "bg-[#2563eb] text-white"
                : "bg-[#f3f4f6] text-[#374151] hover:bg-[#e5e7eb]"
              }`}
            aria-pressed={selectedGame === game}
          >
            {game}
          </button>
        ))}
      </div>
    </div>
  );
}
