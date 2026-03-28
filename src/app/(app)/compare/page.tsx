import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { ComparisonView } from "@/components/compare/comparison-view";

export default async function ComparePage() {
  const supabase = await createClient();

  const { data: players } = await supabase
    .from("players")
    .select("id, name, is_regular")
    .order("name");

  const { data: sessionPlayers } = await supabase
    .from("session_players")
    .select(`
      player_id,
      profit_loss,
      buy_ins_count,
      sessions!inner(id, date, location)
    `)
    .order("date", { referencedTable: "sessions", ascending: true });

  // Transform data: supabase returns sessions as single object, not array
  const transformed = (sessionPlayers || []).map((sp: Record<string, unknown>) => ({
    player_id: sp.player_id as string,
    profit_loss: sp.profit_loss as number,
    buy_ins_count: sp.buy_ins_count as number,
    sessions: sp.sessions as { id: string; date: string; location: string },
  }));

  return (
    <>
      <PageHeader title="Head to Head" subtitle="Compare two players" />
      <ComparisonView
        players={players || []}
        allSessionPlayers={transformed}
      />
    </>
  );
}
