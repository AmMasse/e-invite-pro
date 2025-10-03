import { useState } from "react";
import { Upload, X } from "lucide-react";
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

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setProgress(0);

    try {
      const totalFiles = selectedFiles.length;
      let completedFiles = 0;

      for (const file of selectedFiles) {
        const fileName = `${Date.now()}-${file.name}`;
        
        // Get upload URL from edge function
        const { data: uploadData, error: urlError } = await supabase.functions.invoke('get-upload-url', {
          body: { fileName, contentType: file.type }
        });

        if (urlError) throw urlError;

        // Upload to B2
        const uploadResponse = await fetch(uploadData.uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': uploadData.authorizationToken,
            'X-Bz-File-Name': fileName,
            'Content-Type': file.type,
            'X-Bz-Content-Sha1': 'do_not_verify'
          },
          body: file
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file to B2');
        }

        const b2Response = await uploadResponse.json();

        // Save metadata
        const { error: metadataError } = await supabase.functions.invoke('complete-upload', {
          body: {
            eventId,
            guestId,
            fileName,
            fileSize: file.size,
            mimeType: file.type,
            b2FileId: b2Response.fileId,
            b2FileUrl: uploadData.b2FileUrl
          }
        });

        if (metadataError) throw metadataError;

        completedFiles++;
        setProgress((completedFiles / totalFiles) * 100);
      }

      toast({
        title: "Upload successful",
        description: `${completedFiles} file(s) uploaded successfully`
      });

      setSelectedFiles([]);
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
      <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center">
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
          className="cursor-pointer flex flex-col items-center gap-2"
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
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">
                Uploading... {Math.round(progress)}%
              </p>
            </div>
          )}

          <Button
            onClick={uploadFiles}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? "Uploading..." : `Upload ${selectedFiles.length} File(s)`}
          </Button>
        </div>
      )}
    </div>
  );
};