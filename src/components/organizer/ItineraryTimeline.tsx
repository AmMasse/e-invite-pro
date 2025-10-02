import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Navigation } from "lucide-react";
import { format, parseISO, isSameDay } from "date-fns";
import { toast } from "sonner";

interface ItineraryItem {
  id: string;
  event_id: string;
  title: string;
  description: string | null;
  location: string | null;
  lat: number | null;
  lng: number | null;
  start_time: string;
  end_time: string | null;
}

interface ItineraryTimelineProps {
  eventId: string;
  readonly?: boolean;
}

export const ItineraryTimeline = ({ eventId, readonly = false }: ItineraryTimelineProps) => {
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItineraryItems();

    const channel = supabase
      .channel(`itinerary_${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "itinerary_items",
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          fetchItineraryItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  const fetchItineraryItems = async () => {
    try {
      const { data, error } = await supabase
        .from("itinerary_items")
        .select("*")
        .eq("event_id", eventId)
        .order("start_time", { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching itinerary items:", error);
      if (!readonly) {
        toast.error("Failed to load itinerary");
      }
    } finally {
      setLoading(false);
    }
  };

  const groupByDate = (items: ItineraryItem[]) => {
    const grouped: { [key: string]: ItineraryItem[] } = {};

    items.forEach((item) => {
      const date = format(parseISO(item.start_time), "yyyy-MM-dd");
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });

    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  };

  const formatTime = (dateTime: string) => {
    try {
      return format(parseISO(dateTime), "h:mm a");
    } catch {
      return dateTime;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "EEEE, MMMM d, yyyy");
    } catch {
      return dateString;
    }
  };

  const getNavigationLink = (lat: number, lng: number) => {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading schedule...</p>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No schedule available</p>
          <p className="text-sm">Check back later for event details</p>
        </CardContent>
      </Card>
    );
  }

  const groupedItems = groupByDate(items);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Event Schedule
          </CardTitle>
          <CardDescription>
            Your complete event timeline and locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {groupedItems.map(([date, dateItems]) => (
              <div key={date} className="space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">
                    {formatDate(date)}
                  </h3>
                </div>

                <div className="relative pl-8 space-y-6">
                  <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-primary/20" />

                  {dateItems.map((item, index) => (
                    <div key={item.id} className="relative">
                      <div className="absolute -left-[1.875rem] top-2 w-3 h-3 rounded-full bg-primary border-2 border-background" />

                      <Card className="border-l-2 border-l-primary">
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <h4 className="text-base font-semibold">{item.title}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
                                <Clock className="w-4 h-4" />
                                <span>{formatTime(item.start_time)}</span>
                                {item.end_time && (
                                  <>
                                    <span>-</span>
                                    <span>{formatTime(item.end_time)}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {item.description && (
                              <p className="text-sm text-muted-foreground">
                                {item.description}
                              </p>
                            )}

                            {item.location && (
                              <div className="flex items-start gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="font-medium">{item.location}</p>
                                  {item.lat && item.lng && (
                                    <a
                                      href={getNavigationLink(item.lat, item.lng)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-primary hover:underline mt-1"
                                    >
                                      <Navigation className="w-3 h-3" />
                                      Get Directions
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
