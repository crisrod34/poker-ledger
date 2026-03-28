"use client";

import { useState } from "react";
import { Landmark, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface PlayerPayment {
  id: string;
  name: string;
  profitLoss: number;
  paymentVerified: boolean;
}

interface Props {
  sessionId: string;
  bankerName: string;
  players: PlayerPayment[];
  isOpen?: boolean;
}

export function PaymentChecklist({ sessionId, bankerName, players, isOpen }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  // For open sessions: everyone except banker needs to pay buy-in
  // For completed sessions: everyone except banker needs to settle
  const playersToSettle = players.filter((p) => p.name !== bankerName);

  if (playersToSettle.length === 0) return null;

  const togglePayment = async (sessionPlayerId: string, currentStatus: boolean) => {
    setLoading(sessionPlayerId);
    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_player_id: sessionPlayerId,
          payment_verified: !currentStatus,
        }),
      });
      router.refresh();
    } catch {
      // Silently fail
    } finally {
      setLoading(null);
    }
  };

  const allVerified = playersToSettle.every((p) => p.paymentVerified);

  return (
    <div className="rounded-xl border border-border bg-card/50 overflow-hidden mb-6">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Landmark className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">
          {isOpen ? "Buy-in Payments" : "Payment Status"}
        </h2>
        <span className="text-xs text-muted-foreground ml-auto">
          Banker: {bankerName}
        </span>
      </div>

      <div className="divide-y divide-border">
        {playersToSettle.map((player) => (
          <div key={player.id} className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-sm">{player.name}</span>
              {!isOpen && (
                <span
                  className={`text-xs tabular-nums ${
                    player.profitLoss >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {player.profitLoss >= 0 ? "+" : ""}{"\u20AC"}{player.profitLoss.toFixed(2)}
                </span>
              )}
            </div>
            <button
              onClick={() => togglePayment(player.id, player.paymentVerified)}
              disabled={loading === player.id}
              className={`
                flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all
                ${player.paymentVerified
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/15"
                }
                ${loading === player.id ? "opacity-50" : ""}
              `}
            >
              {player.paymentVerified ? (
                <>
                  <Check className="w-3 h-3" />
                  Paid
                </>
              ) : (
                <>
                  <X className="w-3 h-3" />
                  Unpaid
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {allVerified && (
        <div className="px-4 py-2 bg-emerald-500/5 border-t border-emerald-500/10 text-center">
          <span className="text-xs text-emerald-400 font-medium">
            {isOpen ? "All buy-ins collected" : "All payments settled"}
          </span>
        </div>
      )}
    </div>
  );
}
