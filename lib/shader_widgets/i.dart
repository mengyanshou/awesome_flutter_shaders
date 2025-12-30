import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> shadersWidget() {
  return [
    AwesomeShader(SA.inerciaIntendedOne),
    // TODO: The effect is a bit different, the reson mabey is the linear filter
    Builder(
      builder: (context) {
        final buffer = SA.inkBlotSpread.shaderBuffer;
        buffer.feed(SA.textureRgbaNoiseMedium, wrap: WrapMode.repeat, filter: FilterMode.linear);
        buffer.feed(SA.textureLondon);
        return AwesomeShader(
          buffer,
          upSideDown: false,
        );
      },
    ),
    AwesomeShader(SA.inputTime),
    Builder(
      builder: (context) {
        final bufferA = ShaderBuffer(SA.insideTheMandelbulbIiBufferA);
        final mainBuffer = ShaderBuffer(SA.insideTheMandelbulbIi);
        mainBuffer.feedShader(bufferA);
        return AwesomeShader([bufferA, mainBuffer]);
      },
    ),
    AwesomeShader(SA.insideTheMandelbulbIiBufferA),
    AwesomeShader(SA.inverseBilinear.feed(SA.textureLondon)),
    AwesomeShader(SA.ionize, upSideDown: false),
  ];
}
