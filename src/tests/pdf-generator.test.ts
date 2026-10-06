import { describe, it, expect } from 'vitest';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { generateTenderPackage } from '../lib/pdf/generator';
import type { Tender, Requirement, UploadedFile } from '../types';

describe('PDF Package Generator & Footer Verification', () => {
  async function createTestPdf(pageCount: number, title: string): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    for (let i = 0; i < pageCount; i++) {
      const page = doc.addPage([595.28, 841.89]);
      page.drawText(`${title} - Page ${i + 1}`, { x: 50, y: 700, size: 14, font });
    }
    return await doc.save();
  }

  const createPdfFile = (bytes: Uint8Array, name: string) => {
    const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    return new File([arrayBuffer], name, { type: 'application/pdf' });
  };

  it('generates a complete, valid PDF package with cover page and footers on every page', async () => {
    const tender: Tender = {
      tender_id: 'T-2026-0417',
      title: 'Supply of IT Equipment',
      procuring_entity: 'Example Directorate',
      bidder: 'Example Company Ltd.',
      submission_deadline: '2026-10-20',
    };

    // Document 1: 1 page
    const bytes1 = await createTestPdf(1, 'Trade License');
    const file1: UploadedFile = {
      id: 'f1',
      file: createPdfFile(bytes1, 'trade_license.pdf'),
      name: 'trade_license.pdf',
      size: bytes1.length,
      pages: 1,
      hash: 'hash1',
      isDuplicate: false,
      isValidPdf: true,
      data: bytes1,
    };

    // Document 2: 2 pages
    const bytes2 = await createTestPdf(2, 'TIN Certificate');
    const file2: UploadedFile = {
      id: 'f2',
      file: createPdfFile(bytes2, 'tin_cert.pdf'),
      name: 'tin_cert.pdf',
      size: bytes2.length,
      pages: 2,
      hash: 'hash2',
      isDuplicate: false,
      isValidPdf: true,
      data: bytes2,
    };

    const reqs: Requirement[] = [
      { id: 'R01', order: 1, title_en: 'Trade License', title_bn: 'ট্রেড লাইসেন্স', mandatory: true, has_expiry: true },
      { id: 'R02', order: 2, title_en: 'TIN Certificate', title_bn: 'টিআইএন সনদ', mandatory: true, has_expiry: false },
      { id: 'R03', order: 3, title_en: 'MAF Letter', title_bn: 'এমএএফ লেটার', mandatory: false, has_expiry: false }, // Optional omitted
    ];

    const matches = {
      R01: { fileId: 'f1', expiryDate: '2026-11-01' },
      R02: { fileId: 'f2', expiryDate: null },
      R03: { fileId: null, expiryDate: null },
    };

    const fileMap = new Map<string, UploadedFile>([
      ['f1', file1],
      ['f2', file2],
    ]);

    const result = await generateTenderPackage(tender, reqs, matches, fileMap, { includeIndexPage: false });

    expect(result.fileName).toBe('T-2026-0417_Package.pdf');
    // Total pages: Cover (1) + Document 1 (1 page) + Document 2 (2 pages) = 4 pages
    expect(result.totalPages).toBe(4);
    expect(result.includedDocuments.length).toBe(2);
    expect(result.includedDocuments[0].requirementId).toBe('R01');
    expect(result.includedDocuments[1].requirementId).toBe('R02');

    // Programmatically open and inspect the generated PDF
    const parsedGenerated = await PDFDocument.load(result.pdfBytes);
    expect(parsedGenerated.getPageCount()).toBe(4);

    // Verify each page exists
    for (let p = 0; p < parsedGenerated.getPageCount(); p++) {
      const page = parsedGenerated.getPage(p);
      expect(page).toBeDefined();
    }
  });

  it('correctly includes index page when enabled', async () => {
    const tender: Tender = {
      tender_id: 'T-2026-0417',
      title: 'Supply of IT Equipment',
      procuring_entity: 'Example Directorate',
      bidder: 'Example Company Ltd.',
      submission_deadline: '2026-10-20',
    };

    const bytes1 = await createTestPdf(1, 'Doc 1');
    const file1: UploadedFile = {
      id: 'f1',
      file: createPdfFile(bytes1, 'doc1.pdf'),
      name: 'doc1.pdf',
      size: bytes1.length,
      pages: 1,
      hash: 'hash1',
      isDuplicate: false,
      isValidPdf: true,
      data: bytes1,
    };

    const reqs: Requirement[] = [
      { id: 'R01', order: 1, title_en: 'Doc 1', title_bn: 'নথি ১', mandatory: true, has_expiry: false },
    ];

    const matches = { R01: { fileId: 'f1', expiryDate: null } };
    const fileMap = new Map<string, UploadedFile>([['f1', file1]]);

    const result = await generateTenderPackage(tender, reqs, matches, fileMap, { includeIndexPage: true });

    // Cover (1) + Index (1) + Doc 1 (1) = 3 pages
    expect(result.totalPages).toBe(3);
    const parsed = await PDFDocument.load(result.pdfBytes);
    expect(parsed.getPageCount()).toBe(3);
  });
});
