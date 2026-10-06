# AI Prompts & Engineering Directives

> This document archives the exact prompts and engineering directives used to design, build, test, and verify the **TenderPack — Tender Document Package Builder** for the **AI DevFest Hackathon**.

---

## 1st Prompt: Master Build Directive

```markdown
You are the **Lead AI Engineering Agent** responsible for building my final competition submission for the **AI DevFest — Tender Document Package Builder** challenge.

You are not acting as a generic coding assistant.

You are operating as a coordinated team of senior specialists:

1. **Senior Product Architect**
2. **Senior Frontend Engineer**
3. **TypeScript Engineer**
4. **Browser File & Security Engineer**
5. **PDF / Document Processing Engineer**
6. **Business Logic & Validation Engineer**
7. **UX/UI Designer**
8. **Internationalization Engineer**
9. **QA / Test Engineer**
10. **Competition Judge / Final Reviewer**
11. **Performance Engineer**
12. **Git / Deployment Engineer**

Your objective is to produce the **most reliable, polished, judge-ready submission possible within the competition's 90-minute build window**.

Do not build unnecessary features merely to make the project look complex.

**Correctness > reliability > usability > visual polish > bonus features.**

The final application must work correctly with the provided sample pack and must be robust enough to work with a different unseen pack using the same format.

---

# 1. FIRST: UNDERSTAND THE COMPETITION

The application is a **frontend-only web app** for office staff.

The user has:

- `requirements.json`
- multiple PDF documents

The application must help the user:

1. load the tender requirements
2. view tender information
3. upload multiple PDF files
4. count pages
5. match uploaded files to required documents
6. enter expiry dates where required
7. detect duplicate files
8. calculate the exact status of every requirement
9. prevent package generation when blocking problems exist
10. generate one combined PDF
11. preserve the required order and all pages
12. add the required cover
13. add page footers
14. download the final package
15. use the application in English or Bangla

The application must process tender documents **entirely inside the browser**.

Do not upload tender files to any participant-controlled backend, database, cloud storage service, API, or server.

---

# 2. COMPETITION CONSTRAINTS

Treat these as hard constraints.

- Frontend only
- All document processing must happen in the browser
- Input is PDF only
- Maximum 30 uploaded files
- Maximum 50 MB total
- Must work in latest Google Chrome
- Must produce the exact required output PDF
- Must be publicly deployable over HTTPS
- No login should be required for judges
- Main tasks must work before bonus tasks
- Final build/deployment must be ready before T+90
- Git history should satisfy the competition requirement of at least 3 commits and the required timing
- Commit messages should document the change and, where AI is used, include the relevant AI prompt or indicate manual edits

Do not introduce a backend simply because it is convenient.

---

# 3. RECOMMENDED TECHNOLOGY

Choose the fastest reliable frontend architecture appropriate for the existing repository.

Preferred stack unless the repository already dictates otherwise:

- React
- TypeScript
- Vite or the existing frontend framework
- `pdf-lib` for PDF creation/merging/stamping
- `pdfjs-dist` / PDF.js for PDF inspection and page counting
- Browser File APIs
- Web Crypto API for SHA-256 duplicate detection

Avoid unnecessary dependencies.

Do not add a library unless it clearly saves time or improves reliability.

---

# 4. DEVELOPMENT STRATEGY

Work in this order:

## Phase A — Inspect

Before implementing:

1. inspect the existing repository
2. inspect the supplied sample pack
3. inspect `requirements.json`
4. inspect every sample PDF
5. understand the existing project structure
6. identify available dependencies
7. identify the deployment target
8. identify whether any code already exists that can safely be reused

Do not blindly overwrite working code.

---

## Phase B — Design

Create a minimal architecture that separates:

- data models
- business logic
- file processing
- duplicate detection
- PDF generation
- application state
- UI components
- i18n
- testing

The business logic must not be tightly coupled to the UI.

---

# 5. DATA MODEL

Use a clear internal model similar to:

```ts
type Tender = {
  tenderId: string
  title: string
  procuringEntity: string
  bidder: string
  submissionDeadline: string
}

