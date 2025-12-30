import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> shadersWidget() {
  return [
    AwesomeShader(SA.ed209),
    const AwesomeShader('shaders/e/electron.frag', upSideDown: false),
    // TODO: Fix: Effect not match
    // Builder(
    //   builder: (context) {
    //     final main = 'shaders/e/Elevated.frag'.shaderBuffer;
    //     final bufferA = 'shaders/e/Elevated BufferA.frag'.shaderBuffer;
    //     bufferA.feed(
    //       SA.textureGreyNoiseMedium,
    //       wrap: .repeat,
    //       filter: .linear,
    //     );
    //     main.feedShader(bufferA);
    //     return AwesomeShader(
    //       [bufferA, main],
    //     );
    //   },
    // ),
    AwesomeShader(
      SA.entryLevel
          .feed(
            SA.textureAbstract1,
            wrap: .repeat,
          )
          .feed(SA.cubemapUffiziGallery),
    ),
  ];
}
