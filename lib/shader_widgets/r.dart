import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> shadersWidget() {
  return [
    // Spreading Frost
    AwesomeShader('shaders/r/Rotate And Points Circle.frag'),
    AwesomeShader('shaders/r/Red-Blue Swirl.frag'),
    AwesomeShader('shaders/r/Raymarching Basic.frag'),
    // TODO: Support repeat
    AwesomeShader('shaders/r/Rainier mood.frag'.feed(SA.textureWood)),
    //  TODO 效果不一样
    Builder(builder: (_) {
      final shader = SA.v2rPortalIosAr.shaderBuffer;
      final bufferA = SA.v2rPortalIosArBufferA.shaderBuffer;
      bufferA.feedback();
      shader.feedShader(bufferA);
      shader.feedImageFromAsset(SA.textureLondon);
      return AwesomeShader([bufferA, shader]);
    }),
    // TODO: 卡
    // Builder(builder: (_) {
    //   final shader = 'shaders/r/Rainforest.frag'.shaderBuffer;
    //   final bufferA = 'shaders/r/Rainforest BufferA.frag'.shaderBuffer;
    //   bufferA.feedback();
    //   shader.feedShader(bufferA);
    //   return AwesomeShader([bufferA, shader]);
    // }),
    // ShaderSurfaceWrapper.builder(() {
    //   final shader = 'shaders/r/Rainforest.frag'.shaderBuffer;
    //   final bufferA = 'shaders/r/Rainforest BufferA.frag'.shaderBuffer;
    //   bufferA.feedback();
    //   shader.feedShader(bufferA);
    //   return [bufferA, shader];
    // }),
    // 'shaders/r/Reclaim the streets.frag'
    AwesomeShader(SA.v2rReclaimTheStreets),
  ];
}
