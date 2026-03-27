import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import SubtitlePreview from './SubtitlePreview';
import { SubtitleEntry } from '@/hooks/useSubtitleParser';

// Mock lucide-react to avoid any rendering issues in tests
vi.mock('lucide-react', () => ({
  Copy: () => <span>CopyIcon</span>,
  Download: () => <span>DownloadIcon</span>,
  Play: () => <span>PlayIcon</span>,
  Pause: () => <span>PauseIcon</span>,
  Palette: () => <span>PaletteIcon</span>,
  FileText: () => <span>FileTextIcon</span>,
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('SubtitlePreview', () => {
  afterEach(() => {
    cleanup();
  });

  const mockEntries: SubtitleEntry[] = [
    {
      index: 1,
      startTime: '00:00:01,000',
      endTime: '00:01:04,000',
      text: 'Hello world',
      startMs: 1000,
      endMs: 64000,
      language: 'primary',
    },
    {
      index: 2,
      startTime: '00:00:01,000',
      endTime: '00:01:04,000',
      text: 'Xin chào thế giới',
      startMs: 1000,
      endMs: 64000,
      language: 'secondary',
    },
  ];

  it('renders "No Subtitles Yet" when entries are empty', () => {
    render(<SubtitlePreview entries={[]} onDownload={() => {}} />);
    expect(screen.getByText('No Subtitles Yet')).toBeDefined();
  });

  it('renders entries in transcript list', () => {
    render(<SubtitlePreview entries={mockEntries} onDownload={() => {}} />);
    expect(screen.getByText('Hello world')).toBeDefined();
    expect(screen.getByText('Xin chào thế giới')).toBeDefined();
  });

  it('buttons for download SRT/VTT are present', () => {
    const onDownload = vi.fn();
    render(<SubtitlePreview entries={mockEntries} onDownload={onDownload} />);
    
    const srtBtn = screen.getByText('Export SRT');
    const vttBtn = screen.getByText('Export VTT');
    
    expect(srtBtn).toBeDefined();
    expect(vttBtn).toBeDefined();
    
    fireEvent.click(srtBtn);
    expect(onDownload).toHaveBeenCalledWith('srt');
    
    fireEvent.click(vttBtn);
    expect(onDownload).toHaveBeenCalledWith('vtt');
  });

  it('toggles play/pause state', () => {
    render(<SubtitlePreview entries={mockEntries} onDownload={() => {}} />);
    
    // Tìm nút play bằng aria-label
    const playBtn = screen.getByRole('button', { name: /play preview/i });
    expect(playBtn).toBeDefined();
    
    // Click để play
    fireEvent.click(playBtn);
    
    // Sau khi click, nút nên đổi thành pause
    const pauseBtn = screen.getByRole('button', { name: /pause preview/i });
    expect(pauseBtn).toBeDefined();

    // Click lần nữa để pause
    fireEvent.click(pauseBtn);
    expect(screen.getByRole('button', { name: /play preview/i })).toBeDefined();
  });

  it('applies custom primary and secondary colors in preview', () => {
    const primaryColor = '#ff0000';
    const secondaryColor = '#00ff00';
    
    render(
      <SubtitlePreview 
        entries={mockEntries} 
        onDownload={() => {}} 
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      />
    );
    
    const primaryText = screen.getByText('Hello world');
    const secondaryText = screen.getByText('Xin chào thế giới');
    
    expect(primaryText.style.color).toBe('rgb(255, 0, 0)'); // rgb format for #ff0000
    expect(secondaryText.style.color).toBe('rgb(0, 255, 0)'); // rgb format for #00ff00
  });

  it('prioritizes individual entry style over global colors', () => {
    const entriesWithStyle: SubtitleEntry[] = [
      {
        ...mockEntries[0],
        customStyle: { textColor: '#0000ff', fontSize: 40 }
      }
    ];
    
    render(
      <SubtitlePreview 
        entries={entriesWithStyle} 
        onDownload={() => {}} 
        primaryColor="#ff0000"
      />
    );
    
    const text = screen.getByText('Hello world');
    expect(text.style.color).toBe('rgb(0, 0, 255)'); // #0000ff should win
    expect(text.style.fontSize).toBe('40px');
  });
});
