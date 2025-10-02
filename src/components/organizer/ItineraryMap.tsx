import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, MapPin, Navigation } from "lucide-react";
import { toast } from "sonner";

interface ItineraryItem {
  id: string;
  title: string;
  location: string | null;
  lat: number | null;
  lng: number | null;
  start_time: string;
}

interface ItineraryMapProps {
  eventId: string;
}

export const ItineraryMap = ({ eventId }: ItineraryMapProps) => {
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ItineraryItem | null>(null);

  useEffect(() => {
    fetchItineraryItems();
  }, [eventId]);

  const fetchItineraryItems = async () => {
    try {
      const { data, error } = await supabase
        .from("itinerary_items")
        .select("id, title, location, lat, lng, start_time")
        .eq("event_id", eventId)
        .not("lat", "is", null)
        .not("lng", "is", null)
        .order("start_time", { ascending: true });

      if (error) throw error;
      setItems(data || []);
      if (data && data.length > 0) {
        setSelectedItem(data[0]);
      }
    } catch (error) {
      console.error("Error fetching itinerary items:", error);
      toast.error("Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  const getNavigationLink = (lat: number, lng: number) => {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  };

  const getEmbedMapUrl = (lat: number, lng: number) => {
    return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${lat},${lng}&zoom=15`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading map...</p>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Map className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No locations available</p>
          <p className="text-sm">Add locations with coordinates to see them on the map</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="w-5 h-5" />
            Event Locations
          </CardTitle>
          <CardDescription>
            Interactive map of all event venues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 space-y-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedItem?.id === item.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <MapPin className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      selectedItem?.id === item.id ? "text-primary" : "text-muted-foreground"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.title}</p>
                      {item.location && (
                        <p className="text-xs text-muted-foreground truncate">
                          {item.location}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="lg:col-span-2">
              {selectedItem && selectedItem.lat && selectedItem.lng && (
                <div className="space-y-3">
                  <div className="aspect-video w-full rounded-lg overflow-hidden border shadow-sm">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={getEmbedMapUrl(selectedItem.lat, selectedItem.lng)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">{selectedItem.title}</h4>
                      {selectedItem.location && (
                        <p className="text-sm text-muted-foreground">
                          {selectedItem.location}
                        </p>
                      )}
                    </div>
                    <a
                      href={getNavigationLink(selectedItem.lat, selectedItem.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      <Navigation className="w-4 h-4" />
                      Navigate
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
