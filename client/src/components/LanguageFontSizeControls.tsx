/**
 * LanguageFontSizeControls Component
 * Allows customization of font size for primary and secondary language subtitles
 */

import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';

interface LanguageFontSizeControlsProps {
  primaryFontSize: number;
  secondaryFontSize: number;
  onPrimaryFontSizeChange: (size: number) => void;
  onSecondaryFontSizeChange: (size: number) => void;
}

export default function LanguageFontSizeControls({
  primaryFontSize,
  secondaryFontSize,
  onPrimaryFontSizeChange,
  onSecondaryFontSizeChange,
}: LanguageFontSizeControlsProps) {
  return (
    <Card className="p-6 space-y-6 bg-card border border-border rounded-lg">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Language Font Sizes
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Customize font size for each language to make the primary subtitle more prominent
        </p>
      </div>

      {/* Primary Language */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            First Language (Primary)
          </label>
          <span className="text-sm font-semibold text-accent bg-accent/10 px-3 py-1 rounded">
            {primaryFontSize}px
          </span>
        </div>
        <Slider
          value={[primaryFontSize]}
          onValueChange={(value) => onPrimaryFontSizeChange(value[0])}
          min={12}
          max={48}
          step={1}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          This is the main subtitle language (typically larger)
        </p>
      </div>

      {/* Secondary Language */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Second Language (Secondary)
          </label>
          <span className="text-sm font-semibold text-accent bg-accent/10 px-3 py-1 rounded">
            {secondaryFontSize}px
          </span>
        </div>
        <Slider
          value={[secondaryFontSize]}
          onValueChange={(value) => onSecondaryFontSizeChange(value[0])}
          min={8}
          max={32}
          step={1}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          This is the secondary subtitle language (typically smaller)
        </p>
      </div>

      {/* Preview */}
      <div className="mt-6 pt-6 border-t border-border space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase">Preview</p>
        <div className="bg-black rounded-lg p-4 space-y-2">
          <p
            style={{
              fontSize: `${primaryFontSize}px`,
              color: '#ffffff',
              lineHeight: 1.5,
            }}
          >
            First Language Subtitle
          </p>
          <p
            style={{
              fontSize: `${secondaryFontSize}px`,
              color: '#ffffff',
              lineHeight: 1.5,
            }}
          >
            Second Language Subtitle
          </p>
        </div>
      </div>
    </Card>
  );
}
