import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { PlayerCard } from "@/components/players/player-card";

export default async function PlayersPage() {
  const supabase = await createClient();

  const { data: players } = await supabase
    .from("players")
    .select(`
      *,
      session_players(profit_loss, buy_ins_count)
    `)
    .order("name");

  const regulars = (players || []).filter((p) => p.is_regular);
  const guests = (players || []).filter((p) => !p.is_regular);

  const getStats = (player: typeof regulars[0]) => {
    const sessions = player.session_players.filter(
      (sp: { buy_ins_count: number; profit_loss: number }) =>
        sp.buy_ins_count > 0 || Number(sp.profit_loss) !== 0
    );
    const totalPL = sessions.reduce(
      (sum: number, sp: { profit_loss: number }) => sum + Number(sp.profit_loss),
      0
    );
    return { totalPL, sessionsPlayed: sessions.length };
  };

  return (
    <>
      <PageHeader title="Players" subtitle="The poker crew" />

      {regulars.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
            Regulars
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {regulars.map((player) => {
              const stats = getStats(player);
              return (
                <PlayerCard
                  key={player.id}
                  player={player}
                  totalPL={stats.totalPL}
                  sessionsPlayed={stats.sessionsPlayed}
                />
              );
            })}
          </div>
        </div>
      )}

      {guests.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
            Guests
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {guests.map((player) => {
              const stats = getStats(player);
              return (
                <PlayerCard
                  key={player.id}
                  player={player}
                  totalPL={stats.totalPL}
                  sessionsPlayed={stats.sessionsPlayed}
                />
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
