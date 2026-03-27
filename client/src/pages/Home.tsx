import { useState, useCallback, useEffect } from 'react';
import { useSubtitleParser, SubtitleEntry } from '@/hooks/useSubtitleParser';
import SubtitleUploader from '@/components/SubtitleUploader';
import SubtitlePreview from '@/components/SubtitlePreview';
import LanguageFontSizeControls from '@/components/LanguageFontSizeControls';
import SubtitleSpacingControls from '@/components/SubtitleSpacingControls';
import SubtitleEntryStyler from '@/components/SubtitleEntryStyler';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  FileStack,
  Settings2,
  Download,
  RefreshCw,
  Timer,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

export default function Home() {
  const { mergeSubtitles, parseSubtitle, convertToSRT, convertToVTT } = useSubtitleParser();

  // File states
  const [file1, setFile1] = useState<{ content: string; name: string } | null>(null);
  const [file2, setFile2] = useState<{ content: string; name: string } | null>(null);
  const [file1Name, setFile1Name] = useState<string>('Language 1');
  const [file2Name, setFile2Name] = useState<string>('Language 2');

  // App states
  const [entries, setEntries] = useState<SubtitleEntry[]>([]);
  const [outputContent, setOutputContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showStyler, setShowStyler] = useState(false);

  // Customization states
  const [primaryFontSize, setPrimaryFontSize] = useState(35);
  const [secondaryFontSize, setSecondaryFontSize] = useState(18);
  const [primaryColor, setPrimaryColor] = useState('#ffffff');
  const [secondaryColor, setSecondaryColor] = useState('#ffff00');
  const [lineHeight, setLineHeight] = useState(1.5);
  const [marginBottom, setMarginBottom] = useState(10);
  const [offsetMs, setOffsetMs] = useState(0);
  const [globalOffsetMs, setGlobalOffsetMs] = useState(0);

  // Merge logic
  const handleMerge = useCallback(() => {
    if (!file1 || !file2) return;

    setIsLoading(true);
    try {
      // Capture current styles to persist them
      const currentStyleMap = new Map<string, any>();
      entries.forEach(e => {
        if (e.customStyle && Object.keys(e.customStyle).length > 0) {
          currentStyleMap.set(`${e.language}-${e.text}`, e.customStyle);
        }
      });

      const sub1 = parseSubtitle(file1.content, file1Name);
      const sub2 = parseSubtitle(file2.content, file2Name);

      const result = mergeSubtitles(sub1, sub2, 'srt', offsetMs, globalOffsetMs);

      // Re-apply sustained styles
      const entriesWithStyles = result.entries.map((e: SubtitleEntry) => {
        const key = `${e.language}-${e.text}`;
        if (currentStyleMap.has(key)) {
          return { ...e, customStyle: currentStyleMap.get(key) };
        }
        return e;
      });

      setEntries(entriesWithStyles);

      // RE-GENERATE CONTENT WITH STYLES to ensure manual edits are in the download
      const finalContent = convertToSRT(entriesWithStyles, primaryFontSize, secondaryFontSize, primaryColor, secondaryColor);
      setOutputContent(finalContent);

      toast.success('Subtitles merged and styles preserved!');
    } catch (error) {
      console.error('Merge error:', error);
      toast.error('Failed to merge subtitles.');
    } finally {
      setIsLoading(false);
    }
  }, [file1, file2, file1Name, file2Name, offsetMs, globalOffsetMs, primaryFontSize, secondaryFontSize, mergeSubtitles, parseSubtitle, entries, convertToSRT]);

  // Re-merge khi offset thay đổi
  useEffect(() => {
    if (file1 && file2) {
      handleMerge();
    }
  }, [offsetMs, globalOffsetMs]); // eslint-disable-line react-hooks/exhaustive-deps

  // Regenerate outputContent khi font size thay đổi (không cần merge lại)
  useEffect(() => {
    if (entries.length > 0) {
      const newContent = convertToSRT(entries, primaryFontSize, secondaryFontSize, primaryColor, secondaryColor);
      setOutputContent(newContent);
    }
  }, [primaryFontSize, secondaryFontSize, primaryColor, secondaryColor]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileSelect = async (file: File | null, index: number) => {
    if (!file) {
      if (index === 1) setFile1(null);
      else setFile2(null);
      setEntries([]);
      return;
    }

    const content = await file.text();
    if (index === 1) {
      setFile1({ content, name: file.name });
      setFile1Name(file.name.replace(/\.[^/.]+$/, ""));
    } else {
      setFile2({ content, name: file.name });
      setFile2Name(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleDownload = (format: 'srt' | 'vtt') => {
    if (entries.length === 0) return;

    const content = format === 'srt'
      ? convertToSRT(entries, primaryFontSize, secondaryFontSize, primaryColor, secondaryColor)
      : convertToVTT(entries, primaryFontSize, secondaryFontSize, primaryColor, secondaryColor);

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `merged_subtitles.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded as ${format.toUpperCase()}`);
  };

  const handleEntryStyleChange = (index: number, style: SubtitleEntry['customStyle']) => {
    const newEntries = [...entries];
    newEntries[index] = {
      ...newEntries[index],
      customStyle: style
    };
    setEntries(newEntries);
    // Regenerate outputContent ngay sau khi thay đổi style từng entry
    const newContent = convertToSRT(newEntries, primaryFontSize, secondaryFontSize, primaryColor, secondaryColor);
    setOutputContent(newContent);
  };

  return (
    <div className="min-h-screen bg-[#f9f8f6] text-[#2d3e50] p-6 lg:p-12 font-['Lato']">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-['Playfair_Display'] font-bold text-[#1a3a52] mb-3">
            Subtitle Merger
          </h1>
          <p className="text-[#2d3e50]/70 max-w-xl">
            Create professional bilingual subtitles by merging two files with precision timing and elegant styling.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleMerge}
            disabled={!file1 || !file2 || isLoading}
            className="bg-[#1a3a52] hover:bg-[#1a3a52]/90 text-white gap-2 px-6"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Merge Subtitles
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload & Config */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="p-6 border-[#e0dcd8] bg-white shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#d4a574]" />
            <div className="flex items-center gap-2 mb-6">
              <FileStack className="h-5 w-5 text-[#d4a574]" />
              <h2 className="text-xl font-['Playfair_Display'] font-bold text-[#1a3a52]">Upload Files</h2>
            </div>

            <div className="space-y-6">
              <SubtitleUploader
                language="Primary Language (Top)"
                selectedFile={file1 ? new File([file1.content], file1.name) : null}
                onFileSelect={(f) => handleFileSelect(f, 1)}
              />
              <SubtitleUploader
                language="Secondary Language (Bottom)"
                selectedFile={file2 ? new File([file2.content], file2.name) : null}
                onFileSelect={(f) => handleFileSelect(f, 2)}
              />
            </div>
          </Card>

          <Card className="p-6 border-[#e0dcd8] bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Timer className="h-5 w-5 text-[#d4a574]" />
              <h2 className="text-xl font-['Playfair_Display'] font-bold text-[#1a3a52]">Synchronization</h2>
            </div>

            <div className="space-y-8">
              {/* Secondary Offset */}
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="offset" className="text-sm font-semibold">
                    Relatively Sync Sub 2 to Sub 1 (ms)
                  </Label>
                  <span className="text-xs font-mono font-bold text-accent">
                    {offsetMs > 0 ? `+${offsetMs}` : offsetMs}ms
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    id="offset"
                    type="number"
                    value={offsetMs}
                    onChange={(e) => setOffsetMs(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="border-[#e0dcd8] font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setOffsetMs(0)}
                    title="Reset"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {[-500, -100, 100, 500].map(val => (
                    <Button
                      key={val}
                      variant="ghost"
                      size="sm"
                      onClick={() => setOffsetMs(prev => prev + val)}
                      className="text-[10px] h-7 px-2 border border-border/50 hover:bg-accent/5 hover:text-accent"
                    >
                      {val > 0 ? `+${val}` : val}
                    </Button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Adjust time for secondary sub only.
                </p>
              </div>

              {/* Global Delay */}
              <div className="grid gap-3 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <Label htmlFor="globalOffset" className="text-sm font-semibold">
                    Global Delay (All) (ms)
                  </Label>
                  <span className="text-xs font-mono font-bold text-[#1a3a52]">
                    {globalOffsetMs > 0 ? `+${globalOffsetMs}` : globalOffsetMs}ms
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    id="globalOffset"
                    type="number"
                    value={globalOffsetMs}
                    onChange={(e) => setGlobalOffsetMs(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="border-[#e0dcd8] font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setGlobalOffsetMs(0)}
                    title="Reset"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {[-500, -100, 100, 500].map(val => (
                    <Button
                      key={val}
                      variant="ghost"
                      size="sm"
                      onClick={() => setGlobalOffsetMs(prev => prev + val)}
                      className="text-[10px] h-7 px-2 border border-border/50 hover:bg-muted"
                    >
                      {val > 0 ? `+${val}` : val}
                    </Button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Shifts entire resulting file.
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <div className="flex items-center gap-2 px-2">
              <Settings2 className="h-5 w-5 text-[#d4a574]" />
              <h2 className="text-xl font-['Playfair_Display'] font-bold text-[#1a3a52]">Visual Settings</h2>
            </div>

            <LanguageFontSizeControls
              primaryFontSize={primaryFontSize}
              secondaryFontSize={secondaryFontSize}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              onPrimaryFontSizeChange={setPrimaryFontSize}
              onSecondaryFontSizeChange={setSecondaryFontSize}
              onPrimaryColorChange={setPrimaryColor}
              onSecondaryColorChange={setSecondaryColor}
            />

            <SubtitleSpacingControls
              lineHeight={lineHeight}
              marginBottom={marginBottom}
              onLineHeightChange={setLineHeight}
              onMarginBottomChange={setMarginBottom}
            />
          </div>
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-8">
          <Card className="p-8 border-[#e0dcd8] bg-white shadow-sm min-h-[600px]">
            <SubtitlePreview
              entries={entries}
              onDownload={handleDownload}
              isLoading={isLoading}
              primaryFontSize={primaryFontSize}
              secondaryFontSize={secondaryFontSize}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              style={{
                fontSize: primaryFontSize,
                lineHeight: lineHeight,
              }}
              onEditEntryStyle={() => setShowStyler(true)}
            />
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-20 pt-8 border-t border-[#e0dcd8]/50 text-center text-sm text-[#2d3e50]/50">
        <p>&copy; 2026 Subtitle Merger Pro. Professional Subtitle Synchronization & Merging Tool.</p>
      </footer>

      {/* Individual Styler Modal */}
      {showStyler && (
        <SubtitleEntryStyler
          entries={entries}
          onEntryStyleChange={handleEntryStyleChange}
          onClose={() => setShowStyler(false)}
          primaryDefaultSize={primaryFontSize}
          secondaryDefaultSize={secondaryFontSize}
        />
      )}
    </div>
  );
}
