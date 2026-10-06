import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { parseAndValidateRequirements } from '../lib/validation/requirements';
import { parsePdfFile } from '../lib/pdf/parser';
import { findAutoMatches } from '../lib/matching/autoMatch';
import { getDocumentStatus, evaluatePackageEligibility } from '../lib/validation/status';
import { generateTenderPackage } from '../lib/pdf/generator';
import type { UploadedFile, Requirement } from '../types';

describe('Official Problem Pack Sample Integration Verification', () => {
  const samplePackDir = path.resolve(__dirname, '../../problem-pack/sample-pack');
  const requirementsPath = path.join(samplePackDir, 'requirements.json');
  const documentsDir = path.join(samplePackDir, 'documents');

  it('1. Parses and validates requirements.json correctly', () => {
    const rawJson = fs.readFileSync(requirementsPath, 'utf-8');
    const parseResult = parseAndValidateRequirements(rawJson);

    expect(parseResult.valid).toBe(true);
    expect(parseResult.data).toBeDefined();

    const data = parseResult.data!;
    expect(data.tender.tender_id).toBe('T-2026-0417');
    expect(data.tender.submission_deadline).toBe('2026-10-20');
    expect(data.tender.bidder).toBe('Meghna Tech Solutions Ltd.');
    expect(data.requirements).toHaveLength(10);

    // Verify ordering is strictly 1 to 10
    const orders = data.requirements.map((r) => r.order);
    expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('2. Evaluates all documents in problem-pack, detecting duplicates, non-PDFs, and page counts', async () => {
    const filenames = fs.readdirSync(documentsDir);
    expect(filenames).toContain('company_logo.png');
    expect(filenames).toContain('experience_cert.pdf');
    expect(filenames).toContain('experience_cert (1).pdf');
    expect(filenames).toContain('trade_license_2025.pdf');
    expect(filenames).toContain('trade_license_2026.pdf');
    expect(filenames).toContain('scan_0042.pdf');

    const uploadedFiles: UploadedFile[] = [];
    const seenHashes = new Map<string, string>();

    for (const name of filenames) {
      const fullPath = path.join(documentsDir, name);
      const buffer = fs.readFileSync(fullPath);
      const blob = new Blob([buffer], {
        type: name.endsWith('.pdf') ? 'application/pdf' : 'image/png',
      });
      const file = new File([blob], name);

      if (!name.endsWith('.pdf')) {
        // Non-PDF file should be rejected
        expect(name).toBe('company_logo.png');
        continue;
      }

      const parsed = await parsePdfFile(file);
      expect(parsed.isValid).toBe(true);
      expect(parsed.pageCount).toBeGreaterThan(0);
      expect(parsed.hash).toBeDefined();

      let isDuplicate = false;
      let duplicateOfName: string | undefined = undefined;

      if (seenHashes.has(parsed.hash)) {
        isDuplicate = true;
        duplicateOfName = seenHashes.get(parsed.hash);
      } else {
        seenHashes.set(parsed.hash, name);
      }

      uploadedFiles.push({
        id: `file_${name}`,
        file,
        name,
        size: buffer.length,
        pages: parsed.pageCount,
        hash: parsed.hash,
        isDuplicate,
        duplicateOfName,
        isValidPdf: parsed.isValid,
        data: parsed.data,
      });
    }

    // Exactly 10 PDFs should be parsed
    expect(uploadedFiles).toHaveLength(10);

    // Verify duplicate detection: exactly one duplicate must be detected between the two identical experience certificates
    const duplicateFiles = uploadedFiles.filter((f) => f.isDuplicate);
    expect(duplicateFiles).toHaveLength(1);
    expect(duplicateFiles[0].name).toMatch(/^experience_cert/);
    expect(duplicateFiles[0].duplicateOfName).toMatch(/^experience_cert/);
  });

  it('3. Auto-matches documents with year-awareness and residual handling', async () => {
    const rawJson = fs.readFileSync(requirementsPath, 'utf-8');
    const { data } = parseAndValidateRequirements(rawJson);
    const requirements = data!.requirements;
    const deadline = data!.tender.submission_deadline; // '2026-10-20'

    // Load all uploaded files
    const filenames = fs.readdirSync(documentsDir).filter((f) => f.endsWith('.pdf'));
    const uploadedFiles: UploadedFile[] = [];
    const seenHashes = new Map<string, string>();

    for (const name of filenames) {
      const fullPath = path.join(documentsDir, name);
      const buffer = fs.readFileSync(fullPath);
      const file = new File([buffer], name);
      const parsed = await parsePdfFile(file);

      let isDuplicate = false;
      let duplicateOfName: string | undefined = undefined;
      if (seenHashes.has(parsed.hash)) {
        isDuplicate = true;
        duplicateOfName = seenHashes.get(parsed.hash);
      } else {
        seenHashes.set(parsed.hash, name);
      }

      uploadedFiles.push({
        id: `file_${name}`,
        file,
        name,
        size: buffer.length,
        pages: parsed.pageCount,
        hash: parsed.hash,
        isDuplicate,
        duplicateOfName,
        isValidPdf: parsed.isValid,
        data: parsed.data,
      });
    }

    const matches: Record<string, { fileId: string | null; expiryDate: string | null }> = {};
    requirements.forEach((r) => {
      matches[r.id] = { fileId: null, expiryDate: null };
    });

    const suggestions = findAutoMatches(requirements, uploadedFiles, matches, deadline);

    // Apply suggestions
    suggestions.forEach((s) => {
      matches[s.requirementId] = { fileId: s.fileId, expiryDate: null };
    });

    // Check key requirements:
    // R01: Trade License should select 2026, NOT the expired 2025 license!
    expect(matches['R01']?.fileId).toBe('file_trade_license_2026.pdf');

    // R02: TIN
    expect(matches['R02']?.fileId).toBe('file_03_tin_certificate.pdf');

    // R03: VAT
    expect(matches['R03']?.fileId).toBe('file_04_vat_certificate.pdf');

    // R04: Bank Solvency
    expect(matches['R04']?.fileId).toBe('file_bank_solvency.pdf');

    // R05: Experience Certificate (should match the non-duplicate experience certificate)
    const matchedExp = uploadedFiles.find((f) => f.id === matches['R05']?.fileId);
    expect(matchedExp?.name).toMatch(/^experience_cert/);
    expect(matchedExp?.isDuplicate).toBe(false);

    // R08: Technical Proposal
    expect(matches['R08']?.fileId).toBe('file_02_technical_proposal.pdf');

    // R09: Financial Proposal
    expect(matches['R09']?.fileId).toBe('file_01_financial_proposal.pdf');

    // R10: Signed Tender Submission Declaration -> scan_0042.pdf matched via heuristic/residual!
    expect(matches['R10']?.fileId).toBe('file_scan_0042.pdf');

    // R06 & R07 are optional and not provided
    expect(matches['R06']?.fileId).toBeNull();
    expect(matches['R07']?.fileId).toBeNull();

    // Map files
    const fileMap = new Map<string, UploadedFile>();
    uploadedFiles.forEach((f) => fileMap.set(f.id, f));

    // Verify blocking status before expiry dates are entered:
    const initialEligibility = evaluatePackageEligibility(requirements, matches, fileMap, deadline);
    expect(initialEligibility.canGenerate).toBe(false);
    expect(initialEligibility.blockingReasons).toHaveLength(2);
    expect(initialEligibility.blockingReasons.map((b) => b.requirementId)).toEqual(['R01', 'R04']);

    // If an expired date is entered for Trade License (2025-06-30):
    matches['R01'].expiryDate = '2025-06-30';
    const expiredStatus = getDocumentStatus(
      requirements.find((r) => r.id === 'R01')!,
      fileMap.get('file_trade_license_2026.pdf'),
      '2025-06-30',
      deadline
    );
    expect(expiredStatus).toBe('expired');

    // Now enter valid expiry dates from the actual certificates:
    // Trade license valid until 2027-06-30
    matches['R01'].expiryDate = '2027-06-30';
    // Bank solvency valid until 2026-12-31
    matches['R04'].expiryDate = '2026-12-31';

    const finalEligibility = evaluatePackageEligibility(requirements, matches, fileMap, deadline);
    expect(finalEligibility.canGenerate).toBe(true);
    expect(finalEligibility.blockingReasons).toHaveLength(0);
    expect(finalEligibility.totalOk).toBe(8);

    // 4. Generate final compilation package
    const packageResult = await generateTenderPackage(
      data!.tender,
      requirements,
      matches,
      fileMap,
      { includeIndexPage: true }
    );

    expect(packageResult.pdfBytes).toBeDefined();
    expect(packageResult.pdfBytes.length).toBeGreaterThan(1000);
    expect(packageResult.fileName).toBe('T-2026-0417_Package.pdf');
    expect(packageResult.includedDocuments).toHaveLength(8);
  });
});
