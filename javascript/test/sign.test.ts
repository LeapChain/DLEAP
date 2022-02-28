import {
  createSignature,
  readSignedMessage,
  signMessage,
  verifySignature,
  Wallet,
} from '../src';

describe('Signing Functions', () => {
  const message = 'HELLO, WORLD!';
  const secretKey =
    '705a3b36b44c2e95eebba870dc6fe5280c5c72783e2fe9449ebb73556faec57e';
  const signature =
    'bda5c7af7d0992837d73e3cafea46e4b0879cd5445d0909060a20d81aadbd730b0a24f8b503646dd601a30b8d4a67c15ad44d97f4228347c10713bb95fe3e309';
  const signedMessage =
    'bda5c7af7d0992837d73e3cafea46e4b0879cd5445d0909060a20d81aadbd730b0a24f8b503646dd601a30b8d4a67c15ad44d97f4228347c10713bb95fe3e30948454c4c4f2c20574f524c4421';

  const wallet = new Wallet(secretKey);

  it('signMessage(message, secretKey)', () => {
    const signedMsg = signMessage(message, secretKey);
    expect(signedMsg).toStrictEqual(signedMessage);
    expect(signedMsg.slice(0, 128)).toStrictEqual(signature);
  });

  it('readSignedMessage(signedMessage, publicKey)', () => {
    const msg = readSignedMessage(signedMessage, wallet.publicKeyHex);
    expect(msg).toStrictEqual(message);
  });

  it('createSignature(message, secretKey)', () => {
    const sig = createSignature(message, secretKey);
    expect(sig).toStrictEqual(signature);
  });

  it('verifySignature(signature, message, secretKey)', () => {
    expect(
      verifySignature(signature, message, wallet.publicKeyHex)
    ).toBeTruthy();
    expect(
      verifySignature(signature, message, wallet.secretKeyHex)
    ).toBeFalsy();
    expect(
      verifySignature('signature', message, wallet.publicKeyHex)
    ).toBeFalsy();
    expect(
      verifySignature(signature, 'message', wallet.publicKeyHex)
    ).toBeFalsy();

    // passes when verifiying signedMessage
    expect(
      verifySignature(signedMessage, message, wallet.publicKeyHex)
    ).toBeTruthy();
  });
});
