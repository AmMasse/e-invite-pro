import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, MapPin, CheckCircle2, XCircle, HelpCircle, Camera, Clock, Mail } from "lucide-react";
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
  event_time?: string;
  location?: string;
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
        // Fetch guest data
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

        // Fetch event data
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

        // Fetch invitation message
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
    const badges = {
      yes: (
        <div className="true-glass-badge true-glass-badge-success">
          <CheckCircle2 className="w-4 h-4" />
          Attending
        </div>
      ),
      no: (
        <div className="true-glass-badge true-glass-badge-destructive">
          <XCircle className="w-4 h-4" />
          Not Attending
        </div>
      ),
      maybe: (
        <div className="true-glass-badge true-glass-badge-accent">
          <HelpCircle className="w-4 h-4" />
          Maybe
        </div>
      ),
      pending: (
        <div className="true-glass-badge">
          <Clock className="w-4 h-4" />
          Pending
        </div>
      )
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/background/image.jpg)' }} />
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Loading Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="true-glass-card">
            <div className="true-glass-content text-center">
              <Loader2 className="w-12 h-12 animate-spin text-purple-300 mx-auto mb-4 glass-icon-glow" />
              <p className="text-white/80 glass-text-shadow">Loading your invitation...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !guest || !event) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/background/image.jpg)' }} />
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Error Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="true-glass-card max-w-md w-full" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <div className="true-glass-content">
              <h2 className="text-2xl font-bold text-white glass-text-shadow mb-2">Invitation Not Found</h2>
              <p className="text-white/70">{error || "This invitation link is invalid or has expired."}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/background/image.jpg)' }} />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen py-8 md:py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* EVENT DETAILS - HERO CARD */}
          <div className="true-glass-card true-glass-hero">
            <div className="true-glass-content text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 glass-text-shadow bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                {event.name}
              </h1>
              {event.description && (
                <p className="text-white/90 text-base md:text-lg lg:text-xl mb-6 leading-relaxed glass-text-shadow max-w-2xl mx-auto">
                  {event.description}
                </p>
              )}
              
              {/* Date, Time, Location */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 text-white/80 mb-4">
                {event.event_date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 md:w-6 md:h-6 glass-icon-glow text-purple-300 flex-shrink-0" />
                    <span className="font-medium text-sm md:text-base">
                      {new Date(event.event_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                
                {event.event_time && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 md:w-6 md:h-6 glass-icon-glow text-blue-300 flex-shrink-0" />
                    <span className="font-medium text-sm md:text-base">{event.event_time}</span>
                  </div>
                )}
              </div>

              {event.location && (
                <div className="flex items-center justify-center gap-3 text-white/80">
                  <MapPin className="w-5 h-5 md:w-6 md:h-6 glass-icon-glow text-purple-300 flex-shrink-0" />
                  <span className="font-medium text-sm md:text-base">{event.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* GUEST INFO CARD */}
          <div className="true-glass-card">
            <div className="true-glass-content">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white glass-text-shadow mb-2">
                    Hello, {guest.name}! 👋
                  </h2>
                  <p className="text-white/70 text-sm md:text-base">Your personal invitation</p>
                </div>
                {getRSVPBadge(guest.rsvp_status)}
              </div>
            </div>
          </div>

          {/* CUSTOM MESSAGE CARD */}
          {invitation?.custom_message && (
            <div className="true-glass-card" style={{ background: 'rgba(139, 92, 246, 0.08)' }}>
              <div className="true-glass-content">
                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 md:w-6 md:h-6 text-purple-300 glass-icon-glow flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-white glass-text-shadow mb-2">Personal Message</h3>
                    <p className="text-white/80 italic leading-relaxed text-sm md:text-base">
                      {invitation.custom_message}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RSVP SECTION */}
          <div className="true-glass-card">
            <div className="true-glass-content">
              <h3 className="text-lg md:text-xl font-bold text-white glass-text-shadow mb-3 md:mb-4 text-center">
                Please Respond
              </h3>
              <p className="text-white/70 text-center mb-4 md:mb-6 text-sm md:text-base">
                Let us know if you can make it
              </p>
              
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                <button
                  onClick={() => handleRSVP('yes')}
                  disabled={updating || guest.rsvp_status === 'yes'}
                  className={`true-glass-button flex flex-col items-center gap-2 py-4 md:py-6 ${
                    guest.rsvp_status === 'yes' ? 'true-glass-button-active' : ''
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                  <span className="text-sm md:text-base">Yes</span>
                </button>
                
                <button
                  onClick={() => handleRSVP('maybe')}
                  disabled={updating || guest.rsvp_status === 'maybe'}
                  className={`true-glass-button flex flex-col items-center gap-2 py-4 md:py-6 ${
                    guest.rsvp_status === 'maybe' ? 'true-glass-button-active' : ''
                  }`}
                >
                  <HelpCircle className="w-5 h-5 md:w-6 md:h-6" />
                  <span className="text-sm md:text-base">Maybe</span>
                </button>
                
                <button
                  onClick={() => handleRSVP('no')}
                  disabled={updating || guest.rsvp_status === 'no'}
                  className={`true-glass-button flex flex-col items-center gap-2 py-4 md:py-6 ${
                    guest.rsvp_status === 'no' ? 'true-glass-button-active' : ''
                  }`}
                >
                  <XCircle className="w-5 h-5 md:w-6 md:h-6" />
                  <span className="text-sm md:text-base">No</span>
                </button>
              </div>
              
              {updating && (
                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-white/70">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating your response...</span>
                </div>
              )}
            </div>
          </div>

          {/* EVENT SCHEDULE */}
          <div className="true-glass-card">
            <div className="true-glass-content">
              <h3 className="text-lg md:text-xl font-bold text-white glass-text-shadow mb-4 md:mb-6">Event Schedule</h3>
              <ItineraryTimeline eventId={guest.event_id} readonly={true} />
            </div>
          </div>

          {/* EVENT GALLERY */}
          <div className="true-glass-card">
            <div className="true-glass-content">
              <div className="flex items-center gap-2 mb-4">
                <Camera className="w-5 h-5 text-purple-300 glass-icon-glow" />
                <h3 className="text-lg md:text-xl font-bold text-white glass-text-shadow">Event Gallery</h3>
              </div>
              <p className="text-white/70 mb-6 text-sm md:text-base">
                Share your memories from this event
              </p>
              
              <Tabs defaultValue="gallery" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10">
                  <TabsTrigger value="gallery" className="data-[state=active]:bg-white/10">
                    View Gallery
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="data-[state=active]:bg-white/10">
                    Upload Media
                  </TabsTrigger>
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
          </div>

          {/* FOOTER - You're Invited */}
          <div className="text-center py-8">
            <p className="text-white/50 text-sm mb-1">Your Presence will be a blessing</p>
            <p className="text-white/40 text-xs">With regard {event.organizer_name}</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GuestInvitation;
