import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { estimateCompressedSize, formatFileSize } from "@/utils/compressionWorker";

interface QualitySelectorProps {
  quality: 'low' | 'medium' | 'high';
  onQualityChange: (quality: 'low' | 'medium' | 'high') => void;
  totalSize?: number;
}

const QualitySelector = ({ quality, onQualityChange, totalSize }: QualitySelectorProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold">Compression Quality</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Choose between file size and image quality
        </p>
      </div>

      <RadioGroup value={quality} onValueChange={(val) => onQualityChange(val as any)}>
        <div 
          className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-smooth cursor-pointer ${
            quality === 'high' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          }`}
          onClick={() => onQualityChange('high')}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onQualityChange('high')}
          role="button"
          tabIndex={0}
          aria-pressed={quality === 'high'}
        >
          <RadioGroupItem value="high" id="high" />
          <div className="flex-1">
            <Label htmlFor="high" className="cursor-pointer font-medium">
              High Quality
            </Label>
            <p className="text-xs text-muted-foreground">
              Best quality, ~20-30% smaller
              {totalSize && ` (≈${formatFileSize(estimateCompressedSize(totalSize, 'high'))})`}
            </p>
          </div>
        </div>

        <div 
          className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-smooth cursor-pointer ${
            quality === 'medium' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          }`}
          onClick={() => onQualityChange('medium')}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onQualityChange('medium')}
          role="button"
          tabIndex={0}
          aria-pressed={quality === 'medium'}
        >
          <RadioGroupItem value="medium" id="medium" />
          <div className="flex-1">
            <Label htmlFor="medium" className="cursor-pointer font-medium">
              Medium Quality (Recommended)
            </Label>
            <p className="text-xs text-muted-foreground">
              Balanced, ~45-55% smaller
              {totalSize && ` (≈${formatFileSize(estimateCompressedSize(totalSize, 'medium'))})`}
            </p>
          </div>
        </div>

        <div 
          className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-smooth cursor-pointer ${
            quality === 'low' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          }`}
          onClick={() => onQualityChange('low')}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onQualityChange('low')}
          role="button"
          tabIndex={0}
          aria-pressed={quality === 'low'}
        >
          <RadioGroupItem value="low" id="low" />
          <div className="flex-1">
            <Label htmlFor="low" className="cursor-pointer font-medium">
              Low Quality
            </Label>
            <p className="text-xs text-muted-foreground">
              Maximum compression, ~65-75% smaller
              {totalSize && ` (≈${formatFileSize(estimateCompressedSize(totalSize, 'low'))})`}
            </p>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
};

export default QualitySelector;
