-- Session lifecycle: open → completed
ALTER TABLE sessions ADD COLUMN status TEXT NOT NULL DEFAULT 'completed';

-- Event photos
CREATE TABLE event_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_event_photos_event ON event_photos(event_id);

ALTER TABLE event_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON event_photos FOR ALL USING (true) WITH CHECK (true);
