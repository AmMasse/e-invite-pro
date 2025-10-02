import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, CheckCircle, Clock, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface EventStats {
  totalGuests: number;
  confirmed: number;
  pending: number;
  declined: number;
}

interface EventOverviewProps {
  eventId: string;
}

export const EventOverview = ({ eventId }: EventOverviewProps) => {
  const [event, setEvent] = useState<any>(null);
  const [stats, setStats] = useState<EventStats>({
    totalGuests: 0,
    confirmed: 0,
    pending: 0,
    declined: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        // Fetch event details
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("id", eventId)
          .single();

        if (eventError) throw eventError;
        setEvent(eventData);

        // Fetch guest stats
        const { data: guests, error: guestsError } = await supabase
          .from("guests")
          .select("rsvp_status")
          .eq("event_id", eventId);

        if (guestsError) throw guestsError;

        const statsData = {
          totalGuests: guests.length,
          confirmed: guests.filter((g) => g.rsvp_status === "yes").length,
          pending: guests.filter((g) => g.rsvp_status === "pending").length,
          declined: guests.filter((g) => g.rsvp_status === "no").length,
        };

        setStats(statsData);
      } catch (error) {
        console.error("Error fetching event data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  if (loading) {
    return <div className="text-muted-foreground">Loading event details...</div>;
  }

  if (!event) {
    return <div className="text-destructive">Event not found</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {event.name}
          </CardTitle>
          <CardDescription>{event.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {event.event_date && (
              <p className="text-muted-foreground">
                <span className="font-medium">Date:</span>{" "}
                {format(new Date(event.event_date), "PPP")}
              </p>
            )}
            <p className="text-muted-foreground">
              <span className="font-medium">Organizer:</span> {event.organizer_name}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Total Guests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGuests}</div>
          </CardContent>
        </Card>

        <Card className="border-success/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.confirmed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalGuests > 0
                ? Math.round((stats.confirmed / stats.totalGuests) * 100)
                : 0}
              % response rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="border-destructive/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="w-4 h-4 text-destructive" />
              Declined
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.declined}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
