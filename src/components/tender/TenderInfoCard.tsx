import React from 'react';
import { Calendar, Building2, User, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { Tender, Language } from '../../types';
import { getTranslation } from '../../i18n';
import { formatDisplayDate } from '../../lib/utils/date';

interface TenderInfoCardProps {
  tender: Tender;
  language: Language;
  onResetRequirements: () => void;
}

export const TenderInfoCard: React.FC<TenderInfoCardProps> = ({
  tender,
  language,
  onResetRequirements,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-800 tracking-wider">
              {tender.tender_id}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {getTranslation(language, 'tenderDetails')}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
            {tender.title}
          </h2>
        </div>

        <button
          type="button"
          onClick={onResetRequirements}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {getTranslation(language, 'reloadRequirements')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Procuring Entity */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50/80 border border-slate-100">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {getTranslation(language, 'procuringEntity')}
            </div>
            <div className="text-sm font-semibold text-slate-800 mt-0.5">
              {tender.procuring_entity}
            </div>
          </div>
        </div>

        {/* Bidder */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50/80 border border-slate-100">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {getTranslation(language, 'bidder')}
            </div>
            <div className="text-sm font-semibold text-slate-800 mt-0.5">
              {tender.bidder}
            </div>
          </div>
        </div>

        {/* Submission Deadline */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50/60 border border-amber-100">
          <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
              {getTranslation(language, 'submissionDeadline')}
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {formatDisplayDate(tender.submission_deadline, language)}
              <span className="text-xs font-normal text-slate-500 ml-1.5">
                ({tender.submission_deadline})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
