import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> buildShaderWidgets() {
  return [
    // TODO: The effect is a bit different, the reson mabey is the linear filter
    // Builder(
    //   builder: (_) {
    //     final shader = 'shaders/r/Rainforest.frag'.shaderBuffer;
    //     final bufferA = 'shaders/r/Rainforest BufferA.frag'.shaderBuffer;
    //     bufferA.feedback();
    //     shader.feed(bufferA, filter: .linear);
    //     return AwesomeShader([bufferA, shader]);
    //   },
    // ),
    AwesomeShader(SA.rainierMood.feed(SA.textureAbstract1, wrap: .repeat)),
    AwesomeShader(SA.raymarchingBasic),
    AwesomeShader(SA.redBlueSwirl),
    if (!kIsWeb) AwesomeShader(SA.reclaimTheStreets),
    AwesomeShader(SA.rotateAndPointsCircle),
  ];
}
