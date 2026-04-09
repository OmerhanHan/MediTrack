const keyText = (Deno.env.get("ENCRYPTION_KEY") ?? "").slice(0, 32);
if (!keyText || keyText.length < 32) {
  throw new Error("ENCRYPTION_KEY must be at least 32 chars");
}

const encoder = new TextEncoder();

function toHex(bytes: Uint8Array) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

let cryptoKeyPromise: Promise<CryptoKey> | null = null;
async function getCryptoKey() {
  if (!cryptoKeyPromise) {
    cryptoKeyPromise = crypto.subtle.importKey(
      "raw",
      encoder.encode(keyText),
      { name: "AES-GCM" },
      false,
      ["encrypt"],
    );
  }
  return cryptoKeyPromise;
}

export async function encrypt(plainText: string) {
  const key = await getCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const encoded = encoder.encode(plainText);
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv, tagLength: 128 }, key, encoded),
  );

  const tagLength = 16;
  const cipherBytes = encrypted.slice(0, encrypted.length - tagLength);
  const tagBytes = encrypted.slice(encrypted.length - tagLength);

  return `${toHex(iv)}:${toHex(tagBytes)}:${toHex(cipherBytes)}`;
}

export async function encryptIfPresent(value?: string | null) {
  if (!value) return null;
  return encrypt(value);
}

