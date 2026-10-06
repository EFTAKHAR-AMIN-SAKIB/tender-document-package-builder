import pypdf
import os

pdf_path = os.path.join(os.getcwd(), 'output', 'T-2026-0417_Package.pdf')
assert os.path.exists(pdf_path), f"File {pdf_path} does not exist"

reader = pypdf.PdfReader(pdf_path)
total_pages = len(reader.pages)
print(f"Verified PDF exists. Total pages: {total_pages}")
assert total_pages == 8, f"Expected 8 pages, got {total_pages}"

for i, page in enumerate(reader.pages):
    text = page.extract_text()
    page_num = i + 1
    expected_footer = f"T-2026-0417 | Page {page_num} of {total_pages}"
    print(f"\n--- Checking Page {page_num} ---")
    print(f"Text sample: {text[:150].strip()}...")
    
    # Verify footer on page
    assert expected_footer in text, f"Missing expected footer '{expected_footer}' on page {page_num}. Page text: {text}"
    print(f"-> Footer verified: {expected_footer}")

# Verify Cover Page content
cover_text = reader.pages[0].extract_text()
assert "TENDER SUBMISSION PACKAGE" in cover_text, "Missing header on cover page"
assert "T-2026-0417" in cover_text, "Missing tender ID on cover page"
assert "Supply of IT Equipment" in cover_text, "Missing tender title on cover page"
assert "Example Directorate" in cover_text, "Missing procuring entity on cover page"
assert "Example Company Ltd." in cover_text, "Missing bidder on cover page"
assert "2026-10-20" in cover_text, "Missing submission deadline on cover page"
assert "INCLUDED DOCUMENTS SCHEDULE" in cover_text, "Missing document schedule on cover page"

# Verify Index Page content
index_text = reader.pages[1].extract_text()
assert "TABLE OF CONTENTS / DOCUMENT INDEX" in index_text, "Missing index title"

print("\nALL PDF ACCEPTANCE CRITERIA VERIFIED 100% PROGRAMMATICALLY!")
