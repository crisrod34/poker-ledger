"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, AlertTriangle, Check, PlayCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DEFAULT_BUY_IN, formatCurrency } from "@/lib/constants";
import { toast } from "sonner";

interface PlayerOption {
  id: string;
  name: string;
  is_regular: boolean;
}

interface EventOption {
  id: string;
  name: string;
}

interface PlayerRow {
  key: string;
  playerId: string;
  playerName: string;
  buyInsCount: number;
  endBalance: number;
}

interface EditSession {
  id: string;
  date: string;
  location: string;
  buyInAmount: number;
  leaderName: string;
  bankerName: string;
  eventId: string | null;
  notes: string | null;
  status: string;
  players: { playerId: string; playerName: string; buyInsCount: number; endBalance: number }[];
}

interface Props {
  players: PlayerOption[];
  events: EventOption[];
  editSession?: EditSession;
  mode?: "open" | "complete";
}

export function SessionForm({ players, events, editSession, mode }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Determine if we're completing an open session or creating new
  const isCompleting = mode === "complete";
  const isOpen = mode === "open" || (!editSession && !isCompleting);

  const [date, setDate] = useState(editSession?.date || new Date().toISOString().split("T")[0]);
  const [location, setLocation] = useState(editSession?.location || "");
  const [buyInAmount, setBuyInAmount] = useState(editSession?.buyInAmount || DEFAULT_BUY_IN);
  const [leaderName, setLeaderName] = useState(editSession?.leaderName || "");
  const [bankerName, setBankerName] = useState(editSession?.bankerName || "");
  const [eventId, setEventId] = useState(editSession?.eventId || "");
  const [notes, setNotes] = useState(editSession?.notes || "");
  const [status, setStatus] = useState<"open" | "completed">(
    isCompleting ? "completed" : (editSession?.status as "open" | "completed") || "open"
  );

  const [playerRows, setPlayerRows] = useState<PlayerRow[]>(() => {
    if (editSession?.players.length) {
      return editSession.players.map((p, i) => ({
        key: `existing-${i}`,
        playerId: p.playerId,
        playerName: p.playerName,
        buyInsCount: p.buyInsCount,
        endBalance: p.endBalance,
      }));
    }
    return [{ key: "0", playerId: "", playerName: "", buyInsCount: 1, endBalance: 0 }];
  });

  const addPlayerRow = () => {
    setPlayerRows((rows) => [
      ...rows,
      { key: Date.now().toString(), playerId: "", playerName: "", buyInsCount: 1, endBalance: 0 },
    ]);
  };

  const removePlayerRow = (key: string) => {
    setPlayerRows((rows) => rows.filter((r) => r.key !== key));
  };

  const updatePlayerRow = (key: string, field: Partial<PlayerRow>) => {
    setPlayerRows((rows) =>
      rows.map((r) => (r.key === key ? { ...r, ...field } : r))
    );
  };

  // Calculate totals
  const totalBuyIns = playerRows.reduce(
    (sum, r) => sum + (r.playerId ? r.buyInsCount * buyInAmount : 0),
    0
  );
  const totalEndBalance = playerRows.reduce(
    (sum, r) => sum + (r.playerId ? r.endBalance : 0),
    0
  );
  const isBalanced = Math.abs(totalBuyIns - totalEndBalance) < 0.01;
  const validPlayers = playerRows.filter((r) => r.playerId);

  // For open sessions, we don't need balance validation or end balances
  const needsResults = status === "completed";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leaderName || !bankerName || !location || !date) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (validPlayers.length < 2) {
      toast.error("Need at least 2 players");
      return;
    }

    if (needsResults && !isBalanced) {
      toast.error("End balances must equal total buy-ins");
      return;
    }

    setLoading(true);

    try {
      const body = {
        date,
        location,
        buy_in_amount: buyInAmount,
        leader_name: leaderName,
        banker_name: bankerName,
        event_id: eventId || null,
        notes: notes || null,
        status,
        players: validPlayers.map((r) => ({
          player_id: r.playerId,
          buy_ins_count: r.buyInsCount,
          end_balance: needsResults ? r.endBalance : 0,
          profit_loss: needsResults ? r.endBalance - r.buyInsCount * buyInAmount : 0,
        })),
      };

      const url = editSession
        ? `/api/sessions/${editSession.id}`
        : "/api/sessions";
      const method = editSession ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save session");

      const data = await res.json();
      const msg = status === "open"
        ? "Session opened"
        : editSession ? "Session updated" : "Session created";
      toast.success(msg);
      router.push(`/sessions/${data.id}`);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const usedPlayerIds = new Set(playerRows.map((r) => r.playerId).filter(Boolean));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Status toggle (only for new sessions) */}
      {!editSession && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setStatus("open")}
            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
              status === "open"
                ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                : "border-border bg-card/50 text-muted-foreground hover:bg-card"
            }`}
          >
            <PlayCircle className="w-4 h-4" />
            Open Session
          </button>
          <button
            type="button"
            onClick={() => setStatus("completed")}
            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
              status === "completed"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-border bg-card/50 text-muted-foreground hover:bg-card"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Log Completed
          </button>
        </div>
      )}

      {status === "open" && !editSession && (
        <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-sm text-amber-400">
          Open a session before the game starts. Players can be added and the banker can track buy-in payments. Close it with results after the game.
        </div>
      )}

      {/* Session details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date *</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Location *</Label>
          <Input
            placeholder="e.g., Chez Mariano"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Buy-in Amount ({"\u20AC"}) *</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={buyInAmount}
            onChange={(e) => setBuyInAmount(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label>Session Leader *</Label>
          <Select value={leaderName || undefined} onValueChange={(v) => v && setLeaderName(v)}>
            <SelectTrigger><SelectValue placeholder="Select leader" /></SelectTrigger>
            <SelectContent>
              {players.filter((p) => p.is_regular).map((p) => (
                <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Banker *</Label>
          <Select value={bankerName || undefined} onValueChange={(v) => v && setBankerName(v)}>
            <SelectTrigger><SelectValue placeholder="Select banker" /></SelectTrigger>
            <SelectContent>
              {players.filter((p) => p.is_regular).map((p) => (
                <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Event (optional)</Label>
          <Select value={eventId || undefined} onValueChange={(v) => setEventId(v || "")}>
            <SelectTrigger>
              <SelectValue placeholder="None">
                {eventId && eventId !== "none" ? events.find((e) => e.id === eventId)?.name : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {events.map((ev) => (
                <SelectItem key={ev.id} value={ev.id}>{ev.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>Notes (optional)</Label>
        <Input
          placeholder="Any notes about this session..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Player rows */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Players</Label>
          <Button type="button" variant="outline" size="sm" onClick={addPlayerRow}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Player
          </Button>
        </div>

        {/* Header */}
        <div className={`hidden sm:grid gap-2 px-1 text-xs text-muted-foreground font-medium ${
          needsResults ? "grid-cols-[1fr_80px_100px_100px_40px]" : "grid-cols-[1fr_80px_40px]"
        }`}>
          <span>Player</span>
          <span>Buy-ins</span>
          {needsResults && <span>End Balance</span>}
          {needsResults && <span>P&L</span>}
          <span />
        </div>

        <AnimatePresence initial={false}>
          {playerRows.map((row) => {
            const pl = row.playerId
              ? row.endBalance - row.buyInsCount * buyInAmount
              : 0;

            return (
              <motion.div
                key={row.key}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`grid gap-2 items-center ${
                  needsResults
                    ? "grid-cols-[1fr_80px_100px_40px] sm:grid-cols-[1fr_80px_100px_100px_40px]"
                    : "grid-cols-[1fr_80px_40px] sm:grid-cols-[1fr_80px_40px]"
                }`}>
                  <Select
                    value={row.playerId || undefined}
                    onValueChange={(v) => {
                      if (!v) return;
                      const player = players.find((p) => p.id === v);
                      updatePlayerRow(row.key, {
                        playerId: v,
                        playerName: player?.name || "",
                      });
                    }}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select player">
                        {row.playerName || undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {players
                        .filter((p) => !usedPlayerIds.has(p.id) || p.id === row.playerId)
                        .map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                            {!p.is_regular && " (Guest)"}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    min="1"
                    className="h-9 tabular-nums"
                    value={row.buyInsCount}
                    onChange={(e) =>
                      updatePlayerRow(row.key, { buyInsCount: Number(e.target.value) || 1 })
                    }
                  />

                  {needsResults && (
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      className="h-9 tabular-nums"
                      value={row.endBalance || ""}
                      onChange={(e) =>
                        updatePlayerRow(row.key, { endBalance: Number(e.target.value) || 0 })
                      }
                      placeholder="0.00"
                    />
                  )}

                  {/* P&L (desktop only, completed mode) */}
                  {needsResults && (
                    <div className="hidden sm:flex items-center justify-end">
                      <span
                        className={`text-sm font-medium tabular-nums ${
                          pl > 0 ? "text-emerald-400" : pl < 0 ? "text-red-400" : "text-muted-foreground"
                        }`}
                      >
                        {row.playerId ? formatCurrency(pl) : "-"}
                      </span>
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-muted-foreground hover:text-red-400"
                    onClick={() => removePlayerRow(row.key)}
                    disabled={playerRows.length <= 1}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Balance check (only for completed sessions) */}
      {needsResults && (
        <div
          className={`flex items-center justify-between p-3 rounded-xl border ${
            validPlayers.length === 0
              ? "border-border bg-muted/30"
              : isBalanced
                ? "border-emerald-500/20 bg-emerald-500/5"
                : "border-amber-500/20 bg-amber-500/5"
          }`}
        >
          <div className="flex items-center gap-2 text-sm">
            {validPlayers.length === 0 ? (
              <span className="text-muted-foreground">Add players to see balance</span>
            ) : isBalanced ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Balanced</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 font-medium">
                  Off by {"\u20AC"}{Math.abs(totalBuyIns - totalEndBalance).toFixed(2)}
                </span>
              </>
            )}
          </div>
          <div className="text-xs text-muted-foreground space-x-4">
            <span>Buy-ins: {"\u20AC"}{totalBuyIns.toFixed(2)}</span>
            <span>Balances: {"\u20AC"}{totalEndBalance.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={loading || (needsResults && !isBalanced) || validPlayers.length < 2}
        className={`w-full h-11 text-white ${
          status === "open"
            ? "bg-amber-600 hover:bg-amber-700"
            : "bg-emerald-600 hover:bg-emerald-700"
        }`}
      >
        {loading
          ? "Saving..."
          : status === "open"
            ? "Open Session"
            : editSession
              ? "Update Session"
              : "Create Session"
        }
      </Button>
    </form>
  );
}
