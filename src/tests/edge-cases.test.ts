import { describe, it, expect } from 'vitest';
import { hasPdfMagicBytes } from '../lib/pdf/parser';
import { isValidISODateString } from '../lib/utils/date';
import { findAutoMatches } from '../lib/matching/autoMatch';
import type { Requirement, UploadedFile } from '../types';

describe('Hostile QA Edge Cases & Guardrails', () => {
  it('rejects files without PDF magic bytes (%PDF-)', () => {
    // Non-PDF bytes: plain text or image
    const textBytes = new TextEncoder().encode('This is not a PDF file at all.');
    expect(hasPdfMagicBytes(textBytes)).toBe(false);

    const fakePdfBytes = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04]);
    expect(hasPdfMagicBytes(fakePdfBytes)).toBe(false);

    // Real PDF magic bytes
    const validMagic = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);
    expect(hasPdfMagicBytes(validMagic)).toBe(true);
  });

  it('validates leap year and calendar dates accurately', () => {
    // 2026 is NOT a leap year -> Feb 29 is invalid
    expect(isValidISODateString('2026-02-29')).toBe(false);
    // 2024 is a leap year -> Feb 29 is valid
    expect(isValidISODateString('2024-02-29')).toBe(true);

    // Invalid months and days
    expect(isValidISODateString('2026-13-01')).toBe(false);
    expect(isValidISODateString('2026-00-10')).toBe(false);
    expect(isValidISODateString('2026-04-31')).toBe(false); // April has 30 days
    expect(isValidISODateString('2026-04-30')).toBe(true);
  });

  it('enforces duplicate file matching safety', () => {
    const req1: Requirement = { id: 'R01', order: 1, title_en: 'Trade License', title_bn: 'ট্রেড লাইসেন্স', mandatory: true, has_expiry: true };
    const req2: Requirement = { id: 'R02', order: 2, title_en: 'Trade License Copy', title_bn: 'ট্রেড লাইসেন্স কপি', mandatory: true, has_expiry: false };

    // File 1 and File 2 have identical hash (duplicate content)
    const file1: UploadedFile = {
      id: 'f1',
      file: new File([''], 'trade_license.pdf'),
      name: 'trade_license.pdf',
      size: 500,
      pages: 1,
      hash: 'same_hash_123',
      isDuplicate: false,
      isValidPdf: true,
      data: new Uint8Array([1]),
    };

    const file2: UploadedFile = {
      id: 'f2',
      file: new File([''], 'copy_of_trade.pdf'),
      name: 'copy_of_trade.pdf',
      size: 500,
      pages: 1,
      hash: 'same_hash_123', // Same hash!
      isDuplicate: true,
      duplicateOfName: 'trade_license.pdf',
      isValidPdf: true,
      data: new Uint8Array([1]),
    };

    // If file 1 is already assigned to R01:
    const currentMatches = {
      R01: { fileId: 'f1', expiryDate: '2026-12-31' },
      R02: { fileId: null, expiryDate: null },
    };

    // Auto-match must NOT assign duplicate file2 to R02!
    const suggestions = findAutoMatches([req1, req2], [file1, file2], currentMatches);
    expect(suggestions.find((s) => s.fileId === 'f2')).toBeUndefined();
  });
});
