"use client";

import { useState, useRef } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface EventPhoto {
  id: string;
  event_id: string;
  storage_path: string;
  uploaded_at: string;
}

interface Props {
  eventId: string;
  photos: EventPhoto[];
}

export function EventPhotoGallery({ eventId, photos }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    if (photos.length + files.length > 10) {
      toast.error("Maximum 10 photos per event");
      return;
    }

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const path = `events/${eventId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("session-photos")
          .upload(path, file);

        if (uploadError) throw uploadError;

        await supabase.from("event_photos").insert({
          event_id: eventId,
          storage_path: path,
        });
      }

      toast.success("Photos uploaded");
      router.refresh();
    } catch {
      toast.error("Failed to upload photos");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const getPhotoUrl = (path: string) => {
    const { data } = supabase.storage.from("session-photos").getPublicUrl(path);
    return data.publicUrl;
  };

  const deletePhoto = async (photoId: string, path: string) => {
    await supabase.storage.from("session-photos").remove([path]);
    await supabase.from("event_photos").delete().eq("id", photoId);
    toast.success("Photo deleted");
    router.refresh();
  };

  return (
    <div className="rounded-xl border border-border bg-card/50 overflow-hidden mt-6">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Event Photos</h2>
          <span className="text-xs text-muted-foreground">{photos.length}/10</span>
        </div>
        {photos.length < 10 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
            ) : (
              <Camera className="w-3.5 h-3.5 mr-1" />
            )}
            Upload
          </Button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {photos.length > 0 ? (
        <div className="p-3 grid grid-cols-3 sm:grid-cols-5 gap-2">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative group aspect-square rounded-lg overflow-hidden cursor-pointer border border-border"
              onClick={() => setSelectedPhoto(photo.storage_path)}
            >
              <img
                src={getPhotoUrl(photo.storage_path)}
                alt="Event photo"
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deletePhoto(photo.id, photo.storage_path);
                }}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground text-sm">
          No photos yet
        </div>
      )}

      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">Photo view</DialogTitle>
          {selectedPhoto && (
            <img
              src={getPhotoUrl(selectedPhoto)}
              alt="Event photo"
              className="w-full h-auto"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
