import React from 'react';
import { FileDown, Download, CheckCircle, FileSpreadsheet, Save, FolderOpen, Loader2 } from 'lucide-react';
import { Language, PackageEligibility } from '../../types';
import { getTranslation } from '../../i18n';

interface GeneratePackageSectionProps {
  language: Language;
  eligibility: PackageEligibility;
  isGenerating: boolean;
  includeIndexPage: boolean;
  onToggleIndexPage: (val: boolean) => void;
  onGeneratePackage: () => void;
  onExportCsv: () => void;
  onSaveSession: () => void;
  onLoadSession: () => void;
}

export const GeneratePackageSection: React.FC<GeneratePackageSectionProps> = ({
  language,
  eligibility,
  isGenerating,
  includeIndexPage,
  onToggleIndexPage,
  onGeneratePackage,
  onExportCsv,
  onSaveSession,
  onLoadSession,
}) => {
  const { canGenerate, blockingReasons } = eligibility;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileDown className="w-5 h-5 text-blue-600" />
            {getTranslation(language, 'generateSectionTitle')}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {canGenerate
              ? getTranslation(language, 'readyToGenerate')
              : `${getTranslation(language, 'blockedTitle')}: ${blockingReasons.length} issue(s) require resolution.`}
          </p>

          {/* Bonus Features Checklist & Options */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs">
            <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={includeIndexPage}
                onChange={(e) => onToggleIndexPage(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>{getTranslation(language, 'includeIndexPage')}</span>
            </label>

            <span className="text-slate-300">|</span>

            <button
              type="button"
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-semibold hover:underline"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              {getTranslation(language, 'exportChecklistCsv')}
            </button>

            <span className="text-slate-300">|</span>

            <button
              type="button"
              onClick={onSaveSession}
              className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold hover:underline"
              title="Save current matches and progress to a local file"
            >
              <Save className="w-3.5 h-3.5 text-blue-600" />
              {getTranslation(language, 'saveSession')}
            </button>

            <button
              type="button"
              onClick={onLoadSession}
              className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold hover:underline"
              title="Restore a saved workspace session"
            >
              <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
              {getTranslation(language, 'loadSession')}
            </button>
          </div>
        </div>

        {/* Generate Package CTA Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            disabled={!canGenerate || isGenerating}
            onClick={onGeneratePackage}
            className={`px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-md ${
              canGenerate && !isGenerating
                ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {getTranslation(language, 'generatingBtn')}
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                {getTranslation(language, 'generateBtn')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
