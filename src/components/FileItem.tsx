import { useState } from "react";
import { Download, FileImage, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { compressImage, formatFileSize, calculateCompressionRatio } from "@/utils/imageCompression";
import { compressPDF } from "@/utils/pdfCompression";
import { useToast } from "@/hooks/use-toast";

interface FileItemProps {
  file: File;
}

const FileItem = ({ file }: FileItemProps) => {
  const [compressing, setCompressing] = useState(false);
  const [compressed, setCompressed] = useState(false);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [originalSize] = useState(file.size);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const { toast } = useToast();

  const isImage = file.type.startsWith("image/");
  const isPDF = file.type === "application/pdf";

  const handleCompress = async () => {
    setCompressing(true);
    try {
      let blob: Blob;
      
      if (isImage) {
        blob = await compressImage(file, {
          quality: 75,
          maxWidth: 1920,
          maxHeight: 1920,
        });
      } else if (isPDF) {
        blob = await compressPDF(file);
      } else {
        throw new Error("Unsupported file type");
      }

      setCompressedBlob(blob);
      setCompressedSize(blob.size);
      setCompressed(true);

      const ratio = calculateCompressionRatio(originalSize, blob.size);
      toast({
        title: "Compression successful!",
        description: `Reduced file size by ${ratio}%`,
      });
    } catch (error) {
      console.error("Compression error:", error);
      toast({
        title: "Compression failed",
        description: error instanceof Error ? error.message : "An error occurred during compression",
        variant: "destructive",
      });
    } finally {
      setCompressing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedBlob) return;

    const url = URL.createObjectURL(compressedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compressed_${file.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const compressionRatio = compressed
    ? calculateCompressionRatio(originalSize, compressedSize)
    : 0;

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-card transition-smooth hover:shadow-elegant">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
          {isImage ? (
            <FileImage className="w-6 h-6 text-primary" />
          ) : (
            <FileText className="w-6 h-6 text-primary" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-foreground truncate mb-1">
            {file.name}
          </h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <span>Original: {formatFileSize(originalSize)}</span>
            {compressed && (
              <>
                <span>→</span>
                <span className="text-primary font-medium">
                  {formatFileSize(compressedSize)} ({compressionRatio}% smaller)
                </span>
              </>
            )}
          </div>

          {compressing && (
            <div className="mb-3">
              <Progress value={50} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">Compressing...</p>
            </div>
          )}

          <div className="flex items-center gap-2">
            {!compressed && !compressing && (
              <Button
                onClick={handleCompress}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Compress
              </Button>
            )}

            {compressed && (
              <Button
                onClick={handleDownload}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            )}

            {compressing && (
              <Button size="sm" disabled>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileItem;
