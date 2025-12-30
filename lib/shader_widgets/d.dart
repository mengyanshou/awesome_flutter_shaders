import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> shadersWidget() {
  return [
    AwesomeShader(SA.darkTransit),
    AwesomeShader(SA.desireCrystal),
    AwesomeShader(SA.devilGlass),
    AwesomeShader(SA.diveToCloud),
    // TODO: Effect not match
    AwesomeShader(
      SA.digitalBrain.feed(SA.textureRgbaNoiseSmall, wrap: WrapMode.repeat, filter: FilterMode.linear),
    ),
    // ! It is quite laggy but works fine, so comment it out for now
    // AwesomeShader('shaders/d/divergence-free flow curly noise.frag'),
    Builder(
      builder: (context) {
        final bufferA = SA.dodecahedronBufferA.shaderBuffer.feedback();
        final bufferB = SA.dodecahedron.feed(bufferA);
        return AwesomeShader([bufferA, bufferB]);
      },
    ),
    AwesomeShader(SA.drifting),
    AwesomeShader(SA.driveHome6RainWindow),
    AwesomeShader(SA.dullSkullPrometheus.feed(SA.wall)),
    // TODO: Look into the function of this keyboard input
    AwesomeShader(
      SA.dustyNebula4
          .feed(
            SA.textureRgbaNoiseMedium,
            wrap: WrapMode.mirror,
            filter: FilterMode.linear,
          )
          .feedKeyboard(),
    ),
  ];
}
