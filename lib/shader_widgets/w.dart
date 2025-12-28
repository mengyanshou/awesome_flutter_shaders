import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> shadersWidget() {
  return [
    // Warped Extruded Skewed Grid
    AwesomeShader('shaders/w/Warped Extruded Skewed Grid.frag'.feed(SA.textureOrganic2)),
    // Warping - procedural 2
    AwesomeShader('shaders/w/Warping - procedural 2.frag'),
    AwesomeShader('shaders/w/Water2D.frag'.feed(SA.textureLondon)),
    AwesomeShader(
      'shaders/w/wavyfire.frag'.feed(SA.textureLondon),
      upSideDown: false,
    ),
    // TODO: filter: mipmap wrap: repeat
    AwesomeShader('shaders/w/Where the River Goes.frag'.feed(SA.textureLichen)),
    shader(SA.wavyfire, channels: [SA.wall]),
    shader(SA.warpingProcedural2),
  ];
}