type Requirement = {
  id: string
  order: number
  titleEn: string
  titleBn: string
  mandatory: boolean
  hasExpiry: boolean
}

type UploadedFile = {
  id: string
  file: File
  name: string
  size: number
  pageCount: number
  hash: string
  isDuplicate: boolean
}

type Match = {
  requirementId: string
  fileId?: string
  expiryDate?: string
}

type DocumentStatus =
  | "missing"
  | "expiry_needed"
  | "expired"
  | "not_provided"
  | "ok"
```

You may improve these types if needed, but keep the data model predictable and easy to test.

---

# 6. REQUIREMENTS.JSON

Support the provided requirements format.

The tender object contains:

- tender ID
- title
- procuring entity
- bidder
- submission deadline

Each requirement contains:

- ID
- order
- English title
- Bangla title
- mandatory flag
- expiry flag

Load and validate this data safely.

Sort requirements by `order`.

Do not assume requirements arrive sorted.

Do not hard-code the sample tender.

The judges will provide a different pack.

---

# 7. FILE UPLOAD ENGINE

Implement reliable multi-file upload.

Requirements:

- multiple PDFs at once
- drag-and-drop if practical
- file picker
- reject non-PDF files
- clear error messages
- show file names
- show page count
- allow removing uploaded files
- enforce 30-file limit
- enforce 50 MB total limit
- prevent malformed state
- do not crash when processing a bad PDF

Where possible, validate the file based on actual PDF structure/signature rather than trusting only the filename extension or MIME type.

Use asynchronous processing so the UI remains responsive.

Do not upload files anywhere.

---

# 8. PAGE COUNTING

Every uploaded PDF should have an accurate page count.

Use PDF.js or an equally reliable browser-side PDF parser.

If a PDF cannot be read:

- do not crash
- clearly mark the file as invalid
- explain the problem
- prevent invalid files from entering the package

Gracefully handle:

- corrupted PDF
- password-protected PDF
- unreadable PDF

These are bonus capabilities, but the app must fail safely rather than crash.

---

# 9. DUPLICATE DETECTION

Duplicate detection is based on **exact file content**, not filenames.

For every uploaded PDF:

1. read its bytes
2. compute SHA-256 using the Web Crypto API
3. compare hashes
4. detect files with identical content
5. mark them as duplicates even when their names differ

Example:

```text
license.pdf
license-copy.pdf
```

must be recognized as duplicates if their contents are identical.

Do not allow duplicate files to be matched to different requirements.

The duplicate mechanism must update correctly when files are removed or added.

Make duplicate detection deterministic and testable.

---

# 10. MATCHING ENGINE

Each uploaded file may belong to at most one requirement.

Each requirement may receive at most one file.

Support:

- matching
- changing a match
- undoing a match
- replacing a file
- clearing a match

Prevent invalid many-to-one and one-to-many relationships.

The UI should make the relationship obvious.

Do not rely on filenames being identical to requirement names.

Optional bonus:

If time remains after all mandatory functionality is stable, implement conservative filename-based auto-match suggestions.

Never automatically create a dangerous incorrect match merely because filenames look similar.

---

# 11. EXPIRY DATE ENGINE

For a requirement with:

```ts
hasExpiry === true
```

and an assigned file:

- expiry date must be entered
- no expiry date → `expiry_needed`
- expiry before submission deadline → `expired`
- expiry on submission deadline → `ok`
- expiry after submission deadline → `ok`

Use date-safe logic.

Do not introduce timezone-related errors.

Tender dates are `YYYY-MM-DD`.

Do not compare localized date strings.

---

# 12. STATUS ENGINE

This is one of the most important parts of the entire application.

Every requirement must have exactly one status.

Implement a pure deterministic function such as:

```ts
getDocumentStatus(
  requirement,
  match,
  tender.submissionDeadline
)
```

Rules:

### Missing

Mandatory requirement + no file.

Blocks package.

### Expiry date needed

Requirement requires expiry + file exists + expiry date missing.

Blocks package.

### Expired

Expiry date is before submission deadline.

Blocks package.

### Not provided

Optional requirement + no file.

Does not block package.

### OK

File is matched and:

- expiry is not required, or
- expiry exists and is on/after submission deadline

Does not block package.

Never create additional hidden statuses unless absolutely necessary.

The UI may display helpful secondary information, but every requirement's main status must map to exactly one of the required five statuses.

---

# 13. STATUS MUST UPDATE IMMEDIATELY

After every relevant change, recompute affected status immediately.

Examples:

- matching a file
- removing a file
- changing a match
- entering expiry
- changing expiry
- removing expiry
- loading requirements

There should be no manual "refresh status" operation.

The UI should always reflect the current state.

---

# 14. MAIN UX

Design for:

> an office worker with no technical skills

The interface should be immediately understandable.

Suggested workflow:

```text
STEP 1
Tender information

