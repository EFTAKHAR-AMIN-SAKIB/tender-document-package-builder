import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface GeneratedSampleFile {
  file: File;
  title: string;
}

/**
 * Creates realistic sample test PDFs directly in the browser to facilitate
 * testing, demonstration, and evaluation by judges.
 */
export async function createSamplePdfFiles(): Promise<File[]> {
  const files: File[] = [];

  // Helper to safely convert Uint8Array to File
  const createPdfFile = (bytes: Uint8Array, name: string) => {
    const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    return new File([arrayBuffer], name, { type: 'application/pdf' });
  };

  // 1. Trade License PDF (1 page)
  const doc1 = await PDFDocument.create();
  const font1 = await doc1.embedFont(StandardFonts.HelveticaBold);
  const regular1 = await doc1.embedFont(StandardFonts.Helvetica);
  const page1 = doc1.addPage([595.28, 841.89]);

  page1.drawText('GOVERNMENT OF THE PEOPLE\'S REPUBLIC', { x: 120, y: 780, size: 14, font: font1, color: rgb(0.1, 0.4, 0.2) });
  page1.drawText('CITY CORPORATION - TRADE LICENSE 2026', { x: 130, y: 750, size: 16, font: font1, color: rgb(0.1, 0.2, 0.5) });
  page1.drawText('License No: TL-DHAKA-2026-998812', { x: 60, y: 690, size: 11, font: regular1, color: rgb(0.2, 0.2, 0.2) });
  page1.drawText('Business Name: Example Company Ltd.', { x: 60, y: 660, size: 11, font: regular1, color: rgb(0.2, 0.2, 0.2) });
  page1.drawText('Nature of Business: IT & Telecommunications Equipment Supply', { x: 60, y: 630, size: 11, font: regular1, color: rgb(0.2, 0.2, 0.2) });
  page1.drawText('Valid Till: 2026-12-31', { x: 60, y: 600, size: 11, font: font1, color: rgb(0.1, 0.5, 0.2) });
  const doc1Bytes = await doc1.save();
  files.push(createPdfFile(doc1Bytes, 'Trade_License_2026.pdf'));

  // 2. Exact Duplicate of doc1 with different filename: Trade_License_Scan_Backup.pdf
  // This enables testing the mandatory SHA-256 duplicate content detection!
  files.push(createPdfFile(doc1Bytes, 'Trade_License_Scan_Backup.pdf'));

  // 3. Tax Identification Number (TIN) Certificate (1 page)
  const doc3 = await PDFDocument.create();
  const font3 = await doc3.embedFont(StandardFonts.HelveticaBold);
  const regular3 = await doc3.embedFont(StandardFonts.Helvetica);
  const page3 = doc3.addPage([595.28, 841.89]);

  page3.drawText('NATIONAL BOARD OF REVENUE', { x: 180, y: 780, size: 14, font: font3, color: rgb(0.6, 0.2, 0.1) });
  page3.drawText('ELECTRONIC TAX IDENTIFICATION NUMBER (e-TIN) CERTIFICATE', { x: 80, y: 750, size: 13, font: font3, color: rgb(0.1, 0.1, 0.1) });
  page3.drawText('TIN: 8492-0192-3841', { x: 60, y: 690, size: 11, font: regular3, color: rgb(0.2, 0.2, 0.2) });
  page3.drawText('Taxpayer Name: Example Company Ltd.', { x: 60, y: 660, size: 11, font: regular3, color: rgb(0.2, 0.2, 0.2) });
  page3.drawText('Taxes Zone: Zone-04, Dhaka', { x: 60, y: 630, size: 11, font: regular3, color: rgb(0.2, 0.2, 0.2) });
  page3.drawText('Status: Active & Registered', { x: 60, y: 600, size: 11, font: font3, color: rgb(0.2, 0.5, 0.2) });
  const doc3Bytes = await doc3.save();
  files.push(createPdfFile(doc3Bytes, 'TIN_Certificate_ExampleCo.pdf'));

  // 4. VAT Registration Certificate (BIN) (1 page)
  const doc4 = await PDFDocument.create();
  const font4 = await doc4.embedFont(StandardFonts.HelveticaBold);
  const regular4 = await doc4.embedFont(StandardFonts.Helvetica);
  const page4 = doc4.addPage([595.28, 841.89]);

  page4.drawText('CUSTOMS, EXCISE AND VAT COMMISSIONERATE', { x: 110, y: 780, size: 13, font: font4, color: rgb(0.1, 0.2, 0.4) });
  page4.drawText('CENTRAL VALUE ADDED TAX (VAT) REGISTRATION', { x: 100, y: 750, size: 14, font: font4, color: rgb(0.1, 0.1, 0.1) });
  page4.drawText('Business Identification Number (BIN): 001294857-0101', { x: 60, y: 690, size: 11, font: font4, color: rgb(0.2, 0.2, 0.2) });
  page4.drawText('Entity: Example Company Ltd.', { x: 60, y: 660, size: 11, font: regular4, color: rgb(0.2, 0.2, 0.2) });
  page4.drawText('VAT Category: Wholesaler / Importer / Supplier', { x: 60, y: 630, size: 11, font: regular4, color: rgb(0.2, 0.2, 0.2) });
  const doc4Bytes = await doc4.save();
  files.push(createPdfFile(doc4Bytes, 'VAT_BIN_Registration.pdf'));

  // 5. Bank Solvency Certificate (Multi-page: 2 pages!)
  const doc5 = await PDFDocument.create();
  const font5 = await doc5.embedFont(StandardFonts.HelveticaBold);
  const regular5 = await doc5.embedFont(StandardFonts.Helvetica);

  const p5_1 = doc5.addPage([595.28, 841.89]);
  p5_1.drawText('NATIONAL COMMERCIAL BANK PLC', { x: 160, y: 780, size: 14, font: font5, color: rgb(0.1, 0.3, 0.5) });
  p5_1.drawText('CONFIDENTIAL BANK SOLVENCY & CREDIT RATIO', { x: 120, y: 750, size: 13, font: font5, color: rgb(0.1, 0.1, 0.1) });
  p5_1.drawText('Certificate Ref: NCB/SOLV/2026/0491', { x: 60, y: 690, size: 11, font: regular5, color: rgb(0.2, 0.2, 0.2) });
  p5_1.drawText('Account Holder: Example Company Ltd.', { x: 60, y: 660, size: 11, font: regular5, color: rgb(0.2, 0.2, 0.2) });
  p5_1.drawText('Account Status: Satisfactory & Solvent', { x: 60, y: 630, size: 11, font: font5, color: rgb(0.1, 0.5, 0.2) });
  p5_1.drawText('Date of Issuance: 2026-09-15', { x: 60, y: 600, size: 11, font: regular5, color: rgb(0.2, 0.2, 0.2) });
  p5_1.drawText('[Continued on next page for credit facility details...]', { x: 60, y: 550, size: 10, font: regular5, color: rgb(0.5, 0.5, 0.5) });

  const p5_2 = doc5.addPage([595.28, 841.89]);
  p5_2.drawText('NATIONAL COMMERCIAL BANK PLC (Page 2)', { x: 160, y: 780, size: 12, font: font5, color: rgb(0.1, 0.3, 0.5) });
  p5_2.drawText('Approved Credit Lines & Liquidity Assessment', { x: 60, y: 730, size: 12, font: regular5, color: rgb(0.2, 0.2, 0.2) });
  p5_2.drawText('Liquid Assets Balance: BDT 50,000,000 (Fifty Million Taka)', { x: 60, y: 690, size: 11, font: regular5, color: rgb(0.2, 0.2, 0.2) });
  p5_2.drawText('Validity Period: Valid until 2026-11-30', { x: 60, y: 660, size: 11, font: font5, color: rgb(0.1, 0.5, 0.2) });
  const doc5Bytes = await doc5.save();
  files.push(createPdfFile(doc5Bytes, 'Bank_Solvency_Letter.pdf'));

  // 6. Manufacturer Authorization Letter (MAF) (1 page)
  const doc6 = await PDFDocument.create();
  const font6 = await doc6.embedFont(StandardFonts.HelveticaBold);
  const regular6 = await doc6.embedFont(StandardFonts.Helvetica);

  const page6 = doc6.addPage([595.28, 841.89]);
  page6.drawText('GLOBAL TECH HARDWARE CORP - OEM AUTHORIZATION', { x: 90, y: 780, size: 13, font: font6, color: rgb(0.2, 0.2, 0.6) });
  page6.drawText('Manufacturer Authorization Form (MAF)', { x: 150, y: 750, size: 14, font: font6, color: rgb(0.1, 0.1, 0.1) });
  page6.drawText('Authorized Partner: Example Company Ltd.', { x: 60, y: 690, size: 11, font: font6, color: rgb(0.2, 0.2, 0.2) });
  page6.drawText('Target Tender: T-2026-0417 - Supply of IT Equipment', { x: 60, y: 660, size: 11, font: regular6, color: rgb(0.2, 0.2, 0.2) });
  page6.drawText('Authorization Valid Until: 2026-12-31', { x: 60, y: 630, size: 11, font: regular6, color: rgb(0.2, 0.2, 0.2) });
  const doc6Bytes = await doc6.save();
  files.push(createPdfFile(doc6Bytes, 'Manufacturer_Authorization_MAF.pdf'));

  return files;
}
