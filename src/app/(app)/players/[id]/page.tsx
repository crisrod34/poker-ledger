import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { StatsGrid } from "@/components/players/stats-grid";
import { StreakBadge } from "@/components/players/streak-badge";
import { AvatarUpload } from "@/components/players/avatar-upload";
import { formatCurrency } from "@/lib/constants";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";

export default async function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: player } = await supabase
    .from("players")
    .select("*")
    .eq("id", id)
    .single();

  if (!player) notFound();

  const { data: sessionPlayers } = await supabase
    .from("session_players")
    .select(`
      *,
      sessions!inner(id, date, location)
    `)
    .eq("player_id", id)
    .order("date", { referencedTable: "sessions", ascending: true });

  const activeSessions = (sessionPlayers || []).filter(
    (sp) => sp.buy_ins_count > 0 || Number(sp.profit_loss) !== 0
  );

  const profits = activeSessions.map((sp) => Number(sp.profit_loss));
  const totalPL = profits.reduce((sum, p) => sum + p, 0);
  const sessionsPlayed = profits.length;
  const avgPL = sessionsPlayed > 0 ? totalPL / sessionsPlayed : 0;
  const bestSession = profits.length ? Math.max(...profits) : 0;
  const worstSession = profits.length ? Math.min(...profits) : 0;
  const winCount = profits.filter((p) => p > 0).length;
  const winRate = sessionsPlayed > 0 ? (winCount / sessionsPlayed) * 100 : 0;

  // Calculate current streak
  let currentStreak = 0;
  let streakType: "hot" | "cold" | null = null;
  if (profits.length > 0) {
    const lastResult = profits[profits.length - 1];
    const isPositive = lastResult > 0;
    streakType = isPositive ? "hot" : "cold";
    for (let i = profits.length - 1; i >= 0; i--) {
      if ((isPositive && profits[i] > 0) || (!isPositive && profits[i] < 0)) {
        currentStreak++;
      } else {
        break;
      }
    }
    if (currentStreak < 3) {
      streakType = null;
      currentStreak = 0;
    }
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <AvatarUpload
          playerId={player.id}
          playerName={player.name}
          currentAvatarUrl={player.avatar_url}
        />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{player.name}</h1>
            {streakType && <StreakBadge type={streakType} count={currentStreak} />}
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">
            {player.is_regular ? "Regular" : "Guest"}
          </p>
        </div>
      </div>

      <StatsGrid
        stats={[
          { label: "Total P&L", value: formatCurrency(totalPL), positive: totalPL >= 0 },
          { label: "Sessions", value: sessionsPlayed.toString() },
          { label: "Avg P&L", value: formatCurrency(avgPL), positive: avgPL >= 0 },
          { label: "Win Rate", value: `${winRate.toFixed(0)}%` },
          { label: "Best Night", value: formatCurrency(bestSession), positive: true },
          { label: "Worst Night", value: formatCurrency(worstSession), positive: false },
        ]}
      />

      {/* Session history */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          Session History
        </h2>
        <div className="space-y-2">
          {[...activeSessions].reverse().map((sp) => {
            const pl = Number(sp.profit_loss);
            const session = sp.sessions as unknown as { id: string; date: string; location: string };
            return (
              <Link key={sp.id} href={`/sessions/${session.id}`}>
                <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card/50 hover:bg-card transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(parseISO(session.date), "MMM d, yyyy")}
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      {session.location}
                    </span>
                  </div>
                  <span
                    className={`font-bold tabular-nums ${
                      pl > 0 ? "text-emerald-400" : pl < 0 ? "text-red-400" : "text-muted-foreground"
                    }`}
                  >
                    {formatCurrency(pl)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