STEP 2
Upload PDFs

STEP 3
Match documents

STEP 4
Resolve issues

STEP 5
Generate package

STEP 6
Download
```

Use clear visual hierarchy.

Make the current problem obvious.

Avoid overly technical language.

Do not hide important errors inside console logs.

Use clear messages like:

```text
3 required documents are missing
```

rather than:

```text
Validation failed
```

---

# 15. DOCUMENT CHECKLIST UI

Create a central document checklist/table.

Each requirement should clearly show:

- order
- document name
- mandatory/optional
- matched filename
- page count
- expiry date if applicable
- status
- useful action such as Match / Change / Remove

Make blocking problems visually obvious.

Do not depend exclusively on color.

Use text/icon/state indicators so the meaning remains clear.

---

# 16. UPLOADED FILE UI

Show:

- filename
- number of pages
- file size
- duplicate state
- matched requirement
- status or issue

Allow the user to remove a file.

Make duplicate files immediately noticeable.

The user should never wonder whether a file has already been used.

---

# 17. GENERATE BUTTON

The Generate Package button must remain disabled whenever at least one blocking problem exists.

Blocking states:

- Missing
- Expiry date needed
- Expired

Non-blocking:

- Not provided
- OK

When disabled, explain why.

Example:

```text
Package cannot be generated
2 required documents are missing and 1 document has expired.
```

Do not merely disable the button without explanation.

When there are no blocking problems:

```text
Generate Package
```

becomes available.

---

# 18. PDF PACKAGE GENERATION

This is another critical area.

Final output filename:

```text
<tender_id>_Package.pdf
```

Generate exactly one combined PDF.

The final package must follow this structure:

```text
PAGE 1
Cover

THEN
Required/selected documents
in requirement order
```

Include all pages from each selected PDF.

Preserve every document's original internal page order.

Skip optional requirements when no file is provided.

Do not accidentally reorder files based on upload order.

The order must come from the requirement's `order` field.

---

# 19. COVER PAGE

The first page must be an English cover page containing:

- tender ID
- tender title
- procuring entity
- bidder name
- submission deadline
- date package was created
- included documents in final order

Design it professionally but simply.

It should look like a real tender submission cover, not a developer demo page.

Make sure typography is readable.

The included-document list should reflect the actual generated package.

---

# 20. PAGE FOOTERS

Every page, including the cover page, must contain:

```text
<tender_id> | Page X of Y
```

Where:

- `X` = current page number
- `Y` = total number of pages in the final package

Example:

```text
T-2026-0417 | Page 7 of 23
```

Important:

The total `Y` must refer to the **entire final package**, not an individual document.

The footer must:

- be readable
- be positioned safely
- not cover the document's existing content

Think carefully about page dimensions and footer placement.

---

# 21. PDF GENERATION PIPELINE

Prefer a robust pipeline similar to:

```text
Create cover
      ↓
Load selected PDFs
      ↓
Copy/append all pages in correct order
      ↓
Determine total page count
      ↓
Stamp footer on every page
      ↓
