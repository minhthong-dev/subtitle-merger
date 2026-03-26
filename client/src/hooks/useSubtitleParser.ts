/**
 * Hook for parsing and processing subtitle files (SRT/VTT format)
 * Handles merging bilingual subtitles with proper timing synchronization
 */

export interface SubtitleEntry {
  index: number;
  startTime: string;
  endTime: string;
  text: string;
  startMs: number;
  endMs: number;
  language?: 'primary' | 'secondary'; // Track which language this subtitle is from
  customStyle?: {
    fontSize?: number;
    fontFamily?: string;
    textColor?: string;
    backgroundColor?: string;
    opacity?: number;
    lineHeight?: number;
  };
}

export interface ParsedSubtitle {
  entries: SubtitleEntry[];
  format: 'srt' | 'vtt';
  language?: string;
}

/**
 * Convert time string to milliseconds
 * Supports both SRT (HH:MM:SS,mmm) and VTT (HH:MM:SS.mmm) formats
 */
function timeToMs(timeStr: string): number {
  const match = timeStr.match(/(\d+):(\d+):(\d+)[.,](\d+)/);
  if (!match) return 0;
  
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = parseInt(match[3], 10);
  const ms = parseInt(match[4].padEnd(3, '0'), 10);
  
  return hours * 3600000 + minutes * 60000 + seconds * 1000 + ms;
}

/**
 * Convert milliseconds to time string (SRT format: HH:MM:SS,mmm)
 */
function msToTime(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
}

/**
 * Parse SRT format subtitle file
 */
function parseSRT(content: string): SubtitleEntry[] {
  const entries: SubtitleEntry[] = [];
  const blocks = content.split(/\n\s*\n/).filter(block => block.trim());
  
  blocks.forEach((block) => {
    const lines = block.trim().split('\n');
    if (lines.length < 3) return;
    
    const indexLine = lines[0].trim();
    const timeLine = lines[1].trim();
    const textLines = lines.slice(2);
    
    const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
    if (!timeMatch) return;
    
    const startTime = timeMatch[1];
    const endTime = timeMatch[2];
    const text = textLines.join('\n');
    
    entries.push({
      index: entries.length + 1,
      startTime,
      endTime,
      text,
      startMs: timeToMs(startTime),
      endMs: timeToMs(endTime),
    });
  });
  
  return entries;
}

/**
 * Parse VTT format subtitle file
 */
function parseVTT(content: string): SubtitleEntry[] {
  const entries: SubtitleEntry[] = [];
  const lines = content.split('\n');
  
  let i = 0;
  // Skip WEBVTT header
  while (i < lines.length && !lines[i].includes('-->')) {
    i++;
  }
  
  while (i < lines.length) {
    const line = lines[i].trim();
    
    if (line.includes('-->')) {
      const timeMatch = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})/);
      if (timeMatch) {
        // Convert VTT time to SRT time format
        const startTime = timeMatch[1].replace('.', ',');
        const endTime = timeMatch[2].replace('.', ',');
        
        const textLines: string[] = [];
        i++;
        
        while (i < lines.length && lines[i].trim() !== '') {
          textLines.push(lines[i]);
          i++;
        }
        
        if (textLines.length > 0) {
          entries.push({
            index: entries.length + 1,
            startTime,
            endTime,
            text: textLines.join('\n'),
            startMs: timeToMs(startTime),
            endMs: timeToMs(endTime),
          });
        }
      }
    }
    
    i++;
  }
  
  return entries;
}

/**
 * Detect subtitle format (SRT or VTT)
 */
function detectFormat(content: string): 'srt' | 'vtt' {
  if (content.includes('WEBVTT')) return 'vtt';
  if (content.includes('-->')) return 'srt';
  return 'srt'; // Default to SRT
}

/**
 * Parse subtitle file content
 */
export function parseSubtitle(content: string, language?: string): ParsedSubtitle {
  const format = detectFormat(content);
  const entries = format === 'vtt' ? parseVTT(content) : parseSRT(content);
  
  return {
    entries,
    format,
    language,
  };
}

