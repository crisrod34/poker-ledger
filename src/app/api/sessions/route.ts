import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .insert({
      date: body.date,
      location: body.location,
      buy_in_amount: body.buy_in_amount,
      leader_name: body.leader_name,
      banker_name: body.banker_name,
      event_id: body.event_id === "none" ? null : body.event_id,
      notes: body.notes,
      status: body.status || "completed",
    })
    .select()
    .single();

  if (sessionError) {
    return NextResponse.json({ error: sessionError.message }, { status: 400 });
  }

  // Insert player results
  const playerRows = body.players.map((p: {
    player_id: string;
    buy_ins_count: number;
    end_balance: number;
    profit_loss: number;
  }) => ({
    session_id: session.id,
    player_id: p.player_id,
    buy_ins_count: p.buy_ins_count,
    end_balance: p.end_balance,
    profit_loss: p.profit_loss,
    payment_verified: false,
  }));

  const { error: playersError } = await supabase
    .from("session_players")
    .insert(playerRows);

  if (playersError) {
    // Clean up the session if player insert fails
    await supabase.from("sessions").delete().eq("id", session.id);
    return NextResponse.json({ error: playersError.message }, { status: 400 });
  }

  return NextResponse.json(session, { status: 201 });
}
