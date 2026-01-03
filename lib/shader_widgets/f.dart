import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> shadersWidget() {
  return [
    AwesomeShader(SA.fire),
    AwesomeShader(SA.flame),
    AwesomeShader(SA.fractalPyramid),
    Builder(
      builder: (_) {
        final bufferA = SA.fracturedOrbBufferA.shaderBuffer;
        bufferA.feed(
          SA.textureRgbaNoiseMedium,
          wrap: WrapMode.repeat,
          filter: FilterMode.linear,
        );
        final bufferB = SA.fracturedOrb.feed(bufferA);
        return AwesomeShader([bufferA, bufferB]);
      },
    ),
    AwesomeShader(SA.fullSpectrumCyber),
  ];
}
