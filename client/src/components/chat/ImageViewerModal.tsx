import { X, Download } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ImageViewerModalProps {
  src: string;
  downloadName?: string;
  onClose: () => void;
}

export function ImageViewerModal({ src, downloadName, onClose }: ImageViewerModalProps) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="absolute right-4 top-4 z-10 flex gap-2">
        <a
          href={`${src}${downloadName ? `?name=${encodeURIComponent(downloadName)}` : ''}`}
          download={downloadName}
          className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          onClick={(e) => e.stopPropagation()}
        >
          <Download size={20} />
        </a>
        <button type="button" onClick={onClose} className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
          <X size={20} />
        </button>
      </div>

      <img
        src={src}
        alt={downloadName ?? 'Full size'}
        className="relative z-0 max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>,
    document.body,
  );
}
