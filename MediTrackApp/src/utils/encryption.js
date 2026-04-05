import forge from 'node-forge';

// İlk 32 karakter, backend `ENCRYPTION_KEY` ile aynı olmalı (mevcut şifreli veriyi okumak için).
const getKey = () => {
  const keyStr = process.env.EXPO_PUBLIC_ENCRYPTION_KEY;
  if (!keyStr || keyStr.length < 32) {
    throw new Error('EXPO_PUBLIC_ENCRYPTION_KEY must be at least 32 characters');
  }
  return forge.util.createBuffer(keyStr.slice(0, 32), 'utf8');
};

/**
 * Encrypt plaintext using AES-256-GCM via node-forge.
 * Returns a combined string: iv:authTag:ciphertext (all hex-encoded)
 */
export const encrypt = (plaintext) => {
  const key = getKey();
  // 16 bytes for IV
  const iv = forge.random.getBytesSync(16);
  
  const cipher = forge.cipher.createCipher('AES-GCM', key);
  cipher.start({ iv: iv });
  cipher.update(forge.util.createBuffer(plaintext, 'utf8'));
  const pass = cipher.finish();

  if (!pass) {
    throw new Error('Encryption failed');
  }

  const encrypted = cipher.output.toHex();
  const authTag = cipher.mode.tag.toHex();
  const ivHex = forge.util.bytesToHex(iv);

  return `${ivHex}:${authTag}:${encrypted}`;
};

/**
 * Decrypt a string encrypted with encrypt() using node-forge.
 */
export const decrypt = (encryptedData) => {
  const key = getKey();
  const parts = encryptedData.split(':');
  
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }
  
  const [ivHex, authTagHex, ciphertextHex] = parts;

  const iv = forge.util.hexToBytes(ivHex);
  const authTag = forge.util.hexToBytes(authTagHex);
  const ciphertext = forge.util.hexToBytes(ciphertextHex);

  const decipher = forge.cipher.createDecipher('AES-GCM', key);
  decipher.start({
    iv: iv,
    tag: forge.util.createBuffer(authTag) // Auth Tag is handled differently in forge
  });
  
  decipher.update(forge.util.createBuffer(ciphertext));
  const pass = decipher.finish();

  if (!pass) {
    throw new Error('Decryption failed (auth tag mismatch)');
  }
  
  return decipher.output.toString('utf8');
};

/**
 * Encrypt a value only if it's not empty/null.
 */
export const encryptIfPresent = (value) => {
  if (!value) return null;
  return encrypt(value);
};

/**
 * Decrypt a value only if it's not empty/null.
 */
export const decryptIfPresent = (value) => {
  if (!value) return null;
  return decrypt(value);
};
