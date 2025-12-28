import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> shadersWidget() {
  return [
    // TODO: Fix texture input
    Builder(builder: (context) {
      final mainBuffer = SA.v2lLandmassZMorph.shaderBuffer;
      mainBuffer.feedImageFromAsset(SA.textureLichen);
      return AwesomeShader(mainBuffer);
    }),
    AwesomeShader(
      SA.v2lLandmassZMorph.feed(SA.textureLichen),
    ),
    AwesomeShader(SA.v2lLetsSelfReflect),
  ];
}

List<Widget> shadersWidgetWithShaderBuffer() {
  return [
    // TODO: Fix texture input
    shader(SA.v2lLandmassZMorph, channels: [SA.textureLichen]),
    shader(SA.v2lLetsSelfReflect),
  ];
}