/**
 * Merge two subtitle files into bilingual format
 * Carefully synchronizes subtitle2 entries to subtitle1's timing.
 * Primarily uses overlap duration to find the best match.
 */
export function mergeSubtitles(
  subtitle1: ParsedSubtitle,
  subtitle2: ParsedSubtitle,
  format: 'srt' | 'vtt' = 'srt',
  secondaryOffsetMs: number = 0,
  globalOffsetMs: number = 0
): { entries: SubtitleEntry[]; content: string } {
  const merged: SubtitleEntry[] = [];
  
  // Apply secondary offset to subtitle2
  let adjustedSubtitle2Entries = subtitle2.entries.map(e => {
    const startMs = Math.max(0, e.startMs + secondaryOffsetMs);
    const endMs = Math.max(0, e.endMs + secondaryOffsetMs);
    return {
      ...e,
      startMs,
      endMs,
      startTime: msToTime(startMs),
      endTime: msToTime(endMs)
    };
  });

  const matchingThresholdMs = 3000;
  const consumedSub2Indices = new Set<number>();

  // Process sub1 and match sub2 to it
  subtitle1.entries.forEach((e1) => {
    let bestMatchIdx = -1;
    let bestScore = -1;

    adjustedSubtitle2Entries.forEach((e2, idx) => {
      if (consumedSub2Indices.has(idx)) return;

      const overlap = Math.max(0, Math.min(e1.endMs, e2.endMs) - Math.max(e1.startMs, e2.startMs));
      const startDiff = Math.abs(e1.startMs - e2.startMs);
      
      let score = 0;
      if (overlap > 0) {
        score = 100000 + overlap; 
      } else if (startDiff < matchingThresholdMs) {
        score = matchingThresholdMs - startDiff;
      }

      if (score > bestScore && score > 0) {
        bestScore = score;
        bestMatchIdx = idx;
      }
    });

    if (bestMatchIdx !== -1) {
      const e2 = adjustedSubtitle2Entries[bestMatchIdx];
      merged.push({ ...e1, language: 'primary' });
      merged.push({
        ...e2,
        startTime: e1.startTime,
        endTime: e1.endTime,
        startMs: e1.startMs,
        endMs: e1.endMs,
        language: 'secondary',
      });
      consumedSub2Indices.add(bestMatchIdx);
    } else {
      merged.push({ ...e1, language: 'primary' });
    }
  });

  // Add remaining sub2 entries
  adjustedSubtitle2Entries.forEach((e2, idx) => {
    if (!consumedSub2Indices.has(idx)) {
      merged.push({ ...e2, language: 'secondary' });
    }
  });

  // Apply GLOBAL offset to all entries
  const finalEntries = merged.map(entry => {
    if (globalOffsetMs === 0) return entry;
    const startMs = Math.max(0, entry.startMs + globalOffsetMs);
    const endMs = Math.max(0, entry.endMs + globalOffsetMs);
    return {
      ...entry,
      startMs,
      endMs,
      startTime: msToTime(startMs),
      endTime: msToTime(endMs)
    };
  });

  // Final sort
  finalEntries.sort((a, b) => {
    if (a.startMs !== b.startMs) return a.startMs - b.startMs;
    return a.language === 'primary' ? -1 : 1;
  });

  // Re-index
  finalEntries.forEach((entry, idx) => {
    entry.index = idx + 1;
  });

  const content = format === 'vtt' ? convertToVTT(finalEntries) : convertToSRT(finalEntries);
  return { entries: finalEntries, content };
}

/**
 * Convert subtitle entries to SRT format with styling support
 */
