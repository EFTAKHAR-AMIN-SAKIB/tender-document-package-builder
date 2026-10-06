import React from 'react';
import { CheckCircle2, Download, ExternalLink, X, FileCheck, Layers, Hash } from 'lucide-react';
import { Language, IncludedDocumentInfo } from '../../types';
import { getTranslation } from '../../i18n';
import { downloadPdf } from '../../lib/pdf/generator';
import { localizeNumber } from '../../lib/utils/format';

interface PackageSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  pdfBytes: Uint8Array | null;
  totalPages: number;
  fileName: string;
  tenderId: string;
  includedDocuments: IncludedDocumentInfo[];
}

export const PackageSuccessModal: React.FC<PackageSuccessModalProps> = ({
  isOpen,
  onClose,
  language,
  pdfBytes,
  totalPages,
  fileName,
  tenderId,
  includedDocuments,
}) => {
  if (!isOpen || !pdfBytes) return null;

  const handleDownload = () => {
    downloadPdf(pdfBytes, fileName);
  };

  const handlePreview = () => {
    const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-xs">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{getTranslation(language, 'packageReadyTitle')}</h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                {getTranslation(language, 'packageReadyDesc')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Metrics summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {getTranslation(language, 'summaryTotalPages')}
              </span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">
                {localizeNumber(totalPages, language)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {getTranslation(language, 'summaryIncludedDocs')}
              </span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">
                {localizeNumber(includedDocuments.length, language)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-center">
              <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">
                {getTranslation(language, 'summaryFilename')}
              </span>
              <span className="text-xs font-mono font-bold text-blue-900 mt-2 block truncate" title={fileName}>
                {fileName}
              </span>
            </div>
          </div>

          {/* Verification Callout */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
            <p className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              Verified Package Structure:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Page 1:</strong> Official Cover Page in English with complete tender metadata & schedule.</li>
              <li><strong>Pages 2+:</strong> All pages of selected documents preserved in strict order.</li>
              <li><strong>Footer:</strong> Every page stamped with <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">{tenderId} | Page X of {totalPages}</code>.</li>
            </ul>
          </div>

          {/* Included Documents Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Final Document Schedule ({includedDocuments.length})
            </h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs max-h-48 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-2 px-3 w-10 text-center">#</th>
                    <th className="py-2 px-3">Document</th>
                    <th className="py-2 px-3">Source File</th>
                    <th className="py-2 px-3 text-center">Pages</th>
                    <th className="py-2 px-3 text-right">Starts At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {includedDocuments.map((doc) => (
                    <tr key={doc.requirementId} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-center font-bold text-slate-600">{doc.order}</td>
                      <td className="py-2 px-3 font-semibold text-slate-800">
                        {language === 'bn' ? doc.titleBn : doc.titleEn}
                      </td>
                      <td className="py-2 px-3 text-slate-500 font-mono text-[11px] truncate max-w-[140px]">
                        {doc.fileName}
                      </td>
                      <td className="py-2 px-3 text-center text-slate-600">{doc.pageCount}</td>
                      <td className="py-2 px-3 text-right font-bold text-blue-700">
                        Page {doc.startPage}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={handlePreview}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold rounded-xl text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <ExternalLink className="w-4 h-4 text-slate-500" />
            Preview PDF in Browser
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4" />
            {getTranslation(language, 'downloadNow')}
          </button>
        </div>
      </div>
    </div>
  );
};
