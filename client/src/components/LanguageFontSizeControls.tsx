/**
 * LanguageFontSizeControls Component
 * Allows customization of font size for primary and secondary language subtitles
 */

import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';

interface LanguageFontSizeControlsProps {
  primaryFontSize: number;
  secondaryFontSize: number;
  primaryColor: string;
  secondaryColor: string;
  onPrimaryFontSizeChange: (size: number) => void;
  onSecondaryFontSizeChange: (size: number) => void;
  onPrimaryColorChange: (color: string) => void;
  onSecondaryColorChange: (color: string) => void;
}

export default function LanguageFontSizeControls({
  primaryFontSize,
  secondaryFontSize,
  primaryColor,
  secondaryColor,
  onPrimaryFontSizeChange,
  onSecondaryFontSizeChange,
  onPrimaryColorChange,
  onSecondaryColorChange,
}: LanguageFontSizeControlsProps) {
  return (
    <Card className="p-6 space-y-6 bg-card border border-border rounded-lg">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Language Styles
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Customize font size and color for each language to make subtitles perfectly balanced
        </p>
      </div>

      {/* Primary Language */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            First Language (Primary)
          </label>
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded border border-border overflow-hidden">
              <input 
                type="color" 
                value={primaryColor} 
                onChange={(e) => onPrimaryColorChange(e.target.value)}
                className="absolute -inset-2 w-12 h-12 cursor-pointer"
              />
            </div>
            <span className="text-sm font-semibold text-accent bg-accent/10 px-3 py-1 rounded">
              {primaryFontSize}px
            </span>
          </div>
        </div>
        <Slider
          value={[primaryFontSize]}
          onValueChange={(value) => onPrimaryFontSizeChange(value[0])}
          min={12}
          max={64}
          step={1}
          className="w-full"
        />
      </div>

      {/* Secondary Language */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Second Language (Secondary)
          </label>
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded border border-border overflow-hidden">
              <input 
                type="color" 
                value={secondaryColor} 
                onChange={(e) => onSecondaryColorChange(e.target.value)}
                className="absolute -inset-2 w-12 h-12 cursor-pointer"
              />
            </div>
            <span className="text-sm font-semibold text-accent bg-accent/10 px-3 py-1 rounded">
              {secondaryFontSize}px
            </span>
          </div>
        </div>
        <Slider
          value={[secondaryFontSize]}
          onValueChange={(value) => onSecondaryFontSizeChange(value[0])}
          min={8}
          max={48}
          step={1}
          className="w-full"
        />
      </div>

      {/* Preview */}
      <div className="mt-6 pt-6 border-t border-border space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase">Preview</p>
        <div className="bg-black rounded-lg p-6 space-y-2 flex flex-col items-center">
          <p
            className="text-center"
            style={{
              fontSize: `${primaryFontSize}px`,
              color: primaryColor,
              lineHeight: 1.4,
              fontWeight: 700,
              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            }}
          >
            L'essential est invisible cho các mắt.
          </p>
          <p
            className="text-center"
            style={{
              fontSize: `${secondaryFontSize}px`,
              color: secondaryColor,
              lineHeight: 1.4,
              fontWeight: 500,
              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            }}
          >
            Cái cốt lõi thì không thể nhìn thấy bằng mắt thường.
          </p>
        </div>
      </div>
    </Card>
  );
}
