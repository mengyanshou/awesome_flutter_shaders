import 'dart:async';
import 'dart:math';
import 'dart:typed_data';
import 'dart:ui' as ui;
import 'dart:ui';

Future<ui.Image> generateNoiseImage(int width, int height) async {
  final pictureRecorder = ui.PictureRecorder();
  final canvas = Canvas(pictureRecorder);
  final paint = Paint();
  final random = Random();

  for (int y = 0; y < height; y++) {
    for (int x = 0; x < width; x++) {
      final colorValue = random.nextInt(256);
      paint.color = Color.fromARGB(255, colorValue, colorValue, colorValue);
      canvas.drawRect(Rect.fromLTWH(x.toDouble(), y.toDouble(), 1, 1), paint);
    }
  }

  final picture = pictureRecorder.endRecording();
  return picture.toImage(width, height);
}

Future<ui.Image> generateNoiseImageV2(int width, int height) async {
  final noiseData = generateNoiseData(width, height);
  final completer = Completer<ui.Image>();
  ui.decodeImageFromPixels(noiseData, width, height, ui.PixelFormat.rgba8888, (image) {
    completer.complete(image);
  });
  return completer.future;
}

Uint8List generateNoiseData(int width, int height) {
  final random = Random();
  final data = Uint8List(width * height * 4);
  for (int i = 0; i < data.length; i += 4) {
    final value = random.nextInt(256);
    data[i] = value; // Red
    data[i + 1] = value; // Green
    data[i + 2] = value; // Blue
    data[i + 3] = 255; // Alpha
  }
  return data;
}
