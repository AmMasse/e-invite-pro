import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Download, Trash2, Image as ImageIcon, Video } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface MediaManagementProps {
  eventId: string;
}

const MediaManagement = ({ eventId }: MediaManagementProps) => {
  const { toast } = useToast();
  const [media, setMedia] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchMedia();
    }
  }, [eventId]);

  const fetchMedia = async () => {
    setIsLoading(true);
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
        title: "Error",
        description: "Failed to load media",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadAllMedia = async () => {
    setIsDownloading(true);
    try {
      for (const item of media) {
        const link = document.createElement('a');
        link.href = item.b2_file_url;
        link.download = item.file_name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      toast({
        title: "Success",
        description: `Downloading ${media.length} files`
      });
    } catch (error) {
      console.error('Error downloading media:', error);
      toast({
        title: "Error",
        description: "Failed to download media",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const deleteAllMedia = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('delete-media', {
        body: { eventId }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "All media deleted successfully"
      });
      
      setMedia([]);
    } catch (error) {
      console.error('Error deleting media:', error);
      toast({
        title: "Error",
        description: "Failed to delete media",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <Card className="border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-accent" />
          Media Management
        </CardTitle>
        <CardDescription>
          Manage all media for this event
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-muted-foreground">Loading media...</p>
        ) : media.length === 0 ? (
          <p className="text-muted-foreground">No media uploaded yet</p>
        ) : (
          <>
            <div className="flex gap-2 mb-4">
              <Button
                onClick={downloadAllMedia}
                disabled={isDownloading}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download All ({media.length})
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={isDeleting}
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete All ({media.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all {media.length} media files from Backblaze storage and the database. 
                      Guests will no longer be able to access these files. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteAllMedia}>
                      Delete All Media
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {media.map((item) => (
                <div key={item.id} className="relative">
                  <div className="aspect-square rounded-lg overflow-hidden bg-accent/5 border border-accent/20">
                    {item.mime_type.startsWith('image/') ? (
                      <img
                        src={item.b2_file_url}
                        alt={item.file_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground truncate">
                    {item.file_name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatFileSize(item.file_size)}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-accent/20">
              <p className="text-sm text-muted-foreground">
                Total: {media.length} files ({formatFileSize(media.reduce((acc, item) => acc + item.file_size, 0))})
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MediaManagement;
