import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> shadersWidget() {
  return [
    // Warped Extruded Skewed Grid
    AwesomeShader(SA.warpedExtrudedSkewedGrid.feed(SA.textureOrganic2)),
    // Warping - procedural 2
    AwesomeShader(SA.warpingProcedural2),
    AwesomeShader(
      SA.wavyfire.feed(SA.textureLondon),
      upSideDown: false,
    ),
    AwesomeShader(SA.water2D.feed(SA.textureLondon)),
    shader(SA.wavyfire, channels: [SA.wall]),
    AwesomeShader(SA.whereTheRiverGoes.feed(SA.textureLichen)),
  ];
}
