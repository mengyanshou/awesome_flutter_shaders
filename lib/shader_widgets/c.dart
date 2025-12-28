import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> shadersWidget() {
  return [
    AwesomeShader(SA.v2cColorfulUnderwaterBubblesIi),
    // TODO 这个 channel 没必要
    AwesomeShader(SA.v2cCubeLines.feed(SA.wall)),
    AwesomeShader(SA.v2cCubular),
    AwesomeShader(SA.v2cCineShaderLava),
    AwesomeShader(SA.v2cClouds2D),
    AwesomeShader(SA.v2cCobwebTest),
    AwesomeShader(SA.v2cCold),
    // Curl noise Image transition
    AwesomeShader(
      'shaders/c/Curl noise Image transition.frag'.feed(SA.wall).feed(SA.textureLondon),
      upSideDown: false,
    ),
  ];
}
