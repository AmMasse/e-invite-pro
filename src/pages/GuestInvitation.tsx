import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, MapPin, CheckCircle2, XCircle, HelpCircle, Camera, Clock } from "lucide-react";
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
        return <span className="true-glass-badge true-glass-badge-success">Attending</span>;
      case 'no':
        return <span className="true-glass-badge true-glass-badge-destructive">Not Attending</span>;
      case 'maybe':
        return <span className="true-glass-badge true-glass-badge-accent">Maybe</span>;
      default:
        return <span className="true-glass-badge">Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/public/background/image.jpg)' }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        </div>
        
        <div className="relative z-10 text-center">
          <Loader2 className="w-16 h-16 animate-spin text-white mx-auto mb-6" />
          <p className="text-white text-lg glass-text-shadow">Loading your invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !guest || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/background/image.jpg)' }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        </div>

        <div className="relative z-10 max-w-md w-full true-glass-card p-8">
          <h2 className="text-2xl font-bold text-white mb-4 glass-text-shadow">Invitation Not Found</h2>
          <p className="text-white/80 glass-text-shadow">
            {error || "This invitation link is invalid or has expired."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image - EASY TO CHANGE: Just replace /background/image.jpg */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/background/image.jpg)' }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          
          {/* EVENT DETAILS - Hero Card */}
          <div className="true-glass-hero p-6 sm:p-10 lg:p-12 true-glass-content">
            <div className="text-center space-y-4 sm:space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white glass-text-shadow leading-tight">
                {event.name}
              </h1>
              
              {event.description && (
                <p className="text-lg sm:text-xl text-white/90 glass-text-shadow max-w-2xl mx-auto leading-relaxed">
                  {event.description}
                </p>
              )}
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 pt-4">
                {event.event_date && (
                  <div className="flex items-center gap-3 text-white">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 glass-icon-glow" />
                    <span className="text-base sm:text-lg font-medium glass-text-shadow">
                      {new Date(event.event_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                
                {event.event_date && (
                  <div className="flex items-center gap-3 text-white">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 glass-icon-glow" />
                    <span className="text-base sm:text-lg font-medium glass-text-shadow">
                      {new Date(event.event_date).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <p className="text-white/70 text-sm sm:text-base glass-text-shadow">
                  Hosted by <span className="font-semibold text-white">{event.organizer_name}</span>
                </p>
              </div>
            </div>
          </div>

          {/* GUEST INFO - Compact Card */}
          <div className="true-glass-card p-5 sm:p-6 true-glass-content">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white glass-text-shadow mb-2">
                  Hello, {guest.name}! 👋
                </h2>
                <p className="text-white/70 glass-text-shadow text-sm sm:text-base">
                  Your personal invitation
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/70 glass-text-shadow">Status:</span>
                {getRSVPBadge(guest.rsvp_status)}
              </div>
            </div>
          </div>

          {/* CUSTOM MESSAGE - If exists */}
          {invitation?.custom_message && (
            <div className="true-glass-card p-6 sm:p-8 true-glass-content">
              <h3 className="text-xl sm:text-2xl font-bold text-white glass-text-shadow mb-4">
                A Personal Message
              </h3>
              <p className="text-white/90 glass-text-shadow italic text-base sm:text-lg leading-relaxed">
                "{invitation.custom_message}"
              </p>
            </div>
          )}

          {/* RSVP BUTTONS - Prominent Card */}
          <div className="true-glass-card p-6 sm:p-8 true-glass-content">
            <h3 className="text-xl sm:text-2xl font-bold text-white glass-text-shadow mb-3 text-center">
              Will You Join Us?
            </h3>
            <p className="text-white/70 glass-text-shadow text-center mb-6 text-sm sm:text-base">
              Please let us know if you can make it
            </p>
            
            <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto">
              <button
                onClick={() => handleRSVP('yes')}
                disabled={updating || guest.rsvp_status === 'yes'}
                className={`true-glass-button py-4 sm:py-6 px-3 sm:px-6 rounded-2xl transition-all flex flex-col items-center justify-center gap-2 sm:gap-3 ${
                  guest.rsvp_status === 'yes' ? 'true-glass-button-active' : ''
                }`}
              >
                <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-white glass-icon-glow" />
                <span className="text-white font-bold text-sm sm:text-base glass-text-shadow">Yes</span>
              </button>
              
              <button
                onClick={() => handleRSVP('maybe')}
                disabled={updating || guest.rsvp_status === 'maybe'}
                className={`true-glass-button py-4 sm:py-6 px-3 sm:px-6 rounded-2xl transition-all flex flex-col items-center justify-center gap-2 sm:gap-3 ${
                  guest.rsvp_status === 'maybe' ? 'true-glass-button-active' : ''
                }`}
              >
                <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white glass-icon-glow" />
                <span className="text-white font-bold text-sm sm:text-base glass-text-shadow">Maybe</span>
              </button>
              
              <button
                onClick={() => handleRSVP('no')}
                disabled={updating || guest.rsvp_status === 'no'}
                className={`true-glass-button py-4 sm:py-6 px-3 sm:px-6 rounded-2xl transition-all flex flex-col items-center justify-center gap-2 sm:gap-3 ${
                  guest.rsvp_status === 'no' ? 'true-glass-button-active' : ''
                }`}
              >
                <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white glass-icon-glow" />
                <span className="text-white font-bold text-sm sm:text-base glass-text-shadow">No</span>
              </button>
            </div>
            
            {updating && (
              <div className="flex items-center justify-center gap-2 mt-6 text-white/80">
                <Loader2 className="w-5 h-5 animate-spin glass-icon-glow" />
                <span className="glass-text-shadow text-sm sm:text-base">Updating your response...</span>
              </div>
            )}
          </div>

          {/* EVENT SCHEDULE */}
          <div className="true-glass-card p-6 sm:p-8 true-glass-content">
            <h3 className="text-xl sm:text-2xl font-bold text-white glass-text-shadow mb-6">
              Event Schedule
            </h3>
            <ItineraryTimeline eventId={guest.event_id} readonly={true} />
          </div>

          {/* GALLERY - Large Card */}
          <div className="true-glass-card p-6 sm:p-8 true-glass-content">
            <div className="flex items-center gap-3 mb-6">
              <Camera className="w-6 h-6 text-white glass-icon-glow" />
              <h3 className="text-xl sm:text-2xl font-bold text-white glass-text-shadow">
                Event Gallery
              </h3>
            </div>
            <p className="text-white/70 glass-text-shadow mb-6 text-sm sm:text-base">
              View photos and share your own memories
            </p>
            
            <Tabs defaultValue="gallery" className="w-full">
              <TabsList className="grid w-full grid-cols-2 true-glass-card p-1 mb-6">
                <TabsTrigger 
                  value="gallery"
                  className="text-white data-[state=active]:true-glass-button-active data-[state=active]:font-bold"
                >
                  View Gallery
                </TabsTrigger>
                <TabsTrigger 
                  value="upload"
                  className="text-white data-[state=active]:true-glass-button-active data-[state=active]:font-bold"
                >
                  Upload Media
                </TabsTrigger>
              </TabsList>
              <TabsContent value="gallery" className="mt-0">
                <MediaGallery eventId={event.id} />
              </TabsContent>
              <TabsContent value="upload" className="mt-0">
                <MediaUpload 
                  eventId={event.id}
                  guestId={guest.id}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* FOOTER - "You're Invited" */}
          <div className="true-glass-card p-8 sm:p-12 true-glass-content">
            <div className="text-center space-y-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white glass-text-shadow">
                You're Invited
              </h2>
              <p className="text-white/70 glass-text-shadow text-sm sm:text-base">
                We can't wait to celebrate with you
              </p>
            </div>
          </div>

          {/* Bottom Spacing */}
          <div className="h-8"></div>
        </div>
      </div>
    </div>
  );
};

export default GuestInvitation;
