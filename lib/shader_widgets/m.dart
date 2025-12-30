import 'dart:io';

import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> shadersWidget() {
  return [
    AwesomeShader(SA.moFromWallE),
    Builder(
      builder: (context) {
        final bufferA = ShaderBuffer(SA.macOsMonterey2BufferA);
        final mainBuffer = ShaderBuffer(SA.macOsMonterey2);
        mainBuffer.feedShader(bufferA);
        return AwesomeShader([bufferA, mainBuffer]);
      },
    ),
    AwesomeShader(SA.macOsMonterey2BufferA),
    Builder(
      builder: (context) {
        final bufferA = ShaderBuffer(SA.macOsMontereyWallpaperBufferA);
        final mainBuffer = ShaderBuffer(SA.macOsMontereyWallpaper);
        mainBuffer.feedShader(bufferA);
        return AwesomeShader([bufferA, mainBuffer]);
      },
    ),
    AwesomeShader(SA.macOsMontereyWallpaperBufferA),
    if (!Platform.isAndroid) AwesomeShader(SA.mandelbulb3DFractal),
    AwesomeShader(SA.mandelbulb),
    AwesomeShader(SA.marioWorld11),
    AwesomeShader(SA.metalVortex),
    AwesomeShader(SA.monster),
    AwesomeShader(SA.montereyWannabe),
  ];
}
