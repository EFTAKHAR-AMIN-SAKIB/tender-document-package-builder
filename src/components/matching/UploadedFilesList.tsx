import React from 'react';
import { FileText, Trash2, Copy, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { UploadedFile, Language, Requirement } from '../../types';
import { getTranslation } from '../../i18n';
import { formatFileSize, localizeNumber } from '../../lib/utils/format';

interface UploadedFilesListProps {
  language: Language;
  files: UploadedFile[];
  requirements: Requirement[];
  matches: Record<string, { fileId: string | null; expiryDate: string | null }>;
  onRemoveFile: (fileId: string) => void;
  onClearAllFiles: () => void;
}

export const UploadedFilesList: React.FC<UploadedFilesListProps> = ({
  language,
  files,
  requirements,
  matches,
  onRemoveFile,
  onClearAllFiles,
}) => {
  if (files.length === 0) {
    return null;
  }

  // Create lookup for which requirement each file is matched to
  const fileToRequirementMap = new Map<string, Requirement>();
  Object.entries(matches).forEach(([reqId, match]) => {
    if (match.fileId) {
      const req = requirements.find((r) => r.id === reqId);
      if (req) {
        fileToRequirementMap.set(match.fileId, req);
      }
    }
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            {getTranslation(language, 'uploadedFilesTitle')} ({localizeNumber(files.length, language)})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographic SHA-256 verification and duplicate detection active
          </p>
        </div>

        <button
          type="button"
          onClick={onClearAllFiles}
          className="text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-200 transition-colors"
        >
          {getTranslation(language, 'clearAllFiles')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
        {files.map((file) => {
          const matchedReq = fileToRequirementMap.get(file.id);
          const matchedTitle = matchedReq
            ? language === 'bn'
              ? matchedReq.title_bn
              : matchedReq.title_en
            : null;

          return (
            <div
              key={file.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                file.error
                  ? 'border-red-300 bg-red-50/50'
                  : file.isDuplicate
                  ? 'border-amber-300 bg-amber-50/40'
                  : 'border-slate-200 bg-slate-50/60 hover:bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className={`p-2 rounded-lg flex-shrink-0 mt-0.5 ${
                      file.error
                        ? 'bg-red-100 text-red-700'
                        : file.isDuplicate
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <p
                      className="text-sm font-semibold text-slate-900 truncate"
                      title={file.name}
                    >
                      {file.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-0.5">
                      <span className="font-medium text-slate-700">
                        {localizeNumber(file.pages, language)} {getTranslation(language, 'pages')}
                      </span>
                      <span>•</span>
                      <span>{formatFileSize(file.size)}</span>
                      {file.hash && (
                        <>
                          <span>•</span>
                          <span
                            className="font-mono text-[10px] text-slate-400"
                            title={`SHA-256 Hash: ${file.hash}`}
                          >
                            Hash: {file.hash.substring(0, 8)}...
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => onRemoveFile(file.id)}
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title={getTranslation(language, 'removeFile')}
                  aria-label={`Remove file ${file.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Status / Duplicate warning banner */}
              <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-xs">
                {file.error ? (
                  <span className="inline-flex items-center gap-1 text-red-700 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                    {file.error}
                  </span>
                ) : file.isDuplicate ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-medium text-[11px] border border-amber-300">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                    {getTranslation(language, 'duplicateBadge')}
                    {file.duplicateOfName ? ` (${file.duplicateOfName})` : ''}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500">Verified unique document</span>
                )}

                {/* Assignment Status */}
                {matchedReq ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px] border border-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    #{matchedReq.order} {matchedTitle}
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-400">
                    {getTranslation(language, 'unmatched')}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
