import { RequirementsData, UploadedFile, DocumentMatch } from '../../types';

export interface SavedWorkspaceSession {
  version: string;
  savedAt: string;
  tenderData: RequirementsData;
  matches: Record<string, { fileId: string | null; expiryDate: string | null }>;
  uploadedFilesMeta: Array<{
    id: string;
    name: string;
    size: number;
    pages: number;
    hash: string;
  }>;
}

const STORAGE_KEY = 'tender_builder_session_v1';

export function saveSessionToLocalStorage(
  tenderData: RequirementsData,
  matches: Record<string, { fileId: string | null; expiryDate: string | null }>,
  uploadedFiles: UploadedFile[]
): void {
  try {
    const session: SavedWorkspaceSession = {
      version: '1.0',
      savedAt: new Date().toISOString(),
      tenderData,
      matches,
      uploadedFilesMeta: uploadedFiles.map((f) => ({
        id: f.id,
        name: f.name,
        size: f.size,
        pages: f.pages,
        hash: f.hash,
      })),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.warn('Failed to save session to localStorage:', err);
  }
}

export function loadSessionFromLocalStorage(): SavedWorkspaceSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function exportSessionToFile(
  tenderData: RequirementsData,
  matches: Record<string, { fileId: string | null; expiryDate: string | null }>,
  uploadedFiles: UploadedFile[]
): void {
  const session: SavedWorkspaceSession = {
    version: '1.0',
    savedAt: new Date().toISOString(),
    tenderData,
    matches,
    uploadedFilesMeta: uploadedFiles.map((f) => ({
      id: f.id,
      name: f.name,
      size: f.size,
      pages: f.pages,
      hash: f.hash,
    })),
  };

  const jsonStr = JSON.stringify(session, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${tenderData.tender.tender_id}_Session.tender-session.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
