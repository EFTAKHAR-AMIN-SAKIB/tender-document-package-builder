import React, { useState, useRef } from 'react';
import { Upload, FileJson, AlertCircle, Sparkles } from 'lucide-react';
import { RequirementsData, Language } from '../../types';
import { getTranslation } from '../../i18n';
import { parseAndValidateRequirements } from '../../lib/validation/requirements';
import { sampleRequirementsJson1, sampleRequirementsJson2 } from '../../sampleData/sampleRequirements';

interface RequirementsLoaderProps {
  language: Language;
  onLoaded: (data: RequirementsData) => void;
}

export const RequirementsLoader: React.FC<RequirementsLoaderProps> = ({
  language,
  onLoaded,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessText = (jsonStr: string) => {
    setErrorMessage(null);
    const result = parseAndValidateRequirements(jsonStr);
    if (!result.valid || !result.data) {
      setErrorMessage(result.error || 'Failed to parse requirements.json file.');
      return;
    }
    onLoaded(result.data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleProcessText(content);
    };
    reader.onerror = () => {
      setErrorMessage('Could not read the selected file. Please try again.');
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json')) {
      setErrorMessage('Please upload a JSON file (e.g. requirements.json).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleProcessText(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 max-w-3xl mx-auto my-8">
      <div className="text-center max-w-xl mx-auto mb-6">
        <div className="inline-flex p-3 rounded-2xl bg-blue-50 text-blue-600 mb-3">
          <FileJson className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          {getTranslation(language, 'loadRequirementsTitle')}
        </h2>
        <p className="text-sm text-slate-500 mt-1.5">
          {getTranslation(language, 'loadRequirementsDesc')}
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-left"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">
            <div className="font-semibold">{getTranslation(language, 'jsonErrorTitle')}</div>
            <div className="mt-0.5">{errorMessage}</div>
          </div>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50/60 scale-[1.01]'
            : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
          id="requirements-file-input"
        />

        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600">
          <Upload className="w-6 h-6" />
        </div>

        <p className="text-sm sm:text-base font-semibold text-slate-700">
          {getTranslation(language, 'dragDropJson')}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Supports official <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">requirements.json</code>
        </p>

        <button
          type="button"
          className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
        >
          {getTranslation(language, 'clickToBrowse')}
        </button>
      </div>

      {/* Quick Sample Pack Loader for Testing / Evaluation */}
      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-center gap-1.5 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          {getTranslation(language, 'orUseSample')}
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => handleProcessText(sampleRequirementsJson1)}
            className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-400 text-slate-700 hover:text-blue-600 transition-all shadow-2xs"
          >
            📋 {getTranslation(language, 'loadSample1')}
          </button>
          <button
            type="button"
            onClick={() => handleProcessText(sampleRequirementsJson2)}
            className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-400 text-slate-700 hover:text-blue-600 transition-all shadow-2xs"
          >
            🏗️ {getTranslation(language, 'loadSample2')}
          </button>
        </div>
      </div>
    </div>
  );
};
