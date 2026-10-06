import React from 'react';
import { CheckCircle2, AlertCircle, Clock, XCircle, MinusCircle } from 'lucide-react';
import { DocumentStatus, Language } from '../../types';
import { getTranslation } from '../../i18n';

interface StatusBadgeProps {
  status: DocumentStatus;
  language: Language;
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  language,
  showIcon = true,
  className = '',
}) => {
  switch (status) {
    case 'missing':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200 ${className}`}
          title={getTranslation(language, 'status_missing_desc')}
        >
          {showIcon && <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />}
          {getTranslation(language, 'status_missing')}
        </span>
      );

    case 'expiry_needed':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 ${className}`}
          title={getTranslation(language, 'status_expiry_needed_desc')}
        >
          {showIcon && <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />}
          {getTranslation(language, 'status_expiry_needed')}
        </span>
      );

    case 'expired':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300 ${className}`}
          title={getTranslation(language, 'status_expired_desc')}
        >
          {showIcon && <XCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />}
          {getTranslation(language, 'status_expired')}
        </span>
      );

    case 'not_provided':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 ${className}`}
          title={getTranslation(language, 'status_not_provided_desc')}
        >
          {showIcon && <MinusCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />}
          {getTranslation(language, 'status_not_provided')}
        </span>
      );

    case 'ok':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 ${className}`}
          title={getTranslation(language, 'status_ok_desc')}
        >
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
          {getTranslation(language, 'status_ok')}
        </span>
      );
  }
};
