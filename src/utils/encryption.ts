// src/utils/encryption.ts

/**
 * Hash key used for encryption/decryption
 * This should match the HASH_KEY from your PHP implementation
 */
import { HASH_KEY } from '../services/config';


/**
 * Browser-compatible base64 encoding
 * @param str String to encode
 */
function btoa(str: string): string {
  return window.btoa(str);
}

/**
 * Browser-compatible base64 decoding
 * @param str Base64 encoded string to decode
 */
function atob(str: string): string {
  return window.atob(str);
}

/**
 * Encrypts a string using custom crypto algorithm
 * @param str The string to encrypt
 * @returns The encrypted string
 */
export function encryptStr(str: string): string {
  const compressed = str;
  const encrypted = crypto(compressed);
  
  // Use browser's btoa instead of Node.js Buffer
  const encoded = btoa(encrypted);
  
  const cleaned = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ',');
  return cleaned;
}

/**
 * Decrypts a string that was encrypted with encryptStr
 * @param cleaned The encrypted string
 * @returns The decrypted string
 */
export function decryptStr(cleaned: string): string {
  const restored = cleaned.replace(/-/g, '+').replace(/_/g, '/').replace(/,/g, '=');
  
  // Use browser's atob instead of Node.js Buffer
  const decoded = atob(restored);
  
  const unencrypted = crypto(decoded);
  return unencrypted;
}

/**
 * Core crypto function that performs XOR encryption/decryption
 * @param str The string to encrypt/decrypt
 * @returns The encrypted/decrypted string
 */
function crypto(str: string): string {
  const ky = HASH_KEY.replace(/\s/g, '');
  if (ky.length < 8) throw new Error('Encryption key error: key too short');
  
  const kl = Math.min(ky.length, 32);
  const k: number[] = [];
  
  // Generate the key array
  for (let i = 0; i < kl; ++i) {
    k[i] = ky.charCodeAt(i) & 0x1F;
  }
  
  let result = '';
  let j = 0;
  
  // Perform XOR operation
  for (let i = 0; i < str.length; ++i) {
    const e = str.charCodeAt(i);
    if ((e & 0xE0) !== 0) {
      result += String.fromCharCode(e ^ k[j]);
    } else {
      result += String.fromCharCode(e);
    }
    
    ++j;
    j = j === kl ? 0 : j;
  }
  
  return result;
}

/**
 * Get encrypted IP address 
 * @returns Promise that resolves to the encrypted IP address string
 */
export async function getEncryptedIpAddress(): Promise<string> {
  try {
    // Fetching IP address from a public API
    const response = await fetch('https://api.ipify.org?format=json');
    
    if (!response.ok) {
      // If the request was not successful, fall back to a default IP
      return encryptStr('127.0.0.1');
    }
    
    const data = await response.json();
    const ipAddress = data.ip;
    return encryptStr(ipAddress);
  } catch (error) {
    console.error('Failed to get IP address:', error);
    // Fallback if IP couldn't be determined
    return encryptStr('127.0.0.1');
  }
}