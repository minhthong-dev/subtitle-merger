/**
 * SubtitleUploader Component
 * Handles file upload for subtitle files with drag-and-drop support
 * Professional & Sophisticated design with elegant styling
 */

import { Upload, X, CheckCircle } from 'lucide-react';
import { useRef, useState } from 'react';

interface SubtitleUploaderProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  language?: string;
  disabled?: boolean;
}

export default function SubtitleUploader({
  onFileSelect,
  selectedFile,
  language = 'Language',
  disabled = false,
}: SubtitleUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.name.endsWith('.srt') || file.name.endsWith('.vtt')) {
        onFileSelect(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files[0]) {
      onFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const dragClass = isDragActive
    ? 'border-accent bg-accent/5'
    : 'border-border bg-card hover:border-accent/50 hover:bg-accent/2';

  const disabledClass = disabled ? 'cursor-not-allowed opacity-50' : '';

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <label className="text-sm font-semibold text-foreground">
          {language}
        </label>
        {selectedFile && (
          <span className="text-xs text-muted-foreground">
            {selectedFile.name}
          </span>
        )}
      </div>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`relative cursor-pointer rounded-lg border-2 border-dashed p-8 transition-all duration-300 ${dragClass} ${disabledClass}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".srt,.vtt"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />

        {selectedFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-accent" />
              <div>
                <p className="font-medium text-foreground">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              onClick={handleClear}
              className="rounded-full p-1 hover:bg-destructive/10 transition-colors"
              title="Remove file"
            >
              <X className="h-5 w-5 text-destructive" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <Upload className="h-8 w-8 text-accent" />
            <div>
              <p className="font-medium text-foreground">
                Drop your subtitle file here
              </p>
              <p className="text-xs text-muted-foreground">
                or click to browse (SRT or VTT)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
