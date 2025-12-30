import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> shadersWidget() {
  return [
    AwesomeShader(SA.aLotOfSpheres),
    AwesomeShader(SA.aStudyOfGlass),
    Builder(
      builder: (context) {
        final mainBuffer = SA.alienOcean.shaderBuffer;
        final bufferA = SA.alienOceanBufferA.shaderBuffer;
        mainBuffer.feed(bufferA).feed(SA.textureRgbaNoiseSmall);
        return AwesomeShader(
          [mainBuffer, bufferA],
        );
      },
    ),
    AwesomeShader(SA.alienSpaceJockey),
    AwesomeShader(
      SA.alphaClip1BitDissolve
          .feed(SA.textureLondon)
          .feed(
            SA.textureGreyNoiseSmall,
            wrap: .repeat,
            filter: .linear,
          ),
      upSideDown: false,
    ),
    AwesomeShader(SA.angel),
    AwesomeShader(SA.arcadePacman),
    AwesomeShader(SA.artifactAtSea),
    AwesomeShader(SA.atmosphereSystemTest),
  ];
}
