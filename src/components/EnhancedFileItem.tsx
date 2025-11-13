import { useState, useEffect } from "react";
import { Download, FileImage, FileText, Loader2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { compressImageWithWorker, formatFileSize, calculateCompressionRatio } from "@/utils/compressionWorker";
import { compressPDF } from "@/utils/pdfCompression";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface EnhancedFileItemProps {
  file: File;
  quality: 'low' | 'medium' | 'high';
  format: 'auto' | 'jpeg' | 'webp' | 'png';
  onRemove: () => void;
  onCompressed: (blob: Blob) => void;
}

const EnhancedFileItem = ({ file, quality, format, onRemove, onCompressed }: EnhancedFileItemProps) => {
  const [compressing, setCompressing] = useState(false);
  const [compressed, setCompressed] = useState(false);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [originalSize] = useState(file.size);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [thumbnail, setThumbnail] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [lastQuality, setLastQuality] = useState(quality);
  const [lastFormat, setLastFormat] = useState(format);
  const { toast } = useToast();

  // Allow re-compression if quality or format changes
  const canRecompress = compressed && (quality !== lastQuality || format !== lastFormat);

  const isImage = file.type.startsWith("image/");
  const isPDF = file.type === "application/pdf";

  // Generate thumbnail for images
  useEffect(() => {
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnail(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [file, isImage]);

  const handleCompress = async () => {
    setCompressing(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 100);

    try {
      let blob: Blob;
      
      if (isImage) {
        const result = await compressImageWithWorker(file, { quality, format });
        blob = result.blob;
        setCompressedSize(result.compressedSize);
      } else if (isPDF) {
        blob = await compressPDF(file);
        setCompressedSize(blob.size);
      } else {
        throw new Error("Unsupported file type");
      }

      clearInterval(progressInterval);
      setProgress(100);

      setCompressedBlob(blob);
      setCompressed(true);
      setLastQuality(quality);
      setLastFormat(format);
      onCompressed(blob);

      const ratio = calculateCompressionRatio(originalSize, blob.size);
      toast({
        title: "Compression successful!",
        description: `Reduced file size by ${ratio}% - Download ready`,
      });
    } catch (error) {
      clearInterval(progressInterval);
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-card border border-border rounded-xl p-4 shadow-card transition-smooth hover:shadow-elegant relative"
    >
      {/* Remove button */}
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center transition-smooth group"
        aria-label="Remove file"
      >
        <X className="w-4 h-4 text-destructive group-hover:scale-110 transition-transform" />
      </button>

      <div className="flex items-start gap-4">
        {/* Thumbnail or icon */}
        <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
          {thumbnail ? (
            <img src={thumbnail} alt={file.name} className="w-full h-full object-cover" />
          ) : isImage ? (
            <FileImage className="w-8 h-8 text-primary" />
          ) : (
            <FileText className="w-8 h-8 text-primary" />
          )}
        </div>

        <div className="flex-1 min-w-0 pr-8">
          <h4 className="text-sm font-semibold text-foreground truncate mb-1">
            {file.name}
          </h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <span>Original: {formatFileSize(originalSize)}</span>
            {compressed && (
              <>
                <span>→</span>
                <span className="text-primary font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  {formatFileSize(compressedSize)} ({compressionRatio}% smaller)
                </span>
              </>
            )}
          </div>

          {compressing && (
            <div className="mb-3">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">Compressing... {progress}%</p>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
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
              <>
                <Button
                  onClick={handleDownload}
                  size="sm"
                  variant="outline"
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                {canRecompress && (
                  <Button
                    onClick={handleCompress}
                    size="sm"
                    variant="secondary"
                    className="gap-2"
                  >
                    Re-compress
                  </Button>
                )}
              </>
            )}

            {compressing && (
              <Button size="sm" disabled>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Compressing... {progress}%
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedFileItem;
