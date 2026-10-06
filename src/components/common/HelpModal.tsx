import React from 'react';
import { X, CheckCircle2, AlertCircle, Clock, XCircle, MinusCircle, ShieldCheck } from 'lucide-react';
import { Language } from '../../types';
import { getTranslation } from '../../i18n';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, language }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            {language === 'bn' ? 'ব্যবহারবিধি ও নিয়মাবলী' : 'User Guide & Official Rules'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 leading-relaxed">
          {/* Workflow Steps */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
              {language === 'bn' ? 'কার্যপ্রণালী (Workflow)' : 'Preparation Workflow'}
            </h4>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs">
              <li><strong>Load Requirements:</strong> Upload the procuring entity's <code className="bg-slate-100 px-1 py-0.5 rounded">requirements.json</code>.</li>
              <li><strong>Upload PDFs:</strong> Upload up to 30 PDF files (max 50 MB total).</li>
              <li><strong>Match Documents:</strong> Connect each uploaded PDF to its respective requirement.</li>
              <li><strong>Enter Expiry Dates:</strong> Provide validity dates for documents where required.</li>
              <li><strong>Review Statuses:</strong> Ensure all blocking issues (Missing, Expiry needed, Expired) are resolved.</li>
              <li><strong>Generate Package:</strong> Download the final verified <code className="bg-slate-100 px-1 py-0.5 rounded">&lt;tender_id&gt;_Package.pdf</code>.</li>
            </ol>
          </div>

          {/* Status Meanings */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
              {language === 'bn' ? 'স্ট্যাটাস ও তার অর্থ' : 'Document Status Rules'}
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-red-50/70 border border-red-200">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-red-900">Missing (Blocks Package):</strong>
                  <span className="text-red-800 ml-1">Mandatory requirement has no file matched.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-amber-50/70 border border-amber-200">
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-900">Expiry Date Needed (Blocks Package):</strong>
                  <span className="text-amber-800 ml-1">File is matched, but expiry date is missing.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-rose-50/70 border border-rose-200">
                <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-rose-900">Expired (Blocks Package):</strong>
                  <span className="text-rose-800 ml-1">Expiry date is strictly before the tender submission deadline.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <MinusCircle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">Not Provided (Does NOT Block):</strong>
                  <span className="text-slate-600 ml-1">Optional requirement with no file matched. Will be skipped.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-emerald-50/70 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-900">OK / Verified (Does NOT Block):</strong>
                  <span className="text-emerald-800 ml-1">Document is valid and ready for final compilation.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200 text-xs text-blue-900">
            <strong>Client-Side Security:</strong> All file reading, SHA-256 duplicate checking, page counting, and PDF compilation take place directly in your browser. No files are uploaded to any server.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-900 text-white transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
