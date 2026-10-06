import { describe, it, expect } from 'vitest';
import { getDocumentStatus, isStatusBlocking, evaluatePackageEligibility } from '../lib/validation/status';
import type { Requirement, UploadedFile } from '../types';

describe('Tender Document Status Engine', () => {
  const dummyFile: UploadedFile = {
    id: 'f1',
    file: new File([''], 'test.pdf'),
    name: 'test.pdf',
    size: 1024,
    pages: 2,
    hash: 'abc123hash',
    isDuplicate: false,
    isValidPdf: true,
    data: new Uint8Array([1, 2, 3]),
  };

  const deadline = '2026-10-20';

  it('1. Mandatory document missing -> returns "missing" and blocks package', () => {
    const req: Requirement = {
      id: 'R01',
      order: 1,
      title_en: 'Trade License',
      title_bn: 'ট্রেড লাইসেন্স',
      mandatory: true,
      has_expiry: true,
    };

    const status = getDocumentStatus(req, null, null, deadline);
    expect(status).toBe('missing');
    expect(isStatusBlocking(status)).toBe(true);
  });

  it('2. Optional document missing -> returns "not_provided" and does NOT block package', () => {
    const req: Requirement = {
      id: 'R05',
      order: 5,
      title_en: 'MAF Letter',
      title_bn: 'এমএএফ লেটার',
      mandatory: false,
      has_expiry: true,
    };

    const status = getDocumentStatus(req, null, null, deadline);
    expect(status).toBe('not_provided');
    expect(isStatusBlocking(status)).toBe(false);
  });

  it('3. Required expiry date missing -> returns "expiry_needed" and blocks package', () => {
    const req: Requirement = {
      id: 'R01',
      order: 1,
      title_en: 'Trade License',
      title_bn: 'ট্রেড লাইসেন্স',
      mandatory: true,
      has_expiry: true,
    };

    const statusEmpty = getDocumentStatus(req, dummyFile, '', deadline);
    expect(statusEmpty).toBe('expiry_needed');
    expect(isStatusBlocking(statusEmpty)).toBe(true);

    const statusNull = getDocumentStatus(req, dummyFile, null, deadline);
    expect(statusNull).toBe('expiry_needed');
    expect(isStatusBlocking(statusNull)).toBe(true);
  });

  it('4. Expired document (expiry < deadline) -> returns "expired" and blocks package', () => {
    const req: Requirement = {
      id: 'R01',
      order: 1,
      title_en: 'Trade License',
      title_bn: 'ট্রেড লাইসেন্স',
      mandatory: true,
      has_expiry: true,
    };

    // Expiry 2026-10-19 is strictly before deadline 2026-10-20
    const status = getDocumentStatus(req, dummyFile, '2026-10-19', deadline);
    expect(status).toBe('expired');
    expect(isStatusBlocking(status)).toBe(true);
  });

  it('5. Expiry exactly on deadline -> returns "ok" and does NOT block package', () => {
    const req: Requirement = {
      id: 'R01',
      order: 1,
      title_en: 'Trade License',
      title_bn: 'ট্রেড লাইসেন্স',
      mandatory: true,
      has_expiry: true,
    };

    const status = getDocumentStatus(req, dummyFile, '2026-10-20', deadline);
    expect(status).toBe('ok');
    expect(isStatusBlocking(status)).toBe(false);
  });

  it('6. Expiry after deadline -> returns "ok" and does NOT block package', () => {
    const req: Requirement = {
      id: 'R01',
      order: 1,
      title_en: 'Trade License',
      title_bn: 'ট্রেড লাইসেন্স',
      mandatory: true,
      has_expiry: true,
    };

    const status = getDocumentStatus(req, dummyFile, '2026-12-31', deadline);
    expect(status).toBe('ok');
    expect(isStatusBlocking(status)).toBe(false);
  });

  it('7. Valid non-expiring document -> returns "ok" regardless of expiry input', () => {
    const req: Requirement = {
      id: 'R02',
      order: 2,
      title_en: 'TIN Certificate',
      title_bn: 'টিআইএন সার্টিফিকেট',
      mandatory: true,
      has_expiry: false,
    };

    const status = getDocumentStatus(req, dummyFile, null, deadline);
    expect(status).toBe('ok');
    expect(isStatusBlocking(status)).toBe(false);
  });

  it('8. Optional document provided with valid expiry -> returns "ok"', () => {
    const req: Requirement = {
      id: 'R05',
      order: 5,
      title_en: 'MAF Letter',
      title_bn: 'এমএএফ লেটার',
      mandatory: false,
      has_expiry: true,
    };

    const status = getDocumentStatus(req, dummyFile, '2026-12-31', deadline);
    expect(status).toBe('ok');
    expect(isStatusBlocking(status)).toBe(false);
  });

  it('9. Package eligibility correctly gates generation', () => {
    const reqs: Requirement[] = [
      { id: 'R01', order: 1, title_en: 'Trade License', title_bn: 'ট্রেড লাইসেন্স', mandatory: true, has_expiry: true },
      { id: 'R02', order: 2, title_en: 'TIN', title_bn: 'টিআইএন', mandatory: true, has_expiry: false },
      { id: 'R03', order: 3, title_en: 'MAF', title_bn: 'এমএএফ', mandatory: false, has_expiry: false },
    ];

    const fileMap = new Map<string, UploadedFile>([['f1', dummyFile]]);

    // Case A: R01 missing, R02 matched -> blocked
    const matchesA = {
      R01: { fileId: null, expiryDate: null },
      R02: { fileId: 'f1', expiryDate: null },
      R03: { fileId: null, expiryDate: null },
    };
    const elA = evaluatePackageEligibility(reqs, matchesA, fileMap, deadline);
    expect(elA.canGenerate).toBe(false);
    expect(elA.blockingReasons.length).toBe(1);
    expect(elA.blockingReasons[0].status).toBe('missing');

    // Case B: R01 matched with expired date -> blocked
    const matchesB = {
      R01: { fileId: 'f1', expiryDate: '2026-09-01' },
      R02: { fileId: 'f1', expiryDate: null },
      R03: { fileId: null, expiryDate: null },
    };
    const elB = evaluatePackageEligibility(reqs, matchesB, fileMap, deadline);
    expect(elB.canGenerate).toBe(false);
    expect(elB.blockingReasons[0].status).toBe('expired');

    // Case C: R01 valid date, R02 matched, R03 not provided -> CAN GENERATE!
    const matchesC = {
      R01: { fileId: 'f1', expiryDate: '2026-11-01' },
      R02: { fileId: 'f1', expiryDate: null },
      R03: { fileId: null, expiryDate: null },
    };
    const elC = evaluatePackageEligibility(reqs, matchesC, fileMap, deadline);
    expect(elC.canGenerate).toBe(true);
    expect(elC.blockingReasons.length).toBe(0);
  });
});
