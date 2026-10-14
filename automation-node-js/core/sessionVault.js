import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function getVaultKey() {
  const envKey = process.env.VAULT_AES_256_KEY || 'enterprise_autonomous_agent_key_256bit!!';
  return crypto.createHash('sha256').update(envKey).digest();
}

/**
 * Layer 13: Persistent Cookie & Session Vault.
 * Encrypts and decrypts browser storage state with AES-256-GCM.
 */
export function saveEncryptedSession(storageStateObj, filePath) {
  const plainText = JSON.stringify(storageStateObj);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getVaultKey(), iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');

  const payload = {
    iv: iv.toString('hex'),
    tag,
    data: encrypted,
    updatedAt: new Date().toISOString()
  };

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
}

export function loadEncryptedSession(filePath) {
  if (!fs.existsSync(filePath)) return null;

  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const iv = Buffer.from(raw.iv, 'hex');
    const tag = Buffer.from(raw.tag, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getVaultKey(), iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(raw.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  } catch (err) {
    console.error('Session decryption failed:', err.message);
    return null;
  }
}
