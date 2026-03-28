import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { SessionCalendar } from "@/components/sessions/session-calendar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function SessionsPage() {
  const supabase = await createClient();

  const { data: sessions } = await supabase
    .from("sessions")
    .select(`
      *,
      session_players(
        profit_loss,
        buy_ins_count,
        end_balance,
        players(name)
      ),
      events(name)
    `)
    .order("date", { ascending: false });

  const calendarSessions = (sessions || []).map((session) => {
    const players = (session.session_players || []).filter(
      (sp: { buy_ins_count: number; profit_loss: number }) =>
        sp.buy_ins_count > 0 || sp.profit_loss !== 0
    );
    const topWinner = players.reduce(
      (best: { name: string; pl: number } | null, sp: { profit_loss: number; players: { name: string } }) => {
        const pl = Number(sp.profit_loss);
        if (!best || pl > best.pl) return { name: sp.players.name, pl };
        return best;
      },
      null as { name: string; pl: number } | null
    );
    const totalPot = players.reduce(
      (sum: number, sp: { buy_ins_count: number }) =>
        sum + sp.buy_ins_count * Number(session.buy_in_amount),
      0
    );

    return {
      id: session.id,
      date: session.date,
      location: session.location,
      status: session.status || "completed",
      buy_in_amount: Number(session.buy_in_amount),
      topWinner,
      playerCount: players.length,
      totalPot,
    };
  });

  return (
    <>
      <PageHeader
        title="Sessions"
        subtitle="All poker nights"
        action={
          <Link href="/sessions/new">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="w-4 h-4 mr-1" />
              New Session
            </Button>
          </Link>
        }
      />

      {!sessions?.length ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No sessions yet</p>
          <p className="text-sm mt-1">Create your first poker session</p>
        </div>
      ) : (
        <SessionCalendar sessions={calendarSessions} />
      )}
    </>
  );
}