Serialize final PDF
      ↓
Create Blob
      ↓
Download as <tender_id>_Package.pdf
```

Verify the resulting PDF after generation when practical.

Do not claim success merely because a Blob was created.

---

# 22. FINAL PDF SELF-VALIDATION

Before enabling download or marking generation complete, verify as much as practical:

- file exists
- page count is non-zero
- cover exists
- document order is correct
- all expected pages are present
- footer appears on every page
- final page count is correct
- filename is correct

If full automatic verification is too expensive for the time limit, implement lightweight structural checks and manually inspect the sample output.

---

# 23. LANGUAGE SUPPORT

The entire application must support:

- English
- Bangla

Use the requirement's:

```text
title_en
title_bn
```

for document names depending on selected language.

The language switch should affect:

- navigation
- labels
- buttons
- instructions
- status descriptions
- error messages
- empty states
- document names where applicable

Do not hard-code duplicate UI components for each language.

Use a centralized translation dictionary.

The required cover page itself should remain in English unless the optional Bangla-PDF bonus is implemented later.

---

# 24. ACCESSIBILITY

Implement sensible accessibility:

- keyboard usable controls
- clear labels
- readable font sizes
- sufficient contrast
- clear focus states
- meaningful button labels
- accessible status indicators
- no critical information conveyed only by color

Do not sacrifice basic accessibility for decoration.

---

# 25. RESPONSIVENESS

The app should work well on desktop Chrome, because Chrome is the required judging environment.

Desktop is the primary target.

Still make the UI reasonably usable on smaller screens.

Do not waste large amounts of competition time on elaborate mobile layouts.

---

# 26. ERROR HANDLING

The application must fail gracefully.

Never let a malformed PDF crash the entire app.

Handle:

- invalid requirements.json
- malformed requirement entries
- non-PDF files
- oversized files
- too many files
- corrupted PDF
- password-protected PDF
- duplicate files
- missing expiry date
- invalid dates
- missing mandatory files
- PDF generation failure

Every error should produce a human-readable message.

Do not expose raw stack traces to the user.

---

# 27. STATE MANAGEMENT

Keep the state model simple.

Avoid unnecessary global state libraries unless they are already present.

The important invariant is:

```text
UI state
    =
