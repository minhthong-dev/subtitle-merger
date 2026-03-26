/**
 * SubtitleSpacingControls Component
 * Allows customization of spacing between subtitle lines and margin
 */

import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';

interface SubtitleSpacingControlsProps {
  lineHeight: number;
  marginBottom: number;
  onLineHeightChange: (height: number) => void;
  onMarginBottomChange: (margin: number) => void;
}

export default function SubtitleSpacingControls({
  lineHeight,
  marginBottom,
  onLineHeightChange,
  onMarginBottomChange,
}: SubtitleSpacingControlsProps) {
  return (
    <Card className="p-6 space-y-6 bg-card border border-border rounded-lg">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Subtitle Spacing
        </h3>
        <p className="text-sm text-muted-foreground">
          Adjust spacing between subtitle lines and margins
        </p>
      </div>

      {/* Line Height */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Line Height
          </label>
          <span className="text-sm font-semibold text-accent bg-accent/10 px-3 py-1 rounded">
            {lineHeight.toFixed(1)}
          </span>
        </div>
        <Slider
          value={[lineHeight]}
          onValueChange={(value) => onLineHeightChange(value[0])}
          min={1}
          max={3}
          step={0.1}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Controls spacing between lines within a subtitle entry
        </p>
      </div>

      {/* Margin Bottom */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Bottom Margin
          </label>
          <span className="text-sm font-semibold text-accent bg-accent/10 px-3 py-1 rounded">
            {marginBottom}px
          </span>
        </div>
        <Slider
          value={[marginBottom]}
          onValueChange={(value) => onMarginBottomChange(value[0])}
          min={0}
          max={32}
          step={1}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Controls spacing between subtitle entries
        </p>
      </div>

      {/* Preview */}
      <div className="mt-6 pt-6 border-t border-border space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase">Preview</p>
        <div className="bg-black rounded-lg p-4 space-y-0">
          <div style={{ marginBottom: `${marginBottom}px` }}>
            <p
              style={{
                fontSize: '16px',
                color: '#ffffff',
                lineHeight: lineHeight,
              }}
            >
              First Language Subtitle
            </p>
            <p
              style={{
                fontSize: '12px',
                color: '#ffffff',
                lineHeight: lineHeight,
              }}
            >
              Second Language Subtitle
            </p>
          </div>
          <div>
            <p
              style={{
                fontSize: '16px',
                color: '#ffffff',
                lineHeight: lineHeight,
              }}
            >
              Next Entry Line 1
            </p>
            <p
              style={{
                fontSize: '12px',
                color: '#ffffff',
                lineHeight: lineHeight,
              }}
            >
              Next Entry Line 2
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
