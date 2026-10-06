import { describe, it, expect } from 'vitest';
import { parseAndValidateRequirements } from '../lib/validation/requirements';
import { sampleRequirementsJson1 } from '../sampleData/sampleRequirements';

describe('Requirements JSON Parser & Validator', () => {
  it('parses official sample requirements JSON successfully', () => {
    const res = parseAndValidateRequirements(sampleRequirementsJson1);
    expect(res.valid).toBe(true);
    expect(res.data).toBeDefined();
    expect(res.data?.tender.tender_id).toBe('T-2026-0417');
    expect(res.data?.requirements.length).toBe(6);
    expect(res.data?.requirements[0].order).toBe(1);
    expect(res.data?.requirements[5].order).toBe(6);
  });

  it('rejects empty or whitespace string', () => {
    const res = parseAndValidateRequirements('   ');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('empty');
  });

  it('rejects malformed JSON syntax', () => {
    const res = parseAndValidateRequirements('{"tender": { broken: json');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('Invalid JSON format');
  });

  it('rejects missing tender section', () => {
    const res = parseAndValidateRequirements('{"requirements": []}');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('Missing or invalid "tender" section');
  });

  it('rejects invalid submission deadline date format', () => {
    const invalidJson = JSON.stringify({
      tender: {
        tender_id: 'T-001',
        title: 'Tender',
        procuring_entity: 'Agency',
        bidder: 'Bidder Ltd',
        submission_deadline: '2026-99-99', // Invalid month/day
      },
      requirements: [
        { id: 'R01', order: 1, title_en: 'Doc', mandatory: true, has_expiry: false },
      ],
    });
    const res = parseAndValidateRequirements(invalidJson);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('Invalid submission deadline');
  });

  it('rejects duplicate requirement IDs', () => {
    const dupJson = JSON.stringify({
      tender: {
        tender_id: 'T-001',
        title: 'Tender',
        procuring_entity: 'Agency',
        bidder: 'Bidder Ltd',
        submission_deadline: '2026-10-20',
      },
      requirements: [
        { id: 'R01', order: 1, title_en: 'Doc 1', mandatory: true, has_expiry: false },
        { id: 'R01', order: 2, title_en: 'Doc 2', mandatory: true, has_expiry: false },
      ],
    });
    const res = parseAndValidateRequirements(dupJson);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('Duplicate requirement ID "R01"');
  });

  it('sorts unsorted requirements strictly by order ascending', () => {
    const unsortedJson = JSON.stringify({
      tender: {
        tender_id: 'T-001',
        title: 'Tender',
        procuring_entity: 'Agency',
        bidder: 'Bidder Ltd',
        submission_deadline: '2026-10-20',
      },
      requirements: [
        { id: 'R03', order: 3, title_en: 'Doc 3', mandatory: false, has_expiry: false },
        { id: 'R01', order: 1, title_en: 'Doc 1', mandatory: true, has_expiry: true },
        { id: 'R02', order: 2, title_en: 'Doc 2', mandatory: true, has_expiry: false },
      ],
    });
    const res = parseAndValidateRequirements(unsortedJson);
    expect(res.valid).toBe(true);
    expect(res.data?.requirements[0].id).toBe('R01');
    expect(res.data?.requirements[1].id).toBe('R02');
    expect(res.data?.requirements[2].id).toBe('R03');
  });
});
