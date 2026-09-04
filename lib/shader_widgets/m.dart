import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> buildShaderWidgets() {
  return [
    AwesomeShader(SA.moFromWallE),
    if (!kIsWeb)
      AwesomeShader(() {
        final bufferA = ShaderBuffer(SA.macOsMonterey2BufferA);
        final mainBuffer = ShaderBuffer(SA.macOsMonterey2);
        mainBuffer.feed(bufferA);
        return [bufferA, mainBuffer];
      }),
    if (!kIsWeb) AwesomeShader(SA.macOsMonterey2BufferA),
    if (!kIsWeb)
      AwesomeShader(() {
        final bufferA = ShaderBuffer(SA.macOsMontereyWallpaperBufferA);
        final mainBuffer = ShaderBuffer(SA.macOsMontereyWallpaper);
        mainBuffer.feed(bufferA);
        return [bufferA, mainBuffer];
      }),
    if (!kIsWeb) AwesomeShader(SA.macOsMontereyWallpaperBufferA),
    if (!kIsWeb) AwesomeShader(SA.mandelbulb3DFractal),
    AwesomeShader(SA.mandelbulb),
    AwesomeShader(SA.marioWorld11),
    AwesomeShader(SA.metalVortex),
    AwesomeShader(SA.monster),
    AwesomeShader(SA.montereyWannabe),
  ];
}
