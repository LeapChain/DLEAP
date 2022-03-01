import { mnemonicToSeedSync, validateMnemonic } from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { convertPublicKey, convertSecretKey } from 'ed2curve';
import { box, randomBytes, sign, SignKeyPair } from 'tweetnacl';
import { EncryptedData, Hex } from './models';
import { createSignature } from './sign';
import { hexToUint8Array, uint8arrayToHex, uint8ArrayToText } from './utils';

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

  /**
   * Returns the main wallet from a mnemonic phrase
   * @param {string} mnemonic valid mnemonic phrase
   * @param {string} password optional password for additional security
   *
   * @returns {Wallet} Main Wallet
   */

  static fromMnemonic(mnemonic: string, password?: string) {
    if (!validateMnemonic(mnemonic)) throw 'The Mnemonic Phrase is not valid';

    const seed = mnemonicToSeedSync(mnemonic, password);

    const pathToMainWallet = "m/44'/2002'/0'/0'/0'";
    const { key } = derivePath(pathToMainWallet, seed.toString('hex'));

    return new Wallet(key.toString('hex'));
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

  /**
   * Encyrpts a given message with this wallet's secret key and the message recipient's public key.
   * @param {Hex | Uint8Array} peersPublicKey The message recipient's public key
   * @param {string } message The message to encrypt
   * @param {Hex | Uint8Array} nonce Unique 24 bytes used to encrypt the message
   *
   * @returns {Hex}
   */

  encrypt(
    peersPublicKey: Hex | Uint8Array,
    message: string,
    nonce: Hex | Uint8Array = randomBytes(24)
  ): EncryptedData {
    peersPublicKey =
      typeof peersPublicKey === 'string'
        ? hexToUint8Array(peersPublicKey)
        : peersPublicKey;

    const dhPeersPublicKey = convertPublicKey(peersPublicKey);
    const encodedMessage = new TextEncoder().encode(message);
    const dhSecretKey = convertSecretKey(this.secretKey.slice(0, 32));

    if (!dhPeersPublicKey)
      throw Error('The Public Key could not be converted to x25519');

    const nonceArr = typeof nonce === 'string' ? hexToUint8Array(nonce) : nonce;

    const encryptedMessageArr = box(
      encodedMessage,
      nonceArr,
      dhPeersPublicKey,
      dhSecretKey
    );

    const encryptedMessage = '#'.concat(uint8arrayToHex(encryptedMessageArr));
    return { nonce: uint8arrayToHex(nonceArr), encryptedMessage };
  }

  /**
   * Decrypts an encrypted message with this wallet's secret key and the message recipient's public key.
   *
   * #### Note - This method works with two key combinations:
   *  - The sender's **secret key** and the receiver's **public key**
   *  - The sender's **public key** and the receiver's **secret key**
   *
   * @param {Hex | Uint8Array} peersPublicKey The sender's/recipient's public key
   * @param {Hex} encryptedMessage The encrypted message to decrypt
   * @param {Hex | Uint8Array} nonce 24 bytes previously used to encrypt the message
   *
   * @returns {string} The decrypted message
   */

  decrypt(
    peersPublicKey: Hex | Uint8Array,
    encryptedMessage: Hex,
    nonce: Hex | Uint8Array
  ) {
    peersPublicKey =
      typeof peersPublicKey === 'string'
        ? hexToUint8Array(peersPublicKey)
        : peersPublicKey;

    const dhPeersPublicKey = convertPublicKey(peersPublicKey);

    encryptedMessage = encryptedMessage.startsWith('#')
      ? encryptedMessage.substring(1)
      : encryptedMessage;

    const encryptedMessageArr = hexToUint8Array(encryptedMessage);
    const nonceArr = typeof nonce === 'string' ? hexToUint8Array(nonce) : nonce;
    const dhSecretKey = convertSecretKey(this.secretKey.slice(0, 32));

    if (!dhPeersPublicKey)
      throw Error('The Public Key could not be converted to x25519');

    const encodedMessage = box.open(
      encryptedMessageArr,
      nonceArr,
      dhPeersPublicKey,
      dhSecretKey
    );

    if (!encodedMessage) throw Error('Error decrypting message');

    const message = uint8ArrayToText(encodedMessage);
    return message;
  }
}
