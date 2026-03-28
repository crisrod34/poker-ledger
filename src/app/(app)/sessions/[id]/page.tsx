import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { PageHeader } from "@/components/layout/page-header";
import { Calendar, MapPin, User, Landmark, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/constants";
import { PaymentChecklist } from "@/components/sessions/payment-checklist";
import { PhotoGallery } from "@/components/sessions/photo-gallery";
import { SessionEditButton } from "@/components/sessions/session-edit-button";
import Link from "next/link";

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("sessions")
    .select(`
      *,
      session_players(
        *,
        players(*)
      ),
      session_photos(*),
      events(*)
    `)
    .eq("id", id)
    .single();

  if (!session) notFound();

  const activePlayers = session.session_players
    .filter((sp: { buy_ins_count: number; profit_loss: number }) =>
      sp.buy_ins_count > 0 || sp.profit_loss !== 0
    )
    .sort((a: { profit_loss: number }, b: { profit_loss: number }) =>
      Number(b.profit_loss) - Number(a.profit_loss)
    );

  const totalPot = activePlayers.reduce(
    (sum: number, sp: { buy_ins_count: number }) =>
      sum + sp.buy_ins_count * Number(session.buy_in_amount),
    0
  );

  return (
    <>
      <PageHeader
        title={session.location}
        subtitle={format(parseISO(session.date), "EEEE, MMMM d, yyyy")}
        action={<SessionEditButton sessionId={session.id} leaderName={session.leader_name} />}
      />

      {/* Session info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <InfoCard icon={Calendar} label="Date" value={format(parseISO(session.date), "MMM d, yyyy")} />
        <InfoCard icon={MapPin} label="Location" value={session.location} />
        <InfoCard icon={User} label="Leader" value={session.leader_name} />
        <InfoCard icon={Landmark} label="Banker" value={session.banker_name} />
      </div>

      {session.events && (
        <Link
          href={`/events/${session.event_id}`}
          className="inline-flex items-center gap-1.5 mb-6 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/15 transition-colors"
        >
          <Sparkles className="w-3 h-3" />
          {session.events.name}
        </Link>
      )}

      {/* Results table */}
      <div className="rounded-xl border border-border bg-card/50 overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold">Results</h2>
          <span className="text-xs text-muted-foreground">
            Pot: {"\u20AC"}{totalPot.toFixed(0)} | Buy-in: {"\u20AC"}{Number(session.buy_in_amount).toFixed(0)}
          </span>
        </div>
        <div className="divide-y divide-border">
          {activePlayers.map((sp: { id: string; profit_loss: number; buy_ins_count: number; end_balance: number; players: { name: string; id: string } }, index: number) => {
            const pl = Number(sp.profit_loss);
            return (
              <div
                key={sp.id}
                className={`flex items-center justify-between px-4 py-3 ${
                  index === 0 && pl > 0 ? "bg-emerald-500/5" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center text-xs text-muted-foreground font-medium">
                    {index + 1}
                  </span>
                  <Link
                    href={`/players/${sp.players.id}`}
                    className="font-medium hover:text-emerald-400 transition-colors"
                  >
                    {sp.players.name}
                  </Link>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-muted-foreground tabular-nums hidden sm:block">
                    {sp.buy_ins_count} buy-in{sp.buy_ins_count !== 1 ? "s" : ""}
                  </span>
                  <span className="text-muted-foreground tabular-nums hidden sm:block">
                    {"\u20AC"}{Number(sp.end_balance).toFixed(2)}
                  </span>
                  <span
                    className={`font-bold tabular-nums min-w-[80px] text-right ${
                      pl > 0 ? "text-emerald-400" : pl < 0 ? "text-red-400" : "text-muted-foreground"
                    }`}
                  >
                    {formatCurrency(pl)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment checklist */}
      <PaymentChecklist
        sessionId={session.id}
        bankerName={session.banker_name}
        players={activePlayers.map((sp: { id: string; profit_loss: number; payment_verified: boolean; players: { name: string } }) => ({
          id: sp.id,
          name: sp.players.name,
          profitLoss: Number(sp.profit_loss),
          paymentVerified: sp.payment_verified,
        }))}
      />

      {/* Photos */}
      <PhotoGallery
        sessionId={session.id}
        photos={session.session_photos || []}
      />
    </>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="p-3 rounded-xl border border-border bg-card/50">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <div className="text-sm font-medium truncate">{value}</div>
    </div>
  );
}
