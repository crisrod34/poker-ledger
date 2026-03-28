"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Crown, Sparkles, PlayCircle } from "lucide-react";
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Link href={`/sessions/${session.id}`}>
        <div className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
          isOpen
            ? "border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10"
            : "border-border bg-card/50 hover:bg-card hover:border-emerald-500/15"
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 flex-1 min-w-0">
              {/* Date & Location */}
              <div className="flex items-center gap-3 text-sm">
                {isOpen && (
                  <span className="flex items-center gap-1 text-amber-400 text-xs font-medium">
                    <PlayCircle className="w-3.5 h-3.5" />
                    Open
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(parseISO(session.date), "MMM d, yyyy")}
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate">{session.location}</span>
                </span>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {playerCount} players
                </span>
                <span>Pot: {"\u20AC"}{totalPot.toFixed(0)}</span>
                {eventName && (
                  <span className="flex items-center gap-1 text-emerald-400/70">
                    <Sparkles className="w-3 h-3" />
                    {eventName}
                  </span>
                )}
              </div>
            </div>

            {/* Top winner (only for completed) */}
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
