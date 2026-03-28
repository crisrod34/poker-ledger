"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Pencil, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Player } from "@/lib/supabase/types";

interface Props {
  players: Player[];
}

export function ManagePlayers({ players }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [open, setOpen] = useState(false);
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);
  const [name, setName] = useState("");
  const [isRegular, setIsRegular] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showList, setShowList] = useState(false);

  const openNew = () => {
    setEditPlayer(null);
    setName("");
    setIsRegular(false);
    setOpen(true);
  };

  const openEdit = (player: Player) => {
    setEditPlayer(player);
    setName(player.name);
    setIsRegular(player.is_regular);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);

    try {
      if (editPlayer) {
        const { error } = await supabase
          .from("players")
          .update({ name: name.trim(), is_regular: isRegular })
          .eq("id", editPlayer.id);
        if (error) throw error;
        toast.success("Player updated");
      } else {
        const { error } = await supabase
          .from("players")
          .insert({ name: name.trim(), is_regular: isRegular });
        if (error) throw error;
        toast.success("Player added");
      }
      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save";
      if (msg.includes("duplicate")) {
        toast.error("A player with that name already exists");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setShowList(true)}>
          <Pencil className="w-3.5 h-3.5 mr-1" />
          Edit
        </Button>
        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={openNew}>
          <UserPlus className="w-3.5 h-3.5 mr-1" />
          Add
        </Button>
      </div>

      {/* Edit list dialog */}
      <Dialog open={showList} onOpenChange={setShowList}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Players</DialogTitle>
            <DialogDescription>Edit player names and roles</DialogDescription>
          </DialogHeader>

          <div className="space-y-1">
            {players.filter((p) => p.is_regular).length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Pibardos</p>
                {players.filter((p) => p.is_regular).map((player) => (
                  <button
                    key={player.id}
                    onClick={() => { setShowList(false); openEdit(player); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
                        {player.avatar_url ? (
                          <img src={player.avatar_url} alt={player.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-bold text-muted-foreground">{player.name.charAt(0)}</span>
                        )}
                      </div>
                      <span className="text-sm font-medium">{player.name}</span>
                    </div>
                    <Pencil className="w-3 h-3 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}

            {players.filter((p) => !p.is_regular).length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Guests</p>
                {players.filter((p) => !p.is_regular).map((player) => (
                  <button
                    key={player.id}
                    onClick={() => { setShowList(false); openEdit(player); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
                        {player.avatar_url ? (
                          <img src={player.avatar_url} alt={player.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-bold text-muted-foreground">{player.name.charAt(0)}</span>
                        )}
                      </div>
                      <span className="text-sm font-medium">{player.name}</span>
                    </div>
                    <Pencil className="w-3 h-3 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button variant="outline" className="w-full mt-2" onClick={() => { setShowList(false); openNew(); }}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add New Player
          </Button>
        </DialogContent>
      </Dialog>

      {/* Add/Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editPlayer ? "Edit Player" : "Add Player"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                placeholder="Player name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegular(true)}
                  className={`flex-1 p-2.5 rounded-lg border text-sm font-medium transition-all ${
                    isRegular
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border-border bg-card/50 text-muted-foreground hover:bg-card"
                  }`}
                >
                  Pibardo
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegular(false)}
                  className={`flex-1 p-2.5 rounded-lg border text-sm font-medium transition-all ${
                    !isRegular
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border-border bg-card/50 text-muted-foreground hover:bg-card"
                  }`}
                >
                  Guest
                </button>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={loading || !name.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? "Saving..." : editPlayer ? "Update" : "Add Player"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
