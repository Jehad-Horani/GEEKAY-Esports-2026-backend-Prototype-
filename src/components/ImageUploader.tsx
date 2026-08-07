import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, CheckCircle, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  aspectRatio?: 'square' | 'banner' | 'avatar';
  className?: string;
}

const compressImage = (file: File): Promise<Blob> => {
  return new Promise((resolve) => {
    if (file.type === 'image/gif' || file.type === 'image/svg+xml' || file.size < 500 * 1024) {
      return resolve(file);
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      const maxDim = 1920;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            resolve(blob || file);
          },
          'image/jpeg',
          0.85
        );
      } else {
        resolve(file);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
};

const fileToDataUrl = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  value,
  onChange,
  aspectRatio = 'square',
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setError(null);
    setUploading(true);

    try {
      const processedBlob = await compressImage(file);
      const fileToUpload = new File([processedBlob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
        type: 'image/jpeg'
      });

      const formData = new FormData();
      formData.append('file', fileToUpload);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.url) {
          onChange(data.url);
          return;
        }
      }

      // Fallback to Data URL if server upload returns unexpected format or error
      const dataUrl = await fileToDataUrl(processedBlob);
      onChange(dataUrl);
    } catch (err: any) {
      console.warn('File upload encountered an issue, converting to Data URL fallback:', err);
      try {
        const dataUrl = await fileToDataUrl(file);
        onChange(dataUrl);
      } catch (fallbackErr) {
        setError('Failed to process image file');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="font-syncopate text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
          <ImageIcon size={12} className="text-[#FFC400]" />
          {label}
        </label>
        <span className="text-[9px] font-syncopate text-slate-500 font-bold uppercase tracking-wider">
          رفع ملف صورة / Image File
        </span>
      </div>

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed p-4 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center group ${
          dragActive
            ? 'border-[#FFC400] bg-[#FFC400]/10'
            : value
            ? 'border-slate-800 bg-[#040E1E] hover:border-[#FFC400]/50'
            : 'border-slate-800 bg-[#040E1E]/80 hover:border-[#FFC400] hover:bg-[#040E1E]'
        }`}
      >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />

          {uploading ? (
            <div className="py-4 flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-[#FFC400]" size={28} />
              <span className="font-syncopate text-[10px] text-[#FFC400] font-bold tracking-widest">UPLOADING IMAGE...</span>
            </div>
          ) : value ? (
            <div className="w-full flex items-center justify-between gap-4 py-1">
              <div className="flex items-center gap-3 overflow-hidden">
                <img
                  src={value}
                  alt="Preview"
                  className={`object-cover border border-slate-700 bg-black ${
                    aspectRatio === 'banner' ? 'w-24 h-12' : aspectRatio === 'avatar' ? 'w-12 h-12 rounded-full' : 'w-12 h-12'
                  }`}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="text-left overflow-hidden">
                  <div className="flex items-center gap-1 text-emerald-400 font-syncopate text-[9px] font-bold">
                    <CheckCircle size={10} />
                    <span>IMAGE SET</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">{value}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-[#FFC400] hover:text-black text-white font-syncopate text-[9px] font-bold tracking-wider transition-colors"
                >
                  CHANGE
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange('');
                  }}
                  className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-4 flex flex-col items-center gap-2">
              <div className="p-3 bg-[#081B3A] border border-slate-800 group-hover:border-[#FFC400] transition-colors">
                <Upload className="text-slate-400 group-hover:text-[#FFC400] transition-colors" size={20} />
              </div>
              <div>
                <span className="font-syncopate text-[10px] font-bold text-white tracking-wider block">
                  CLICK OR DRAG IMAGE HERE
                </span>
                <span className="text-[9px] text-slate-500 font-mono">
                  PNG, JPG, WEBP, GIF (MAX 10MB)
                </span>
              </div>
            </div>
          )}

          {error && (
            <p className="text-red-400 font-mono text-[10px] mt-2">{error}</p>
          )}
        </div>
    </div>
  );
};

export default ImageUploader;
