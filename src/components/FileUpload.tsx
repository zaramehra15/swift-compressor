import { useCallback } from "react";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  acceptedTypes?: string;
}

const FileUpload = ({ onFilesSelected, acceptedTypes = "image/*,.pdf" }: FileUploadProps) => {
  const { toast } = useToast();

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      
      const validFiles = files.filter((file) => {
        const isImage = file.type.startsWith("image/");
        const isPDF = file.type === "application/pdf";
        return isImage || isPDF;
      });

      if (validFiles.length === 0) {
        toast({
          title: "Invalid files",
          description: "Please upload images (JPG, PNG, WebP) or PDF files only.",
          variant: "destructive",
        });
        return;
      }

      if (validFiles.length !== files.length) {
        toast({
          title: "Some files were skipped",
          description: "Only image and PDF files are supported.",
        });
      }

      onFilesSelected(validFiles);
    },
    [onFilesSelected, toast]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      onFilesSelected(files);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="border-2 border-dashed border-border rounded-2xl p-12 text-center transition-smooth hover:border-primary hover:bg-primary/5 hover:scale-[1.01] cursor-pointer group"
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept={acceptedTypes}
        multiple
        onChange={handleFileInput}
      />
      <label
        htmlFor="file-upload"
        className="cursor-pointer flex flex-col items-center gap-4"
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Upload className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground mb-2">
            Drop your files here or click to browse
          </p>
          <p className="text-sm text-muted-foreground mb-3">
            Supports JPG, PNG, WebP, and PDF files
          </p>
          <p className="text-xs text-muted-foreground px-4">
            <span className="inline-flex items-center gap-1">
              🔒 Your files never leave your device — all compression happens locally in your browser
            </span>
          </p>
        </div>
      </label>
    </div>
  );
};

export default FileUpload;
