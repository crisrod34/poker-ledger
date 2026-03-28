"use client";

import { motion } from "framer-motion";
import { Crown, PlayCircle, Sparkles, Users } from "lucide-react";
import { format, parseISO } from "date-fns";
import { formatCurrency } from "@/lib/constants";
import Link from "next/link";
import type { Session } from "@/lib/supabase/types";

interface Props {
  session: Session & { status?: string };
  topWinner: { name: string; pl: number } | null;
  totalPot: number;
  playerCount: number;
  eventName?: string;
  index: number;
}

export function SessionCard({ session, topWinner, totalPot, playerCount, eventName, index }: Props) {
  const isOpen = session.status === "open";
  const date = parseISO(session.date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Link href={`/sessions/${session.id}`}>
        <div className={`group relative px-3.5 py-3 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
          isOpen
            ? "border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10"
            : "border-border bg-card/50 hover:bg-card hover:border-emerald-500/15"
        }`}>
          <div className="flex items-center justify-between gap-3">
            {/* Left: date + location + stats */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm">
                {isOpen && (
                  <span className="flex items-center gap-1 text-amber-400 text-xs font-medium shrink-0">
                    <PlayCircle className="w-3.5 h-3.5" />
                    Open
                  </span>
                )}
                <span className="font-medium truncate">
                  <span className="sm:hidden">{format(date, "MMM d")}</span>
                  <span className="hidden sm:inline">{format(date, "MMM d, yyyy")}</span>
                </span>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-muted-foreground truncate">{session.location}</span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{playerCount}</span>
                <span>€{totalPot.toFixed(0)}</span>
                <span className="hidden sm:inline">{format(date, "yyyy")}</span>
                {eventName && (
                  <span className="flex items-center gap-1 text-emerald-400/70 truncate">
                    <Sparkles className="w-3 h-3 shrink-0" />
                    {eventName}
                  </span>
                )}
              </div>
            </div>

            {/* Right: top winner */}
            {!isOpen && topWinner && topWinner.pl > 0 && (
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-xs text-yellow-400/70">
                  <Crown className="w-3 h-3" />
                  {topWinner.name}
                </div>
                <div className="text-sm font-bold text-emerald-400 tabular-nums">
                  {formatCurrency(topWinner.pl)}
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
