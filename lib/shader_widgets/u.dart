import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> buildShaderWidgets() {
  return [
    AwesomeShader(SA.uiNoiseHalo),
    // TODO: Effect not match
    // Builder(
    //   builder: (context) {
    //     final main = SA.undergroundPassageway.shaderBuffer;
    //     final bufferA = SA.undergroundPassagewayBufferA.shaderBuffer;
    //     bufferA.feedback();
    //     main.feedShader(bufferA);
    //     main.feed(SA.textureOrganic3);
    //     return AwesomeShader([bufferA, main]);
    //   },
    // ),
    // for compare different noise inputs
    // if (!kIsWeb) AwesomeShader(SA.undularSubstratum.feed(SA.textureRgbaNoiseSmall, wrap: .repeat)),
    if (!kIsWeb) AwesomeShader(SA.undularSubstratum.feed(rgbaNoiseMediumInput)),
  ];
}
