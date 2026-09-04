import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> buildShaderWidgets() {
  return [
    if (!kIsWeb) AwesomeShader(SA.veryFastProceduralOcean),
    // TODO 有不适配 skia 的语法
    // error: 98: loop index must be compared with a constant expression
    AwesomeShader(() {
      final main = 'shaders/v/Volumetric explosion.frag'.shaderBuffer;
      main.feedInput(rgbaNoiseMediumInput);
      // main.feed(SA.textureRgbaNoiseSmall, wrap: .repeat, filter: .linear);
      main.feedKeyboard();
      main.feedInput(greyNoiseSmallInput);
      // main.feed(SA.textureGreyNoiseMedium, wrap: .repeat, filter: .linear);
      return [main];
    }),
    AwesomeShader(() {
      final buffer = 'shaders/v/Volumetric Mandelbulb.frag'.shaderBuffer;
      // buffer.input(SA.textureGreyNoiseMedium, wrap: .repeat, filter: .linear);
      buffer.feedInput(greyNoiseMediumInput);
      return [buffer];
    }),
  ];
}
