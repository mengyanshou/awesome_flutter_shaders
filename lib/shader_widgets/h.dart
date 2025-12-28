import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> shadersWidget() {
  return [
    // TODO: Wrap: Repeat
    AwesomeShader('shaders/h/Hell.frag'.feed(SA.textureRgbaNoiseMedium)),
  ];
}
