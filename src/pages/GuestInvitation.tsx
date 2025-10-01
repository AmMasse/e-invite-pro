import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, MapPin, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    switch (status) {
      case 'yes':
        return <Badge className="bg-success/10 text-success border-success/20">Attending</Badge>;
      case 'no':
        return <Badge variant="destructive">Not Attending</Badge>;
      case 'maybe':
        return <Badge className="bg-accent/10 text-accent border-accent/20">Maybe</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !guest || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Invitation Not Found</CardTitle>
            <CardDescription>
              {error || "This invitation link is invalid or has expired."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/5">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              You're Invited!
            </h1>
            <p className="text-muted-foreground">From {event.organizer_name}</p>
          </div>

          {/* Guest Info */}
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle>Hello, {guest.name}! 👋</CardTitle>
              <CardDescription>
                Your personal invitation to {event.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current RSVP Status:</span>
                {getRSVPBadge(guest.rsvp_status)}
              </div>
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="text-2xl">{event.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.description && (
                <p className="text-muted-foreground">{event.description}</p>
              )}
              
              {event.event_date && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-accent" />
                  <span>{new Date(event.event_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Custom Message */}
          {invitation?.custom_message && (
            <Card className="border-accent/20 bg-accent/5">
              <CardHeader>
                <CardTitle className="text-lg">Personal Message</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground italic">{invitation.custom_message}</p>
              </CardContent>
            </Card>
          )}

          {/* RSVP Buttons */}
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle>Please Respond</CardTitle>
              <CardDescription>
                Let us know if you can make it
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  onClick={() => handleRSVP('yes')}
                  disabled={updating || guest.rsvp_status === 'yes'}
                  className="gap-2"
                  variant={guest.rsvp_status === 'yes' ? 'default' : 'outline'}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Yes
                </Button>
                
                <Button
                  onClick={() => handleRSVP('maybe')}
                  disabled={updating || guest.rsvp_status === 'maybe'}
                  className="gap-2"
                  variant={guest.rsvp_status === 'maybe' ? 'default' : 'outline'}
                >
                  <HelpCircle className="w-4 h-4" />
                  Maybe
                </Button>
                
                <Button
                  onClick={() => handleRSVP('no')}
                  disabled={updating || guest.rsvp_status === 'no'}
                  className="gap-2"
                  variant={guest.rsvp_status === 'no' ? 'default' : 'outline'}
                >
                  <XCircle className="w-4 h-4" />
                  No
                </Button>
              </div>
              
              {updating && (
                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating your response...</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GuestInvitation;
