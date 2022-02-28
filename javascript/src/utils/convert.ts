import { Hex } from '../models';

/** Converts a hexadecimal string to a Uint8Array. */
export const hexToUint8Array = (hex: Hex): Uint8Array => {
  return new Uint8Array(Buffer.from(hex, 'hex'));
};

/** Converts a Uint8Array to a hexadecimal string. */
export const uint8arrayToHex = (array: Uint8Array): Hex => {
  return Buffer.from(array).toString('hex');
};

/** Converts a string to a Uint8Array. */
export const textToUint8Array = (text: string): Uint8Array => {
  return new TextEncoder().encode(text);
};

/** Converts a Uint8Array to a string. */
export const uint8ArrayToText = (array: Uint8Array): string => {
  return new TextDecoder().decode(array);
};
