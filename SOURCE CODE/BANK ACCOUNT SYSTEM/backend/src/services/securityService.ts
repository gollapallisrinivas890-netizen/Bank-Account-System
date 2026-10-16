import crypto from 'crypto';

export class SecurityService {
  /**
   * Hashes a 4-digit PIN with a salt using SHA-256
   */
  static hashPin(pin: string, salt?: string): string {
    const saltToUse = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(pin, saltToUse, 10000, 32, 'sha256')
      .toString('hex');
    return `${saltToUse}:${hash}`;
  }

  /**
   * Verifies if a raw PIN matches the stored salt:hash string
   */
  static verifyPin(pin: string, storedHash: string): boolean {
    const parts = storedHash.split(':');
    if (parts.length !== 2) return false;
    const [salt, expectedHash] = parts;
    const computedHash = crypto
      .pbkdf2Sync(pin, salt, 10000, 32, 'sha256')
      .toString('hex');
    return crypto.timingSafeEqual(
      Buffer.from(computedHash, 'hex'),
      Buffer.from(expectedHash, 'hex')
    );
  }

  /**
   * Creates a simulated UPI ID: cleanName + accountId + "@" + bankCode
   */
  static generateUpiId(customerName: string, accountId: number, bankCode: string): string {
    const clean = customerName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    const prefix = clean.length > 0 ? clean : 'user';
    return `${prefix}${accountId}@${bankCode.toLowerCase()}`;
  }

  /**
   * Generates a unique transaction reference ID
   */
  static generateRefId(prefix: string = 'TXN'): string {
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${timestamp}-${random}`;
  }
}
