import { encrypt, decrypt } from '../../../src/utils/encryption';

describe('Encryption Utils', () => {
  const testData = 'sensitive-data-to-encrypt';

  describe('encrypt', () => {
    it('should encrypt a string', () => {
      const encrypted = encrypt(testData);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(testData);
      expect(encrypted.length).toBeGreaterThan(0);
    });

    it('should produce different output each time (due to IV)', () => {
      const encrypted1 = encrypt(testData);
      const encrypted2 = encrypt(testData);

      // Due to random IV, encrypted strings should be different
      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should handle empty strings', () => {
      const encrypted = encrypt('');

      expect(encrypted).toBeDefined();
      expect(encrypted.length).toBeGreaterThan(0);
    });

    it('should handle long strings', () => {
      const longString = 'a'.repeat(10000);
      const encrypted = encrypt(longString);

      expect(encrypted).toBeDefined();
      expect(encrypted.length).toBeGreaterThan(0);
    });

    it('should handle special characters', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
      const encrypted = encrypt(specialChars);

      expect(encrypted).toBeDefined();
      expect(encrypted.length).toBeGreaterThan(0);
    });

    it('should handle unicode characters', () => {
      const unicode = '???? ?? ????? ??????';
      const encrypted = encrypt(unicode);

      expect(encrypted).toBeDefined();
      expect(encrypted.length).toBeGreaterThan(0);
    });
  });

  describe('decrypt', () => {
    it('should decrypt an encrypted string', () => {
      const encrypted = encrypt(testData);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(testData);
    });

    it('should decrypt empty strings', () => {
      const encrypted = encrypt('');
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe('');
    });

    it('should decrypt long strings', () => {
      const longString = 'a'.repeat(10000);
      const encrypted = encrypt(longString);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(longString);
    });

    it('should decrypt special characters', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
      const encrypted = encrypt(specialChars);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(specialChars);
    });

    it('should decrypt unicode characters', () => {
      const unicode = '???? ?? ????? ??????';
      const encrypted = encrypt(unicode);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(unicode);
    });

    it('should throw error for invalid encrypted data', () => {
      expect(() => decrypt('invalid-encrypted-data')).toThrow();
    });

    it('should throw error for malformed encrypted data', () => {
      expect(() => decrypt('not:valid:format')).toThrow();
    });
  });

  describe('encrypt/decrypt cycle', () => {
    it('should maintain data integrity through multiple cycles', () => {
      let data = testData;

      for (let i = 0; i < 5; i++) {
        const encrypted = encrypt(data);
        data = decrypt(encrypted);
      }

      expect(data).toBe(testData);
    });

    it('should handle JSON data', () => {
      const jsonData = JSON.stringify({
        user: 'test@example.com',
        tokens: ['token1', 'token2'],
        metadata: { key: 'value' },
      });

      const encrypted = encrypt(jsonData);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(jsonData);
      expect(JSON.parse(decrypted)).toEqual(JSON.parse(jsonData));
    });

    it('should handle numerical strings', () => {
      const numbers = '1234567890';
      const encrypted = encrypt(numbers);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(numbers);
    });
  });
});
