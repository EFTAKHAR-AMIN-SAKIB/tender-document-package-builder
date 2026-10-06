import React, { useEffect, useState } from 'react';
import { X, ExternalLink, FileText, Eye, AlertCircle, Maximize2 } from 'lucide-react';
import { UploadedFile, Language } from '../../types';
import { formatFileSize, localizeNumber } from '../../lib/utils/format';

interface PdfPreviewModalProps {
  file: UploadedFile | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  file,
  isOpen,
  onClose,
  language,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file || !isOpen) {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
      return;
    }

    let url: string;
    if (file.file instanceof File) {
      url = URL.createObjectURL(file.file);
    } else if (file.data && file.data.length > 0) {
      const blob = new Blob([file.data as BlobPart], { type: 'application/pdf' });
      url = URL.createObjectURL(blob);
    } else {
      url = '';
    }

    setBlobUrl(url);

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [file, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !file) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700 flex-shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate" title={file.name}>
                {file.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="font-medium text-slate-700">
                  {localizeNumber(file.pages, language)} {language === 'bn' ? 'পৃষ্ঠা' : 'pages'}
                </span>
                <span>•</span>
                <span>{formatFileSize(file.size)}</span>
                {file.hash && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-[11px] text-slate-400 hidden sm:inline" title={file.hash}>
                      SHA-256: {file.hash.substring(0, 10)}...
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {blobUrl && (
              <a
                href={blobUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
                title="Open PDF in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'bn' ? 'নতুন ট্যাবে খুলুন' : 'Open in New Tab'}</span>
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer Body */}
        <div className="flex-1 bg-slate-100 relative p-2 sm:p-4 overflow-hidden flex flex-col items-center justify-center">
          {blobUrl ? (
            <object
              data={blobUrl}
              type="application/pdf"
              className="w-full h-full rounded-lg shadow-sm border border-slate-300 bg-white"
            >
              {/* Fallback for browsers that don't support inline object embedding */}
              <iframe
                src={blobUrl}
                className="w-full h-full rounded-lg border border-slate-300"
                title={file.name}
              />
            </object>
          ) : (
            <div className="text-center p-8">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-800">
                {language === 'bn' ? 'পিডিএফ প্রিভিউ লোড করা সম্ভব হয়নি।' : 'Unable to preview this document.'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {file.error || (language === 'bn' ? 'ফাইলটি ক্ষতিগ্রস্ত হতে পারে।' : 'File data could not be rendered.')}
              </p>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            {language === 'bn'
              ? 'নথির বিষয়বস্তু এবং মেয়াদের তারিখ যাচাই করতে প্রিভিউ ব্যবহার করুন'
              : 'Inspect document content, validity dates, and signatures directly in-browser'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium transition-colors"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
