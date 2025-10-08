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
        border: none;
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

  // 🧠 Dynamically update the global fixed background (new)
  useEffect(() => {
    const bg = document.getElementById('fixed-bg');
    if (bg) {
      const backgroundImageUrl =
        event?.background_image && event.background_image.trim() !== ''
          ? `/background/${event.background_image}`
          : '/background/default.jpg';

      bg.style.backgroundImage = `url(${backgroundImageUrl})`;
    }
  }, [event]);

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

  const glassCardStyle = {
    background: 'rgba(255, 249, 249, 0.03)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(1.9px)',
    WebkitBackdropFilter: 'blur(1.9px)',
    border: '1px solid rgba(255, 249, 249, 0.55)',
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-x-hidden flex items-center justify-center">
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
          className="relative z-10 max-w-md w-full rounded-2xl p-6"
          style={glassCardStyle}
        >
          <h2 className="text-2xl font-bold text-red-400 mb-2 glass-text-shadow">Invitation Not Found</h2>
          <p className="text-white/80 glass-text-shadow">
            {error || "This invitation link is invalid or has expired."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* [ everything else unchanged here ] */}
        {/* same as before */}
      </div>

      {/* Schedule Overlay */}
      {showSchedule && (
        <div className="fixed inset-0 z-50 bg-black/80 overflow-y-auto">
          <div className="min-h-screen relative py-8 px-4">
            <button
              onClick={() => setShowSchedule(false)}
              className="fixed top-6 right-6 z-10 text-white hover:text-white/70 transition-colors bg-black/50 rounded-full p-2"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="max-w-4xl mx-auto">
              <ItineraryTimeline eventId={guest.event_id} readonly={true} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestInvitation;
