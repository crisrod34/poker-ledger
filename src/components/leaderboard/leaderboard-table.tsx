"use client";

import { motion } from "framer-motion";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Sparkline } from "./sparkline";
import { RankBadge } from "./rank-badge";
import { formatCurrency } from "@/lib/constants";
import type { LeaderboardEntry } from "@/lib/supabase/types";
import Link from "next/link";

interface Props {
  entries: LeaderboardEntry[];
}

export function LeaderboardTable({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-lg font-medium">No sessions yet</p>
        <p className="text-sm">Start a poker session to see the leaderboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, index) => (
        <motion.div
          key={entry.player_id}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
        >
          <Link href={`/players/${entry.player_id}`}>
            <div
              className={`
                group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200
                hover:border-emerald-500/20 hover:bg-card/80 cursor-pointer
                ${index === 0
                  ? "bg-card border-emerald-500/20 glow-emerald-sm"
                  : index < 3
                    ? "bg-card border-border"
                    : "bg-card/50 border-border"
                }
              `}
            >
              {/* Rank */}
              <RankBadge rank={index + 1} />

              {/* Player info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold truncate">{entry.player_name}</span>
                  {!entry.is_regular && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                      Guest
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                  <span>{entry.sessions_played} sessions</span>
                  <span className="text-border">|</span>
                  <span>
                    {entry.win_count}W - {entry.sessions_played - entry.win_count}L
                  </span>
                </div>
              </div>

              {/* Sparkline */}
              <div className="hidden sm:block w-24 h-8">
                <Sparkline data={entry.history} />
              </div>

              {/* Avg P&L */}
              <div className="hidden sm:block text-right w-20">
                <div className="text-xs text-muted-foreground">Avg</div>
                <div
                  className={`text-sm font-medium tabular-nums ${
                    entry.avg_profit_loss >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {formatCurrency(entry.avg_profit_loss)}
                </div>
              </div>

              {/* Total P&L */}
              <div className="text-right min-w-[80px]">
                <div className="flex items-center justify-end gap-1">
                  {entry.total_profit_loss > 0 ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  ) : entry.total_profit_loss < 0 ? (
                    <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                  ) : (
                    <Minus className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                  <span
                    className={`text-lg font-bold tabular-nums ${
                      entry.total_profit_loss > 0
                        ? "text-emerald-400"
                        : entry.total_profit_loss < 0
                          ? "text-red-400"
                          : "text-muted-foreground"
                    }`}
                  >
                    {formatCurrency(entry.total_profit_loss)}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