current requirements
+
uploaded files
+
matches
+
expiry dates
+
derived statuses
```

Do not maintain redundant mutable state when it can safely be derived.

Statuses should preferably be derived from source state rather than manually toggled.

---

# 28. TESTING STRATEGY

Act like a hostile competition judge.

Create tests or test scenarios for at least:

### Requirement tests

- mandatory missing
- optional missing
- normal matched document
- expiry-required document
- expiry exactly on deadline
- expiry after deadline
- expiry before deadline

### File tests

- valid PDF
- non-PDF
- duplicate PDFs with same content/different names
- duplicate restriction
- removing a file
- replacing a match
- multiple files

### Package tests

- correct document order
- optional unprovided document skipped
- all pages preserved
- cover page generated
- footer on every page
- total page count correct
- final filename correct

### Edge cases

- zero files
- one file
- maximum number of files
- near-size-limit package
- multiple blocking statuses simultaneously
- all requirements valid
- only optional requirements missing

---

# 29. COMPETITION-JUDGE MODE

After implementation, stop thinking like the developer.

Pretend you are a judge who has never seen the app before.

Ask:

1. Can I understand what to do immediately?
2. Can I load the tender correctly?
3. Can I upload many PDFs?
4. Can I see page counts?
5. Can I match files without confusion?
6. Are duplicate files detected?
7. Are statuses exactly correct?
8. Is expiry logic correct?
9. Is Generate disabled for every blocking problem?
10. Is the final PDF exactly ordered?
11. Does the cover contain everything required?
12. Does every page have the correct footer?
13. Can I use Bangla?
14. Can I complete everything without technical knowledge?
15. Does anything crash with unexpected input?

Fix every serious weakness you discover.

---

# 30. PERFORMANCE RULES

Because PDFs can be large, be careful with browser memory.

Avoid unnecessarily duplicating huge ArrayBuffers.

Prefer:

- asynchronous processing
- lazy previews
- efficient PDF loading
- cleanup of object URLs
- minimal state duplication

Do not build a PDF preview engine from scratch.

Do not process the same file repeatedly unless necessary.

---

# 31. VISUAL DESIGN DIRECTION

The product should feel like a serious internal business tool.

Visual principles:

- clean
- modern
- trustworthy
- professional
- calm
- information-dense but readable
- obvious status hierarchy

Avoid:

- excessive gradients
- oversized decorative elements
- unnecessary animations
- gimmicky AI branding
- complicated dashboards
- excessive cards
- distracting effects

The purpose is document preparation, not entertainment.

---

# 32. BONUS FEATURES — ONLY AFTER MAIN TASKS ARE ROCK SOLID

Only implement bonuses if:

1. all mandatory functionality works
2. PDF output is verified
3. status logic is verified
4. there is sufficient time
5. the bonus cannot destabilize the core application

Priority among bonuses:

1. Index page
2. Save/reopen
3. CSV/Excel export
4. Auto-match suggestions
5. Safe bad-PDF handling
6. Seal/signature placement
7. Bangla text in generated PDF
8. AI assistance

Do not allow bonus features to break mandatory functionality.

---

# 33. INDEX PAGE BONUS

If implemented:

Place it after the cover.

For each included document show:

- document name
- starting page number

Calculate page numbers from the actual final package.

Do not guess them.

---

# 34. AUTO-MATCH BONUS

If implemented:

Suggest a match using filename similarity.

Examples:

```text
trade_license.pdf
Trade-License-2026.pdf
TIN_certificate.pdf
```

But suggestions must remain suggestions.

Do not blindly auto-match ambiguous files.

The user must remain in control.

---

# 35. AI BONUS

Do not add AI merely for marketing.

Only implement AI help if:

- the core application is already reliable
- it can use the user's own API key as required by the competition rules
- tender files remain safely in the browser unless explicitly allowed by the rulebook
- the feature provides practical value

Never compromise the frontend-only document-processing requirement.

---

# 36. SAMPLE PACK VERIFICATION

The provided sample pack contains hidden real-world problems.

You must inspect it carefully.

Do not assume every supplied PDF is valid.

Use the sample pack to verify that the application can actually discover the problems.

Resolve the sample pack problems correctly and generate the final required output file:

```text
output/<tender_id>_Package.pdf
```

Also create:

```text
screenshots/
```

with at least one screenshot clearly showing document statuses.

---

# 37. REPOSITORY QUALITY

Keep the repository clean.

Suggested structure:

```text
src/
  components/
  features/
    tender/
    documents/
    matching/
    validation/
    package/
  lib/
    pdf/
    files/
    hashing/
    validation/
  i18n/
  types/
  utils/

public/

output/
screenshots/
```

Adjust this to fit the actual project.

Do not over-engineer the folder structure.

---

# 38. COMMENTS AND CODE QUALITY

Write clean TypeScript.

Prefer:

- small functions
- pure business logic
- descriptive names
- typed interfaces
- reusable components
- clear error handling

Avoid:

- giant components
- repeated logic
- unexplained magic numbers
- unsafe `any`
- unnecessary abstractions
- duplicated state

Comment important logic, especially:

- status calculation
- date comparison
- duplicate hashing
- page numbering
- PDF footer generation

---

# 39. GIT STRATEGY

Because the competition requires multiple commits, maintain meaningful checkpoints.

Suggested:

### Commit 1
Project foundation + requirements loading + UI shell

### Commit 2
PDF upload + matching + validation + duplicate detection

### Commit 3
PDF generation + footer + final package + polish

Each commit message should briefly state:

- what changed
- the relevant AI prompt used, or `Manual edit`

Do not fake commit history.

Make real commits.

---

# 40. TIME MANAGEMENT

This is a 90-minute competition.

Do not spend 30 minutes polishing the landing page.

Suggested priority:

### 0–10 minutes
Project inspection + architecture + requirements parser

### 10–25
File upload + PDF parsing + page count

### 25–45
Matching + expiry + status engine + duplicate detection

### 45–65
PDF generation + cover + merging + footers

### 65–75
Bilingual UI + UX polish + error handling

### 75–85
Judge-style testing + edge cases

### 85–90
Final build + deployment + screenshots + output PDF + final verification

If time becomes limited:

**cut bonus features first, never core requirements.**

---

# 41. IMPORTANT IMPLEMENTATION RULE

Never optimize for "looks impressive in source code."

Optimize for:

```text
Correct input
      ↓
