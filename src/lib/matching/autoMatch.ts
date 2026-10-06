import { Requirement, UploadedFile } from '../../types';

export interface AutoMatchSuggestion {
  requirementId: string;
  fileId: string;
  confidence: number;
}

function cleanTokens(str: string): string[] {
  return str
    .toLowerCase()
    .replace(/\.pdf$/i, '')
    .replace(/[^a-z0-9\u0980-\u09FF]+/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

/**
 * Computes heuristic similarity between requirement titles and uploaded filename,
 * taking into account keywords, requirement IDs, document scan indicators, and year comparison.
 */
export function calculateMatchScore(
  req: Requirement,
  file: UploadedFile,
  submissionDeadline?: string
): number {
  const fileTokens = cleanTokens(file.name);
  const reqEnTokens = cleanTokens(req.title_en);
  const reqBnTokens = cleanTokens(req.title_bn);

  let enMatches = 0;
  for (const token of fileTokens) {
    if (reqEnTokens.includes(token)) enMatches += 2;
    else if (reqEnTokens.some((t) => t.includes(token) || token.includes(t))) enMatches += 1;
  }

  let bnMatches = 0;
  for (const token of fileTokens) {
    if (reqBnTokens.includes(token)) bnMatches += 2;
  }

  let baseScore = Math.max(enMatches, bnMatches);

  const nameLower = file.name.toLowerCase();
  const reqEnLower = req.title_en.toLowerCase();

  // Exact requirement ID matching (e.g., "R01", "R02")
  if (req.id && nameLower.includes(req.id.toLowerCase())) {
    baseScore += 6;
  }

  // Common tender document keyword bonuses
  if (nameLower.includes('trade') && reqEnLower.includes('trade')) baseScore += 4;
  if (nameLower.includes('tin') && (reqEnLower.includes('tin') || reqEnLower.includes('tax'))) baseScore += 4;
  if (nameLower.includes('vat') && reqEnLower.includes('vat')) baseScore += 4;
  if (nameLower.includes('solvency') && reqEnLower.includes('solvency')) baseScore += 4;
  if (nameLower.includes('experience') && reqEnLower.includes('experience')) baseScore += 4;
  if (nameLower.includes('technical') && reqEnLower.includes('technical')) baseScore += 4;
  if (nameLower.includes('financial') && reqEnLower.includes('financial')) baseScore += 4;
  if (
    (nameLower.includes('maf') || nameLower.includes('authorization')) &&
    (reqEnLower.includes('authorization') || reqEnLower.includes('manufacturer'))
  ) {
    baseScore += 4;
  }

  // Signed Declaration / Undertaking heuristics
  const isDeclarationReq =
    reqEnLower.includes('declaration') ||
    reqEnLower.includes('signed') ||
    reqEnLower.includes('undertaking') ||
    reqEnLower.includes('affidavit');

  if (isDeclarationReq) {
    if (
      nameLower.includes('declaration') ||
      nameLower.includes('signed') ||
      nameLower.includes('undertaking') ||
      nameLower.includes('affidavit')
    ) {
      baseScore += 6;
    } else if (nameLower.startsWith('scan') || nameLower.includes('scanned') || nameLower.includes('scan_')) {
      // Scanned files in tenders are frequently signed declarations/undertakings
      baseScore += 3;
    }
  }

  // Year-Awareness: Compare years in filename (e.g. 2025 vs 2026) against submission deadline year
  const yearMatches = Array.from(file.name.matchAll(/(?:^|[^0-9])(20\d{2})(?:[^0-9]|$)/g)).map((m) => m[1]);
  if (yearMatches && yearMatches.length > 0) {
    const fileYear = parseInt(yearMatches[yearMatches.length - 1], 10);
    let deadlineYear: number | null = null;

    if (submissionDeadline) {
      const parsedYear = parseInt(submissionDeadline.substring(0, 4), 10);
      if (!isNaN(parsedYear)) deadlineYear = parsedYear;
    }

    if (deadlineYear !== null) {
      if (fileYear >= deadlineYear) {
        // Document year is current or future relative to tender deadline -> High priority
        baseScore += 6;
      } else {
        // Document year is older than tender deadline -> Penalize to prefer current year document
        baseScore -= 4;
      }
    }
  }

  return Math.max(0, baseScore);
}

/**
 * Suggests best 1-to-1 matches while strictly respecting:
 * 1. One file matched to at most one requirement
 * 2. One requirement matched to at most one file
 * 3. Duplicate files cannot be assigned to different requirements
 */
export function findAutoMatches(
  requirements: Requirement[],
  uploadedFiles: UploadedFile[],
  currentMatches: Record<string, { fileId: string | null; expiryDate: string | null }>,
  submissionDeadline?: string
): AutoMatchSuggestion[] {
  const suggestions: AutoMatchSuggestion[] = [];
  const assignedFileIds = new Set<string>();
  const assignedHashes = new Set<string>();

  // Mark already matched files
  Object.values(currentMatches).forEach((m) => {
    if (m?.fileId) {
      assignedFileIds.add(m.fileId);
      const f = uploadedFiles.find((file) => file.id === m.fileId);
      if (f) assignedHashes.add(f.hash);
    }
  });

  // Calculate scores for all pairs of (unmatched requirement, available valid file)
  const candidates: Array<{
    reqId: string;
    file: UploadedFile;
    score: number;
  }> = [];

  for (const req of requirements) {
    // If requirement already has a match, skip
    if (currentMatches[req.id]?.fileId) continue;

    for (const file of uploadedFiles) {
      if (!file.isValidPdf) continue;
      if (assignedFileIds.has(file.id)) continue;
      if (assignedHashes.has(file.hash)) continue; // Don't assign duplicate of already used file

      const score = calculateMatchScore(req, file, submissionDeadline);
      if (score >= 2) {
        candidates.push({ reqId: req.id, file, score });
      }
    }
  }

  // Sort candidate pairs by score descending
  candidates.sort((a, b) => b.score - a.score);

  const matchedReqs = new Set<string>();

  for (const cand of candidates) {
    if (matchedReqs.has(cand.reqId)) continue;
    if (assignedFileIds.has(cand.file.id)) continue;
    if (assignedHashes.has(cand.file.hash)) continue;

    suggestions.push({
      requirementId: cand.reqId,
      fileId: cand.file.id,
      confidence: cand.score,
    });

    matchedReqs.add(cand.reqId);
    assignedFileIds.add(cand.file.id);
    assignedHashes.add(cand.file.hash);
  }

  // Residual Matching Pass:
  // If exactly 1 unmatched mandatory requirement remains, and exactly 1 unassigned valid non-duplicate file remains,
  // suggest that remaining file so arbitrary filenames (e.g. scan_0042.pdf) are naturally completed.
  const remainingUnmatchedMandatory = requirements.filter(
    (req) => req.mandatory && !currentMatches[req.id]?.fileId && !matchedReqs.has(req.id)
  );
  const remainingAvailableFiles = uploadedFiles.filter(
    (file) =>
      file.isValidPdf &&
      !file.isDuplicate &&
      !assignedFileIds.has(file.id) &&
      !assignedHashes.has(file.hash)
  );

  if (remainingUnmatchedMandatory.length === 1 && remainingAvailableFiles.length === 1) {
    const lastReq = remainingUnmatchedMandatory[0];
    const lastFile = remainingAvailableFiles[0];

    suggestions.push({
      requirementId: lastReq.id,
      fileId: lastFile.id,
      confidence: 2,
    });

    matchedReqs.add(lastReq.id);
    assignedFileIds.add(lastFile.id);
    assignedHashes.add(lastFile.hash);
  }

  return suggestions;
}
