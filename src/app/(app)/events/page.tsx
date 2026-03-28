import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { CreateEventButton } from "@/components/events/create-event-button";

export default async function EventsPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select(`
      *,
      sessions(
        id,
        date,
        buy_in_amount,
        session_players(profit_loss, buy_ins_count)
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <>
      <PageHeader
        title="Events"
        subtitle="Multi-session tournaments and retreats"
        action={<CreateEventButton />}
      />

      {!events?.length ? (
        <div className="text-center py-16 text-muted-foreground">
          <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No events yet</p>
          <p className="text-sm">Create an event to group sessions together</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const sessionCount = event.sessions?.length || 0;
            const totalPot = (event.sessions || []).reduce(
              (sum: number, s: { buy_in_amount: number; session_players: { buy_ins_count: number }[] }) =>
                s.session_players.reduce(
                  (sSum: number, sp: { buy_ins_count: number }) => sSum + sp.buy_ins_count * Number(s.buy_in_amount),
                  sum
                ),
              0
            );

            return (
              <Link key={event.id} href={`/events/${event.id}`}>
                <div className="p-4 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-emerald-500/15 transition-all duration-200 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span className="font-semibold">{event.name}</span>
                      </div>
                      {event.description && (
                        <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                      )}
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <div>{sessionCount} session{sessionCount !== 1 ? "s" : ""}</div>
                      <div>{"\u20AC"}{totalPot} total pot</div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
