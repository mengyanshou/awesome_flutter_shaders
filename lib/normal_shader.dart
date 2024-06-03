import 'dart:async';
import 'dart:typed_data';
import 'dart:ui' as ui;
import 'package:flutter/material.dart' hide Image;
import 'package:flutter/services.dart';

Future<ui.Image> loadImageFromAsset(String assetPath) async {
  final ByteData data = await rootBundle.load(assetPath);
  final Completer<ui.Image> completer = Completer();
  ui.decodeImageFromList(Uint8List.view(data.buffer), (ui.Image img) {
    completer.complete(img);
  });
  return completer.future;
}

// Future<ui.Image> loadImageFromFile(String filePath) async {
//   final File file = File(filePath);
//   final Uint8List bytes = await file.readAsBytes();
//   final Completer<ui.Image> completer = Completer();
//   ui.decodeImageFromList(bytes, (ui.Image img) {
//     completer.complete(img);
//   });
//   return completer.future;
// }
class NormalShader extends StatefulWidget {
  const NormalShader({
    super.key,
    required this.asset,
    this.width,
    this.height,
    this.simplers = const [],
  });
  final String asset;
  final double? width;
  final double? height;
  final List<String> simplers;

  NormalShader copyWith({
    String? asset,
    double? width,
    double? height,
    List<String>? simplers,
    Key? key,
  }) {
    return NormalShader(
      asset: asset ?? this.asset,
      width: width ?? this.width,
      height: height ?? this.height,
      simplers: simplers ?? this.simplers,
      key: key ?? UniqueKey(),
    );
  }

  @override
  State<NormalShader> createState() => _NormalShaderState();
}

class _NormalShaderState extends State<NormalShader> {
  Timer? timer;
  double delta = 0;
  ui.FragmentShader? shader;
  ui.Image? image;

  void loadMyShader() async {
    if (widget.simplers.isNotEmpty) {
      for (var simpler in widget.simplers) {
        image = await loadImageFromAsset(simpler);
      }
    }
    var program = await ui.FragmentProgram.fromAsset(widget.asset);
    shader = program.fragmentShader();

    if (mounted) {
      setState(() {});
    }

    timer = Timer.periodic(const Duration(milliseconds: 16), (timer) {
      if (mounted) {
        setState(() {
          delta += 1 / 60;
        });
      }
    });
  }

  @override
  void initState() {
    super.initState();
    loadMyShader();
  }

  @override
  void dispose() {
    timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (shader == null) {
      return const Center(child: CircularProgressIndicator());
    } else {
      return SizedBox(
        width: widget.width,
        height: widget.height,
        child: CustomPaint(
          painter: NormalShaderPainter(
            shader!,
            delta,
            image,
          ),
        ),
      );
    }
  }
}

class NormalShaderPainter extends CustomPainter {
  final ui.FragmentShader shader;
  final double time;
  final ui.Image? image;

  NormalShaderPainter(
    ui.FragmentShader fragmentShader,
    this.time,
    this.image,
  ) : shader = fragmentShader;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint();
    shader.setFloat(0, size.width);
    shader.setFloat(1, size.height);
    shader.setFloat(2, time);
    if (image != null) shader.setImageSampler(0, image!);
    paint.style = PaintingStyle.fill;
    paint.shader = shader;

    // Create a matrix that flips the y-axis
    final matrix4 = Matrix4.identity();
    matrix4.setEntry(1, 1, -1);

    // Translate the canvas down by its height
    matrix4.translate(0.0, -size.height);

    // Apply the transformation
    canvas.transform(matrix4.storage);

    canvas.drawRect(Offset.zero & size, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
