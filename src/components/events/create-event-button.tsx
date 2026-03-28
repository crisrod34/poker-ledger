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
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function CreateEventButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);

    const { error } = await supabase.from("events").insert({
      name: name.trim(),
      description: description.trim() || null,
    });

    if (error) {
      toast.error("Failed to create event");
    } else {
      toast.success("Event created");
      setOpen(false);
      setName("");
      setDescription("");
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <>
      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-1" />
        New Event
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Create Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input placeholder="e.g., Retiro Poker 2025" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="Optional description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <Button onClick={handleCreate} disabled={loading || !name.trim()} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
