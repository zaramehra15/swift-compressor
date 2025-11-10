import { Button } from "@/components/ui/button";
import { Download, FileImage } from "lucide-react";

const SampleFiles = () => {
  const sampleFiles = [
    {
      name: "Sample Image.jpg",
      size: "2.4 MB",
      description: "High-resolution photo",
    },
    {
      name: "Document.pdf",
      size: "1.8 MB",
      description: "Multi-page PDF",
    },
  ];

  const handleDownloadSample = (name: string) => {
    // In a real implementation, these would be actual sample files
    alert(`Sample file "${name}" would be downloaded here. Replace with actual sample files.`);
  };

  return (
    <div className="bg-secondary/30 rounded-2xl p-8 border border-border">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Try with Sample Files
          </h3>
          <p className="text-sm text-muted-foreground">
            Don't have files ready? Test with our sample images and PDFs
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {sampleFiles.map((file, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-4 bg-background rounded-xl border border-border"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileImage className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">{file.description} • {file.size}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDownloadSample(file.name)}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SampleFiles;
