import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> shadersWidget() {
  return [
    Builder(builder: (context) {
      final bufferA = ShaderBuffer(SA.v2iInsideTheMandelbulbIiBufferA);
      final mainBuffer = ShaderBuffer(SA.v2iInsideTheMandelbulbIi);
      mainBuffer.feedShader(bufferA);
      return AwesomeShader([bufferA, mainBuffer]);
    }),
    AwesomeShader(SA.v2iInsideTheMandelbulbIiBufferA),
    AwesomeShader(SA.v2iInputTime),
    AwesomeShader(SA.v2iInverseBilinear.feed(SA.textureLondon)),
    // inercia intended one
    AwesomeShader(SA.v2iInerciaIntendedOne),

    // TODO 效果不一样
    Builder(builder: (context) {
      final buffer = 'shaders/i/Ink Blot Spread.frag'.shaderBuffer;
      buffer.feed(SA.textureRgbaNoiseSmall);
      buffer.feed(SA.textureLondon);
      return AwesomeShader(buffer);
    })
  ];
}
