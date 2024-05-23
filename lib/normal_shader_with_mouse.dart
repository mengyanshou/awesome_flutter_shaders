import 'dart:async';
import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:flutter/material.dart' hide Image;
import 'package:flutter/services.dart';

class NormalShader extends StatefulWidget {
  const NormalShader({
    super.key,
    required this.asset,
  });
  final String asset;

  @override
  State<NormalShader> createState() => _NormalShaderState();
}

class _NormalShaderState extends State<NormalShader> {
  late Timer timer;
  double delta = 0;
  ui.FragmentShader? shader;
  ui.Image? image;

  void loadMyShader() async {
    var program = await ui.FragmentProgram.fromAsset(widget.asset);
    shader = program.fragmentShader();

    setState(() {
      // trigger a repaint
    });

    timer = Timer.periodic(const Duration(milliseconds: 16), (timer) {
      setState(() {
        delta += 1 / 60;
      });
    });
  }

  @override
  void initState() {
    super.initState();
    loadMyShader();
  }

  @override
  void dispose() {
    timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (shader == null) {
      return const Center(child: CircularProgressIndicator());
    } else {
      return CustomPaint(
        painter: NormalShaderPainter(
          shader!,
          delta,
        ),
      );
    }
  }
}

class NormalShaderPainter extends CustomPainter {
  final ui.FragmentShader shader;
  final double time;

  NormalShaderPainter(
    ui.FragmentShader fragmentShader,
    this.time,
  ) : shader = fragmentShader;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint();
    shader.setFloat(0, size.width);
    shader.setFloat(1, size.height);
    shader.setFloat(2, time);
    paint.shader = shader;
    canvas.drawRect(Offset.zero & size, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
