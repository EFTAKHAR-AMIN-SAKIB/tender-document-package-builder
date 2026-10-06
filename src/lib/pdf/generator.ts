import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Tender, Requirement, UploadedFile, PackageGenerationOptions, IncludedDocumentInfo } from '../../types';

export interface GeneratePackageResult {
  pdfBytes: Uint8Array;
  totalPages: number;
  includedDocuments: IncludedDocumentInfo[];
  fileName: string;
}

/**
 * Builds the complete, verified tender submission PDF package.
 */
export async function generateTenderPackage(
  tender: Tender,
  requirements: Requirement[],
  matches: Record<string, { fileId: string | null; expiryDate: string | null }>,
  uploadedFilesMap: Map<string, UploadedFile>,
  options: PackageGenerationOptions = {}
): Promise<GeneratePackageResult> {
  const mergedPdf = await PDFDocument.create();
  const helvetica = await mergedPdf.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await mergedPdf.embedFont(StandardFonts.HelveticaBold);

  // 1. Determine which documents to include (sorted strictly by requirement.order)
  const sortedReqs = [...requirements].sort((a, b) => a.order - b.order);
  const itemsToInclude: Array<{
    req: Requirement;
    file: UploadedFile;
  }> = [];

  for (const req of sortedReqs) {
    const match = matches[req.id];
    if (match && match.fileId) {
      const file = uploadedFilesMap.get(match.fileId);
      if (file && file.isValidPdf) {
        itemsToInclude.push({ req, file });
      }
    }
  }

  // Pre-calculate page counts to determine accurate starting page numbers
  // Page 1 is always the Cover Page.
  const hasIndexPage = Boolean(options.includeIndexPage);
  let currentPageCounter = 1 + (hasIndexPage ? 1 : 0); // After cover (and index if present)

  const includedDocsInfo: IncludedDocumentInfo[] = [];

  for (const item of itemsToInclude) {
    const startPage = currentPageCounter + 1;
    includedDocsInfo.push({
      order: item.req.order,
      requirementId: item.req.id,
      titleEn: item.req.title_en,
      titleBn: item.req.title_bn,
      fileName: item.file.name,
      pageCount: item.file.pages,
      startPage,
    });
    currentPageCounter += item.file.pages;
  }

  // PAGE 1: COVER PAGE (English)
  const coverPage = mergedPdf.addPage([595.28, 841.89]); // A4 portrait in points (210mm x 297mm)
  const { width: coverWidth, height: coverHeight } = coverPage.getSize();

  // Draw header banner
  coverPage.drawRectangle({
    x: 40,
    y: coverHeight - 110,
    width: coverWidth - 80,
    height: 70,
    color: rgb(0.08, 0.2, 0.4), // Professional Navy Blue
  });

  coverPage.drawText('TENDER SUBMISSION PACKAGE', {
    x: 60,
    y: coverHeight - 75,
    size: 20,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });

  coverPage.drawText('OFFICIAL TENDER DOCUMENT DOSSIER', {
    x: 60,
    y: coverHeight - 95,
    size: 9,
    font: helvetica,
    color: rgb(0.85, 0.9, 1),
  });

  // Tender Metadata Grid
  const metaStartY = coverHeight - 140;
  const metaLineHeight = 22;
  const labelX = 50;
  const valueX = 190;

  const metadata = [
    { label: 'Tender ID:', value: tender.tender_id },
    { label: 'Tender Title:', value: tender.title },
    { label: 'Procuring Entity:', value: tender.procuring_entity },
    { label: 'Bidder Name:', value: tender.bidder },
    { label: 'Submission Deadline:', value: tender.submission_deadline },
    { label: 'Package Created:', value: new Date().toISOString().split('T')[0] },
    { label: 'Total Documents:', value: `${includedDocsInfo.length} document(s)` },
  ];

  metadata.forEach((item, index) => {
    const currentY = metaStartY - index * metaLineHeight;

    // Subtle alternating row background
    if (index % 2 === 0) {
      coverPage.drawRectangle({
        x: 45,
        y: currentY - 5,
        width: coverWidth - 90,
        height: metaLineHeight,
        color: rgb(0.96, 0.97, 0.99),
      });
    }

    coverPage.drawText(item.label, {
      x: labelX,
      y: currentY,
      size: 10,
      font: helveticaBold,
      color: rgb(0.2, 0.25, 0.35),
    });

    // Truncate long value if needed
    const valText = item.value.length > 55 ? item.value.substring(0, 52) + '...' : item.value;
    coverPage.drawText(valText, {
      x: valueX,
      y: currentY,
      size: 10,
      font: helvetica,
      color: rgb(0.1, 0.1, 0.1),
    });
  });

  // Divider line
  const tableStartY = metaStartY - metadata.length * metaLineHeight - 20;
  coverPage.drawLine({
    start: { x: 45, y: tableStartY },
    end: { x: coverWidth - 45, y: tableStartY },
    thickness: 1,
    color: rgb(0.8, 0.85, 0.9),
  });

  // Included Documents Table Header
  coverPage.drawText('INCLUDED DOCUMENTS SCHEDULE', {
    x: 45,
    y: tableStartY - 25,
    size: 13,
    font: helveticaBold,
    color: rgb(0.08, 0.2, 0.4),
  });

  const colOrderX = 50;
  const colTitleX = 90;
  const colFileX = 300;
  const colPagesX = 490;
  const tableHeaderY = tableStartY - 50;

  coverPage.drawRectangle({
    x: 45,
    y: tableHeaderY - 6,
    width: coverWidth - 90,
    height: 22,
    color: rgb(0.9, 0.93, 0.97),
  });

  coverPage.drawText('Order', { x: colOrderX, y: tableHeaderY, size: 9, font: helveticaBold, color: rgb(0.2, 0.3, 0.4) });
  coverPage.drawText('Document Name', { x: colTitleX, y: tableHeaderY, size: 9, font: helveticaBold, color: rgb(0.2, 0.3, 0.4) });
  coverPage.drawText('Source File', { x: colFileX, y: tableHeaderY, size: 9, font: helveticaBold, color: rgb(0.2, 0.3, 0.4) });
  coverPage.drawText('Pages', { x: colPagesX, y: tableHeaderY, size: 9, font: helveticaBold, color: rgb(0.2, 0.3, 0.4) });

  let rowY = tableHeaderY - 24;
  const rowHeight = 20;

  includedDocsInfo.forEach((doc, idx) => {
    // Only render rows that fit comfortably on Page 1
    if (rowY > 60) {
      if (idx % 2 === 1) {
        coverPage.drawRectangle({
          x: 45,
          y: rowY - 4,
          width: coverWidth - 90,
          height: rowHeight,
          color: rgb(0.98, 0.98, 0.99),
        });
      }

      coverPage.drawText(String(doc.order), { x: colOrderX + 5, y: rowY, size: 9, font: helvetica, color: rgb(0.2, 0.2, 0.2) });

      const titleStr = doc.titleEn.length > 32 ? doc.titleEn.substring(0, 30) + '...' : doc.titleEn;
      coverPage.drawText(titleStr, { x: colTitleX, y: rowY, size: 9, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });

      const fileStr = doc.fileName.length > 28 ? doc.fileName.substring(0, 26) + '...' : doc.fileName;
      coverPage.drawText(fileStr, { x: colFileX, y: rowY, size: 8.5, font: helvetica, color: rgb(0.3, 0.3, 0.3) });

      coverPage.drawText(`${doc.pageCount} pg`, { x: colPagesX, y: rowY, size: 9, font: helvetica, color: rgb(0.2, 0.2, 0.2) });

      rowY -= rowHeight;
    }
  });

  // Optional BONUS 1: INDEX PAGE (Table of Contents)
  if (hasIndexPage) {
    const indexPage = mergedPdf.addPage([595.28, 841.89]);
    const { width: idxW, height: idxH } = indexPage.getSize();

    indexPage.drawText('TABLE OF CONTENTS / DOCUMENT INDEX', {
      x: 50,
      y: idxH - 70,
      size: 16,
      font: helveticaBold,
      color: rgb(0.08, 0.2, 0.4),
    });

    indexPage.drawText(`Tender ID: ${tender.tender_id} | ${tender.title}`, {
      x: 50,
      y: idxH - 90,
      size: 10,
      font: helvetica,
      color: rgb(0.4, 0.45, 0.5),
    });

    indexPage.drawLine({
      start: { x: 50, y: idxH - 105 },
      end: { x: idxW - 50, y: idxH - 105 },
      thickness: 1,
      color: rgb(0.85, 0.85, 0.9),
    });

    // Table Header
    const idxHdrY = idxH - 130;
    indexPage.drawRectangle({
      x: 50,
      y: idxHdrY - 6,
      width: idxW - 100,
      height: 22,
      color: rgb(0.92, 0.94, 0.98),
    });

    indexPage.drawText('#', { x: 60, y: idxHdrY, size: 9, font: helveticaBold, color: rgb(0.2, 0.3, 0.4) });
    indexPage.drawText('Document Name', { x: 90, y: idxHdrY, size: 9, font: helveticaBold, color: rgb(0.2, 0.3, 0.4) });
    indexPage.drawText('Total Pages', { x: 380, y: idxHdrY, size: 9, font: helveticaBold, color: rgb(0.2, 0.3, 0.4) });
    indexPage.drawText('Starts at Page', { x: 470, y: idxHdrY, size: 9, font: helveticaBold, color: rgb(0.2, 0.3, 0.4) });

    let idxRowY = idxHdrY - 24;
    includedDocsInfo.forEach((doc, idx) => {
      if (idxRowY > 60) {
        if (idx % 2 === 1) {
          indexPage.drawRectangle({
            x: 50,
            y: idxRowY - 4,
            width: idxW - 100,
            height: 20,
            color: rgb(0.98, 0.98, 0.99),
          });
        }

        indexPage.drawText(String(doc.order), { x: 60, y: idxRowY, size: 9, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
        indexPage.drawText(doc.titleEn, { x: 90, y: idxRowY, size: 9, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });
        indexPage.drawText(`${doc.pageCount} page(s)`, { x: 380, y: idxRowY, size: 9, font: helvetica, color: rgb(0.3, 0.3, 0.3) });
        indexPage.drawText(`Page ${doc.startPage}`, { x: 470, y: idxRowY, size: 9, font: helveticaBold, color: rgb(0.08, 0.2, 0.4) });

        idxRowY -= 22;
      }
    });
  }

  // 2. APPEND DOCUMENT PAGES (Sorted strictly by requirement.order)
  for (const item of itemsToInclude) {
    const srcDoc = await PDFDocument.load(item.file.data);
    const pageIndices = srcDoc.getPageIndices();
    const copiedPages = await mergedPdf.copyPages(srcDoc, pageIndices);

    for (const page of copiedPages) {
      mergedPdf.addPage(page);
    }
  }

  // 3. FOOTER ON EVERY PAGE (Section 6.3 & 6.4)
  // Format: <tender_id> | Page X of Y
  const totalPages = mergedPdf.getPageCount();
  const tenderId = tender.tender_id;

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const page = mergedPdf.getPage(pageIdx);
    const { width: pWidth } = page.getSize();
    const pageNum = pageIdx + 1;
    const footerText = `${tenderId} | Page ${pageNum} of ${totalPages}`;

    const textWidth = helvetica.widthOfTextAtSize(footerText, 9);
    // Center the footer text at the bottom (y = 20) with a subtle protective background
    const footerX = (pWidth - textWidth) / 2;
    const footerY = 20;

    // Small protective pill background so footer is legible on any document content
    page.drawRectangle({
      x: footerX - 6,
      y: footerY - 4,
      width: textWidth + 12,
      height: 16,
      color: rgb(1, 1, 1),
      opacity: 0.88,
    });

    page.drawText(footerText, {
      x: footerX,
      y: footerY,
      size: 9,
      font: helvetica,
      color: rgb(0.2, 0.25, 0.3),
    });
  }

  const pdfBytes = await mergedPdf.save();
  const fileName = `${tender.tender_id}_Package.pdf`;

  return {
    pdfBytes,
    totalPages,
    includedDocuments: includedDocsInfo,
    fileName,
  };
}

/**
 * Triggers a browser download of the generated PDF file.
 */
export function downloadPdf(pdfBytes: Uint8Array, fileName: string): void {
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
