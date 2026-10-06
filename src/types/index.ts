export interface Tender {
  tender_id: string;
  title: string;
  procuring_entity: string;
  bidder: string;
  submission_deadline: string; // YYYY-MM-DD
}

export interface Requirement {
  id: string;
  order: number;
  title_en: string;
  title_bn: string;
  mandatory: boolean;
  has_expiry: boolean;
}

export interface RequirementsData {
  tender: Tender;
  requirements: Requirement[];
}

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pages: number;
  hash: string;
  isDuplicate: boolean;
  duplicateOfId?: string;
  duplicateOfName?: string;
  isValidPdf: boolean;
  error?: string;
  data: Uint8Array;
}

export interface DocumentMatch {
  requirementId: string;
  fileId: string | null;
  expiryDate: string | null; // YYYY-MM-DD
}

export type DocumentStatus =
  | 'missing'
  | 'expiry_needed'
  | 'expired'
  | 'not_provided'
  | 'ok';

export interface RequirementWithMatch extends Requirement {
  match?: DocumentMatch;
  matchedFile?: UploadedFile;
  status: DocumentStatus;
  statusMessageKey: string;
}

export type Language = 'en' | 'bn';

export interface PackageGenerationOptions {
  includeIndexPage?: boolean;
}

export interface IncludedDocumentInfo {
  order: number;
  requirementId: string;
  titleEn: string;
  titleBn: string;
  fileName: string;
  pageCount: number;
  startPage: number;
}

export interface PackageEligibility {
  canGenerate: boolean;
  blockingReasons: Array<{
    requirementId: string;
    requirementTitleEn: string;
    requirementTitleBn: string;
    status: DocumentStatus;
    reasonEn: string;
    reasonBn: string;
  }>;
  totalRequirements: number;
  totalMandatory: number;
  totalMatched: number;
  totalOk: number;
}

