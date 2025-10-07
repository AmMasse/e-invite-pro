import { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MediaUploadProps {
  eventId: string;
  guestId?: string;
  onUploadComplete?: () => void;
}

export const MediaUpload = ({ eventId, guestId, onUploadComplete }: MediaUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentFileName, setCurrentFileName] = useState<string>("");
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(file => {
        const isValid = file.type.startsWith('image/') || file.type.startsWith('video/');
        const isUnder50MB = file.size <= 50 * 1024 * 1024;
        
        if (!isValid) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not an image or video`,
            variant: "destructive"
          });
        }
        if (!isUnder50MB) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds 50MB limit`,
            variant: "destructive"
          });
        }
        
        return isValid && isUnder50MB;
      });
      
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const simulateProgress = (fileIndex: number, totalFiles: number): Promise<void> => {
    return new Promise((resolve) => {
      const startPercent = (fileIndex / totalFiles) * 100;
      const endPercent = ((fileIndex + 1) / totalFiles) * 100;
      const duration = 1500; // 1.5 seconds per file
      const steps = 30;
      const increment = (endPercent - startPercent) / steps;
      const stepDuration = duration / steps;
      
      let currentStep = 0;
      
      const interval = setInterval(() => {
        currentStep++;
        const newProgress = startPercent + (increment * currentStep);
        setProgress(Math.min(newProgress, endPercent - 1)); // Stop just before complete
        
        if (currentStep >= steps) {
          clearInterval(interval);
          resolve();
        }
      }, stepDuration);
    });
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setProgress(0);

    try {
      const totalFiles = selectedFiles.length;

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setCurrentFileName(file.name);

        // Start simulated progress
        const progressPromise = simulateProgress(i, totalFiles);

        // Actual upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('eventId', eventId);
        if (guestId) formData.append('guestId', guestId);

        const uploadPromise = supabase.functions.invoke('upload-media', {
          body: formData
        });

        // Wait for both progress simulation and upload to complete
        const [, { data, error }] = await Promise.all([
          progressPromise,
          uploadPromise
        ]);

        if (error) throw error;

        // Complete this file's progress
        setProgress(((i + 1) / totalFiles) * 100);
      }

      toast({
        title: "Upload successful",
        description: `${totalFiles} file(s) uploaded successfully`
      });

      setSelectedFiles([]);
      setCurrentFileName("");
      onUploadComplete?.();

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center hover:border-primary/40 transition-colors">
        <input
          type="file"
          id="media-upload"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
        <label
          htmlFor="media-upload"
          className={`flex flex-col items-center gap-2 ${uploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        >
          <Upload className="w-12 h-12 text-primary" />
          <p className="text-lg font-semibold">Upload Photos & Videos</p>
          <p className="text-sm text-muted-foreground">
            Click to select files (Max 50MB per file)
          </p>
        </label>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Selected Files ({selectedFiles.length})</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm truncate flex-1">{file.name}</span>
                <span className="text-xs text-muted-foreground mx-2">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {uploading && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <p className="text-sm font-medium">Uploading...</p>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="space-y-1">
                <p className="text-sm text-center text-muted-foreground">
                  {Math.round(progress)}% Complete
                </p>
                {currentFileName && (
                  <p className="text-xs text-center text-muted-foreground truncate">
                    Current: {currentFileName}
                  </p>
                )}
              </div>
            </div>
          )}

          <Button
            onClick={uploadFiles}
            disabled={uploading}
            className="w-full"
            size="lg"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              `Upload ${selectedFiles.length} File(s)`
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
