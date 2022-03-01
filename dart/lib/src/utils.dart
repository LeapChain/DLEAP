import 'dart:convert';
import 'dart:typed_data';

Uint8List normalizeMessage(dynamic data) {
  if (data is Uint8List) {
    return data;
  } else if (data is List<int>) {
    return Uint8List.fromList(data);
  } else if (data is String) {
    return Uint8List.fromList(utf8.encode(data));
  }
  throw TypeError();
}
