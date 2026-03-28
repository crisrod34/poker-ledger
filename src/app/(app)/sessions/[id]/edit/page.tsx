import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { SessionForm } from "@/components/sessions/session-form";

export default async function EditSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("sessions")
    .select(`
      *,
      session_players(
        *,
        players(id, name)
      )
    `)
    .eq("id", id)
    .single();

  if (!session) notFound();

  const { data: players } = await supabase
    .from("players")
    .select("id, name, is_regular")
    .order("name");

  const { data: events } = await supabase
    .from("events")
    .select("id, name")
    .order("name");

  const existingPlayers = session.session_players
    .filter((sp: { buy_ins_count: number; profit_loss: number }) =>
      sp.buy_ins_count > 0 || sp.profit_loss !== 0
    )
    .map((sp: { player_id: string; buy_ins_count: number; end_balance: number; players: { name: string } }) => ({
      playerId: sp.player_id,
      playerName: sp.players.name,
      buyInsCount: sp.buy_ins_count,
      endBalance: Number(sp.end_balance),
    }));

  return (
    <>
      <PageHeader title="Edit Session" subtitle={`${session.location} - ${session.date}`} />
      <SessionForm
        players={players || []}
        events={events || []}
        editSession={{
          id: session.id,
          date: session.date,
          location: session.location,
          buyInAmount: Number(session.buy_in_amount),
          leaderName: session.leader_name,
          bankerName: session.banker_name,
          eventId: session.event_id,
          notes: session.notes,
          players: existingPlayers,
        }}
      />
    </>
  );
}
