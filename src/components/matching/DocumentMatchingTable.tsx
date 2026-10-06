import React from 'react';
import { Sparkles, X, Calendar, FileText, AlertCircle, Check } from 'lucide-react';
import { Requirement, UploadedFile, Language, DocumentStatus } from '../../types';
import { getTranslation } from '../../i18n';
import { getDocumentStatus, getDocumentStatusInfo } from '../../lib/validation/status';
import { StatusBadge } from '../status/StatusBadge';
import { localizeNumber } from '../../lib/utils/format';

interface DocumentMatchingTableProps {
  language: Language;
  requirements: Requirement[];
  uploadedFiles: UploadedFile[];
  matches: Record<string, { fileId: string | null; expiryDate: string | null }>;
  submissionDeadline: string;
  onMatchChange: (requirementId: string, fileId: string | null) => void;
  onExpiryChange: (requirementId: string, expiryDate: string) => void;
  onAutoMatch: () => void;
  onClearAllMatches: () => void;
  focusedRequirementId?: string | null;
}

export const DocumentMatchingTable: React.FC<DocumentMatchingTableProps> = ({
  language,
  requirements,
  uploadedFiles,
  matches,
  submissionDeadline,
  onMatchChange,
  onExpiryChange,
  onAutoMatch,
  onClearAllMatches,
  focusedRequirementId,
}) => {
  // Map of fileId -> requirementId currently assigned
  const assignedFileMap = new Map<string, string>();
  // Set of hashes already assigned to any requirement
  const assignedHashesMap = new Map<string, string>(); // hash -> fileId

  Object.entries(matches).forEach(([reqId, m]) => {
    if (m.fileId) {
      assignedFileMap.set(m.fileId, reqId);
      const file = uploadedFiles.find((f) => f.id === m.fileId);
      if (file) {
        assignedHashesMap.set(file.hash, m.fileId);
      }
    }
  });

  const fileLookup = new Map<string, UploadedFile>();
  uploadedFiles.forEach((f) => fileLookup.set(f.id, f));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
      {/* Table Header & Controls */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            {getTranslation(language, 'documentChecklist')}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {getTranslation(language, 'matchingDesc')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {uploadedFiles.length > 0 && (
            <button
              type="button"
              onClick={onAutoMatch}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors shadow-2xs"
              title="Automatically match uploaded PDFs to requirements based on filenames"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              {getTranslation(language, 'autoMatchBtn')}
            </button>
          )}

          <button
            type="button"
            onClick={onClearAllMatches}
            className="text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 px-2.5 py-1.5 rounded-lg border border-slate-300 transition-colors"
          >
            {getTranslation(language, 'clearAllMatches')}
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 text-xs font-semibold uppercase tracking-wider">
              <th className="py-3 px-3 w-12 text-center">{getTranslation(language, 'colOrder')}</th>
              <th className="py-3 px-4 min-w-[200px]">{getTranslation(language, 'colRequirement')}</th>
              <th className="py-3 px-3 w-28 text-center">{getTranslation(language, 'colType')}</th>
              <th className="py-3 px-4 min-w-[240px]">{getTranslation(language, 'colMatchedFile')}</th>
              <th className="py-3 px-4 min-w-[190px]">{getTranslation(language, 'colExpiryDate')}</th>
              <th className="py-3 px-4 min-w-[150px] text-center">{getTranslation(language, 'colStatus')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requirements.map((req) => {
              const match = matches[req.id] || { fileId: null, expiryDate: null };
              const matchedFile = match.fileId ? fileLookup.get(match.fileId) : undefined;
              const status = getDocumentStatus(req, matchedFile, match.expiryDate, submissionDeadline);
              const statusInfo = getDocumentStatusInfo(req, matchedFile, match.expiryDate, submissionDeadline);

              const docTitle = language === 'bn' ? req.title_bn : req.title_en;
              const isFocused = focusedRequirementId === req.id;

              return (
                <tr
                  key={req.id}
                  id={`req-row-${req.id}`}
                  className={`transition-colors ${
                    isFocused
                      ? 'bg-amber-50 ring-2 ring-amber-400'
                      : req.mandatory && !matchedFile
                      ? 'bg-red-50/20 hover:bg-red-50/40'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* Order Number */}
                  <td className="py-3 px-3 text-center font-bold text-slate-600">
                    {localizeNumber(req.order, language)}
                  </td>

                  {/* Requirement Title & Details */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{docTitle}</div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span className="font-mono text-[11px] text-slate-400">{req.id}</span>
                      <span>•</span>
                      {req.has_expiry ? (
                        <span className="text-amber-700 font-medium">
                          {getTranslation(language, 'expiryRequired')}
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          {getTranslation(language, 'noExpiryNeeded')}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Type: Mandatory vs Optional */}
                  <td className="py-3 px-3 text-center">
                    {req.mandatory ? (
                      <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-red-100 text-red-800 border border-red-200">
                        {getTranslation(language, 'mandatory')}
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {getTranslation(language, 'optional')}
                      </span>
                    )}
                  </td>

                  {/* Matched File Dropdown / Selector */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <select
                        aria-label={`Match file for ${docTitle}`}
                        value={match.fileId || ''}
                        onChange={(e) => onMatchChange(req.id, e.target.value || null)}
                        className={`w-full text-xs rounded-lg border py-2 px-2.5 bg-white transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                          matchedFile
                            ? 'border-emerald-300 text-slate-900 font-medium bg-emerald-50/20'
                            : 'border-slate-300 text-slate-600'
                        }`}
                      >
                        <option value="">{getTranslation(language, 'selectFilePlaceholder')}</option>
                        {uploadedFiles.map((file) => {
                          const assignedToOther =
                            assignedFileMap.has(file.id) &&
                            assignedFileMap.get(file.id) !== req.id;

                          // Check if another identical file (by hash) is already assigned to another requirement
                          const identicalHashAssignedToOther =
                            assignedHashesMap.has(file.hash) &&
                            assignedHashesMap.get(file.hash) !== file.id &&
                            assignedHashesMap.get(file.hash) !== match.fileId;

                          const isDisabled =
                            !file.isValidPdf || assignedToOther || identicalHashAssignedToOther;

                          let labelSuffix = `(${file.pages} pg)`;
                          if (!file.isValidPdf) {
                            labelSuffix += ' - Invalid PDF';
                          } else if (assignedToOther) {
                            labelSuffix += ' - Assigned to another item';
                          } else if (identicalHashAssignedToOther) {
                            labelSuffix += ' - Duplicate of already assigned file';
                          }

                          return (
                            <option
                              key={file.id}
                              value={file.id}
                              disabled={isDisabled}
                            >
                              {file.name} {labelSuffix}
                            </option>
                          );
                        })}
                      </select>

                      {matchedFile && (
                        <button
                          type="button"
                          onClick={() => onMatchChange(req.id, null)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title={getTranslation(language, 'unassignFile')}
                          aria-label={`Unassign file for ${docTitle}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {matchedFile && (
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                        <FileText className="w-3 h-3 text-emerald-600" />
                        <span>
                          {matchedFile.pages} {getTranslation(language, 'pages')}
                        </span>
                        {matchedFile.isDuplicate && (
                          <span className="text-amber-700 font-semibold ml-1">
                            (Duplicate file)
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Expiry Date Input */}
                  <td className="py-3 px-4">
                    {req.has_expiry && matchedFile ? (
                      <div>
                        <div className="relative">
                          <input
                            type="date"
                            value={match.expiryDate || ''}
                            onChange={(e) => onExpiryChange(req.id, e.target.value)}
                            className={`w-full text-xs rounded-lg border py-1.5 px-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                              !match.expiryDate
                                ? 'border-amber-400 bg-amber-50/40'
                                : status === 'expired'
                                ? 'border-rose-400 bg-rose-50/30'
                                : 'border-slate-300'
                            }`}
                            aria-label={`Expiry date for ${docTitle}`}
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {getTranslation(language, 'expiryDeadlineNotice', {
                            date: submissionDeadline,
                          })}
                        </p>
                      </div>
                    ) : req.has_expiry && !matchedFile ? (
                      <span className="text-xs text-slate-400 italic">
                        {language === 'bn' ? 'ফাইল সংযুক্ত হলে প্রযোজ্য' : 'Enabled when file matched'}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>

                  {/* Document Status */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <StatusBadge status={status} language={language} />
                      <span className="text-[11px] text-slate-500 max-w-[140px] text-center leading-tight">
                        {language === 'bn' ? statusInfo.reasonBn : statusInfo.reasonEn}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
