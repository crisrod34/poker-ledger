import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { LeaderboardFilters } from "@/components/leaderboard/leaderboard-filters";
import type { LeaderboardEntry } from "@/lib/supabase/types";
import { Suspense } from "react";

async function getLeaderboard(filter?: string): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();

  const { data: sessionPlayers } = await supabase
    .from("session_players")
    .select(`
      player_id,
      profit_loss,
      players!inner(id, name, is_regular),
      sessions!inner(date, status)
    `)
    .order("date", { referencedTable: "sessions", ascending: true });

  if (!sessionPlayers?.length) return [];

  const playerMap = new Map<string, {
    name: string;
    is_regular: boolean;
    profits: number[];
  }>();

  for (const sp of sessionPlayers) {
    const player = sp.players as unknown as { id: string; name: string; is_regular: boolean };
    const session = sp.sessions as unknown as { date: string; status: string };
    const pl = Number(sp.profit_loss);

    // Skip non-participants and open sessions
    if (pl === 0 || session.status === "open") continue;

    // Apply filter
    if (filter === "regulars" && !player.is_regular) continue;
    if (filter === "guests" && player.is_regular) continue;

    const existing = playerMap.get(player.id);
    if (existing) {
      existing.profits.push(pl);
    } else {
      playerMap.set(player.id, {
        name: player.name,
        is_regular: player.is_regular,
        profits: [pl],
      });
    }
  }

  const entries: LeaderboardEntry[] = [];
  for (const [playerId, data] of playerMap) {
    const total = data.profits.reduce((sum, p) => sum + p, 0);
    const sessions = data.profits.length;
    const wins = data.profits.filter((p) => p > 0).length;

    entries.push({
      player_id: playerId,
      player_name: data.name,
      is_regular: data.is_regular,
      total_profit_loss: total,
      sessions_played: sessions,
      avg_profit_loss: sessions > 0 ? total / sessions : 0,
      best_session: Math.max(...data.profits),
      worst_session: Math.min(...data.profits),
      win_count: wins,
      history: data.profits,
    });
  }

  entries.sort((a, b) => b.total_profit_loss - a.total_profit_loss);
  return entries;
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const activeFilter = filter || "regulars";
  const leaderboard = await getLeaderboard(activeFilter);

  const subtitle = activeFilter === "regulars"
    ? "Regulars only"
    : activeFilter === "guests"
      ? "Guests only"
      : "All-time poker standings";

  return (
    <>
      <PageHeader
        title="Leaderboard"
        subtitle={subtitle}
        action={
          <Suspense>
            <LeaderboardFilters />
          </Suspense>
        }
      />
      <LeaderboardTable entries={leaderboard} />
    </>
  );
}
