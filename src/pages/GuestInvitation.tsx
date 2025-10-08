import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, CheckCircle2, XCircle, HelpCircle, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ItineraryTimeline } from "@/components/organizer/ItineraryTimeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaUpload } from "@/components/media/MediaUpload";
import { MediaGallery } from "@/components/media/MediaGallery";

interface Guest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  rsvp_status: string;
  event_id: string;
}

interface Event {
  id: string;
  name: string;
  description?: string;
  event_date?: string;
  organizer_name: string;
}

interface Invitation {
  custom_message?: string;
}

const GuestInvitation = () => {
  const { uniqueId } = useParams<{ uniqueId: string }>();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchInvitationData = async () => {
      if (!uniqueId) {
        setError("Invalid invitation link");
        setLoading(false);
        return;
      }

      try {
        const { data: guestData, error: guestError } = await supabase
          .from('guests')
          .select('*')
          .eq('unique_link', uniqueId)
          .single();

        if (guestError || !guestData) {
          setError("Invitation not found");
          setLoading(false);
          return;
        }

        setGuest(guestData);

        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', guestData.event_id)
          .single();

        if (eventError || !eventData) {
          setError("Event not found");
          setLoading(false);
          return;
        }

        setEvent(eventData);

        const { data: invitationData } = await supabase
          .from('invitations')
          .select('custom_message')
          .eq('event_id', guestData.event_id)
          .maybeSingle();

        setInvitation(invitationData);
      } catch (err) {
        console.error("Error fetching invitation data:", err);
        setError("Failed to load invitation");
      } finally {
        setLoading(false);
      }
    };

    fetchInvitationData();
  }, [uniqueId]);

  const handleRSVP = async (status: 'yes' | 'no' | 'maybe') => {
    if (!guest) return;

    setUpdating(true);

    try {
      const { error } = await supabase
        .from('guests')
        .update({ 
          rsvp_status: status,
          rsvp_at: new Date().toISOString()
        })
        .eq('id', guest.id);

      if (error) throw error;

      setGuest({ ...guest, rsvp_status: status });
      
      toast({
        title: "RSVP Updated!",
        description: `Your response has been recorded as: ${status.toUpperCase()}`,
      });
    } catch (err) {
      console.error("Error updating RSVP:", err);
      toast({
        title: "Error",
        description: "Failed to update RSVP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const getRSVPBadge = (status: string) => {
    switch (status) {
      case 'yes':
        return <Badge className="true-glass-badge true-glass-badge-success">Attending</Badge>;
      case 'no':
        return <Badge className="true-glass-badge true-glass-badge-destructive">Not Attending</Badge>;
      case 'maybe':
        return <Badge className="true-glass-badge true-glass-badge-accent">Maybe</Badge>;
      default:
        return <Badge className="true-glass-badge">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-x-hidden flex items-center justify-center">
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/background/image.jpg)' }}
        />
        <div className="relative z-10 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white glass-text-shadow">Loading your invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !guest || !event) {
    return (
      <div className="min-h-screen relative overflow-x-hidden flex items-center justify-center p-4">
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/background/default.jpg)' }}
        />
        <div 
          className="relative z-10 max-w-md w-full rounded-2xl p-6"
          style={{
            background: 'rgba(255, 249, 249, 0.03)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(1.9px)',
            WebkitBackdropFilter: 'blur(1.9px)',
            border: '1px solid rgba(255, 249, 249, 0.55)',
          }}
        >
          <h2 className="text-2xl font-bold text-red-400 mb-2 glass-text-shadow">Invitation Not Found</h2>
          <p className="text-white/80 glass-text-shadow">
            {error || "This invitation link is invalid or has expired."}
          </p>
        </div>
      </div>
    );
  }

  const glassCardStyle = {
    background: 'rgba(255, 249, 249, 0.03)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(1.9px)',
    WebkitBackdropFilter: 'blur(1.9px)',
    border: '1px solid rgba(255, 249, 249, 0.55)',
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background Image - CHANGE THIS PATH TO UPDATE BACKGROUND */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/background/default.jpg)' }}
      />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Event Details - TOP */}
          <div className="rounded-2xl p-8 glass-text-shadow" style={glassCardStyle}>
            <h2 className="text-3xl font-bold mb-4 text-white">{event.name}</h2>
            {event.description && (
              <p className="text-white/90 mb-6">{event.description}</p>
            )}
            {event.event_date && (
              <div className="flex items-center gap-2 text-white/90">
                <Calendar className="w-5 h-5 text-amber-400 glass-icon-glow" />
                <span className="text-lg">{new Date(event.event_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            )}
          </div>

          {/* Guest Info */}
          <div className="rounded-2xl p-6 glass-text-shadow" style={glassCardStyle}>
            <h3 className="text-2xl font-bold mb-2 text-white">Hello, {guest.name}! 👋</h3>
            <p className="text-white/80 mb-4">Your personal invitation to {event.name}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Current RSVP Status:</span>
              {getRSVPBadge(guest.rsvp_status)}
            </div>
          </div>

          {/* Custom Message */}
          {invitation?.custom_message && (
            <div className="rounded-2xl p-6 glass-text-shadow" style={glassCardStyle}>
              <h3 className="text-xl font-bold mb-3 text-white">Personal Message</h3>
              <p className="text-white/90 italic">{invitation.custom_message}</p>
            </div>
          )}

          {/* RSVP Buttons */}
          <div className="rounded-2xl p-6 glass-text-shadow" style={glassCardStyle}>
            <h3 className="text-xl font-bold mb-2 text-white">Please Respond</h3>
            <p className="text-white/70 mb-4 text-sm">Let us know if you can make it</p>
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={() => handleRSVP('yes')}
                disabled={updating || guest.rsvp_status === 'yes'}
                className={`gap-2 ${guest.rsvp_status === 'yes' ? 'true-glass-button-active' : 'true-glass-button'}`}
                variant="outline"
              >
                <CheckCircle2 className="w-4 h-4" />
                Yes
              </Button>
              
              <Button
                onClick={() => handleRSVP('maybe')}
                disabled={updating || guest.rsvp_status === 'maybe'}
                className={`gap-2 ${guest.rsvp_status === 'maybe' ? 'true-glass-button-active' : 'true-glass-button'}`}
                variant="outline"
              >
                <HelpCircle className="w-4 h-4" />
                Maybe
              </Button>
              
              <Button
                onClick={() => handleRSVP('no')}
                disabled={updating || guest.rsvp_status === 'no'}
                className={`gap-2 ${guest.rsvp_status === 'no' ? 'true-glass-button-active' : 'true-glass-button'}`}
                variant="outline"
              >
                <XCircle className="w-4 h-4" />
                No
              </Button>
            </div>
            
            {updating && (
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-white/70">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating your response...</span>
              </div>
            )}
          </div>

          {/* Event Schedule */}
          <div className="rounded-2xl p-6 glass-text-shadow" style={glassCardStyle}>
            <ItineraryTimeline eventId={guest.event_id} readonly={true} />
          </div>

          {/* Gallery */}
          <div className="rounded-2xl p-6 glass-text-shadow" style={glassCardStyle}>
            <div className="flex items-center gap-2 mb-2">
              <Camera className="w-5 h-5 text-purple-400 glass-icon-glow" />
              <h3 className="text-xl font-bold text-white">Event Gallery</h3>
            </div>
            <p className="text-white/70 mb-6 text-sm">Share your memories from this event</p>
            <Tabs defaultValue="gallery" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10">
                <TabsTrigger value="gallery" className="data-[state=active]:bg-white/10">View Gallery</TabsTrigger>
                <TabsTrigger value="upload" className="data-[state=active]:bg-white/10">Upload Media</TabsTrigger>
              </TabsList>
              <TabsContent value="gallery" className="mt-6">
                <MediaGallery eventId={event.id} />
              </TabsContent>
              <TabsContent value="upload" className="mt-6">
                <MediaUpload 
                  eventId={event.id}
                  guestId={guest.id}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer - "You're Invited" */}
          <div className="rounded-2xl p-8 text-center glass-text-shadow" style={glassCardStyle}>
            <h1 className="text-4xl font-bold mb-2 text-white">You're Invited!</h1>
            <p className="text-white/80">From {event.organizer_name}</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GuestInvitation;
