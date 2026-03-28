"use client";

import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/constants";
import Link from "next/link";
import type { Player } from "@/lib/supabase/types";

interface Props {
  player: Player;
  totalPL: number;
  sessionsPlayed: number;
}

export function PlayerCard({ player, totalPL, sessionsPlayed }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/players/${player.id}`}>
        <div className="p-4 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-emerald-500/15 transition-all duration-200 cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
              {player.avatar_url ? (
                <img src={player.avatar_url} alt={player.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-muted-foreground">{player.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold truncate">{player.name}</span>
                {!player.is_regular && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                    Guest
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {sessionsPlayed} session{sessionsPlayed !== 1 ? "s" : ""}
              </div>
            </div>
            <span
              className={`text-lg font-bold tabular-nums ${
                totalPL > 0 ? "text-emerald-400" : totalPL < 0 ? "text-red-400" : "text-muted-foreground"
              }`}
            >
              {formatCurrency(totalPL)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
