import { FileText, Download } from 'lucide-react';
import { formatFileSize } from '../../utils/formatters';
import { toAbsoluteFileUrl } from '../../utils/constants';

interface FileAttachmentProps {
  fileUrl: string;
  fileName: string;
  fileSize: number;
}

export function FileAttachment({ fileUrl, fileName, fileSize }: FileAttachmentProps) {
  const absoluteUrl = toAbsoluteFileUrl(fileUrl);

  return (
    <a
      href={`${absoluteUrl}?name=${encodeURIComponent(fileName)}`}
      download={fileName}
      className="flex items-center gap-3 rounded-lg bg-black/5 p-2.5 hover:bg-black/10"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
        <FileText size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">{fileName}</p>
        <p className="text-xs text-gray-500">{formatFileSize(fileSize)}</p>
      </div>
      <Download size={16} className="shrink-0 text-gray-500" />
    </a>
  );
}
