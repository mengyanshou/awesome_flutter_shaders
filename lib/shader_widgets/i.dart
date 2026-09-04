import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> buildShaderWidgets() {
  return [
    if (!kIsWeb) AwesomeShader(SA.inerciaIntendedOne),
    // keep this code for compare different noise inputs
    // AwesomeShader(
    //   () {
    //     final buffer = SA.inkBlotSpread.shaderBuffer;
    //     buffer.feed(SA.textureRgbaNoiseMedium, wrap: .repeat, filter: .linear);
    //     return [buffer];
    //   },
    //   upSideDown: false,
    //   inputs: [SA.textureLondon],
    // ),
    // TODO: The effect is a bit different, the reson mabey is the linear filter
    AwesomeShader(
      () {
        final buffer = SA.inkBlotSpread.shaderBuffer;
        buffer.feed(rgbaNoiseMediumInput);
        return [buffer];
      },
      upSideDown: false,
      inputs: [SA.textureLondon],
    ),
    AwesomeShader(SA.inputTime),
    if (!kIsWeb)
      AwesomeShader(() {
        final bufferA = ShaderBuffer(SA.insideTheMandelbulbIiBufferA);
        final mainBuffer = ShaderBuffer(SA.insideTheMandelbulbIi);
        mainBuffer.feedShader(bufferA);
        return [bufferA, mainBuffer];
      }),
    AwesomeShader(SA.insideTheMandelbulbIiBufferA),
    AwesomeShader(
      SA.inverseBilinear,
      inputs: [SA.textureLondon],
    ),
    if (!kIsWeb) AwesomeShader(SA.ionize, upSideDown: false),
  ];
}
