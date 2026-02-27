import React, { useState, useRef } from 'react';
import { UploadCloud, Loader2, X } from 'lucide-react';

interface Props {
  onImageSelected: (base64: string, mimeType: string) => void;
  isProcessing: boolean;
}

export function ImageUpload({ onImageSelected, isProcessing }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
      // Extract base64 and mime type
      const match = result.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (match) {
        onImageSelected(match[2], match[1]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const clearPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (previewUrl) {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center h-48 shadow-inner">
        <img src={previewUrl} alt="Screenshot preview" className="max-h-full max-w-full object-contain opacity-60 dark:opacity-40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-sm">
          {isProcessing ? (
            <>
              <Loader2 className="w-12 h-12 text-amber-500 dark:text-amber-400 animate-spin mb-4" />
              <span className="text-xs font-bold uppercase tracking-widest text-white dark:text-zinc-950 bg-amber-500 dark:bg-amber-400 px-4 py-2 rounded-lg shadow-lg shadow-amber-500/20">Analyzing with AI...</span>
            </>
          ) : (
            <button 
              onClick={clearPreview}
              className="bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-red-500 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/50 border border-zinc-200 dark:border-zinc-700 px-5 py-2.5 rounded-xl shadow-xl font-semibold text-sm flex items-center transition-all"
            >
              <X size={16} className="mr-2" /> Clear Image
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer ${
        isDragging ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/5' : 'border-zinc-300 dark:border-zinc-700 hover:border-amber-400 dark:hover:border-amber-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50'
      } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <div className="flex flex-col items-center justify-center space-y-5">
        <div className={`p-4 rounded-2xl shadow-sm dark:shadow-lg border transition-colors duration-300 ${isDragging ? 'bg-amber-100 dark:bg-amber-500/20 border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400'}`}>
          <UploadCloud className="w-10 h-10" />
        </div>
        
        <div>
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 tracking-wide">
            Click or drag screenshot to upload
          </p>
          <p className="text-xs font-medium text-zinc-500 mt-2 uppercase tracking-widest">
            PNG, JPG, WEBP up to 10MB
          </p>
        </div>
      </div>
    </div>
  );
}
