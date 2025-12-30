import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> shadersWidget() {
  return [
    AwesomeShader(SA.galaxyOfUniverses),
    AwesomeShader(SA.galvanize),
    AwesomeShader(SA.ghosts),
    AwesomeShader(
      SA.goodbyeDreamClouds.feed(
        SA.textureRgbaNoiseMedium,
        wrap: WrapMode.repeat,
        filter: FilterMode.linear,
      ),
    ),
    AwesomeShader(SA.gradientFlow),
  ];
}
