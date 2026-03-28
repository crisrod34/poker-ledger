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
import { Plus, Trash2, AlertTriangle, Check, PlayCircle, CheckCircle2, Users } from "lucide-react";
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

  const isCompleting = mode === "complete";

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

      const url = editSession ? `/api/sessions/${editSession.id}` : "/api/sessions";
      const method = editSession ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save session");

      const data = await res.json();
      toast.success(status === "open" ? "Session opened" : editSession ? "Session updated" : "Session created");
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Status toggle */}
      {!editSession && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setStatus("open")}
            className={`flex items-center justify-center gap-2.5 py-3.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
              status === "open"
                ? "border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.08)]"
                : "border-border bg-card/30 text-muted-foreground hover:bg-card/60"
            }`}
          >
            <PlayCircle className="w-4 h-4" />
            Open Session
          </button>
          <button
            type="button"
            onClick={() => setStatus("completed")}
            className={`flex items-center justify-center gap-2.5 py-3.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
              status === "completed"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.08)]"
                : "border-border bg-card/30 text-muted-foreground hover:bg-card/60"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Log Completed
          </button>
        </div>
      )}

      {status === "open" && !editSession && (
        <div className="px-4 py-3 rounded-xl border border-amber-500/15 bg-amber-500/5 text-[13px] leading-relaxed text-amber-300/80">
          Open a session before the game starts. The banker can track buy-in payments. Close it with results after.
        </div>
      )}

      {/* Session Details Card */}
      <div className="rounded-2xl border border-border bg-card/40 p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-10 w-full" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Buy-in ({"\u20AC"})</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={buyInAmount}
              onChange={(e) => setBuyInAmount(Number(e.target.value))}
              className="h-10 w-full"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Location</Label>
          <Input
            placeholder="e.g., Chez Mariano"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-10 w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Session Leader</Label>
            <Select value={leaderName} onValueChange={(v) => v && setLeaderName(v)}>
              <SelectTrigger className="h-10 w-full"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {players.filter((p) => p.is_regular).map((p) => (
                  <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Banker</Label>
            <Select value={bankerName} onValueChange={(v) => v && setBankerName(v)}>
              <SelectTrigger className="h-10 w-full"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {players.filter((p) => p.is_regular).map((p) => (
                  <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Collapsible extras */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Event</Label>
            <Select value={eventId} onValueChange={(v) => setEventId(v || "")}>
              <SelectTrigger className="h-10 w-full">
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
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Notes</Label>
            <Input
              placeholder="Optional"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-10 w-full"
            />
          </div>
        </div>
      </div>

      {/* Players Card */}
      <div className="rounded-2xl border border-border bg-card/40 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Players</span>
            {validPlayers.length > 0 && (
              <span className="text-xs text-muted-foreground">({validPlayers.length})</span>
            )}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addPlayerRow} className="h-8">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add
          </Button>
        </div>

        {/* Desktop header */}
        {needsResults && (
          <div className="hidden sm:grid grid-cols-[1fr_80px_100px_90px_44px] gap-3 px-5 py-2 text-[11px] text-muted-foreground font-medium uppercase tracking-wider border-b border-border/50">
            <span>Player</span>
            <span>Buy-ins</span>
            <span>End Bal.</span>
            <span className="text-right">P&L</span>
            <span />
          </div>
        )}

        <div className="divide-y divide-border/50">
          <AnimatePresence initial={false}>
            {playerRows.map((row) => {
              const pl = row.playerId ? row.endBalance - row.buyInsCount * buyInAmount : 0;

              return (
                <motion.div
                  key={row.key}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  className="px-5 py-3"
                >
                  {/* Mobile: stacked layout */}
                  <div className="sm:hidden space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <Select
                          value={row.playerId}
                          onValueChange={(v) => {
                            if (!v) return;
                            const player = players.find((p) => p.id === v);
                            updatePlayerRow(row.key, { playerId: v, playerName: player?.name || "" });
                          }}
                        >
                          <SelectTrigger className="h-10 w-full">
                            <SelectValue placeholder="Select player">
                              {row.playerName || undefined}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {players
                              .filter((p) => !usedPlayerIds.has(p.id) || p.id === row.playerId)
                              .map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.name}{!p.is_regular && " (Guest)"}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0 text-muted-foreground hover:text-red-400 shrink-0"
                        onClick={() => removePlayerRow(row.key)}
                        disabled={playerRows.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className={`grid gap-2 ${needsResults ? "grid-cols-3" : "grid-cols-1"}`}>
                      <div>
                        <Label className="text-[10px] text-muted-foreground mb-1 block">Buy-ins</Label>
                        <Input
                          type="number"
                          min="1"
                          className="h-10 tabular-nums"
                          value={row.buyInsCount}
                          onChange={(e) => updatePlayerRow(row.key, { buyInsCount: Number(e.target.value) || 1 })}
                        />
                      </div>
                      {needsResults && (
                        <div>
                          <Label className="text-[10px] text-muted-foreground mb-1 block">End Bal.</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            className="h-10 tabular-nums"
                            value={row.endBalance || ""}
                            onChange={(e) => updatePlayerRow(row.key, { endBalance: Number(e.target.value) || 0 })}
                            placeholder="0.00"
                          />
                        </div>
                      )}
                      {needsResults && (
                        <div>
                          <Label className="text-[10px] text-muted-foreground mb-1 block">P&L</Label>
                          <div className={`h-10 flex items-center justify-center rounded-lg border border-border/50 text-sm font-semibold tabular-nums ${
                            pl > 0 ? "text-emerald-400 bg-emerald-500/5" : pl < 0 ? "text-red-400 bg-red-500/5" : "text-muted-foreground"
                          }`}>
                            {row.playerId ? formatCurrency(pl) : "-"}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Desktop: grid layout */}
                  <div className={`hidden sm:grid gap-3 items-center ${
                    needsResults
                      ? "grid-cols-[1fr_80px_100px_90px_44px]"
                      : "grid-cols-[1fr_80px_44px]"
                  }`}>
                    <Select
                      value={row.playerId}
                      onValueChange={(v) => {
                        if (!v) return;
                        const player = players.find((p) => p.id === v);
                        updatePlayerRow(row.key, { playerId: v, playerName: player?.name || "" });
                      }}
                    >
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue placeholder="Select player">
                          {row.playerName || undefined}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {players
                          .filter((p) => !usedPlayerIds.has(p.id) || p.id === row.playerId)
                          .map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}{!p.is_regular && " (Guest)"}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      min="1"
                      className="h-10 tabular-nums"
                      value={row.buyInsCount}
                      onChange={(e) => updatePlayerRow(row.key, { buyInsCount: Number(e.target.value) || 1 })}
                    />

                    {needsResults && (
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        className="h-10 tabular-nums"
                        value={row.endBalance || ""}
                        onChange={(e) => updatePlayerRow(row.key, { endBalance: Number(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    )}

                    {needsResults && (
                      <div className="flex items-center justify-end">
                        <span className={`text-sm font-semibold tabular-nums ${
                          pl > 0 ? "text-emerald-400" : pl < 0 ? "text-red-400" : "text-muted-foreground"
                        }`}>
                          {row.playerId ? formatCurrency(pl) : "-"}
                        </span>
                      </div>
                    )}

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 text-muted-foreground hover:text-red-400"
                      onClick={() => removePlayerRow(row.key)}
                      disabled={playerRows.length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Balance indicator */}
      {needsResults && (
        <div
          className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
            validPlayers.length === 0
              ? "border-border bg-muted/20"
              : isBalanced
                ? "border-emerald-500/20 bg-emerald-500/5"
                : "border-amber-500/20 bg-amber-500/5"
          }`}
        >
          <div className="flex items-center gap-2 text-sm">
            {validPlayers.length === 0 ? (
              <span className="text-muted-foreground text-xs">Add players to see balance</span>
            ) : isBalanced ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-medium text-xs">Balanced</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 font-medium text-xs">
                  Off by {"\u20AC"}{Math.abs(totalBuyIns - totalEndBalance).toFixed(2)}
                </span>
              </>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground tabular-nums space-x-3">
            <span>In: {"\u20AC"}{totalBuyIns.toFixed(2)}</span>
            <span>Out: {"\u20AC"}{totalEndBalance.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={loading || (needsResults && !isBalanced) || validPlayers.length < 2}
        className={`w-full h-12 text-white font-medium text-sm rounded-xl transition-all duration-200 ${
          status === "open"
            ? "bg-amber-600 hover:bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
            : "bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
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
