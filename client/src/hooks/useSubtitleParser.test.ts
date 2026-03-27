import { describe, it, expect } from 'vitest';
import { parseSubtitle, mergeSubtitles, convertToSRT } from './useSubtitleParser';

describe('useSubtitleParser logic', () => {
  const srtContent = `1
00:00:01,000 --> 00:00:04,000
Hello world

2
00:00:05,000 --> 00:00:08,000
Goodbye world`;

  const srtContentSecondary = `1
00:00:01,500 --> 00:00:04,500
Xin chào thế giới

2
00:00:05,500 --> 00:00:08,500
Tạm biệt thế giới`;

  it('should parse SRT correctly', () => {
    const parsed = parseSubtitle(srtContent);
    expect(parsed.format).toBe('srt');
    expect(parsed.entries).toHaveLength(2);
    expect(parsed.entries[0].text).toBe('Hello world');
    expect(parsed.entries[0].startMs).toBe(1000);
    expect(parsed.entries[0].endMs).toBe(4000);
  });

  it('should detect VTT format', () => {
    const vttContent = `WEBVTT\n\n00:00:01.000 --> 00:00:04.000\nHello`;
    const parsed = parseSubtitle(vttContent);
    expect(parsed.format).toBe('vtt');
  });

  it('should merge subtitles correctly', () => {
    const sub1 = parseSubtitle(srtContent);
    const sub2 = parseSubtitle(srtContentSecondary);
    
    const { entries } = mergeSubtitles(sub1, sub2);
    
    // 2 entries from sub1 + 2 entries matched from sub2 = 4 entries
    expect(entries).toHaveLength(4);
    
    // Check if matched entries have same timing
    const entry1 = entries[0]; // primary
    const entry2 = entries[1]; // secondary (matched)
    
    expect(entry1.language).toBe('primary');
    expect(entry2.language).toBe('secondary');
    expect(entry1.startTime).toBe(entry2.startTime);
    expect(entry2.text).toBe('Xin chào thế giới');
  });

  it('should apply secondary offset', () => {
    const sub1 = parseSubtitle(srtContent);
    const sub2 = parseSubtitle(srtContentSecondary);
    
    // Shift sub2 forward by 1 second
    const { entries } = mergeSubtitles(sub1, sub2, 'srt', 1000);
    
    // Entry 2 (secondary) should still match because of overlap or threshold
    // But its original timing in sub2 was 1.5s -> 4.5s
    // With 1s offset, it becomes 2.5s -> 5.5s
    // It still overlaps with 1s -> 4s
    const entry2 = entries.find(e => e.language === 'secondary' && e.text === 'Xin chào thế giới');
    expect(entry2).toBeDefined();
  });

  it('should convert to SRT with font tags', () => {
    const entries = [
      {
        index: 1,
        startTime: '00:00:01,000',
        endTime: '00:00:04,000',
        text: 'Hello',
        startMs: 1000,
        endMs: 4000,
        language: 'primary' as const
      },
      {
        index: 2,
        startTime: '00:00:01,000',
        endTime: '00:00:04,000',
        text: 'Xin chào',
        startMs: 1000,
        endMs: 4000,
        language: 'secondary' as const
      }
    ];
    
    const output = convertToSRT(entries);
    expect(output).toContain('<font size="24" color="#ffffff">Hello</font>');
    expect(output).toContain('<font size="18" color="#d4d4d4">Xin chào</font>');
    expect(output).toContain('00:00:01,000 --> 00:00:04,000');
  });

  it('should convert to SRT with custom default colors', () => {
    const entries = [
      {
        index: 1,
        startTime: '00:00:01,000',
        endTime: '00:00:04,000',
        text: 'Hello',
        startMs: 1000,
        endMs: 4000,
        language: 'primary' as const
      }
    ];
    
    // Set custom default colors
    const output = convertToSRT(entries, 24, 18, '#ff0000', '#00ff00');
    expect(output).toContain('<font size="24" color="#ff0000">Hello</font>');
  });
});
