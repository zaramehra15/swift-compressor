import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight } from "lucide-react";

interface ConversionSelectorProps {
  category: string;
  fromFormat: string;
  toFormat: string;
  onFromFormatChange: (format: string) => void;
  onToFormatChange: (format: string) => void;
}

// Define all valid "from" formats per category
const fromFormats: Record<string, string[]> = {
  images: ["JPG", "PNG", "WEBP", "GIF", "BMP", "TIFF", "ICO"],
  documents: ["PDF", "DOCX", "XLSX", "PPTX", "CSV", "TXT"],
  audio: ["MP3", "WAV", "M4A", "OGG", "AAC"],
  video: ["MP4", "MOV", "AVI", "WEBM", "MKV"],
};

// Define valid "to" formats based on "from" selection
const getToFormats = (category: string, from: string): string[] => {
  switch (category) {
    case 'images':
      // All image formats except the source
      return ["JPG", "PNG", "WEBP", "GIF", "BMP", "TIFF"].filter(f => f !== from);

    case 'documents':
      switch (from) {
        case 'PDF':
          return ['DOCX', 'TXT', 'PNG', 'JPG'];
        case 'DOCX':
          return ['PDF', 'TXT'];
        case 'XLSX':
          return ['PDF', 'CSV'];
        case 'PPTX':
          return ['PDF'];
        case 'CSV':
          return ['XLSX'];
        case 'TXT':
          return ['PDF'];
        default:
          return [];
      }

    case 'audio':
      // Currently supported output: MP3, WAV
      return ['MP3', 'WAV'].filter(f => f !== from);

    case 'video':
      // Currently supported output: MP4, WEBM
      return ['MP4', 'WEBM'].filter(f => f !== from);

    default:
      return [];
  }
};

const ConversionSelector = ({
  category,
  fromFormat,
  toFormat,
  onFromFormatChange,
  onToFormatChange,
}: ConversionSelectorProps) => {
  const availableFromFormats = fromFormats[category] || [];
  const availableToFormats = fromFormat ? getToFormats(category, fromFormat) : [];

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border">
      <Label className="text-base font-semibold">Conversion Format</Label>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Label className="text-sm text-muted-foreground mb-2 block">From</Label>
          <Select value={fromFormat} onValueChange={onFromFormatChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {availableFromFormats.map((format) => (
                <SelectItem key={format} value={format}>
                  {format}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ArrowRight className="w-5 h-5 text-primary mt-6 flex-shrink-0" />

        <div className="flex-1">
          <Label className="text-sm text-muted-foreground mb-2 block">To</Label>
          <Select value={toFormat} onValueChange={onToFormatChange} disabled={!fromFormat}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={fromFormat ? "Select format" : "Select 'From' first"} />
            </SelectTrigger>
            <SelectContent>
              {availableToFormats.map((format) => (
                <SelectItem key={format} value={format}>
                  {format}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {fromFormat && toFormat && (
        <div className="text-sm text-center p-3 bg-primary/10 text-primary rounded-lg font-medium">
          Converting: {fromFormat} → {toFormat}
        </div>
      )}
    </div>
  );
};

export default ConversionSelector;
