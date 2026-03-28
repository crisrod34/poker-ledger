import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json();

  // Update session
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .update({
      date: body.date,
      location: body.location,
      buy_in_amount: body.buy_in_amount,
      leader_name: body.leader_name,
      banker_name: body.banker_name,
      event_id: body.event_id === "none" ? null : body.event_id,
      notes: body.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (sessionError) {
    return NextResponse.json({ error: sessionError.message }, { status: 400 });
  }

  // Replace player results: delete existing, insert new
  await supabase.from("session_players").delete().eq("session_id", id);

  const playerRows = body.players.map((p: {
    player_id: string;
    buy_ins_count: number;
    end_balance: number;
    profit_loss: number;
  }) => ({
    session_id: id,
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
    return NextResponse.json({ error: playersError.message }, { status: 400 });
  }

  return NextResponse.json(session);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json();

  // For partial updates like payment verification
  if (body.session_player_id && body.payment_verified !== undefined) {
    const { error } = await supabase
      .from("session_players")
      .update({ payment_verified: body.payment_verified })
      .eq("id", body.session_player_id)
      .eq("session_id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
