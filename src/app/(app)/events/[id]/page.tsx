import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { formatCurrency } from "@/lib/constants";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!event) notFound();

  const { data: sessions } = await supabase
    .from("sessions")
    .select(`
      *,
      session_players(
        profit_loss,
        buy_ins_count,
        end_balance,
        players(id, name)
      )
    `)
    .eq("event_id", id)
    .order("date", { ascending: true });

  // Build combined leaderboard
  const playerMap = new Map<string, { name: string; totalPL: number; totalWagered: number; totalEndBalance: number }>();

  for (const session of sessions || []) {
    for (const sp of session.session_players) {
      if (sp.buy_ins_count === 0 && Number(sp.profit_loss) === 0) continue;
      const player = sp.players as unknown as { id: string; name: string };
      const existing = playerMap.get(player.id);
      const wagered = sp.buy_ins_count * Number(session.buy_in_amount);
      if (existing) {
        existing.totalPL += Number(sp.profit_loss);
        existing.totalWagered += wagered;
        existing.totalEndBalance += Number(sp.end_balance);
      } else {
        playerMap.set(player.id, {
          name: player.name,
          totalPL: Number(sp.profit_loss),
          totalWagered: wagered,
          totalEndBalance: Number(sp.end_balance),
        });
      }
    }
  }

  const leaderboard = [...playerMap.entries()]
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.totalPL - a.totalPL);

  return (
    <>
      <PageHeader
        title={event.name}
        subtitle={event.description || `${sessions?.length || 0} sessions`}
      />

      {/* Combined leaderboard */}
      <div className="rounded-xl border border-border bg-card/50 overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold">Combined Leaderboard</h2>
        </div>
        <div className="divide-y divide-border">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between px-4 py-3 ${
                index === 0 ? "bg-emerald-500/5" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center text-xs text-muted-foreground font-medium">
                  {index + 1}
                </span>
                <Link
                  href={`/players/${entry.id}`}
                  className="font-medium hover:text-emerald-400 transition-colors"
                >
                  {entry.name}
                </Link>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <span className="text-muted-foreground tabular-nums hidden sm:block">
                  Wagered: {"\u20AC"}{entry.totalWagered.toFixed(0)}
                </span>
                <span className="text-muted-foreground tabular-nums hidden sm:block">
                  End: {"\u20AC"}{entry.totalEndBalance.toFixed(2)}
                </span>
                <span
                  className={`font-bold tabular-nums min-w-[80px] text-right ${
                    entry.totalPL > 0 ? "text-emerald-400" : entry.totalPL < 0 ? "text-red-400" : "text-muted-foreground"
                  }`}
                >
                  {formatCurrency(entry.totalPL)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sessions in this event */}
      <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
        Sessions
      </h2>
      <div className="space-y-2">
        {(sessions || []).map((session) => (
          <Link key={session.id} href={`/sessions/${session.id}`}>
            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card/50 hover:bg-card transition-colors cursor-pointer">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{format(parseISO(session.date), "MMM d, yyyy")}</span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {session.location}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {session.session_players.filter(
                  (sp: { buy_ins_count: number }) => sp.buy_ins_count > 0
                ).length} players
              </span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
