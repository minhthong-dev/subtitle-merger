/**
 * SubtitleEntryStyler Component
 * Allows customization of individual subtitle entry appearance
 */

import { SubtitleEntry } from '@/hooks/useSubtitleParser';
import { Slider } from '@/components/ui/slider';
import { X, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface SubtitleEntryStylerProps {
  entries: SubtitleEntry[];
  onEntryStyleChange: (index: number, style: SubtitleEntry['customStyle']) => void;
  onClose: () => void;
  primaryDefaultSize?: number;
  secondaryDefaultSize?: number;
}

const fontFamilies = [
  { value: 'sans-serif', label: 'Sans Serif' },
  { value: 'serif', label: 'Serif' },
  { value: 'monospace', label: 'Monospace' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Times New Roman', label: 'Times New Roman' },
];

export default function SubtitleEntryStyler({
  entries,
  onEntryStyleChange,
  onClose,
  primaryDefaultSize = 24,
  secondaryDefaultSize = 18,
}: SubtitleEntryStylerProps) {
  const [selectedEntryIndex, setSelectedEntryIndex] = useState<number>(0);
  const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set());

  const selectedEntry = entries[selectedEntryIndex];
  const customStyle = selectedEntry?.customStyle || {};
  const defaultSize = selectedEntry?.language === 'primary' ? primaryDefaultSize : secondaryDefaultSize;

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedEntries(newExpanded);
  };

  const handleFontSizeChange = (value: number[]) => {
    onEntryStyleChange(selectedEntryIndex, {
      ...customStyle,
      fontSize: value[0],
    });
  };

  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onEntryStyleChange(selectedEntryIndex, {
      ...customStyle,
      fontFamily: e.target.value,
    });
  };

  const handleTextColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onEntryStyleChange(selectedEntryIndex, {
      ...customStyle,
      textColor: e.target.value,
    });
  };

  const handleResetEntry = () => {
    onEntryStyleChange(selectedEntryIndex, {});
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4 bg-muted/30">
          <h3 className="font-semibold text-foreground">Customize Individual Subtitles</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Entry List */}
          <div className="w-40 border-r border-border overflow-y-auto bg-muted/20">
            {entries.map((entry, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedEntryIndex(idx)}
                className={`w-full text-left px-3 py-2 text-sm border-b border-border/50 hover:bg-muted transition-colors ${
                  selectedEntryIndex === idx ? 'bg-accent/20 border-l-2 border-l-accent' : ''
                }`}
              >
                <div className="font-medium text-xs text-accent">#{entry.index}</div>
                <div className="text-[10px] uppercase font-bold text-muted-foreground/50">{entry.language}</div>
                <div className="text-xs text-muted-foreground truncate mt-1">
                  {entry.text.split('\n')[0]}
                </div>
              </button>
            ))}
          </div>

          {/* Style Controls */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {selectedEntry && (
              <>
                {/* Preview */}
                <div className="bg-black rounded-lg p-6 text-center border border-white/10">
                  <p
                    className="text-white"
                    style={{
                      fontSize: `${customStyle.fontSize || defaultSize}px`,
                      fontFamily: customStyle.fontFamily || 'sans-serif',
                      color: customStyle.textColor || (selectedEntry.language === 'primary' ? '#ffffff' : '#cccccc'),
                      lineHeight: customStyle.lineHeight || 1.5,
                      fontWeight: selectedEntry.language === 'primary' ? '700' : '400',
                    }}
                  >
                    {selectedEntry.text}
                  </p>
                </div>

                {/* Font Size */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Font Size</label>
                    <span className="text-xs font-semibold px-2 py-1 bg-accent/10 rounded text-accent">
                      {customStyle.fontSize || defaultSize} px
                    </span>
                  </div>
                  <Slider
                    value={[customStyle.fontSize || defaultSize]}
                    onValueChange={handleFontSizeChange}
                    min={12}
                    max={64}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Font Family */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Font Family</label>
                  <select
                    value={customStyle.fontFamily || 'sans-serif'}
                    onChange={handleFontFamilyChange}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    {fontFamilies.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Text Color */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Text Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customStyle.textColor || '#ffffff'}
                      onChange={handleTextColorChange}
                      className="h-10 w-16 cursor-pointer rounded-md border border-border"
                    />
                    <input
                      type="text"
                      value={customStyle.textColor || '#ffffff'}
                      onChange={handleTextColorChange}
                      className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>

                {/* Reset Button */}
                <button
                  onClick={handleResetEntry}
                  className="w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Reset to Default
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
