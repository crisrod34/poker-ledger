"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REGULAR_PLAYERS } from "@/lib/constants";
import { useRouter } from "next/navigation";

interface Props {
  sessionId: string;
  leaderName: string;
  isOpen?: boolean;
}

export function SessionEditButton({ sessionId, leaderName, isOpen }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleConfirm = () => {
    if (selectedName === leaderName) {
      const url = isOpen
        ? `/sessions/${sessionId}/edit?complete=true`
        : `/sessions/${sessionId}/edit`;
      router.push(url);
    } else {
      setError(true);
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="w-3.5 h-3.5 mr-1" />
        Edit
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Verify identity</DialogTitle>
            <DialogDescription>
              Only the session leader can edit this session. Select your name to continue.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Select value={selectedName || undefined} onValueChange={(v) => { setSelectedName(v || ""); setError(false); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select your name" />
              </SelectTrigger>
              <SelectContent>
                {REGULAR_PLAYERS.map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {error && (
              <p className="text-red-400 text-sm">
                Only {leaderName} can edit this session.
              </p>
            )}

            <Button onClick={handleConfirm} disabled={!selectedName} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
