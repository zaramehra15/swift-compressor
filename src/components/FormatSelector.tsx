import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type OutputFormat = 'auto' | 'jpeg' | 'webp' | 'png';

interface FormatSelectorProps {
  format: OutputFormat;
  onFormatChange: (format: OutputFormat) => void;
}

const FormatSelector = ({ format, onFormatChange }: FormatSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-base font-semibold">Output Format</Label>
      <Select value={format} onValueChange={(val) => {
        const isFormat = (v: string): v is OutputFormat => (
          v === 'auto' || v === 'jpeg' || v === 'webp' || v === 'png'
        );
        onFormatChange(isFormat(val) ? val : format);
      }}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select format" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="auto">Auto (Best format)</SelectItem>
          <SelectItem value="jpeg">JPEG</SelectItem>
          <SelectItem value="webp">WebP (Smallest)</SelectItem>
          <SelectItem value="png">PNG</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Auto selects the best format based on your image type
      </p>
    </div>
  );
};

export default FormatSelector;