export function convertToSRT(
  entries: SubtitleEntry[], 
  primarySize: number = 24, 
  secondarySize: number = 18
): string {
  // Gộp các entry có cùng timing để xuất ra 1 block SRT duy nhất
  // Điều này đảm bảo video player hiển thị text đúng thứ tự (primary dòng trên, secondary dòng dưới)
  const blocks: { timing: string; group: SubtitleEntry[] }[] = [];
  entries.forEach(entry => {
    const timing = `${entry.startTime} --> ${entry.endTime}`;
    if (blocks.length > 0 && blocks[blocks.length - 1].timing === timing) {
      blocks[blocks.length - 1].group.push(entry);
    } else {
      blocks.push({ timing, group: [entry] });
    }
  });

  let index = 1;
  return blocks
    .map(({ timing, group }) => {
      // Đảm bảo primary (bự) lọt vào array đầu tiên (để hiển thị DÒNG TRÊN)
      // secondary (nhỏ) lọt vào array sau (để hiển thị DÒNG DƯỚI)
      const sorted = [...group].sort((a, b) => {
        if (a.language === 'primary') return -1;
        if (b.language === 'primary') return 1;
        return 0;
      });

      const combinedText = sorted.map(entry => {
        const style = entry.customStyle;
        const size = style?.fontSize || (entry.language === 'primary' ? primarySize : secondarySize);
        // Màu mặc định: secondary dùng màu xám nhạt/vàng nhạt để dễ phân biệt, primary màu trắng
        const color = style?.textColor || (entry.language === 'secondary' ? '#d4d4d4' : '#ffffff');
        return `<font size="${size}" color="${color}">${entry.text}</font>`;
      }).join('\n');
      
      return `${index++}\n${timing}\n${combinedText}`;
    })
    .join('\n\n') + '\n';
}

/**
 * Convert subtitle entries to VTT format with styling support
 */
export function convertToVTT(
  entries: SubtitleEntry[],
  primarySize: number = 24,
  secondarySize: number = 18
): string {
  const blocks: { timing: string; group: SubtitleEntry[] }[] = [];
  entries.forEach(entry => {
    const startTime = entry.startTime.replace(',', '.');
    const endTime = entry.endTime.replace(',', '.');
    const timing = `${startTime} --> ${endTime}`;
    
    if (blocks.length > 0 && blocks[blocks.length - 1].timing === timing) {
      blocks[blocks.length - 1].group.push(entry);
    } else {
      blocks.push({ timing, group: [entry] });
    }
  });

  const vttEntries = blocks
    .map(({ timing, group }) => {
      const sorted = [...group].sort((a, b) => {
        if (a.language === 'primary') return -1;
        if (b.language === 'primary') return 1;
        return 0;
      });

      const combinedText = sorted.map(entry => {
        const style = entry.customStyle;
        const size = style?.fontSize || (entry.language === 'primary' ? primarySize : secondarySize);
        const color = style?.textColor || (entry.language === 'secondary' ? '#d4d4d4' : '#ffffff');
        return `<font size="${size}" color="${color}">${entry.text}</font>`;
      }).join('\n');

      return `${timing}\n${combinedText}`;
    })
    .join('\n\n');
  
  return `WEBVTT\n\nSTYLE\n::cue {\n  background: transparent;\n}\n\n${vttEntries}\n`;
}

/**
 * Custom hook for subtitle parsing
 */
export function useSubtitleParser() {
  const parseFile = async (file: File, language?: string): Promise<ParsedSubtitle> => {
    const content = await file.text();
    return parseSubtitle(content, language);
  };
  
  const mergeFiles = async (
    file1: File,
    file2: File,
    format: 'srt' | 'vtt' = 'srt',
    secondaryOffsetMs: number = 0,
    globalOffsetMs: number = 0
  ): Promise<{ entries: SubtitleEntry[]; content: string }> => {
    const content1 = await file1.text();
    const content2 = await file2.text();
    
    const subtitle1 = parseSubtitle(content1, 'Language 1');
    const subtitle2 = parseSubtitle(content2, 'Language 2');
    
    return mergeSubtitles(subtitle1, subtitle2, format, secondaryOffsetMs, globalOffsetMs);
  };
  
  return {
    parseFile,
    mergeFiles,
    parseSubtitle,
    mergeSubtitles,
    convertToSRT,
    convertToVTT,
  };
}
