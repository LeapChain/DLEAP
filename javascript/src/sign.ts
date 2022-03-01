import { sign } from 'tweetnacl';
import { Hex } from './models';
import {
  hexToUint8Array,
  textToUint8Array,
  uint8arrayToHex,
  uint8ArrayToText,
} from './utils';

/**
 * Signs a given message.
 * @param {string} message the message to sign
 * @param {Hex | Uint8Array} secretKey the secret key to sign with
 *
 * @returns {Hex}  the signed message.
 */

export const signMessage = (
  message: string,
  secretKey: Hex | Uint8Array
): Hex => {
  const encodedMessage = textToUint8Array(message);
  const signedMessageArray = sign(
    encodedMessage,
    typeof secretKey === 'string'
      ? sign.keyPair.fromSeed(hexToUint8Array(secretKey)).secretKey
      : secretKey
  );
  return uint8arrayToHex(signedMessageArray);
};

/**
 * Verifies the signed message and public key then returns the message.
 * Returns null otherwise.
 * @param {Hex} signedMessage the signed message
 * @param {Hex} publicKey the public key that signed the message
 *
 *
 * ### Note - This fn only works for messages signed with `signMessage()` and not `createSignature()`
 */

export const readSignedMessage = (signedMessage: Hex, publicKey: Hex) => {
  const encodedSignedMessage = hexToUint8Array(signedMessage);
  const encodedPublicKey = hexToUint8Array(publicKey);
  const encodedMessage = sign.open(encodedSignedMessage, encodedPublicKey);

  return encodedMessage ? uint8ArrayToText(encodedMessage) : null;
};

/**
 * Signs a given message and returns the generated signature.
 * @param {string} message the message to sign
 * @param {Hex | Uint8Array} secretKey the secret key to sign with
 */

export const createSignature = (
  message: string,
  secretKey: Hex | Uint8Array
): Hex => {
  const signedMessage = signMessage(message, secretKey);
  const signature = signedMessage.slice(0, 128);
  return signature;
};

/**
 * Checks if the message was signed by a specific public key.
 * @param {string} message the message to verify
 * @param {Hex} signature the signed message
 * @param {Hex} publicKey the public key that signed the message
 */

export const verifySignature = (
  signature: Hex,
  message: string,
  publicKey: Hex
): Boolean => {
  const encodedMessage = textToUint8Array(message);
  const encodedSignature = hexToUint8Array(signature.slice(0, 128));
  const encodedPublicKey = hexToUint8Array(publicKey);
  try {
    return sign.detached.verify(
      encodedMessage,
      encodedSignature,
      encodedPublicKey
    );
  } catch {
    return false;
  }
};
