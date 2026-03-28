"use client";

import { motion } from "framer-motion";

interface Stat {
  label: string;
  value: string;
  positive?: boolean;
}

interface Props {
  stats: Stat[];
}

export function StatsGrid({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          className="p-4 rounded-xl border border-border bg-card/50"
        >
          <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
          <div
            className={`text-xl font-bold tabular-nums ${
              stat.positive === true
                ? "text-emerald-400"
                : stat.positive === false
                  ? "text-red-400"
                  : "text-foreground"
            }`}
          >
            {stat.value}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
