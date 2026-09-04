import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> buildShaderWidgets() {
  return [
    // for compare different noise inputs
    // AwesomeShader(
    //   SA.theSunTheSkyAndTheClouds.feed(
    //     SA.textureRgbaNoiseMedium,
    //     filter: .linear,
    //     wrap: .repeat,
    //   ),
    // ),
    AwesomeShader(
      SA.theSunTheSkyAndTheClouds.feed(rgbaNoiseMediumInput),
    ),
    if (!kIsWeb) AwesomeShader(SA.tieFighters),
    if (!kIsWeb) AwesomeShader(SA.tmGyroids),
    AwesomeShader(
      SA.transitionBurning.feed(SA.textureRockTiles, wrap: .repeat).feed(SA.texturePebbles, wrap: .repeat),
      upSideDown: false,
    ),
    // TODO Up side down
    AwesomeShader(SA.transitionSst.feed(SA.textureLondon), upSideDown: false),
    AwesomeShader(
      SA.transitionWithImage.feed(SA.texturePebbles).feed(SA.textureLondon).feed(SA.textureRockTiles),
      upSideDown: false,
    ),
    AwesomeShader(SA.tunnelCable),
    AwesomeShader(
      SA.tissue.feed(
        SA.textureAbstract1,
        wrap: .repeat,
      ),
    ),
  ];
}
