import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Media {
  id: string;
  file_name: string;
  mime_type: string;
  b2_file_url: string;
  uploaded_at: string;
  file_size: number;
}

interface MediaViewerProps {
  media: Media[];
  initialMedia: Media;
  onClose: () => void;
}

export const MediaViewer = ({ media, initialMedia, onClose }: MediaViewerProps) => {
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
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </Button>

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

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded">
            {currentIndex + 1} / {media.length}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};