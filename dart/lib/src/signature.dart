import 'dart:typed_data';
import 'package:hex/hex.dart';
import 'package:ed25519_edwards/ed25519_edwards.dart' as ed;
import 'utils.dart' as utils;

/// An immutable structure for signatures.
class Signature {
  final Uint8List _bytes;

  /// Creates a signature from the given bytes.
  const Signature(this._bytes);

  /// The raw bytes.
  Uint8List get bytes => _bytes;

  /// The bytes encoded in a hexadecimal format.
  String get hexString => HEX.encode(bytes);

  /// Verifies if this signature was generated for the message data using a
  /// secret key associated with the given public key.
  ///
  /// ## Notes
  /// - This only accepts either [Uint8List], [List<int>], or [String] for the
  ///   message. All other forms of message will result in a type exception.
  /// - If a [String] is passed in, then it is converted to utf-8 bytes.
  bool verify({required List<int> publicKey, required dynamic message}) => ed
      .verify(ed.PublicKey(publicKey), utils.normalizeMessage(message), _bytes);
}
