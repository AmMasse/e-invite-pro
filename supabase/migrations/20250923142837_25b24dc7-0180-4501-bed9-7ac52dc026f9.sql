-- E-Invite Database Schema
-- Create tables for events, guests, invitations, and itinerary

-- Events table - stores event information
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  organizer_name TEXT NOT NULL,
  password TEXT NOT NULL,
  description TEXT,
  event_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Guests table - stores guest information and unique links
CREATE TABLE public.guests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  unique_link TEXT NOT NULL UNIQUE,
  rsvp_status TEXT DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'yes', 'no', 'maybe')),
  rsvp_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Invitations table - stores custom messages for events
CREATE TABLE public.invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  custom_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Itinerary items table - stores event schedule and locations
CREATE TABLE public.itinerary_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_guests_event_id ON public.guests(event_id);
CREATE INDEX idx_guests_unique_link ON public.guests(unique_link);
CREATE INDEX idx_invitations_event_id ON public.invitations(event_id);
CREATE INDEX idx_itinerary_event_id ON public.itinerary_items(event_id);
CREATE INDEX idx_itinerary_start_time ON public.itinerary_items(start_time);

-- RLS Policies

-- Events policies - organizers can manage their events
CREATE POLICY "Organizers can view their events" 
ON public.events 
FOR SELECT 
USING (true); -- For now, allow viewing all events (we'll implement auth-based filtering later)

CREATE POLICY "Organizers can create events" 
ON public.events 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Organizers can update their events" 
ON public.events 
FOR UPDATE 
USING (true);

-- Guests policies - guests can view via unique link, organizers can manage
CREATE POLICY "Anyone can view guests" 
ON public.guests 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create guests" 
ON public.guests 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update guest RSVP" 
ON public.guests 
FOR UPDATE 
USING (true);

-- Invitations policies
CREATE POLICY "Anyone can view invitations" 
ON public.invitations 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create invitations" 
ON public.invitations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update invitations" 
ON public.invitations 
FOR UPDATE 
USING (true);

-- Itinerary policies
CREATE POLICY "Anyone can view itinerary items" 
ON public.itinerary_items 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create itinerary items" 
ON public.itinerary_items 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update itinerary items" 
ON public.itinerary_items 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invitations_updated_at
  BEFORE UPDATE ON public.invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_itinerary_items_updated_at
  BEFORE UPDATE ON public.itinerary_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();