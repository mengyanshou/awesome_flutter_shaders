import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> buildShaderWidgets() {
  return [
    AwesomeShader(SA.aLotOfSpheres),
    AwesomeShader(SA.aStudyOfGlass),
    // AwesomeShader(() {
    //   final mainBuffer = SA.alienOcean.buffer;
    //   final bufferA = SA.alienOceanBufferA.buffer;
    //   mainBuffer.feed(bufferA).feed(SA.textureRgbaNoiseSmall);
    //   return [bufferA, mainBuffer];
    // }),
    AwesomeShader(() {
      final mainBuffer = SA.alienOcean.shaderBuffer;
      final bufferA = SA.alienOceanBufferA.shaderBuffer;
      mainBuffer.feed(bufferA).feedInput(rgbaNoiseSmallInput);
      return [bufferA, mainBuffer];
    }),
    AwesomeShader(SA.alienSpaceJockey),
    AwesomeShader(() {
      final buffer = SA.alphaClip1BitDissolve.shaderBuffer;
      // buffer.feed(
      //   SA.textureGreyNoiseMedium,
      //   wrap: .repeat,
      //   filter: .linear,
      // );
      buffer.feedInput(greyNoiseSmallInput);
      buffer.feed(SA.textureLondon);
      return [buffer];
    }),
    AwesomeShader('shaders/a/Analytic Motionblur 2D.frag'),
    AwesomeShader(
      'shaders/a/anamorphic rendering.frag',
      upSideDown: false,
      inputs: [SA.textureLondon],
    ),
    AwesomeShader(SA.angel),
    AwesomeShader(SA.arcadePacman),
    AwesomeShader(SA.artifactAtSea),
    AwesomeShader(SA.atmosphereSystemTest),
  ];
}
