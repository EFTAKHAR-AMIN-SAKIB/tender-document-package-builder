import fs from 'fs';
import path from 'path';
import { parseAndValidateRequirements } from '../src/lib/validation/requirements';
import { sampleRequirementsJson1 } from '../src/sampleData/sampleRequirements';
import { createSamplePdfFiles } from '../src/sampleData/samplePdfGenerator';
import { parsePdfFile } from '../src/lib/pdf/parser';
import { generateTenderPackage } from '../src/lib/pdf/generator';
import { UploadedFile } from '../src/types';

async function run() {
  console.log('Generating official sample output package...');

  const parseResult = parseAndValidateRequirements(sampleRequirementsJson1);
  if (!parseResult.valid || !parseResult.data) {
    throw new Error('Failed to parse sample requirements: ' + parseResult.error);
  }

  const { tender, requirements } = parseResult.data;
  const samplePdfs = await createSamplePdfFiles();

  const uploadedFiles: UploadedFile[] = [];
  for (const f of samplePdfs) {
    const parsed = await parsePdfFile(f);
    uploadedFiles.push({
      id: `file_${f.name}`,
      file: f,
      name: f.name,
      size: f.size,
      pages: parsed.pageCount,
      hash: parsed.hash,
      isDuplicate: false,
      isValidPdf: parsed.isValid,
      data: parsed.data,
    });
  }

  const fileMap = new Map<string, UploadedFile>();
  uploadedFiles.forEach((f) => fileMap.set(f.id, f));

  // Match resolved items:
  // R01 -> Trade_License_2026.pdf (valid expiry 2026-12-31)
  // R02 -> TIN_Certificate_ExampleCo.pdf
  // R03 -> VAT_BIN_Registration.pdf
  // R04 -> Bank_Solvency_Letter.pdf (valid expiry 2026-11-30)
  // R05 -> Manufacturer_Authorization_MAF.pdf (optional, included, valid expiry 2026-12-31)
  // R06 -> optional, omitted

  const matches: Record<string, { fileId: string | null; expiryDate: string | null }> = {
    R01: { fileId: 'file_Trade_License_2026.pdf', expiryDate: '2026-12-31' },
    R02: { fileId: 'file_TIN_Certificate_ExampleCo.pdf', expiryDate: null },
    R03: { fileId: 'file_VAT_BIN_Registration.pdf', expiryDate: null },
    R04: { fileId: 'file_Bank_Solvency_Letter.pdf', expiryDate: '2026-11-30' },
    R05: { fileId: 'file_Manufacturer_Authorization_MAF.pdf', expiryDate: '2026-12-31' },
    R06: { fileId: null, expiryDate: null },
  };

  const packageResult = await generateTenderPackage(tender, requirements, matches, fileMap, {
    includeIndexPage: true,
  });

  const outputDir = path.resolve(process.cwd(), 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, packageResult.fileName);
  fs.writeFileSync(outputPath, Buffer.from(packageResult.pdfBytes));

  console.log(`Successfully generated: ${outputPath}`);
  console.log(`Total Pages: ${packageResult.totalPages}`);
  console.log(`Included Documents: ${packageResult.includedDocuments.length}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
