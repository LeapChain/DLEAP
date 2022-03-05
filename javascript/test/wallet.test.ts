import { Wallet } from '../src';
import { Hex } from '../src/models';

describe('Wallet', () => {
  // mnemonic phrases and tes data can be generated here https://hd-keygen.vercel.app/
  const defaultWallet = {
    mnemonic:
      'favorite delay fun ankle almost connect coconut eyebrow offer timber volcano ethics',
    publicKeyHex:
      'cdfd65191dca919de82b79d7a4fbe493776eb9ecb62cc21063301731364a14a1',
    secretKeyHex:
      '6ad53f1dc05d8157c4ff0823f772840becc9306d7c3d19c0293e9cd36166a90f',
  };

  const wallet = new Wallet(defaultWallet.secretKeyHex);

  const assertWalletBasics = (secretKey: Hex, publicKey: Hex) => {
    let wallet = new Wallet(secretKey);
    expect(wallet.publicKeyHex).toHaveLength(64);
    expect(wallet.secretKeyHex).toHaveLength(64);

    expect(wallet.publicKeyHex).toStrictEqual(publicKey);
    expect(wallet.secretKeyHex).toStrictEqual(secretKey);
  };

  const peersWallet = new Wallet(
    '705a3b36b44c2e95eebba870dc6fe5280c5c72783e2fe9449ebb73556faec57e'
  );

  const encryptedData = {
    nonce: 'cf1b44b30aff3003367ed50b42cf5efaa27f64aa94e23a97',
    encryptedMessage:
      '#d7963c558bde02fcf3f55696a783834f9ec73c4de944e0385de26a78db',
  };

  it('constructor()', () => {
    const randomWallet = new Wallet();
    expect(randomWallet.secretKeyHex).toHaveLength(64);
  });

  it('constructor(secretKey)', () => {
    let pairs = [
      [
        '80811257e5bc79976cba8fd689efe737947caf4e2a741ca11edb601ae3ab654d',
        '4c41c0f516401d8ac975eae151bd6fda312cc81e5ce412f041373996a48cf762',
      ],
      [
        '5a9299a36b91c82918fa5b3d4ea5144cc588c20e66aadb44812d4f2eac953a76',
        '4299a3508b6207a560143a87dbefc9273e13487f49fc79b31e22a02330947141',
      ],
      [
        '09645e081d7d9e3bc01ec94081cf4048244ecf4dc8098b4b0a8275cee07003aa',
        '1c25ff99a7fded3d632146616fd58c3a32b4cc683e04cfc53d8bbc5e59ef38ce',
      ],
    ];

    for (const [secretKey, publicKey] of pairs) {
      assertWalletBasics(secretKey, publicKey);
    }
  });

  it('isValidPair(secretKey, publicKey)', () => {
    expect(
      Wallet.isValidPair(defaultWallet.secretKeyHex, defaultWallet.publicKeyHex)
    ).toBeTruthy();
    expect(
      Wallet.isValidPair(defaultWallet.publicKeyHex, defaultWallet.publicKeyHex)
    ).toBeFalsy();
    expect(
      Wallet.isValidPair(defaultWallet.secretKeyHex, defaultWallet.secretKeyHex)
    ).toBeFalsy();
    expect(
      Wallet.isValidPair(defaultWallet.publicKeyHex, defaultWallet.secretKeyHex)
    ).toBeFalsy();
  });

  it('sign(message)', () => {
    let message = 'HELLO, WORLD!';
    let pairs = [
      [
        '705a3b36b44c2e95eebba870dc6fe5280c5c72783e2fe9449ebb73556faec57e',
        'bda5c7af7d0992837d73e3cafea46e4b0879cd5445d0909060a20d81aadbd730b0a24f8b503646dd601a30b8d4a67c15ad44d97f4228347c10713bb95fe3e309',
      ],
      [
        'aa1ec5983b73d4870721d51a8c6a8fd27982029c0c7fee40a5d25d72861a48a9',
        '836df0c9174558bfe39e0051cbe7310cca3c51f8d1e7ba36bef297d6d3a6e58c1079d753901316e49dbae3715191c2b0fc7713bbba6d590fec14fb0f9e8f110a',
      ],
      [
        '0f6af6c4bd20f06cb0146b8344c75bceae3405497415d7261f615bcf48f633de',
        'fcb5092b7850d83e9d55123b198128b3df5e4181d4cfffb9ab3109ce7c134cbdb63ee2bd93b50a2417df1bb2178d2c37bbad18d02f68589a22ecfea90f1d3f04',
      ],
    ];

    for (const [secretKey, signature] of pairs) {
      const signedMessage = new Wallet(secretKey).sign(message);
      expect(signedMessage).toStrictEqual(signature);
    }
  });

  it('fromMnemonic(mnemonic)', () => {
    const mainWallet = Wallet.fromMnemonic(defaultWallet.mnemonic);

    expect(mainWallet.publicKeyHex).toStrictEqual(defaultWallet.publicKeyHex);
    expect(mainWallet.secretKeyHex).toStrictEqual(defaultWallet.secretKeyHex);
  });

  it('encrypt(peersPublicKey, message, nonce?)', () => {
    let message = 'HELLO, WORLD!';

    const peersWallet = new Wallet(
      '705a3b36b44c2e95eebba870dc6fe5280c5c72783e2fe9449ebb73556faec57e'
    );

    const { encryptedMessage, nonce } = wallet.encrypt(
      peersWallet.publicKey,
      message,
      encryptedData.nonce
    );

    expect(nonce).toStrictEqual(encryptedData.nonce);
    expect(encryptedMessage).toStrictEqual(encryptedData.encryptedMessage);
  });

  it('decrypt(peersPublicKey, message, nonce)', () => {
    let message = 'HELLO, WORLD!';

    //  with sender's secretKey and recipient's publicKey
    let plaintext = wallet.decrypt(
      peersWallet.publicKey,
      encryptedData.encryptedMessage,
      encryptedData.nonce
    );

    expect(plaintext).toStrictEqual(message);

    //  with sender's publicKey and recipient's secretKey
    plaintext = peersWallet.decrypt(
      wallet.publicKey,
      encryptedData.encryptedMessage,
      encryptedData.nonce
    );

    expect(plaintext).toStrictEqual(message);
  });
});
