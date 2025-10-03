import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { MediaViewer } from "./MediaViewer";

interface Media {
  id: string;
  file_name: string;
  mime_type: string;
  b2_file_url: string;
  uploaded_at: string;
  file_size: number;
}

interface MediaGalleryProps {
  eventId: string;
}

export const MediaGallery = ({ eventId }: MediaGalleryProps) => {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const { toast } = useToast();

  const fetchMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('event_id', eventId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error('Error fetching media:', error);
      toast({
        title: "Error loading media",
        description: "Failed to load gallery",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('media-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'media',
          filter: `event_id=eq.${eventId}`
        },
        () => {
          fetchMedia();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No photos or videos yet. Be the first to share!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {media.map((item) => (
          <div
            key={item.id}
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-muted"
            onClick={() => setSelectedMedia(item)}
          >
            {item.mime_type.startsWith('image/') ? (
              <img
                src={item.b2_file_url}
                alt={item.file_name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <video
                src={item.b2_file_url}
                className="w-full h-full object-cover"
                muted
              />
            )}
          </div>
        ))}
      </div>

      {selectedMedia && (
        <MediaViewer
          media={media}
          initialMedia={selectedMedia}
          onClose={() => setSelectedMedia(null)}
        />
      )}
    </>
  );
};