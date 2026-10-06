import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { TenderInfoCard } from './components/tender/TenderInfoCard';
import { RequirementsLoader } from './components/upload/RequirementsLoader';
import { FileUploadZone } from './components/upload/FileUploadZone';
import { UploadedFilesList } from './components/matching/UploadedFilesList';
import { DocumentMatchingTable } from './components/matching/DocumentMatchingTable';
import { GenerationBlockersAlert } from './components/status/GenerationBlockersAlert';
import { GeneratePackageSection } from './components/package/GeneratePackageSection';
import { PackageSuccessModal } from './components/package/PackageSuccessModal';
import { HelpModal } from './components/common/HelpModal';
import { ToastContainer, type ToastMessage } from './components/common/Toast';

import type { RequirementsData, UploadedFile, Language, DocumentMatch } from './types';
import { getTranslation } from './i18n';
import { evaluatePackageEligibility } from './lib/validation/status';
import { generateTenderPackage, type GeneratePackageResult } from './lib/pdf/generator';
import { findAutoMatches } from './lib/matching/autoMatch';
import { exportChecklistCsv } from './lib/export/csv';
import { exportSessionToFile } from './lib/storage/session';

export function App() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('tender_lang');
    return saved === 'bn' ? 'bn' : 'en';
  });

  const [requirementsData, setRequirementsData] = useState<RequirementsData | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [matches, setMatches] = useState<Record<string, { fileId: string | null; expiryDate: string | null }>>({});
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [includeIndexPage, setIncludeIndexPage] = useState(false);
  const [packageResult, setPackageResult] = useState<GeneratePackageResult | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [focusedRequirementId, setFocusedRequirementId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const sessionFileInputRef = useRef<HTMLInputElement>(null);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    localStorage.setItem('tender_lang', newLang);
  };

  // Re-compute duplicate flags whenever uploadedFiles changes
  const updateFileDuplicates = (files: UploadedFile[]): UploadedFile[] => {
    const seenHashes = new Map<string, string>(); // hash -> file name
    return files.map((file) => {
      if (!file.isValidPdf || !file.hash) return file;
      if (seenHashes.has(file.hash)) {
        return {
          ...file,
          isDuplicate: true,
          duplicateOfName: seenHashes.get(file.hash),
        };
      } else {
        seenHashes.set(file.hash, file.name);
        return {
          ...file,
          isDuplicate: false,
          duplicateOfName: undefined,
        };
      }
    });
  };

  // When new requirements loaded
  const handleRequirementsLoaded = (data: RequirementsData) => {
    setRequirementsData(data);
    // Initialize matches object with all requirements
    const initialMatches: Record<string, { fileId: string | null; expiryDate: string | null }> = {};
    data.requirements.forEach((req) => {
      initialMatches[req.id] = { fileId: null, expiryDate: null };
    });
    setMatches(initialMatches);
    addToast('success', `Requirements loaded: ${data.tender.tender_id} - ${data.tender.title}`);
  };

  const handleResetRequirements = () => {
    if (window.confirm('Are you sure you want to unload current requirements and start over?')) {
      setRequirementsData(null);
      setMatches({});
    }
  };

  // Upload handler
  const handleAddFiles = (newFiles: UploadedFile[]) => {
    setUploadedFiles((prev) => {
      const merged = [...prev, ...newFiles];
      return updateFileDuplicates(merged);
    });
    addToast('success', `${newFiles.length} PDF file(s) added successfully.`);
  };

  // Remove individual file
  const handleRemoveFile = (fileId: string) => {
    const file = uploadedFiles.find((f) => f.id === fileId);
    setUploadedFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== fileId);
      return updateFileDuplicates(filtered);
    });

    // If any requirement was matched to this file, clear the match
    setMatches((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((reqId) => {
        if (updated[reqId]?.fileId === fileId) {
          updated[reqId] = {
            ...updated[reqId],
            fileId: null,
          };
        }
      });
      return updated;
    });

    if (file) {
      addToast('info', `Removed file: ${file.name}`);
    }
  };

  // Clear all uploaded files
  const handleClearAllFiles = () => {
    if (window.confirm('Remove all uploaded files?')) {
      setUploadedFiles([]);
      setMatches((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((reqId) => {
          updated[reqId] = {
            ...updated[reqId],
            fileId: null,
          };
        });
        return updated;
      });
      addToast('info', 'All uploaded files cleared.');
    }
  };

  // Match change handler (assign or unassign)
  const handleMatchChange = (requirementId: string, fileId: string | null) => {
    setMatches((prev) => {
      const current = prev[requirementId] || { fileId: null, expiryDate: null };
      return {
        ...prev,
        [requirementId]: {
          ...current,
          fileId,
        },
      };
    });
  };

  // Expiry date change handler
  const handleExpiryChange = (requirementId: string, expiryDate: string) => {
    setMatches((prev) => {
      const current = prev[requirementId] || { fileId: null, expiryDate: null };
      return {
        ...prev,
        [requirementId]: {
          ...current,
          expiryDate: expiryDate ? expiryDate.trim() : null,
        },
      };
    });
  };

  // Clear all matches
  const handleClearAllMatches = () => {
    setMatches((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((reqId) => {
        updated[reqId] = {
          fileId: null,
          expiryDate: null,
        };
      });
      return updated;
    });
    addToast('info', 'All document matches cleared.');
  };

  // Auto-match suggestions
  const handleAutoMatch = () => {
    if (!requirementsData) return;
    const suggestions = findAutoMatches(requirementsData.requirements, uploadedFiles, matches);

    if (suggestions.length === 0) {
      addToast('info', 'No obvious matching file names detected for remaining requirements.');
      return;
    }

    setMatches((prev) => {
      const updated = { ...prev };
      suggestions.forEach((s) => {
        const cur = updated[s.requirementId] || { fileId: null, expiryDate: null };
        updated[s.requirementId] = {
          ...cur,
          fileId: s.fileId,
        };
      });
      return updated;
    });

    addToast('success', getTranslation(language, 'autoMatchApplied', { count: suggestions.length }));
  };

  // Fast file lookup map
  const uploadedFilesMap = useMemo(() => {
    const map = new Map<string, UploadedFile>();
    uploadedFiles.forEach((f) => map.set(f.id, f));
    return map;
  }, [uploadedFiles]);

  // Real-time package eligibility and blocking reasons
  const eligibility = useMemo(() => {
    if (!requirementsData) {
      return {
        canGenerate: false,
        blockingReasons: [],
        totalRequirements: 0,
        totalMandatory: 0,
        totalMatched: 0,
        totalOk: 0,
      };
    }

    return evaluatePackageEligibility(
      requirementsData.requirements,
      matches,
      uploadedFilesMap,
      requirementsData.tender.submission_deadline
    );
  }, [requirementsData, matches, uploadedFilesMap]);

  // Package compilation handler
  const handleGeneratePackage = async () => {
    if (!requirementsData || !eligibility.canGenerate) return;
    setIsGenerating(true);

    try {
      const result = await generateTenderPackage(
        requirementsData.tender,
        requirementsData.requirements,
        matches,
        uploadedFilesMap,
        { includeIndexPage }
      );

      setPackageResult(result);
      setIsSuccessModalOpen(true);
      addToast('success', `Tender package compiled successfully! (${result.totalPages} pages)`);
    } catch (err: any) {
      addToast('error', `Package generation failed: ${err?.message || 'Unknown PDF error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    if (!requirementsData) return;
    exportChecklistCsv(
      requirementsData.requirements,
      matches,
      uploadedFilesMap,
      requirementsData.tender.submission_deadline,
      language
    );
    addToast('success', 'Tender checklist exported as CSV.');
  };

  // Save session file
  const handleSaveSession = () => {
    if (!requirementsData) return;
    exportSessionToFile(requirementsData, matches, uploadedFiles);
    addToast('success', 'Workspace session saved to JSON file.');
  };

  // Restore session file
  const handleLoadSession = () => {
    sessionFileInputRef.current?.click();
  };

  const handleSessionFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const session = JSON.parse(content);
        if (session.tenderData && session.matches) {
          setRequirementsData(session.tenderData);
          setMatches(session.matches);
          addToast('success', 'Workspace session restored successfully.');
        } else {
          addToast('error', 'Invalid workspace session format.');
        }
      } catch (err: any) {
        addToast('error', `Failed to restore session: ${err?.message}`);
      }
    };
    reader.readAsText(file);
    if (sessionFileInputRef.current) sessionFileInputRef.current.value = '';
  };

  const handleFocusRequirement = (reqId: string) => {
    setFocusedRequirementId(reqId);
    const element = document.getElementById(`req-row-${reqId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => {
      setFocusedRequirementId(null);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <input
        ref={sessionFileInputRef}
        type="file"
        accept=".json"
        onChange={handleSessionFileSelected}
        className="hidden"
        id="session-restore-input"
      />

      {/* Official Header */}
      <Header
        language={language}
        onLanguageChange={handleLanguageChange}
        onOpenHelp={() => setIsHelpModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!requirementsData ? (
          // Initial Screen: Load Requirements JSON
          <div className="py-6">
            <RequirementsLoader
              language={language}
              onLoaded={handleRequirementsLoaded}
            />
          </div>
        ) : (
          // Active Workspace
          <div className="space-y-6">
            {/* Step Navigation Bar */}
            <div className="bg-white rounded-xl shadow-2xs border border-slate-200 p-3 sm:p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-semibold">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">✓</span>
                  <span>{getTranslation(language, 'step1')}</span>
                </div>
                <div className={`flex items-center gap-2 p-2 rounded-lg border ${
                  uploadedFiles.length > 0
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-blue-50 text-blue-800 border-blue-200'
                }`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    uploadedFiles.length > 0 ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
                  }`}>2</span>
                  <span>{getTranslation(language, 'step2')} ({uploadedFiles.length})</span>
                </div>
                <div className={`flex items-center gap-2 p-2 rounded-lg border ${
                  eligibility.canGenerate
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    eligibility.canGenerate ? 'bg-emerald-600 text-white' : 'bg-slate-400 text-white'
                  }`}>3</span>
                  <span>{getTranslation(language, 'step3')}</span>
                </div>
                <div className={`flex items-center gap-2 p-2 rounded-lg border ${
                  eligibility.canGenerate
                    ? 'bg-blue-50 text-blue-800 border-blue-200 animate-pulse'
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}>
                  <span className="w-5 h-5 rounded-full bg-slate-300 text-white flex items-center justify-center text-[10px]">4</span>
                  <span>{getTranslation(language, 'step4')}</span>
                </div>
              </div>
            </div>

            {/* Tender Overview Card */}
            <TenderInfoCard
              tender={requirementsData.tender}
              language={language}
              onResetRequirements={handleResetRequirements}
            />

            {/* Upload Zone */}
            <FileUploadZone
              language={language}
              uploadedFiles={uploadedFiles}
              onAddFiles={handleAddFiles}
              onError={(msg) => addToast('error', msg)}
            />

            {/* Uploaded Files Pool */}
            <UploadedFilesList
              language={language}
              files={uploadedFiles}
              requirements={requirementsData.requirements}
              matches={matches}
              onRemoveFile={handleRemoveFile}
              onClearAllFiles={handleClearAllFiles}
            />

            {/* Blocking Issues Alert (if any blocking status exists) */}
            <GenerationBlockersAlert
              blockers={eligibility.blockingReasons}
              language={language}
              onFocusRequirement={handleFocusRequirement}
            />

            {/* Core Matching Table */}
            <DocumentMatchingTable
              language={language}
              requirements={requirementsData.requirements}
              uploadedFiles={uploadedFiles}
              matches={matches}
              submissionDeadline={requirementsData.tender.submission_deadline}
              onMatchChange={handleMatchChange}
              onExpiryChange={handleExpiryChange}
              onAutoMatch={handleAutoMatch}
              onClearAllMatches={handleClearAllMatches}
              focusedRequirementId={focusedRequirementId}
            />

            {/* Final Package Generation CTA */}
            <GeneratePackageSection
              language={language}
              eligibility={eligibility}
              isGenerating={isGenerating}
              includeIndexPage={includeIndexPage}
              onToggleIndexPage={setIncludeIndexPage}
              onGeneratePackage={handleGeneratePackage}
              onExportCsv={handleExportCsv}
              onSaveSession={handleSaveSession}
              onLoadSession={handleLoadSession}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer language={language} />

      {/* Success Modal */}
      {packageResult && requirementsData && (
        <PackageSuccessModal
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          language={language}
          pdfBytes={packageResult.pdfBytes}
          totalPages={packageResult.totalPages}
          fileName={packageResult.fileName}
          tenderId={requirementsData.tender.tender_id}
          includedDocuments={packageResult.includedDocuments}
        />
      )}

      {/* User Guide & Rules Help Modal */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        language={language}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default App;
