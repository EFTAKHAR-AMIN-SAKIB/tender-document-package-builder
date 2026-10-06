import { Requirement, UploadedFile, DocumentStatus, Language } from '../../types';
import { getDocumentStatus } from '../validation/status';

export function exportChecklistCsv(
  requirements: Requirement[],
  matches: Record<string, { fileId: string | null; expiryDate: string | null }>,
  uploadedFilesMap: Map<string, UploadedFile>,
  submissionDeadline: string,
  language: Language
): void {
  const headers = ['Order', 'Requirement Name', 'Mandatory', 'Matched File', 'Pages', 'Expiry Date', 'Status'];

  const rows = requirements.map((req) => {
    const match = matches[req.id];
    const file = match?.fileId ? uploadedFilesMap.get(match.fileId) : undefined;
    const expiry = match?.expiryDate || 'N/A';
    const status: DocumentStatus = getDocumentStatus(req, file, match?.expiryDate, submissionDeadline);
    const title = language === 'bn' ? req.title_bn : req.title_en;

    return [
      req.order,
      `"${title.replace(/"/g, '""')}"`,
      req.mandatory ? 'Yes' : 'No',
      file ? `"${file.name.replace(/"/g, '""')}"` : 'None',
      file ? file.pages : 0,
      expiry,
      status.toUpperCase(),
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Tender_Checklist_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
