import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_buffers/shader_buffers.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> shadersWidget() {
  return [
    AwesomeShader(SA.balaroBackgroundShaders),
    AwesomeShader(SA.ballsAreRubbing),
    AwesomeShader(SA.baseWarpFbm),
    AwesomeShader(
      SA.blackHoleOdeGeodesicSolver.feed(
        SA.textureStars,
        wrap: .repeat,
      ),
    ),
    // TODO: fix
    // Builder(
    //   builder: (_) {
    //     final bufferA = 'shaders/b/Black Hole Raymarcher 3 BufferA.frag'.shaderBuffer;
    //     final bufferB = 'shaders/b/Black Hole Raymarcher 3 BufferB.frag'.shaderBuffer;
    //     final bufferC = 'shaders/b/Black Hole Raymarcher 3 BufferC.frag'.shaderBuffer;
    //     final mainBuffer = 'shaders/b/Black Hole Raymarcher 3.frag'.shaderBuffer;
    //     bufferB.feed(bufferA);
    //     bufferC.feed(bufferB);
    //     mainBuffer.feed(bufferC);
    //     return AwesomeShader([bufferA, bufferB, bufferC, mainBuffer]);
    //   },
    // ),
    AwesomeShader(
      SA.brokenTimeGate.feed(
        SA.textureGreyNoiseMedium,
        wrap: .repeat,
        filter: .linear,
      ),
    ),
    AwesomeShader(SA.bubbles),
    AwesomeShader(SA.bumpedSinusoidalWarp.feed(SA.textureRustyMetal)),
    AwesomeShader(SA.buoy.feed(SA.textureRgbaNoiseMedium, wrap: .repeat)),
    AwesomeShader(SA.byt3Daily013),
  ];
}
