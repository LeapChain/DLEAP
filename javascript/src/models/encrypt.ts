import { Base64, Hex } from './constants';

export interface EncryptedData {
  nonce: Hex;
  encryptedMessage: Base64;
}
