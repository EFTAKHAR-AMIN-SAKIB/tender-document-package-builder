import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Language, DocumentStatus } from '../../types';
import { getTranslation } from '../../i18n';
import { StatusBadge } from './StatusBadge';

interface BlockerItem {
  requirementId: string;
  requirementTitleEn: string;
  requirementTitleBn: string;
  status: DocumentStatus;
  reasonEn: string;
  reasonBn: string;
}

interface GenerationBlockersAlertProps {
  blockers: BlockerItem[];
  language: Language;
  onFocusRequirement?: (reqId: string) => void;
}

export const GenerationBlockersAlert: React.FC<GenerationBlockersAlertProps> = ({
  blockers,
  language,
  onFocusRequirement,
}) => {
  if (blockers.length === 0) return null;

  return (
    <div
      role="alert"
      className="rounded-xl border border-amber-300 bg-amber-50/90 p-5 shadow-sm my-6 transition-all"
    >
      <div className="flex items-start gap-3.5">
        <div className="p-2 bg-amber-100 rounded-lg text-amber-800 flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5 text-amber-700" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-amber-900">
            {getTranslation(language, 'blockedTitle')} ({blockers.length})
          </h3>
          <p className="text-sm text-amber-800/90 mt-1">
            {getTranslation(language, 'blockedDesc')}
          </p>

          <ul className="mt-3.5 space-y-2.5">
            {blockers.map((item) => {
              const docTitle = language === 'bn' ? item.requirementTitleBn : item.requirementTitleEn;
              const reason = language === 'bn' ? item.reasonBn : item.reasonEn;

              return (
                <li
                  key={item.requirementId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-white/80 rounded-lg border border-amber-200 text-sm"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <StatusBadge status={item.status} language={language} />
                    <span className="font-semibold text-slate-800 truncate">{docTitle}:</span>
                    <span className="text-slate-600 truncate">{reason}</span>
                  </div>

                  {onFocusRequirement && (
                    <button
                      type="button"
                      onClick={() => onFocusRequirement(item.requirementId)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 py-1 px-2 hover:bg-blue-50 rounded transition-colors self-end sm:self-auto"
                    >
                      {language === 'bn' ? 'সংশোধন করুন' : 'Fix this item'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};
