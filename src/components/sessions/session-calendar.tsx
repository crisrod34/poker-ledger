"use client";

import { useState, useMemo } from "react";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight, Crown, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/constants";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface SessionData {
  id: string;
  date: string;
  location: string;
  status: string;
  buy_in_amount: number;
  topWinner: { name: string; pl: number } | null;
  playerCount: number;
  totalPot: number;
}

interface Props {
  sessions: SessionData[];
}

export function SessionCalendar({ sessions }: Props) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    // Start at the most recent session's month, or today
    if (sessions.length > 0) {
      return startOfMonth(parseISO(sessions[0].date));
    }
    return startOfMonth(new Date());
  });

  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);

  const sessionsByDate = useMemo(() => {
    const map = new Map<string, SessionData[]>();
    for (const session of sessions) {
      const key = session.date;
      const existing = map.get(key) || [];
      existing.push(session);
      map.set(key, existing);
    }
    return map;
  }, [sessions]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setCurrentMonth((m) => subMonths(m, 1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <Button variant="ghost" size="sm" onClick={() => setCurrentMonth((m) => addMonths(m, 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {weekDays.map((d) => (
            <div key={d} className="px-2 py-2 text-center text-xs font-medium text-muted-foreground">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const daySessions = sessionsByDate.get(dateKey) || [];
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);
            const hasSession = daySessions.length > 0;

            return (
              <div
                key={index}
                className={`min-h-[80px] sm:min-h-[100px] border-b border-r border-border p-1.5 transition-colors ${
                  !inMonth ? "bg-muted/20" : hasSession ? "bg-card cursor-pointer hover:bg-emerald-500/5" : ""
                }`}
                onClick={() => {
                  if (daySessions.length === 1) {
                    setSelectedSession(daySessions[0]);
                  } else if (daySessions.length > 1) {
                    setSelectedSession(daySessions[0]);
                  }
                }}
              >
                <div className={`text-xs font-medium mb-1 ${
                  today
                    ? "text-emerald-400"
                    : inMonth
                      ? "text-foreground"
                      : "text-muted-foreground/40"
                }`}>
                  {today ? (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px]">
                      {format(day, "d")}
                    </span>
                  ) : (
                    format(day, "d")
                  )}
                </div>

                {/* Session indicators */}
                {daySessions.map((s) => (
                  <div
                    key={s.id}
                    className={`text-[10px] sm:text-xs px-1 py-0.5 rounded truncate mb-0.5 ${
                      s.status === "open"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    <span className="hidden sm:inline">{s.location}</span>
                    <span className="sm:hidden">♠</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected session detail */}
      <AnimatePresence mode="wait">
        {selectedSession && (
          <motion.div
            key={selectedSession.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Link href={`/sessions/${selectedSession.id}`}>
              <div className={`p-4 rounded-xl border transition-all cursor-pointer hover:border-emerald-500/20 ${
                selectedSession.status === "open"
                  ? "border-amber-500/20 bg-amber-500/5"
                  : "border-border bg-card/50"
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {selectedSession.status === "open" && (
                        <PlayCircle className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span className="font-semibold">{selectedSession.location}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(parseISO(selectedSession.date), "EEEE, MMMM d, yyyy")}
                      {" \u2022 "}
                      {selectedSession.playerCount} players
                      {" \u2022 "}
                      Pot: {"\u20AC"}{selectedSession.totalPot.toFixed(0)}
                    </div>
                  </div>
                  {selectedSession.topWinner && selectedSession.topWinner.pl > 0 && (
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-xs text-yellow-400/70">
                        <Crown className="w-3 h-3" />
                        {selectedSession.topWinner.name}
                      </div>
                      <div className="text-sm font-bold text-emerald-400 tabular-nums">
                        {formatCurrency(selectedSession.topWinner.pl)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
