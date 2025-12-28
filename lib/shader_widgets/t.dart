import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_buffers/shader_buffers.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> shadersWidget() {
  return [
    // tm gyroids
    const AwesomeShader('shaders/t/tm gyroids.frag'),
    // Transition Burning
    // TODO: Support Clamp/Repeat
    AwesomeShader(
      'shaders/t/Transition Burning.frag'
          .feed(SA.textureRockTiles, wrap: WrapMode.repeat)
          .feed(SA.texturePebbles, wrap: WrapMode.repeat),
      upSideDown: false,
    ),
    // TODOO Up side down
    AwesomeShader('shaders/t/Transition SST.frag'.feed(SA.textureLondon), upSideDown: false),
    AwesomeShader(
      'shaders/t/Transition with image.frag'.feed(SA.texturePebbles).feed(SA.textureLondon).feed(SA.textureRockTiles),
      upSideDown: false,
    ),
    const AwesomeShader('shaders/t/Tunnel Cable.frag'),
    // TODO: Effect not match
    AwesomeShader('shaders/t/Tissue.frag'.feed(SA.textureAbstract1, wrap: WrapMode.repeat)),
    // TIE Fighters
    AwesomeShader('shaders/t/TIE Fighters.frag'),
    // TODO: Noise image, Effect not match
    AwesomeShader('shaders/t/The sun, the sky and the clouds.frag'.feed(SA.textureRgbaNoiseMedium)),
  ];
}
