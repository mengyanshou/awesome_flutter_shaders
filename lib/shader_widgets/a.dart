import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> shadersWidget() {
  return [
    AwesomeShader(SA.v2aAStudyOfGlass),
    Builder(builder: (context) {
      final mainBuffer = SA.v2aAlienOcean.shaderBuffer;
      final bufferA = SA.v2aAlienOceanBufferA.shaderBuffer;
      mainBuffer.feed(bufferA).feed(SA.textureRgbaNoiseSmall);
      return AwesomeShader(
        [mainBuffer, bufferA],
      );
    }),
    AwesomeShader(SA.v2aAlienSpaceJockey),
    AwesomeShader(SA.v2aArtifactAtSea),
  ];
}
