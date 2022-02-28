import 'package:dtnb/dtnb.dart';

void main() {
  var wallet = Wallet.generate();

  print('private key: ${wallet.privateKeyHex}');
  print('public key: ${wallet.publicKeyHex}');

  var msg = 'Hello, world!';

  print("Signing '$msg'");

  var sig = wallet.sign(msg);

  print('Signature: ${sig.hexString}');

  // Check that the signature is associated with the given wallet key's public key
  if (!sig.verify(publicKey: wallet.publicKey, message: msg)) {
    throw Error();
  }
}
