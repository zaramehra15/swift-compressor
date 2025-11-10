import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormatSelectorProps {
  format: 'auto' | 'jpeg' | 'webp' | 'png';
  onFormatChange: (format: 'auto' | 'jpeg' | 'webp' | 'png') => void;
}

const FormatSelector = ({ format, onFormatChange }: FormatSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-base font-semibold">Output Format</Label>
      <Select value={format} onValueChange={(val) => onFormatChange(val as any)}>
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
