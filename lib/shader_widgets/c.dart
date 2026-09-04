import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> buildShaderWidgets() {
  return [
    AwesomeShader(SA.cineShaderLava),
    AwesomeShader(SA.clouds2D),
    AwesomeShader('shaders/c/Clouds 3D.frag'),
    AwesomeShader(SA.cobwebTest),
    if (!kIsWeb) AwesomeShader(SA.cold),
    AwesomeShader(SA.colorfulUnderwaterBubblesIi),
    AwesomeShader(SA.combustibleVoronoi),
    AwesomeShader(
      SA.crosswarpTransition,
      upSideDown: false,
      inputs: [
        SA.textureAbstract1,
        SA.textureLondon,
      ],
    ),
    // TODO: No input needed
    AwesomeShader(SA.cubeLines.feed(SA.textureLondon)),
    AwesomeShader(SA.cubular),
    AwesomeShader(
      () {
        final main = SA.curlNoiseImageTransition.shaderBuffer;
        main.feed(SA.textureAbstract1).feed(SA.textureLondon);
        return [main];
      },
      upSideDown: false,
    ),
  ];
}
