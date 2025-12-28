import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> shadersWidget() {
  return [
    AwesomeShader(SA.v2fFire),
    AwesomeShader(SA.v2fFlame),
    AwesomeShader(SA.v2fFractalPyramid),
    AwesomeShader(SA.v2fFullSpectrumCyber),
  ];
}
