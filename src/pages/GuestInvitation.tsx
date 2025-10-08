import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, XCircle, HelpCircle, Camera, X } from "lucide-react";
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
  background_image?: string;
}

interface Invitation {
  custom_message?: string;
}

// Custom Loader Component
const CustomLoader = () => (
  <div className="flex flex-col items-center justify-center gap-4">
    <div className="loader" />
    <p className="text-white glass-text-shadow">Loading your invitation...</p>
    <style>{`
      .loader {
        width: 50px;
        aspect-ratio: 1;
        color: #f03355;
        --_c: no-repeat radial-gradient(farthest-side, currentColor 92%, #0000);
        background: 
          var(--_c) 50% 0    /12px 12px,
          var(--_c) 50% 100% /12px 12px,
          var(--_c) 100% 50% /12px 12px,
          var(--_c) 0    50% /12px 12px,
          var(--_c) 50%  50% /12px 12px,
          conic-gradient(from 90deg at 4px 4px, #0000 90deg, currentColor 0)
            -4px -4px / calc(50% + 2px) calc(50% + 2px);
        animation: l8 0.3s infinite linear;
      }
      @keyframes l8 {
        to { transform: rotate(1turn); }
      }
    `}</style>
  </div>
);

const GuestInvitation = () => {
  const { uniqueId } = useParams<{ uniqueId: string }>();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string>("");
  const [showSchedule, setShowSchedule] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('/backgrounds/default.jpg');
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
          console.error("Guest fetch error:", guestError);
          setError("Invitation not found");
          setLoading(false);
          return;
        }

        setGuest(guestData);

        // Fetch event data - explicitly select background_image
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('id, name, description, event_date, organizer_name, background_image')
          .eq('id', guestData.event_id)
          .single();

        if (eventError || !eventData) {
          console.error("Event fetch error:", eventError);
          setError("Event not found");
          setLoading(false);
          return;
        }

        console.log("Event data:", eventData); // Debug log
        console.log("Background image value:", eventData.background_image); // Debug log
        
        setEvent(eventData);

        // Set background image with fallback
        if (eventData.background_image) {
          // Construct the path - adjust this based on your actual storage structure
          const imagePath = eventData.background_image.startsWith('/') 
            ? eventData.background_image 
            : `/backgrounds/${eventData.background_image}`;
          
          console.log("Setting background image to:", imagePath); // Debug log
          setBackgroundImage(imagePath);
        } else {
          console.log("No background image found, using default"); // Debug log
          setBackgroundImage('/backgrounds/default.jpg');
        }

        // Fetch invitation custom message
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
          style={{ backgroundImage: 'url(/backgrounds/default.jpg)' }}
        />
        <div className="relative z-10 text-center">
          <CustomLoader />
        </div>
      </div>
    );
  }

  if (error || !guest || !event) {
    return (
      <div className="min-h-screen relative overflow-x-hidden flex items-center justify-center p-4">
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/backgrounds/default.jpg)' }}
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
      {/* Background Image - Dynamically loaded from event data */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
        onError={(e) => {
          console.error("Background image failed to load, using default");
          // If image fails to load, use default
          if (backgroundImage !== '/backgrounds/default.jpg') {
            setBackgroundImage('/backgrounds/default.jpg');
          }
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Event Details - TOP */}
          <div className="rounded-2xl p-8 glass-text-shadow text-center" style={glassCardStyle}>
            <h2 className="text-4xl font-bold mb-4 text-white">{event.name}</h2>
            {event.description && (
              <p className="text-white/90 mb-6 text-lg">{event.description}</p>
            )}
            {event.event_date && (
              <div className="flex items-center justify-center gap-2 text-white/90">
                <Calendar className="w-5 h-5 text-amber-400 glass-icon-glow" />
                <span className="text-xl">{new Date(event.event_date).toLocaleDateString('en-US', {
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
              <p className="text-white/90 font-bold italic text-lg">{invitation.custom_message}</p>
            </div>
          )}

          {/* RSVP Buttons */}
          <div className="rounded-2xl p-6 glass-text-shadow" style={glassCardStyle}>
            <h3 className="text-xl font-bold mb-2 text-white">Please Respond</h3>
            <p className="text-white/70 mb-4 text-sm">Let us know if you can make it</p>
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={() => handleRSVP('yes')}
                disabled={updating}
                className={`gap-2 bg-white/10 backdrop-blur-sm text-white font-bold hover:bg-white/20 transition-all ${
                  guest.rsvp_status === 'yes' ? 'border-2 border-green-400 shadow-lg shadow-green-400/50' : 'border border-white/30'
                }`}
                variant="outline"
              >
                <CheckCircle2 className="w-4 h-4" />
                Yes
              </Button>
              
              <Button
                onClick={() => handleRSVP('maybe')}
                disabled={updating}
                className={`gap-2 bg-white/10 backdrop-blur-sm text-white font-bold hover:bg-white/20 transition-all ${
                  guest.rsvp_status === 'maybe' ? 'border-2 border-amber-400 shadow-lg shadow-amber-400/50' : 'border border-white/30'
                }`}
                variant="outline"
              >
                <HelpCircle className="w-4 h-4" />
                Maybe
              </Button>
              
              <Button
                onClick={() => handleRSVP('no')}
                disabled={updating}
                className={`gap-2 bg-white/10 backdrop-blur-sm text-white font-bold hover:bg-white/20 transition-all ${
                  guest.rsvp_status === 'no' ? 'border-2 border-red-400 shadow-lg shadow-red-400/50' : 'border border-white/30'
                }`}
                variant="outline"
              >
                <XCircle className="w-4 h-4" />
                No
              </Button>
            </div>
            
            {updating && (
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-white/70">
                <CustomLoader />
                <span>Updating your response...</span>
              </div>
            )}
          </div>

          {/* Event Schedule Button */}
          <div className="rounded-2xl p-6 glass-text-shadow flex justify-center" style={glassCardStyle}>
            <Button
              onClick={() => setShowSchedule(true)}
              className="gap-2 bg-white/10 backdrop-blur-sm text-white font-bold hover:bg-white/20 border border-white/30 transition-all"
              variant="outline"
            >
              <Calendar className="w-4 h-4" />
              Event Schedule
            </Button>
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
                <TabsTrigger 
                  value="gallery" 
                  className="text-white font-bold data-[state=active]:bg-white/20 data-[state=active]:border-2 data-[state=active]:border-purple-400"
                >
                  View Gallery
                </TabsTrigger>
                <TabsTrigger 
                  value="upload" 
                  className="text-white font-bold data-[state=active]:bg-white/20 data-[state=active]:border-2 data-[state=active]:border-purple-400"
                >
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

          {/* Footer - "You're Invited" */}
          <div className="rounded-2xl p-8 text-center glass-text-shadow" style={glassCardStyle}>
            <h1 className="text-4xl font-bold mb-2 text-white">You're Invited!</h1>
            <p className="text-white/80">From {event.organizer_name}</p>
          </div>

        </div>
      </div>

      {/* Schedule Overlay */}
      {showSchedule && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowSchedule(false)}
        >
          <div 
            className="relative max-w-3xl w-full max-h-[80vh] overflow-y-auto rounded-2xl p-6 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSchedule(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <ItineraryTimeline eventId={guest.event_id} readonly={true} />
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestInvitation;
