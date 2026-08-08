import { FileText, X } from 'lucide-react';
import { formatFileSize } from '../../utils/formatters';

interface AttachmentPreviewProps {
  file: File;
  previewUrl: string | null;
  onCancel: () => void;
}

export function AttachmentPreview({ file, previewUrl, onCancel }: AttachmentPreviewProps) {
  return (
    <div className="flex items-center gap-3 border-t border-gray-200 bg-gray-50 p-3">
      {previewUrl ? (
        <img src={previewUrl} alt={file.name} className="h-14 w-14 rounded-md object-cover" />
      ) : (
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-brand-100 text-brand-700">
          <FileText size={22} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-800">{file.name}</p>
        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
      </div>
      <button type="button" onClick={onCancel} className="rounded-full p-1.5 text-gray-500 hover:bg-gray-200">
        <X size={16} />
      </button>
    </div>
  );
}
