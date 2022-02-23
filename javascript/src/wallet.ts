import { sign, SignKeyPair } from 'tweetnacl';
import { Hex } from './models';
import { createSignature } from './sign';
import { hexToUint8Array, uint8arrayToHex } from './utils/convert';

export class Wallet {
  readonly publicKey: Uint8Array;
  readonly secretKey: Uint8Array;

  /**
   * @param {Hex} secretKey The wallet's secret key
   */

  constructor(_secretKey?: Hex) {
    let accountKeys: SignKeyPair;
    if (_secretKey) {
      accountKeys = sign.keyPair.fromSeed(hexToUint8Array(_secretKey));
    } else {
      accountKeys = sign.keyPair();
    }

    this.publicKey = accountKeys.publicKey;
    this.secretKey = accountKeys.secretKey;
  }

  /** The 32 byte public key as a 32 byte hex string. */
  get publicKeyHex() {
    return uint8arrayToHex(this.publicKey);
  }

  /** The 64 byte account secret key as a 32 byte hex string. */
  get secretKeyHex() {
    return uint8arrayToHex(this.secretKey.slice(0, 32));
  }

  /**
   * Checks if the secret key pair is valid.
   * @param {Hex} secretKey the given secret key hex string
   * @param {Hex} publicKey the given public key hex string
   */
  static isValidPair(secretKey: Hex, publicKey: Hex) {
    try {
      return new Wallet(secretKey).publicKeyHex === publicKey;
    } catch (_) {
      return false;
    }
  }

  /**
   * Signs a given message and returns the generated sigature.
   * @param {string} message the message to sign
   * @returns {Hex} the generated signature
   */

  sign(message: string): Hex {
    return createSignature(message, this.secretKey);
  }
}
