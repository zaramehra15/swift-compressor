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

const ConversionSelector = ({
  category,
  fromFormat,
  toFormat,
  onFromFormatChange,
  onToFormatChange,
}: ConversionSelectorProps) => {
  const formats: Record<string, string[]> = {
    images: ["JPG", "PNG", "WEBP", "GIF"],
    documents: ["PDF", "DOCX", "XLSX", "PPTX", "CSV"],
    audio: ["MP3", "WAV", "M4A", "OGG"],
    video: ["MP4", "MOV", "AVI", "WEBM"],
  };

  const availableFormats = formats[category] || [];

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
              {availableFormats.map((format) => (
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
          <Select value={toFormat} onValueChange={onToFormatChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {(category === 'documents'
                ? (fromFormat === 'PDF'
                  ? ['PDF', 'DOCX', 'PNG', 'JPG']
                  : fromFormat === 'DOCX'
                  ? ['PDF']
                  : fromFormat === 'XLSX'
                  ? ['PDF', 'CSV']
                  : fromFormat === 'CSV'
                  ? ['XLSX']
                  : fromFormat === 'PPTX'
                  ? ['PDF']
                  : formats.documents)
                : category === 'audio'
                ? (fromFormat === 'MP3'
                  ? ['WAV']
                  : fromFormat === 'WAV'
                  ? ['MP3']
                  : fromFormat === 'M4A'
                  ? ['MP3', 'WAV']
                  : fromFormat === 'OGG'
                  ? ['MP3', 'WAV']
                  : formats.audio)
                : category === 'video'
                ? (['MP4', 'WEBM'])
                : category === 'images'
                ? ['JPG', 'PNG', 'WEBP']
                : availableFormats)
                .filter((format) => format !== fromFormat)
                .map((format) => (
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
