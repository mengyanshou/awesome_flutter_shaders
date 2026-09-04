import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> buildShaderWidgets() {
  return [
    AwesomeShader(SA.galaxyOfUniverses),
    AwesomeShader(SA.galvanize),
    AwesomeShader(SA.ghosts),
    // for compare different noise inputs
    // if (!kIsWeb)
    //   AwesomeShader(() {
    //     final buffer = SA.goodbyeDreamClouds.shaderBuffer;
    //     buffer..feed(
    //       SA.textureRgbaNoiseMedium,
    //       wrap: WrapMode.repeat,
    //       filter: FilterMode.linear,
    //     );
    //     return buffer;
    //   }),
    if (!kIsWeb)
      AwesomeShader(() {
        final buffer = SA.goodbyeDreamClouds.shaderBuffer;
        buffer.feed(rgbaNoiseMediumInput);
        return buffer;
      }),
    AwesomeShader(SA.gradientFlow),
  ];
}