Correct state
      ↓
Correct status
      ↓
Correct package
      ↓
Correct output
```

That is what the judges will evaluate.

---

# 42. DO NOT ASK ME UNNECESSARY QUESTIONS

You are the lead engineer.

When a reasonable implementation decision is required:

- choose the simplest robust option
- document the decision briefly
- continue building

Do not stop the implementation to ask me questions that can be resolved from the problem statement or repository.

Only ask for clarification when the task is genuinely impossible to complete without it.

---

# 43. FINAL REVIEW CHECKLIST

Before declaring the project complete, verify all of these:

## Core

- [ ] requirements.json loads
- [ ] tender details display
- [ ] requirements sorted by order
- [ ] PDFs upload
- [ ] non-PDF rejected
- [ ] page counts shown
- [ ] files removable
- [ ] matching works
- [ ] matching can be changed
- [ ] matching can be undone
- [ ] expiry dates supported
- [ ] duplicate files detected by content
- [ ] duplicates cannot be used across different requirements
- [ ] statuses correct
- [ ] statuses update immediately
- [ ] blocking statuses disable generation
- [ ] generated package follows required order
- [ ] optional missing files skipped
- [ ] all original pages preserved
- [ ] cover page correct
- [ ] footer on every page
- [ ] Page X of Y correct
- [ ] footer does not cover content
- [ ] final filename correct
- [ ] download works
- [ ] English works
- [ ] Bangla works
- [ ] frontend-only processing maintained

## Reliability

- [ ] malformed PDFs do not crash app
- [ ] oversize files handled
- [ ] too many files handled
- [ ] invalid dates handled
- [ ] generation errors handled
- [ ] no unexpected console-critical errors

## Competition

- [ ] sample pack problems resolved
- [ ] final output PDF exists
- [ ] screenshot of statuses exists
- [ ] production build succeeds
- [ ] public HTTPS deployment works
- [ ] judges can open without login
- [ ] Git commits satisfy competition requirements

---

# 44. FINAL INSTRUCTION TO THE AGENT

You are not finished when the application "looks good."

You are finished only when:

1. the sample pack has been processed correctly
2. the application survives judge-style edge cases
3. the generated PDF follows the specification exactly
4. the UI is understandable to a non-technical office worker
5. the app works entirely in the browser
6. the production deployment works
7. the repository contains the required submission artifacts
8. there are no known critical defects

Build the smallest system capable of achieving a **high-scoring competition submission**.

Be decisive.

Be strict about requirements.

Prioritize reliability over cleverness.

Prioritize core scoring requirements over bonuses.

Think like an architect.

Code like a senior frontend engineer.

Process PDFs like a document-engineering specialist.

Test like a hostile judge.

Polish like a product designer.

And before the final submission, independently review the application against the complete problem statement one more time.
```

---

## 2nd Prompt: Deep Analysis & Sample Pack Stress Testing Directive

```markdown
I have tried to test it with some sample doc, here's the doc; @[c:\vibe coding\problem-pack.zip]. and got this result which i have shown you on the ss. so please can you analyze if all things working perfectly or not? analyze deeply and make it workable perfectly.Don't just test the happy path. Inspect every file in this sample pack and identify what hidden problem each file is designed to test. Then create an automated/manual test checklist for the application and verify the implementation against every case.
```
