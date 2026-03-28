import { Flame, Snowflake } from "lucide-react";

interface Props {
  type: "hot" | "cold";
  count: number;
}

export function StreakBadge({ type, count }: Props) {
  if (type === "hot") {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium">
        <Flame className="w-4 h-4" />
        {count} Win Streak
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
      <Snowflake className="w-4 h-4" />
      {count} Loss Streak
    </div>
  );
}
