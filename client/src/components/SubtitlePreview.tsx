import { SubtitleEntry } from '@/hooks/useSubtitleParser';
import { Copy, Download, Play, Pause, Palette, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { useState, useEffect, useRef, useMemo } from 'react';

export interface SubtitleStyle {
  fontFamily?: string;
  fontSize?: number;
  textColor?: string;
  backgroundColor?: string;
  opacity?: number;
  lineHeight?: number;
}

interface SubtitlePreviewProps {
  entries: SubtitleEntry[];
  onDownload: (format: 'srt' | 'vtt') => void;
  isLoading?: boolean;
  style?: SubtitleStyle;
  onEditEntryStyle?: () => void;
  primaryFontSize?: number;
  secondaryFontSize?: number;
}

// Helper time formatter
function formatTimeMs(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function SubtitlePreview({
  entries,
  onDownload,
  isLoading = false,
  style,
  onEditEntryStyle,
  primaryFontSize = 16,
  secondaryFontSize = 12,
}: SubtitlePreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const rafRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Maximum time is the end time of the very last subtitle + a 1s buffer
  const maxTimeMs = useMemo(() => {
    return entries.length > 0 ? entries[entries.length - 1].endMs + 1000 : 0;
  }, [entries]);

  // Handle Playback loop
  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = performance.now();
      const tick = (now: number) => {
        const delta = now - lastTimeRef.current;
        lastTimeRef.current = now;

        setCurrentTimeMs((prev) => {
          const next = prev + (delta * 1.5); // Play slightly faster for preview purposes, or 1.0 for real time
          if (next >= maxTimeMs) {
            setIsPlaying(false);
            return maxTimeMs;
          }
          return next;
        });
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, maxTimeMs]);

  const handleCopyToClipboard = async () => {
    const text = entries
      .map(
        (entry) =>
          `${entry.index}\n${entry.startTime} --> ${entry.endTime}\n${entry.text}`
      )
      .join('\n\n');

    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/60 bg-card/30 min-h-[400px] text-center p-8">
        <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <Play className="h-8 w-8 text-muted-foreground/50 ml-1" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">No Subtitles Yet</h3>
        <p className="text-muted-foreground max-w-sm">
          Upload and merge your subtitle files to activate the Interactive Video Previewer
        </p>
      </div>
    );
  }

  // Get active subtitle entries based on the current playback time
  const activeEntries = entries.filter(e => currentTimeMs >= e.startMs && currentTimeMs <= e.endMs);

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-foreground font-['Playfair_Display']">Interactive Preview</h3>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" />
            {entries.length} segments • {formatTimeMs(maxTimeMs)} total length
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {onEditEntryStyle && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEditEntryStyle}
              disabled={isLoading}
              className="gap-2 shadow-sm"
            >
              <Palette className="h-4 w-4" />
              Tune Individually
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyToClipboard}
            disabled={isLoading}
            className="gap-2 shadow-sm"
          >
            <Copy className="h-4 w-4" />
            Copy
          </Button>
          <div className="w-px h-8 bg-border mx-1"></div>
          <Button
            variant="default"
            size="sm"
            onClick={() => onDownload('srt')}
            disabled={isLoading}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Download className="h-4 w-4" />
            Export SRT
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => onDownload('vtt')}
            disabled={isLoading}
            className="gap-2 bg-[#d4a574] text-[#1a3a52] hover:bg-[#d4a574]/90"
          >
            <Download className="h-4 w-4" />
            Export VTT
          </Button>
        </div>
      </div>

      {/* Simulated Video Player Setup */}
      <div className="relative rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-border bg-black select-none group">

        {/* Actual Video Frame */}
        <div
          className="relative w-full aspect-video flex flex-col items-center justify-end pb-16 cursor-pointer"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {/* Subtle background placeholder (dark theater look) */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0a0a] via-[#111111] to-[#1a1a1a] opacity-80" />

          {/* Subtitle Display Container */}
          <div className="relative z-10 w-full max-w-4xl px-8 flex flex-col items-center pointer-events-none">
            {activeEntries.length > 0 ? (() => {
              // Group active matching entries (usually 1 or 2 overlapping perfectly)
              const grouped: { [key: string]: SubtitleEntry[] } = {};
              activeEntries.forEach(e => {
                const key = `${e.startTime}-${e.endTime}`;
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(e);
              });

              return Object.values(grouped).map((group, gIdx) => {
                // Ensure Primary is top, Secondary is bottom visually
                const sorted = [...group].sort((a, b) => {
                  if (a.language === 'primary') return -1;
                  if (b.language === 'primary') return 1;
                  return 0;
                });

                return (
                  <div key={gIdx} className="flex flex-col items-center mb-1 drop-shadow-2xl">
                    {sorted.map((entry, idx) => {
                      let fontSize = style?.fontSize || 16;
                      if (entry.language === 'primary') fontSize = entry.customStyle?.fontSize || primaryFontSize;
                      else if (entry.language === 'secondary') fontSize = entry.customStyle?.fontSize || secondaryFontSize;
                      else fontSize = entry.customStyle?.fontSize || fontSize;

                      const textColor = entry.customStyle?.textColor ||
                        (entry.language === 'secondary' ? '#e0c97f' : '#ffffff');

                      return (
                        <p
                          key={idx}
                          className="text-center whitespace-pre-wrap tracking-wide transition-all"
                          style={{
                            fontFamily: entry.customStyle?.fontFamily || style?.fontFamily || 'sans-serif',
                            fontSize: `${fontSize}px`,
                            color: textColor,
                            lineHeight: entry.customStyle?.lineHeight || style?.lineHeight || 1.4,
                            fontWeight: entry.language === 'primary' ? '700' : '500',
                            // Add realistic soft drop-shadow typical on Netflix/Youtube instead of hard box background
                            textShadow: '0 1px 3px rgba(0,0,0,0.8), 0 2px 10px rgba(0,0,0,0.6)',
                            marginBottom: idx < sorted.length - 1 ? '5px' : 0,
                          }}
                        >
                          {entry.text}
                        </p>
                      );
                    })}
                  </div>
                );
              });
            })() : null}
          </div>

          {/* Huge Play overlay when paused */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
                <Play className="h-10 w-10 text-white ml-2 opacity-90 fill-white" />
              </div>
            </div>
          )}
        </div>

        {/* Player Controls (Hover revealed on desktop, visible always on mobile) */}
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 via-black/50 to-transparent pt-12 pb-4 px-6 flex flex-col gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
          {/* Timeline Slider */}
          <div className="flex bg-white/10 rounded-full h-1 relative cursor-pointer"
            onClick={(e) => {
              const bounds = e.currentTarget.getBoundingClientRect();
              const percent = Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width));
              setCurrentTimeMs(percent * maxTimeMs);
            }}>
            <div className="h-full bg-[#d4a574] rounded-full relative" style={{ width: `${(currentTimeMs / maxTimeMs) * 100}%` }}>
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg scale-0 sm:group-hover:scale-100 transition-transform"></div>
            </div>
          </div>

          {/* Bottom Bar Tools */}
          <div className="flex items-center justify-between mt-2 select-none">
            <div className="flex items-center gap-6">
              <button
                onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
                className="text-white hover:text-[#d4a574] transition-colors focus:outline-none"
              >
                {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
              </button>
              <div className="text-white/80 font-mono text-xs tracking-wider opacity-90">
                {formatTimeMs(currentTimeMs)} <span className="text-white/40 mx-1">/</span> {formatTimeMs(maxTimeMs)}
              </div>
            </div>
            <div className="text-white/40 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              Preview
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Segment Timeline View */}
      <div className="space-y-3 pt-6 border-t border-border/50">
        <h4 className="text-base font-semibold text-foreground flex items-center gap-2">
          Full Transcript
          <span className="text-xs font-normal text-muted-foreground ml-auto bg-muted px-2 py-1 rounded-md">
            Click segment to jump
          </span>
        </h4>

        <div className="max-h-[500px] overflow-y-auto rounded-xl border border-border bg-card shadow-sm scroll-smooth">
          <div className="divide-y divide-border">
            {entries.map((entry, idx) => {
              const isActive = currentTimeMs >= entry.startMs && currentTimeMs <= entry.endMs;
              const listFontSize = entry.customStyle?.fontSize
                ? Math.max(10, entry.customStyle.fontSize - 6)
                : entry.language === 'primary'
                  ? Math.max(13, primaryFontSize - 6)
                  : Math.max(12, secondaryFontSize - 5);
              const isPrimary = entry.language === 'primary';

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentTimeMs(entry.startMs);
                    setIsPlaying(false);
                  }}
                  className={`px-5 py-4 cursor-pointer transition-all duration-200 group ${isActive
                    ? 'bg-accent/10 hover:bg-accent/15'
                    : 'hover:bg-muted/50'
                    } ${isPrimary
                      ? (isActive ? 'border-l-4 border-l-accent' : 'border-l-4 border-l-accent/40')
                      : 'border-l-4 border-l-transparent pl-8'
                    }`}
                >
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${isActive ? 'bg-accent text-accent-foreground' : 'text-accent bg-accent/10 group-hover:bg-accent/20'
                      }`}>
                      #{entry.index}
                    </span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${isPrimary
                      ? (isActive ? 'text-accent' : 'text-accent/70')
                      : 'text-muted-foreground/60'
                      }`}>
                      {entry.language || 'unknown'}
                    </span>
                    <span className={`text-[11px] font-mono ml-auto ${isActive ? 'text-accent font-semibold' : 'text-muted-foreground'
                      }`}>
                      {entry.startTime.slice(0, -4)} <span className="opacity-50 mx-0.5">→</span> {entry.endTime.slice(0, -4)}
                    </span>
                  </div>
                  <p
                    className="whitespace-pre-wrap"
                    style={{
                      fontFamily: entry.customStyle?.fontFamily || 'inherit',
                      fontSize: `${listFontSize}px`,
                      fontWeight: isPrimary ? '600' : '400',
                      color: isActive ? 'var(--foreground)' : (entry.customStyle?.textColor || 'var(--foreground)'),
                      opacity: isActive ? 1 : 0.85
                    }}
                  >
                    {entry.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
