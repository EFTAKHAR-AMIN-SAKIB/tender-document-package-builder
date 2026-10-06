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
 * Computes heuristic similarity between requirement titles and uploaded filename.
 */
export function calculateMatchScore(req: Requirement, file: UploadedFile): number {
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

  // Common keyword bonuses
  const nameLower = file.name.toLowerCase();
  if (req.id.toLowerCase() && nameLower.includes(req.id.toLowerCase())) enMatches += 5;
  if (nameLower.includes('trade') && req.title_en.toLowerCase().includes('trade')) enMatches += 3;
  if (nameLower.includes('tin') && req.title_en.toLowerCase().includes('tin')) enMatches += 3;
  if (nameLower.includes('vat') && req.title_en.toLowerCase().includes('vat')) enMatches += 3;
  if (nameLower.includes('solvency') && req.title_en.toLowerCase().includes('solvency')) enMatches += 3;
  if (nameLower.includes('maf') && req.title_en.toLowerCase().includes('authorization')) enMatches += 3;

  return Math.max(enMatches, bnMatches);
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
  currentMatches: Record<string, { fileId: string | null; expiryDate: string | null }>
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

      const score = calculateMatchScore(req, file);
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

  return suggestions;
}
