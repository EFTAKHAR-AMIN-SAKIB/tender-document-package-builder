import { describe, it, expect } from 'vitest';
import { computeSHA256 } from '../lib/hashing/sha256';

describe('SHA-256 Cryptographic Hashing for Duplicate Detection', () => {
  it('computes identical hash for identical byte content', async () => {
    const data1 = new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]); // "Hello World"
    const data2 = new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]); // Identical bytes

    const hash1 = await computeSHA256(data1);
    const hash2 = await computeSHA256(data2);

    expect(hash1).toBe(hash2);
    expect(hash1).toBe('a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e');
  });

  it('computes different hashes for distinct contents', async () => {
    const data1 = new Uint8Array([1, 2, 3, 4]);
    const data2 = new Uint8Array([1, 2, 3, 5]);

    const hash1 = await computeSHA256(data1);
    const hash2 = await computeSHA256(data2);

    expect(hash1).not.toBe(hash2);
  });
});
