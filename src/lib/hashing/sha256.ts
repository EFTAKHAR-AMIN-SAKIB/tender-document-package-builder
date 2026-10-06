/**
 * Cryptographic content hashing (SHA-256) for duplicate file detection.
 * Works seamlessly in modern browsers via crypto.subtle, with fallback for test environments.
 */

export async function computeSHA256(data: ArrayBuffer | Uint8Array): Promise<string> {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);

  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', bytes as unknown as BufferSource);
    return bufferToHex(hashBuffer);
  }

  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) {
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', bytes as unknown as BufferSource);
    return bufferToHex(hashBuffer);
  }

  // Fallback for node test runner environment
  try {
    const nodeCrypto = await import('crypto');
    const hash = nodeCrypto.createHash('sha256').update(bytes).digest('hex');
    return hash;
  } catch {
    throw new Error('Cryptographic SHA-256 hashing is not supported in this runtime environment.');
  }
}

function bufferToHex(buffer: ArrayBuffer): string {
  const hashArray = Array.from(new Uint8Array(buffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
