"use client";

import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  sessionId: string;
  leaderName: string;
}

export function OpenSessionBanner({ sessionId, leaderName }: Props) {
  return (
    <div className="mb-6 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
      <div className="flex items-start gap-3">
        <PlayCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-amber-400">Session is open</h3>
          <p className="text-xs text-muted-foreground mt-1">
            This session is waiting for results. Once the game is over, the session leader ({leaderName}) can close it by entering end balances.
          </p>
          <Link href={`/sessions/${sessionId}/edit?complete=true`}>
            <Button size="sm" className="mt-3 bg-amber-600 hover:bg-amber-700 text-white">
              Enter Results & Close
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
