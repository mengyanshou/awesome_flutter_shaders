import 'dart:async';
import 'dart:math';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'dart:ui' as ui;
import 'dart:io';
import 'package:image/image.dart' as img;

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Noise Texture',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: Scaffold(
        appBar: AppBar(
          title: Text('Flutter Noise Texture'),
        ),
        body: Center(
          child: FutureBuilder<ui.Image>(
            future: generateNoiseImage(1000, 2000),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.done && snapshot.hasData) {
                return GestureDetector(
                  onTap: () async {
                    await saveImage(snapshot.data!, "noise_image.png");
                  },
                  child: CustomPaint(
                    size: Size(1000, 2000),
                    painter: NoisePainter(snapshot.data!),
                  ),
                );
              } else {
                return CircularProgressIndicator();
              }
            },
          ),
        ),
      ),
    );
  }
}

class NoisePainter extends CustomPainter {
  final ui.Image noiseImage;

  NoisePainter(this.noiseImage);

  @override
  void paint(Canvas canvas, Size size) {
    paintNoise(canvas, size, noiseImage);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    return true;
  }

  void paintNoise(Canvas canvas, Size size, ui.Image noiseImage) {
    final paint = Paint();
    canvas.drawImageRect(
      noiseImage,
      Rect.fromLTWH(0, 0, noiseImage.width.toDouble(), noiseImage.height.toDouble()),
      Rect.fromLTWH(0, 0, size.width, size.height),
      paint,
    );
  }
}

Future<ui.Image> generateNoiseImage(int width, int height) async {
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

Future<void> saveImage(ui.Image image, String fileName) async {
  // Convert ui.Image to ByteData
  final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
  if (byteData == null) return;

  // Convert ByteData to Uint8List
  final pngBytes = byteData.buffer.asUint8List();

  // Get the directory to save the image
  final directory = Directory('/Users/nightmare/Desktop/awesome_flutter_shaders');
  final filePath = '${directory.path}/$fileName';

  // Save the image to the file
  final file = File(filePath);
  await file.writeAsBytes(pngBytes);

  print('Image saved to $filePath');
}
