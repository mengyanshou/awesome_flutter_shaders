import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:ui' as ui;

class RayShaderPainter extends CustomPainter {
  final ui.FragmentShader shader;
  final double width;
  final double height;

  RayShaderPainter(this.shader, this.width, this.height);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..shader = shader
      ..isAntiAlias = true;

    shader.setFloat(0, width);
    shader.setFloat(1, height);

    canvas.drawRect(Rect.fromLTWH(0, 0, width, height), paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    return false;
  }
}

class RayShaderWidget extends StatefulWidget {
  @override
  _RayShaderWidgetState createState() => _RayShaderWidgetState();
}

class _RayShaderWidgetState extends State<RayShaderWidget> {
  ui.FragmentShader? shader;

  @override
  void initState() {
    super.initState();
    _loadShader();
  }

  Future<void> _loadShader() async {
    // final shaderCode = await rootBundle.loadString('assets/sula.frag');
    var program = await ui.FragmentProgram.fromAsset('shaders/sula.frag');
    final shader = program.fragmentShader();
    setState(() {
      this.shader = shader;
    });
  }

  @override
  Widget build(BuildContext context) {
    return shader == null
        ? Center(child: CircularProgressIndicator())
        : CustomPaint(
            painter: RayShaderPainter(shader!, MediaQuery.of(context).size.width, MediaQuery.of(context).size.height),
            size: Size(MediaQuery.of(context).size.width, MediaQuery.of(context).size.height),
          );
  }
}

void main() {
  runApp(MaterialApp(
    home: Scaffold(
      body: RayShaderWidget(),
    ),
  ));
}
