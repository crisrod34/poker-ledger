import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { format, parseISO } from "date-fns";

export async function GET() {
  const supabase = await createClient();

  const { data: sessions } = await supabase
    .from("sessions")
    .select(`
      *,
      session_players(
        buy_ins_count,
        end_balance,
        profit_loss,
        payment_verified,
        players(name)
      )
    `)
    .order("date", { ascending: true });

  if (!sessions) {
    return NextResponse.json({ error: "No data" }, { status: 404 });
  }

  const rows: string[] = [
    "Date,Location,Buy-in Amount,Leader,Banker,Player,Buy-ins,End Balance,P&L,Payment Verified",
  ];

  for (const session of sessions) {
    for (const sp of session.session_players) {
      if (sp.buy_ins_count === 0 && Number(sp.profit_loss) === 0) continue;
      const player = sp.players as unknown as { name: string };
      rows.push(
        [
          format(parseISO(session.date), "yyyy-MM-dd"),
          `"${session.location}"`,
          Number(session.buy_in_amount).toFixed(2),
          `"${session.leader_name}"`,
          `"${session.banker_name}"`,
          `"${player.name}"`,
          sp.buy_ins_count,
          Number(sp.end_balance).toFixed(2),
          Number(sp.profit_loss).toFixed(2),
          sp.payment_verified ? "Yes" : "No",
        ].join(",")
      );
    }
  }

  const csv = rows.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="poker-ledger-export.csv"`,
    },
  });
}
