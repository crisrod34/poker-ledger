"use client";

import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";

interface Player {
  id: string;
  name: string;
  is_regular: boolean;
}

interface SessionPlayerData {
  player_id: string;
  profit_loss: number;
  buy_ins_count: number;
  sessions: { id: string; date: string; location: string };
}

interface Props {
  players: Player[];
  allSessionPlayers: SessionPlayerData[];
}

export function ComparisonView({ players, allSessionPlayers }: Props) {
  const [player1Id, setPlayer1Id] = useState("");
  const [player2Id, setPlayer2Id] = useState("");

  const comparison = useMemo(() => {
    if (!player1Id || !player2Id) return null;

    const p1Data = allSessionPlayers.filter(
      (sp) => sp.player_id === player1Id && (sp.buy_ins_count > 0 || Number(sp.profit_loss) !== 0)
    );
    const p2Data = allSessionPlayers.filter(
      (sp) => sp.player_id === player2Id && (sp.buy_ins_count > 0 || Number(sp.profit_loss) !== 0)
    );

    const p1Sessions = new Set(p1Data.map((sp) => sp.sessions.id));
    const p2Sessions = new Set(p2Data.map((sp) => sp.sessions.id));

    // Shared sessions
    const sharedSessionIds = [...p1Sessions].filter((id) => p2Sessions.has(id));
    const sharedSessions = sharedSessionIds.map((sessionId) => {
      const sp1 = p1Data.find((sp) => sp.sessions.id === sessionId)!;
      const sp2 = p2Data.find((sp) => sp.sessions.id === sessionId)!;
      return {
        sessionId,
        date: sp1.sessions.date,
        location: sp1.sessions.location,
        p1PL: Number(sp1.profit_loss),
        p2PL: Number(sp2.profit_loss),
      };
    }).sort((a, b) => b.date.localeCompare(a.date));

    const p1Total = p1Data.reduce((s, sp) => s + Number(sp.profit_loss), 0);
    const p2Total = p2Data.reduce((s, sp) => s + Number(sp.profit_loss), 0);
    const p1Wins = p1Data.filter((sp) => Number(sp.profit_loss) > 0).length;
    const p2Wins = p2Data.filter((sp) => Number(sp.profit_loss) > 0).length;

    // Head-to-head: in shared sessions, who performed better
    let h2hP1Wins = 0;
    let h2hP2Wins = 0;
    for (const s of sharedSessions) {
      if (s.p1PL > s.p2PL) h2hP1Wins++;
      else if (s.p2PL > s.p1PL) h2hP2Wins++;
    }

    return {
      p1: { total: p1Total, sessions: p1Data.length, wins: p1Wins, avg: p1Data.length ? p1Total / p1Data.length : 0 },
      p2: { total: p2Total, sessions: p2Data.length, wins: p2Wins, avg: p2Data.length ? p2Total / p2Data.length : 0 },
      h2h: { p1Wins: h2hP1Wins, p2Wins: h2hP2Wins, ties: sharedSessions.length - h2hP1Wins - h2hP2Wins },
      sharedSessions,
    };
  }, [player1Id, player2Id, allSessionPlayers]);

  const p1Name = players.find((p) => p.id === player1Id)?.name || "Player 1";
  const p2Name = players.find((p) => p.id === player2Id)?.name || "Player 2";

  return (
    <div className="space-y-6">
      {/* Player selectors */}
      <div className="grid grid-cols-2 gap-4">
        <Select value={player1Id || undefined} onValueChange={(v) => v && setPlayer1Id(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select player 1">
              {players.find((p) => p.id === player1Id)?.name}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {players.filter((p) => p.id !== player2Id).map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={player2Id || undefined} onValueChange={(v) => v && setPlayer2Id(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select player 2">
              {players.find((p) => p.id === player2Id)?.name}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {players.filter((p) => p.id !== player1Id).map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AnimatePresence mode="wait">
        {comparison && (
          <motion.div
            key={`${player1Id}-${player2Id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Stats comparison */}
            <div className="grid gap-3">
              <CompareRow label="Total P&L" v1={comparison.p1.total} v2={comparison.p2.total} format="currency" />
              <CompareRow label="Sessions" v1={comparison.p1.sessions} v2={comparison.p2.sessions} format="number" />
              <CompareRow label="Avg P&L" v1={comparison.p1.avg} v2={comparison.p2.avg} format="currency" />
              <CompareRow label="Win Rate" v1={comparison.p1.sessions ? (comparison.p1.wins / comparison.p1.sessions) * 100 : 0} v2={comparison.p2.sessions ? (comparison.p2.wins / comparison.p2.sessions) * 100 : 0} format="percent" />
            </div>

            {/* Head to head record */}
            {comparison.sharedSessions.length > 0 && (
              <div className="rounded-xl border border-border bg-card/50 p-4">
                <h3 className="text-sm font-semibold mb-3">
                  Head to Head ({comparison.sharedSessions.length} shared sessions)
                </h3>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">{comparison.h2h.p1Wins}</div>
                    <div className="text-xs text-muted-foreground">{p1Name}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">-</div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{comparison.h2h.ties}</div>
                    <div className="text-xs text-muted-foreground">Ties</div>
                  </div>
                  <div className="text-xs text-muted-foreground">-</div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">{comparison.h2h.p2Wins}</div>
                    <div className="text-xs text-muted-foreground">{p2Name}</div>
                  </div>
                </div>

                {/* Shared session list */}
                <div className="space-y-1.5">
                  {comparison.sharedSessions.map((s) => (
                    <div key={s.sessionId} className="flex items-center justify-between text-sm py-1.5 px-2 rounded-lg hover:bg-muted/30">
                      <span className="text-xs text-muted-foreground w-24">
                        {format(parseISO(s.date), "MMM d, yy")}
                      </span>
                      <span className={`tabular-nums font-medium w-20 text-right ${s.p1PL > s.p2PL ? "text-emerald-400" : s.p1PL < s.p2PL ? "text-red-400" : "text-muted-foreground"}`}>
                        {formatCurrency(s.p1PL)}
                      </span>
                      <span className="text-muted-foreground text-xs">vs</span>
                      <span className={`tabular-nums font-medium w-20 text-left ${s.p2PL > s.p1PL ? "text-emerald-400" : s.p2PL < s.p1PL ? "text-red-400" : "text-muted-foreground"}`}>
                        {formatCurrency(s.p2PL)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CompareRow({ label, v1, v2, format: fmt }: {
  label: string;
  v1: number;
  v2: number;
  format: "currency" | "number" | "percent";
}) {
  const formatValue = (v: number) => {
    if (fmt === "currency") return formatCurrency(v);
    if (fmt === "percent") return `${v.toFixed(0)}%`;
    return v.toString();
  };

  const maxVal = Math.max(Math.abs(v1), Math.abs(v2)) || 1;
  const p1Width = (Math.abs(v1) / maxVal) * 100;
  const p2Width = (Math.abs(v2) / maxVal) * 100;
  const p1Better = fmt === "currency" ? v1 > v2 : v1 > v2;
  const p2Better = fmt === "currency" ? v2 > v1 : v2 > v1;

  return (
    <div className="rounded-xl border border-border bg-card/50 p-3">
      <div className="text-xs text-muted-foreground text-center mb-2">{label}</div>
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
        <div className="text-right">
          <div className={`text-sm font-bold tabular-nums ${p1Better ? "text-emerald-400" : "text-foreground"}`}>
            {formatValue(v1)}
          </div>
          <div className="h-1.5 rounded-full bg-muted mt-1 overflow-hidden flex justify-end">
            <div
              className={`h-full rounded-full ${p1Better ? "bg-emerald-500" : "bg-muted-foreground/30"}`}
              style={{ width: `${p1Width}%` }}
            />
          </div>
        </div>
        <div className="text-xs text-muted-foreground">vs</div>
        <div>
          <div className={`text-sm font-bold tabular-nums ${p2Better ? "text-emerald-400" : "text-foreground"}`}>
            {formatValue(v2)}
          </div>
          <div className="h-1.5 rounded-full bg-muted mt-1 overflow-hidden">
            <div
              className={`h-full rounded-full ${p2Better ? "bg-emerald-500" : "bg-muted-foreground/30"}`}
              style={{ width: `${p2Width}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
