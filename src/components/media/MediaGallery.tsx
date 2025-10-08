import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X, ChevronLeft, ChevronRight, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Media {
  id: string;
  file_name: string;
  mime_type: string;
  b2_file_url: string;
  uploaded_at: string;
  file_size: number;
  guest_id: string;
}

interface Guest {
  id: string;
  name: string;
}

interface MediaGalleryProps {
  eventId: string;
}

export const MediaGallery = ({ eventId }: MediaGalleryProps) => {
  const [media, setMedia] = useState<Media[]>([]);
  const [guests, setGuests] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [mediaToDelete, setMediaToDelete] = useState<Media | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const fetchMedia = async () => {
    try {
      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .select('*')
        .eq('event_id', eventId)
        .order('uploaded_at', { ascending: false });

      if (mediaError) throw mediaError;

      // Shuffle the media array
      const shuffled = (mediaData || []).sort(() => Math.random() - 0.5);
      setMedia(shuffled);

      // Fetch guest names
      const guestIds = [...new Set(shuffled.map(m => m.guest_id))];
      const { data: guestData, error: guestError } = await supabase
        .from('guests')
        .select('id, name')
        .in('id', guestIds);

      if (!guestError && guestData) {
        const guestMap = guestData.reduce((acc, guest) => {
          acc[guest.id] = guest.name;
          return acc;
        }, {} as Record<string, string>);
        setGuests(guestMap);
      }
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

  const handleDownload = async (mediaItem: Media) => {
    try {
      const response = await fetch(mediaItem.b2_file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = mediaItem.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Downloaded",
        description: "Media file downloaded successfully"
      });
    } catch (error) {
      console.error('Error downloading:', error);
      toast({
        title: "Download failed",
        description: "Could not download the file",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (!mediaToDelete) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('media')
        .delete()
        .eq('id', mediaToDelete.id);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Media file deleted successfully"
      });

      // Close viewer if the deleted media was selected
      if (selectedMedia?.id === mediaToDelete.id) {
        setSelectedMedia(null);
      }

      fetchMedia();
    } catch (error) {
      console.error('Error deleting media:', error);
      toast({
        title: "Delete failed",
        description: "Could not delete the file",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
      setMediaToDelete(null);
    }
  };

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
      <Button
        onClick={() => setShowGallery(true)}
        className="w-full"
        variant="outline"
      >
        View Gallery ({media.length} items)
      </Button>

      {/* Full Screen Gallery Modal */}
      {showGallery && (
        <Dialog open={showGallery} onOpenChange={setShowGallery}>
          <DialogContent className="max-w-full max-h-full w-screen h-screen p-0 m-0" style={{ backgroundColor: '#2d2d2d' }}>
            <div className="relative w-full h-full overflow-y-auto" style={{ backgroundColor: '#2d2d2d' }}>
              {/* Header */}
              <div className="sticky top-0 z-20 backdrop-blur border-b px-4 py-3 flex items-center justify-between" style={{ backgroundColor: 'rgba(45, 45, 45, 0.95)' }}>
                <h2 className="text-xl font-semibold text-white">Event Gallery</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowGallery(false)}
                  className="text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Gallery Grid */}
              <div className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {media.map((item) => (
                    <div key={item.id} className="flex flex-col">
                      <div
                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ border: '2px solid rgba(255, 255, 255, 0.2)' }}
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
                        {/* Uploader name overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
                          <p className="text-xs text-white text-center">
                            {guests[item.guest_id] || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Media Viewer */}
      {selectedMedia && (
        <MediaViewer
          media={media}
          initialMedia={selectedMedia}
          guests={guests}
          onClose={() => setSelectedMedia(null)}
          onDownload={handleDownload}
          onDelete={(item) => setMediaToDelete(item)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!mediaToDelete} onOpenChange={() => setMediaToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this media file? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// Media Viewer Component
interface MediaViewerProps {
  media: Media[];
  initialMedia: Media;
  guests: Record<string, string>;
  onClose: () => void;
  onDownload: (media: Media) => void;
  onDelete: (media: Media) => void;
}

const MediaViewer = ({ media, initialMedia, guests, onClose, onDownload, onDelete }: MediaViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(
    media.findIndex(m => m.id === initialMedia.id)
  );

  const currentMedia = media[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[95vw] max-h-[95vh] p-0"
        onKeyDown={handleKeyDown}
      >
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Download Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-16 z-10 text-white hover:bg-white/20"
            onClick={() => onDownload(currentMedia)}
          >
            <Download className="w-6 h-6" />
          </Button>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-28 z-10 text-white hover:bg-red-500/20"
            onClick={() => onDelete(currentMedia)}
          >
            <Trash2 className="w-6 h-6" />
          </Button>

          {/* Navigation Arrows */}
          {media.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 z-10 text-white hover:bg-white/20"
                onClick={goToPrevious}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 z-10 text-white hover:bg-white/20"
                onClick={goToNext}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            </>
          )}

          {/* Media Content */}
          <div className="w-full h-full flex items-center justify-center p-4">
            {currentMedia.mime_type.startsWith('image/') ? (
              <img
                src={currentMedia.b2_file_url}
                alt={currentMedia.file_name}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <video
                src={currentMedia.b2_file_url}
                controls
                className="max-w-full max-h-full"
                autoPlay
              />
            )}
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/70 px-4 py-2 rounded space-y-1 text-center">
            <div>{currentIndex + 1} / {media.length}</div>
            <div className="text-xs">Uploaded by: {guests[currentMedia.guest_id] || 'Unknown'}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
