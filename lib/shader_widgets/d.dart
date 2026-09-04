import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> buildShaderWidgets() {
  return [
    if (!kIsWeb) AwesomeShader(SA.darkTransit),
    if (!kIsWeb) AwesomeShader(SA.desireCrystal),
    AwesomeShader(SA.devilGlass),
    AwesomeShader(SA.diveToCloud),
    // for compare different noise inputs
    // AwesomeShader(
    //   SA.digitalBrain.feed(SA.textureRgbaNoiseSmall, wrap: WrapMode.repeat, filter: FilterMode.linear),
    // ),
    AwesomeShader(
      SA.digitalBrain.feed(rgbaNoiseSmallInput),
    ),
    // ! It is quite laggy but works fine, so comment it out for now
    // AwesomeShader('shaders/d/divergence-free flow curly noise.frag'),
    if (!kIsWeb)
      AwesomeShader(() {
        final bufferA = SA.dodecahedronBufferA.shaderBuffer.feedback();
        final bufferB = SA.dodecahedron.feed(bufferA);
        return [bufferA, bufferB];
      }),
    if (!kIsWeb) AwesomeShader(SA.drifting),
    AwesomeShader(SA.driveHome6RainWindow),
    if (!kIsWeb) AwesomeShader(SA.dullSkullPrometheus.feed(SA.cubemapUffiziGalleryBlurred)),
    // TODO: Look into the function of this keyboard input
    AwesomeShader(() {
      final buffer = SA.dustyNebula4.shaderBuffer;
      buffer.feedInput(rgbaNoiseMediumInput).feedKeyboard();

      // buffer.input(SA.textureRgbaNoiseMedium, wrap: .repeat, filter: .linear).inputKeyboard();
      return [buffer];
    }),
  ];
}
