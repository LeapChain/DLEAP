import 'dart:convert';
import 'package:dtnb/dtnb.dart';
import 'package:test/test.dart';

class DemoKey {
  final String publicHex;
  final String privateHex;

  /// { [MESSAGE]: SIGNATURE }
  final Map<dynamic, String> signatureMocks;

  const DemoKey(
      {required this.publicHex,
      required this.privateHex,
      required this.signatureMocks});
}

const keys = [
  DemoKey(
      privateHex:
          '80811257e5bc79976cba8fd689efe737947caf4e2a741ca11edb601ae3ab654d',
      publicHex:
          '4c41c0f516401d8ac975eae151bd6fda312cc81e5ce412f041373996a48cf762',
      signatureMocks: {
        'HELLO, WORLD!':
            '5e9544bef0046166f15353a0298f41fc7791f1d66203cea659422b6e1a7f12737cffcb5fd71dac1d8f631703a09e9fd03210a6748af5e61cf1c1c3453060760b',
      }),
  DemoKey(
    privateHex:
        '5a9299a36b91c82918fa5b3d4ea5144cc588c20e66aadb44812d4f2eac953a76',
    publicHex:
        '4299a3508b6207a560143a87dbefc9273e13487f49fc79b31e22a02330947141',
    signatureMocks: {
      'HELLO, WORLD!':
          '307d9fa244cf0a38bba092588a90dcd03cee190214fdc2362c3d0c14b8d768b36fc36716915747642f6144b0171fe95c56034dd203e7191bc4b2012dbbbefe02'
    },
  ),
  DemoKey(
      privateHex:
          '09645e081d7d9e3bc01ec94081cf4048244ecf4dc8098b4b0a8275cee07003aa',
      publicHex:
          '1c25ff99a7fded3d632146616fd58c3a32b4cc683e04cfc53d8bbc5e59ef38ce',
      signatureMocks: {
        'HELLO, WORLD!':
            'b355dd1fd6b1ba6cd529c10a6a6a732ca6eb8417d12fbf29344cdc5425dc4cc1a24efc9db04f9530a18150be0ba9d5844e4da0be87e6e19d224b9670da13d007'
      }),
];

void main() {
  group('Wallet', () {
    test('Creating wallet from secret', () {
      for (var data in keys) {
        var wallet = Wallet.fromHexStrings(privateKey: data.privateHex);
        expect(wallet.privateKeyHex, data.privateHex);
        expect(wallet.publicKeyHex, data.publicHex);
      }
    });

    test('Creating wallet from secret and public', () {
      for (var data in keys) {
        var wallet = Wallet.fromHexStrings(
            privateKey: data.privateHex, publicKey: data.publicHex);
        expect(wallet.privateKeyHex, data.privateHex);
        expect(wallet.publicKeyHex, data.publicHex);
      }
    });

    test('Signing data', () {
      for (var data in keys) {
        var wallet = Wallet.fromHexStrings(
            privateKey: data.privateHex, publicKey: data.publicHex);

        for (var mock in data.signatureMocks.entries) {
          expect(wallet.sign(mock.key).hexString, mock.value);
        }
      }
    });

    test('Verifying the signature', () {
      for (var data in keys) {
        var wallet = Wallet.fromHexStrings(
            privateKey: data.privateHex, publicKey: data.publicHex);
        var message = utf8.encode('Hello, world!');
        var sig = wallet.sign(message);

        expect(sig.verify(publicKey: wallet.publicKey, message: message), true);

        expect(
            sig.verify(publicKey: List.filled(32, 0), message: message), false);
      }
    });
  });
}
