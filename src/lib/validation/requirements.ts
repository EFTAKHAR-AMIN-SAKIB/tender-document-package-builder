import { RequirementsData, Requirement, Tender } from '../../types';
import { isValidISODateString } from '../utils/date';

export interface ValidationResult {
  valid: boolean;
  data?: RequirementsData;
  error?: string;
}

export function parseAndValidateRequirements(jsonString: string): ValidationResult {
  if (!jsonString || typeof jsonString !== 'string' || jsonString.trim() === '') {
    return {
      valid: false,
      error: 'The provided requirements file is empty. Please select a valid JSON file.',
    };
  }

  let raw: any;
  try {
    raw = JSON.parse(jsonString);
  } catch (err: any) {
    return {
      valid: false,
      error: `Invalid JSON format: ${err?.message || 'Could not parse JSON structure'}. Please ensure the file is well-formed JSON.`,
    };
  }

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {
      valid: false,
      error: 'Invalid requirements structure: Root must be a JSON object containing "tender" and "requirements".',
    };
  }

  // Validate Tender Object
  const tenderRaw = raw.tender;
  if (!tenderRaw || typeof tenderRaw !== 'object' || Array.isArray(tenderRaw)) {
    return {
      valid: false,
      error: 'Missing or invalid "tender" section in requirements JSON.',
    };
  }

  const tenderId = tenderRaw.tender_id ?? tenderRaw.tenderId;
  if (!tenderId || typeof tenderId !== 'string' || tenderId.trim() === '') {
    return {
      valid: false,
      error: 'Tender object is missing "tender_id".',
    };
  }

  const title = tenderRaw.title;
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return {
      valid: false,
      error: 'Tender object is missing "title".',
    };
  }

  const procuringEntity = tenderRaw.procuring_entity ?? tenderRaw.procuringEntity;
  if (!procuringEntity || typeof procuringEntity !== 'string' || procuringEntity.trim() === '') {
    return {
      valid: false,
      error: 'Tender object is missing "procuring_entity".',
    };
  }

  const bidder = tenderRaw.bidder;
  if (!bidder || typeof bidder !== 'string' || bidder.trim() === '') {
    return {
      valid: false,
      error: 'Tender object is missing "bidder".',
    };
  }

  const submissionDeadline = tenderRaw.submission_deadline ?? tenderRaw.submissionDeadline;
  if (!submissionDeadline || typeof submissionDeadline !== 'string' || submissionDeadline.trim() === '') {
    return {
      valid: false,
      error: 'Tender object is missing "submission_deadline".',
    };
  }

  const cleanDeadline = submissionDeadline.trim().split('T')[0];
  if (!isValidISODateString(cleanDeadline)) {
    return {
      valid: false,
      error: `Invalid submission deadline "${submissionDeadline}". Expected valid date in YYYY-MM-DD format (e.g., "2026-10-20").`,
    };
  }

  const tender: Tender = {
    tender_id: tenderId.trim(),
    title: title.trim(),
    procuring_entity: procuringEntity.trim(),
    bidder: bidder.trim(),
    submission_deadline: cleanDeadline,
  };

  // Validate Requirements Array
  const reqsRaw = raw.requirements;
  if (!Array.isArray(reqsRaw)) {
    return {
      valid: false,
      error: 'Missing or invalid "requirements" list. Expected a JSON array of required documents.',
    };
  }

  if (reqsRaw.length === 0) {
    return {
      valid: false,
      error: 'The "requirements" array must contain at least one document requirement.',
    };
  }

  const seenIds = new Set<string>();
  const parsedReqs: Requirement[] = [];

  for (let i = 0; i < reqsRaw.length; i++) {
    const item = reqsRaw[i];
    const itemNum = i + 1;

    if (!item || typeof item !== 'object') {
      return {
        valid: false,
        error: `Requirement #${itemNum} is not a valid object.`,
      };
    }

    const id = item.id;
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return {
        valid: false,
        error: `Requirement #${itemNum} is missing "id".`,
      };
    }
    const cleanId = id.trim();
    if (seenIds.has(cleanId)) {
      return {
        valid: false,
        error: `Duplicate requirement ID "${cleanId}" found at item #${itemNum}. IDs must be unique.`,
      };
    }
    seenIds.add(cleanId);

    const order = item.order;
    if (order === undefined || order === null || typeof order !== 'number' || isNaN(order) || order < 1) {
      return {
        valid: false,
        error: `Requirement "${cleanId}" has invalid "order". Expected a positive number.`,
      };
    }

    const titleEn = item.title_en ?? item.titleEn;
    if (!titleEn || typeof titleEn !== 'string' || titleEn.trim() === '') {
      return {
        valid: false,
        error: `Requirement "${cleanId}" is missing English title ("title_en").`,
      };
    }

    const titleBn = item.title_bn ?? item.titleBn ?? titleEn; // Fallback to titleEn if Bangla title missing

    const mandatory = item.mandatory;
    if (typeof mandatory !== 'boolean') {
      return {
        valid: false,
        error: `Requirement "${cleanId}" must have a boolean "mandatory" flag (true or false).`,
      };
    }

    const hasExpiry = item.has_expiry ?? item.hasExpiry;
    if (typeof hasExpiry !== 'boolean') {
      return {
        valid: false,
        error: `Requirement "${cleanId}" must have a boolean "has_expiry" flag (true or false).`,
      };
    }

    parsedReqs.push({
      id: cleanId,
      order,
      title_en: titleEn.trim(),
      title_bn: typeof titleBn === 'string' ? titleBn.trim() : titleEn.trim(),
      mandatory,
      has_expiry: hasExpiry,
    });
  }

  // Sort requirements strictly by order ascending
  parsedReqs.sort((a, b) => a.order - b.order);

  return {
    valid: true,
    data: {
      tender,
      requirements: parsedReqs,
    },
  };
}
