import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> shadersWidget() {
  return [
    // TODO: Effect not match
    Builder(builder: (context) {
      final main = 'shaders/u/Underground Passageway.frag'.shaderBuffer;
      final bufferA = 'shaders/u/Underground Passageway BufferA.frag'.shaderBuffer;
      bufferA.feedback();
      main.feedShader(bufferA);
      main.feed(SA.textureOrganic3);
      return AwesomeShader([bufferA, main]);
    }),
    // TODO: Noise input
    AwesomeShader('shaders/u/Undular Substratum.frag'.feed(SA.textureRgbaNoiseSmall)),
    // UI noise halo
    const AwesomeShader('shaders/u/UI noise halo.frag'),
  ];
}
