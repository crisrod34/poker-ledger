"use client";

import { useRouter, useSearchParams } from "next/navigation";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "regulars", label: "Pibardos" },
  { value: "guests", label: "Guests" },
] as const;

export function LeaderboardFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("filter") || "regulars";

  const handleFilter = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("filter", value);
    router.push(`/leaderboard?${params.toString()}`);
  };

  return (
    <div className="flex gap-1 p-1 rounded-lg bg-muted/50 border border-border w-fit">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => handleFilter(f.value)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            current === f.value
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
