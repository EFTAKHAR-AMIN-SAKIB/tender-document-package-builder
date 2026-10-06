import { Requirement, UploadedFile, DocumentStatus, PackageEligibility } from '../../types';
export type { PackageEligibility };
import { isDateBefore, isValidISODateString, normalizeDate } from '../utils/date';

export interface DocumentStatusInfo {
  status: DocumentStatus;
  blocksPackage: boolean;
  messageKey: string;
  reasonEn: string;
  reasonBn: string;
}

/**
 * Deterministic central status engine.
 * Computes exact status for a requirement given its matching state and submission deadline.
 */
export function getDocumentStatus(
  requirement: Requirement,
  matchedFile: UploadedFile | null | undefined,
  expiryDate: string | null | undefined,
  submissionDeadline: string
): DocumentStatus {
  // If no file matched:
  if (!matchedFile) {
    if (requirement.mandatory) {
      return 'missing';
    } else {
      return 'not_provided';
    }
  }

  // File is matched. Check expiry requirement:
  if (requirement.has_expiry) {
    if (!expiryDate || expiryDate.trim() === '' || !isValidISODateString(normalizeDate(expiryDate))) {
      return 'expiry_needed';
    }

    const normExpiry = normalizeDate(expiryDate);
    const normDeadline = normalizeDate(submissionDeadline);

    if (isDateBefore(normExpiry, normDeadline)) {
      return 'expired';
    }

    return 'ok';
  }

  // File is matched and no expiry required
  return 'ok';
}

/**
 * Returns whether a status blocks package generation.
 */
export function isStatusBlocking(status: DocumentStatus): boolean {
  switch (status) {
    case 'missing':
    case 'expiry_needed':
    case 'expired':
      return true;
    case 'not_provided':
    case 'ok':
      return false;
  }
}

/**
 * Returns complete status info including human-readable explanations in English and Bangla.
 */
export function getDocumentStatusInfo(
  requirement: Requirement,
  matchedFile: UploadedFile | null | undefined,
  expiryDate: string | null | undefined,
  submissionDeadline: string
): DocumentStatusInfo {
  const status = getDocumentStatus(requirement, matchedFile, expiryDate, submissionDeadline);
  const blocksPackage = isStatusBlocking(status);

  switch (status) {
    case 'missing':
      return {
        status,
        blocksPackage,
        messageKey: 'status_missing',
        reasonEn: 'Mandatory document has not been uploaded or matched.',
        reasonBn: 'বাধ্যতামূলক নথিটি এখনও আপলোড বা সংযুক্ত করা হয়নি।',
      };
    case 'expiry_needed':
      return {
        status,
        blocksPackage,
        messageKey: 'status_expiry_needed',
        reasonEn: 'Valid expiry date must be entered for this document.',
        reasonBn: 'এই নথির জন্য একটি মেয়াদ উত্তীর্ণের তারিখ প্রবেশ করা আবশ্যক।',
      };
    case 'expired':
      return {
        status,
        blocksPackage,
        messageKey: 'status_expired',
        reasonEn: `Document expires before the submission deadline (${submissionDeadline}).`,
        reasonBn: `নথিটির মেয়াদ জমার শেষ তারিখের (${submissionDeadline}) পূর্বেই শেষ হয়ে গেছে।`,
      };
    case 'not_provided':
      return {
        status,
        blocksPackage,
        messageKey: 'status_not_provided',
        reasonEn: 'Optional document is not provided. It will be skipped from the final package.',
        reasonBn: 'ঐচ্ছিক নথি সরবরাহ করা হয়নি। এটি চূড়ান্ত প্যাকেজ থেকে বাদ দেওয়া হবে।',
      };
    case 'ok':
      return {
        status,
        blocksPackage,
        messageKey: 'status_ok',
        reasonEn: 'Document is verified and ready for package generation.',
        reasonBn: 'নথিটি যাচাইকৃত এবং প্যাকেজ তৈরির জন্য প্রস্তুত।',
      };
  }
}


export function evaluatePackageEligibility(
  requirements: Requirement[],
  matches: Record<string, { fileId: string | null; expiryDate: string | null }>,
  uploadedFilesMap: Map<string, UploadedFile>,
  submissionDeadline: string
): PackageEligibility {
  const blockingReasons: PackageEligibility['blockingReasons'] = [];
  let totalMandatory = 0;
  let totalMatched = 0;
  let totalOk = 0;

  for (const req of requirements) {
    if (req.mandatory) totalMandatory++;

    const match = matches[req.id];
    const file = match?.fileId ? uploadedFilesMap.get(match.fileId) : undefined;
    if (file) totalMatched++;

    const statusInfo = getDocumentStatusInfo(req, file, match?.expiryDate, submissionDeadline);

    if (statusInfo.status === 'ok') {
      totalOk++;
    }

    if (statusInfo.blocksPackage) {
      blockingReasons.push({
        requirementId: req.id,
        requirementTitleEn: req.title_en,
        requirementTitleBn: req.title_bn,
        status: statusInfo.status,
        reasonEn: statusInfo.reasonEn,
        reasonBn: statusInfo.reasonBn,
      });
    }
  }

  // Can generate if requirements exist, there are no blocking issues, and at least 1 document is matched
  const canGenerate = requirements.length > 0 && blockingReasons.length === 0 && totalMatched > 0;

  return {
    canGenerate,
    blockingReasons,
    totalRequirements: requirements.length,
    totalMandatory,
    totalMatched,
    totalOk,
  };
}
