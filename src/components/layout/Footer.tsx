import React from 'react';
import { Shield, Lock } from 'lucide-react';
import { Language } from '../../types';
import { getTranslation } from '../../i18n';

interface FooterProps {
  language: Language;
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-300">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>{getTranslation(language, 'browserPrivacyNotice')}</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400 text-[11px]">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-slate-400" />
            Zero Server Transmission
          </span>
          <span>•</span>
          <span>AI DevFest Official Builder</span>
        </div>
      </div>
    </footer>
  );
};
