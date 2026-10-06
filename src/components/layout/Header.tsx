import React from 'react';
import { ShieldCheck, FileCheck, Globe, HelpCircle } from 'lucide-react';
import { Language } from '../../types';
import { getTranslation } from '../../i18n';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  onOpenHelp,
}) => {
  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3 text-left w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-inner flex-shrink-0">
            <FileCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white m-0">
                {getTranslation(language, 'appName')}
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3" />
                Browser Only
              </span>
            </div>
            <p className="text-xs text-slate-400 m-0">
              {getTranslation(language, 'appSubtitle')}
            </p>
          </div>
        </div>

        {/* Right side controls: Language switcher & Help */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
            <Globe className="w-4 h-4 text-slate-400 ml-1.5 mr-1" />
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                language === 'en'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
              aria-label="Switch to English"
            >
              English
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('bn')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                language === 'bn'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
              aria-label="বাংলা ভাষায় পরিবর্তন করুন"
            >
              বাংলা
            </button>
          </div>

          {/* Quick Help Modal Trigger */}
          <button
            type="button"
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="User Guide & Help"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Guide</span>
          </button>
        </div>
      </div>
    </header>
  );
};
