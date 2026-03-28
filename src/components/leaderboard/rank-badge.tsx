interface Props {
  rank: number;
}

export function RankBadge({ rank }: Props) {
  if (rank === 1) {
    return (
      <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center glow-gold">
        <span className="text-yellow-400 text-lg">1</span>
      </div>
    );
  }

  if (rank === 2) {
    return (
      <div className="w-10 h-10 rounded-full bg-zinc-400/10 border border-zinc-400/30 flex items-center justify-center">
        <span className="text-zinc-300 text-lg">2</span>
      </div>
    );
  }

  if (rank === 3) {
    return (
      <div className="w-10 h-10 rounded-full bg-amber-700/10 border border-amber-700/30 flex items-center justify-center">
        <span className="text-amber-600 text-lg">3</span>
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
      <span className="text-muted-foreground text-sm font-medium">{rank}</span>
    </div>
  );
}
