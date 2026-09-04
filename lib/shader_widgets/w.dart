import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> buildShaderWidgets() {
  return [
    // for compare different noise inputs
    // AwesomeShader(() {
    //   final main = 'shaders/w/Warp Tunnel.frag'.shaderBuffer;
    //   main.feed(SA.textureRgbaNoiseMedium, wrap: .repeat, filter: .linear);
    //   main.feed(SA.textureStars, wrap: .repeat, filter: .linear);
    //   main.feed(SA.textureOrganic2, wrap: .repeat, filter: .linear);
    //   return [main];
    // }),
    AwesomeShader(() {
      final main = 'shaders/w/Warp Tunnel.frag'.shaderBuffer;
      main.feedInput(rgbaNoiseMediumInput);
      main.feed(SA.textureStars, wrap: .repeat, filter: .linear);
      main.feed(SA.textureOrganic2, wrap: .repeat, filter: .linear);
      return [main];
    }),
    AwesomeShader(SA.warpedExtrudedSkewedGrid.feed(SA.textureOrganic2)),
    AwesomeShader(SA.warpingProcedural2),
    AwesomeShader(
      SA.wavyfire.feed(SA.textureLondon),
      upSideDown: false,
    ),
    AwesomeShader(SA.water2D.feed(SA.textureLondon)),
    AwesomeShader(
      SA.wavyfire.feed(SA.textureLondon),
      upSideDown: false,
    ),
    if (!kIsWeb) AwesomeShader(SA.whereTheRiverGoes.feed(SA.textureLichen)),
    AwesomeShader('shaders/w/WMW.frag'),
  ];
}
