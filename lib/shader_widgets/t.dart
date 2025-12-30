import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_buffers/shader_buffers.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> shadersWidget() {
  return [
    // TODO: Noise image, Effect not match
    AwesomeShader(SA.theSunTheSkyAndTheClouds.feed(SA.textureRgbaNoiseMedium)),
    AwesomeShader(SA.tieFighters),
    AwesomeShader(SA.tmGyroids),
    // TODO: Support Clamp/Repeat
    AwesomeShader(
      SA.transitionBurning
          .feed(SA.textureRockTiles, wrap: WrapMode.repeat)
          .feed(SA.texturePebbles, wrap: WrapMode.repeat),
      upSideDown: false,
    ),
    // TODOO Up side down
    AwesomeShader(SA.transitionSst.feed(SA.textureLondon), upSideDown: false),
    AwesomeShader(
      SA.transitionWithImage.feed(SA.texturePebbles).feed(SA.textureLondon).feed(SA.textureRockTiles),
      upSideDown: false,
    ),
    AwesomeShader(SA.tunnelCable),
    // TODO: Effect not match
    AwesomeShader(
      SA.tissue.feed(
        SA.textureAbstract1,
        wrap: WrapMode.repeat,
        // filter: FilterMode.nearest,
      ),
    ),
    // TIE Fighters
  ];
}
