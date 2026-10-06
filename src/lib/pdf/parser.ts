import { PDFDocument } from 'pdf-lib';
import { computeSHA256 } from '../hashing/sha256';

export interface ParsedPdfResult {
  isValid: boolean;
  pageCount: number;
  hash: string;
  data: Uint8Array;
  error?: string;
}

/**
 * Checks if the binary buffer starts with the PDF magic bytes "%PDF-"
 */
export function hasPdfMagicBytes(bytes: Uint8Array): boolean {
  if (bytes.length < 5) return false;
  // "%PDF-" in ASCII is [0x25, 0x50, 0x44, 0x46, 0x2D]
  return (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  );
}

/**
 * Parses an uploaded PDF file, validates format, counts pages, and computes SHA-256 hash.
 */
export async function parsePdfFile(file: File): Promise<ParsedPdfResult> {
  let arrayBuffer: ArrayBuffer;
  try {
    arrayBuffer = await file.arrayBuffer();
  } catch (err: any) {
    return {
      isValid: false,
      pageCount: 0,
      hash: '',
      data: new Uint8Array(),
      error: `Failed to read file contents: ${err?.message || 'Unknown I/O error'}`,
    };
  }

  const uint8 = new Uint8Array(arrayBuffer);

  // Magic bytes check
  if (!hasPdfMagicBytes(uint8)) {
    return {
      isValid: false,
      pageCount: 0,
      hash: '',
      data: uint8,
      error: 'Invalid file format: File does not have standard PDF header signatures.',
    };
  }

  // Compute SHA-256 hash
  let hash = '';
  try {
    hash = await computeSHA256(uint8);
  } catch (err: any) {
    return {
      isValid: false,
      pageCount: 0,
      hash: '',
      data: uint8,
      error: `Failed to compute file hash: ${err?.message || 'Hash error'}`,
    };
  }

  // Load PDF and verify it can be read
  try {
    const pdfDoc = await PDFDocument.load(uint8, {
      ignoreEncryption: false,
    });
    const pageCount = pdfDoc.getPageCount();

    if (pageCount < 1) {
      return {
        isValid: false,
        pageCount: 0,
        hash,
        data: uint8,
        error: 'PDF contains no pages.',
      };
    }

    return {
      isValid: true,
      pageCount,
      hash,
      data: uint8,
    };
  } catch (err: any) {
    const msg = (err?.message || '').toLowerCase();
    if (msg.includes('encrypt') || msg.includes('password') || msg.includes('decrypt')) {
      return {
        isValid: false,
        pageCount: 0,
        hash,
        data: uint8,
        error: 'This PDF is password-protected or encrypted. Please provide an unencrypted PDF.',
      };
    }

    return {
      isValid: false,
      pageCount: 0,
      hash,
      data: uint8,
      error: `Could not parse PDF: ${err?.message || 'Corrupted or unsupported PDF format'}.`,
    };
  }
}
