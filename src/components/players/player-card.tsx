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
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{player.name}</span>
                {!player.is_regular && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                    Guest
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
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
