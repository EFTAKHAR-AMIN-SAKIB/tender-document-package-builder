export const en = {
  // App
  appName: 'Tender Document Package Builder',
  appSubtitle: 'Official Tender Dossier Compiler & Verification Engine',
  tagline: 'Client-side verification and compilation for tender submissions',

  // Language
  language: 'Language',
  english: 'English',
  bangla: 'বাংলা',

  // Steps / Workflow
  step1: '1. Load Requirements',
  step2: '2. Upload PDFs',
  step3: '3. Match Documents',
  step4: '4. Generate Package',

  // Tender Info Card
  tenderDetails: 'Tender Information',
  tenderId: 'Tender ID',
  tenderTitle: 'Tender Title',
  procuringEntity: 'Procuring Entity',
  bidder: 'Bidder Name',
  submissionDeadline: 'Submission Deadline',
  loadSampleTender: 'Load Sample Tender Pack',
  reloadRequirements: 'Change Requirements',

  // Requirements Loader
  loadRequirementsTitle: 'Load Requirements File',
  loadRequirementsDesc: 'Upload the official requirements.json provided by the procuring entity.',
  dragDropJson: 'Drag & drop requirements.json here, or browse files',
  clickToBrowse: 'Browse Computer',
  orUseSample: 'Or quickly test with preloaded sample requirements:',
  loadSample1: 'Standard IT Equipment Tender (6 Docs)',
  loadSample2: 'Infrastructure Works Tender (8 Docs)',
  jsonErrorTitle: 'Requirements File Error',

  // Upload Zone
  uploadPdfsTitle: 'Upload Tender Document PDFs',
  uploadPdfsDesc: 'Select up to 30 PDF files (maximum 50 MB total). All processing occurs securely in your browser.',
  dragDropPdfs: 'Drag & drop PDF files here, or click to upload',
  uploadLimitNotice: 'PDF files only • Up to 30 files • Max 50 MB total',
  totalFiles: 'Total Files',
  totalSize: 'Total Size',
  clearAllFiles: 'Remove All Files',

  // Uploaded Files List
  uploadedFilesTitle: 'Uploaded Documents Pool',
  noFilesUploaded: 'No PDF files uploaded yet. Upload files to begin matching.',
  pages: 'page(s)',
  duplicateBadge: 'Duplicate File',
  duplicateNotice: 'Duplicate content detected (identical to {name}). Files with identical content cannot be assigned to different documents.',
  corruptedFile: 'Unusable PDF',
  removeFile: 'Remove',
  matchedTo: 'Matched to',
  unmatched: 'Unassigned',

  // Matching Table
  documentChecklist: 'Document Verification & Matching Checklist',
  matchingDesc: 'Assign uploaded PDFs to each requirement. Requirements are sorted in the exact submission order.',
  colOrder: '#',
  colRequirement: 'Document Requirement',
  colType: 'Type',
  colMatchedFile: 'Matched File',
  colExpiryDate: 'Expiry Date',
  colStatus: 'Status',
  colActions: 'Actions',
  mandatory: 'Mandatory',
  optional: 'Optional',
  expiryRequired: 'Expiry Check Required',
  noExpiryNeeded: 'No Expiry Needed',
  selectFilePlaceholder: '— Select uploaded PDF —',
  unassignFile: 'Clear Match',
  enterExpiryDate: 'Enter Expiry Date',
  expiryDeadlineNotice: 'Must be valid on or after deadline ({date})',
  autoMatchBtn: 'Smart Auto-Match',
  autoMatchApplied: 'Auto-matched {count} document(s) based on file names.',
  clearAllMatches: 'Clear All Matches',

  // Statuses
  status_missing: 'Missing',
  status_missing_desc: 'Mandatory document has not been matched.',
  status_expiry_needed: 'Expiry Date Needed',
  status_expiry_needed_desc: 'Expiry date is required for this document.',
  status_expired: 'Expired',
  status_expired_desc: 'Document expires before the submission deadline.',
  status_not_provided: 'Not Provided',
  status_not_provided_desc: 'Optional document omitted from package.',
  status_ok: 'OK / Verified',
  status_ok_desc: 'Document verified and ready.',

  // Package Generation
  generateSectionTitle: 'Final Package Generation',
  generateBtn: 'Generate Tender Package PDF',
  generatingBtn: 'Compiling PDF Package...',
  downloadBtn: 'Download Package ({fileName})',
  blockedTitle: 'Package Generation Blocked',
  blockedDesc: 'The following required document issues must be resolved before the final submission package can be generated:',
  readyToGenerate: 'All mandatory documents and expiry dates have been verified! Ready to compile the final package.',
  includeIndexPage: 'Include Table of Contents / Index Page (Bonus)',
  exportChecklistCsv: 'Export Checklist as CSV',
  exportChecklistExcel: 'Export Checklist',
  saveSession: 'Save Workspace',
  loadSession: 'Restore Workspace',

  // Success Modal / Screen
  packageReadyTitle: 'Tender Package Compiled Successfully!',
  packageReadyDesc: 'Your submission dossier has been assembled in strict compliance with the tender requirements.',
  summaryTotalPages: 'Total Pages in Dossier',
  summaryIncludedDocs: 'Included Documents',
  summaryFilename: 'Output File Name',
  coverPageNotice: 'Page 1 contains the official English cover page with metadata and document schedule. Page numbers and tender headers have been stamped on every page.',
  downloadNow: 'Download PDF Package',

  // Errors & Warnings
  fileLimitExceeded: 'File limit reached: Maximum 30 files allowed.',
  sizeLimitExceeded: 'Total upload size limit exceeded: Maximum 50 MB allowed.',
  invalidFileExtension: 'Rejected non-PDF file: {name}. Only valid PDF documents are accepted.',
  duplicateAssignmentBlocked: 'Duplicate files with identical content cannot be matched to different requirements.',
  fileAlreadyAssigned: 'This file is already matched to another requirement.',
  errorProcessingFile: 'Error processing file {name}: {reason}',

  // Footer & Help
  browserPrivacyNotice: '100% Client-Side Processing • Your documents never leave your browser',
  helpTitle: 'Need Assistance?',
  helpWorkflow: '1. Load tender requirements JSON → 2. Upload PDFs → 3. Match documents → 4. Enter expiry dates → 5. Generate & Download PDF.',
};
