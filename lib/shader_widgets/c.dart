import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> shadersWidget() {
  return [
    AwesomeShader(SA.cineShaderLava),
    AwesomeShader(SA.clouds2D),
    AwesomeShader(SA.cobwebTest),
    AwesomeShader(SA.cold),
    AwesomeShader(SA.colorfulUnderwaterBubblesIi),
    AwesomeShader(SA.combustibleVoronoi),
    AwesomeShader(
      SA.crosswarpTransition.feed(SA.textureAbstract1).feed(SA.textureLondon),
      upSideDown: false,
    ),
    // TODO: No input needed
    AwesomeShader(SA.cubeLines.feed(SA.textureLondon)),
    AwesomeShader(SA.cubular),
    AwesomeShader(
      SA.curlNoiseImageTransition.feed(SA.wall).feed(SA.textureLondon),
      upSideDown: false,
    ),
  ];
}
