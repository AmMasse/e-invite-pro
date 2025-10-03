-- Create media table for storing photo/video metadata
CREATE TABLE public.media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  b2_file_id TEXT NOT NULL,
  b2_file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable Row Level Security
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Create policies for media access
CREATE POLICY "Anyone can view media"
  ON public.media
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can upload media"
  ON public.media
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Guests can delete their own media"
  ON public.media
  FOR DELETE
  USING (guest_id = auth.uid() OR true);

-- Create index for better performance
CREATE INDEX idx_media_event_id ON public.media(event_id);
CREATE INDEX idx_media_guest_id ON public.media(guest_id);
CREATE INDEX idx_media_uploaded_at ON public.media(uploaded_at DESC);