import 'dart:typed_data';
import 'package:hex/hex.dart';
import 'package:ed25519_edwards/ed25519_edwards.dart' as ed;
import 'signature.dart';
import 'utils.dart' as utils;

/// Used for managing private and public keys together and provides convenience
/// encryption methods.
class Wallet {
  late ed.KeyPair _keyPair;

  /// Creates a new wallet from the given byte lists for keys. If the
  /// `publicKey` is not provided, then it derives the `publicKey` using
  /// cryptography.
  Wallet.fromBytes({required List<int> privateKey, List<int>? publicKey}) {
    if (privateKey.length != 32) {
      throw ArgumentError(
          'The private key bytes must have a length of 32.', 'privateKey');
    }

    if (publicKey != null) {
      if (publicKey.length != 32) {
        throw ArgumentError(
            'The public key bytes must have a length of 32.', 'publicKey');
      }

      // copies required because it could be a fixed-length list
      privateKey = List.from(privateKey);
      privateKey.addAll(publicKey);

      _keyPair = ed.KeyPair(ed.PrivateKey(Uint8List.fromList(privateKey)),
          ed.PublicKey(publicKey));

      return;
    }

    var privKey = ed.newKeyFromSeed(Uint8List.fromList(privateKey));
    _keyPair = ed.KeyPair(privKey, ed.public(privKey));
  }

  /// Creates a new [Wallet] from the given hex strings for keys. If the
  /// `publicKey` is not provided, then it derives the `publicKey` using
  /// cryptography.
  factory Wallet.fromHexStrings(
          {required String privateKey, String? publicKey}) =>
      Wallet.fromBytes(
          privateKey: HEX.decode(privateKey),
          publicKey: publicKey != null ? HEX.decode(publicKey) : null);

  /// Generates a wallet with a random private key and its associated public
  /// key.
  Wallet.generate() : _keyPair = ed.generateKey();

  /// The private key bytes.
  List<int> get privateKey => ed.seed(_keyPair.privateKey);

  /// The public key bytes.
  List<int> get publicKey => _keyPair.publicKey.bytes;

  /// The private key bytes as a hexadecimal string.
  String get privateKeyHex => HEX.encode(privateKey);

  /// The public key bytes as a hexadecimal string.
  String get publicKeyHex => HEX.encode(publicKey);

  /// Tries to sign the given data.
  ///
  /// ## Notes
  /// - This only accepts either [Uint8List], [List<int>], or [String] for the
  ///   data. All other forms of data will result in a type exception.
  /// - When a [String] is passed in, it is converted to utf-8 bytes and then
  ///   signed.
  Signature sign(dynamic data) =>
      Signature(ed.sign(_keyPair.privateKey, utils.normalizeMessage(data)));
}
