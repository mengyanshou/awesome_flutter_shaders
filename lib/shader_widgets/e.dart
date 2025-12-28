import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> shadersWidget() {
  return [
    AwesomeShader(SA.v2eEd209),
    // Builder(
    //   builder: (context) {
    //     // shaders/e/Elevated.frag
    //     final mainLayer = LayerBuffer(shaderAssetsName: 'shaders/e/Elevated.frag');
    //     final bufferA = LayerBuffer(shaderAssetsName: 'shaders/e/Elevated bufferA.frag');
    //     bufferA.setChannels([
    //       IChannel(assetsTexturePath: 'assets/Noise Image Generator.png'),
    //     ]);
    //     mainLayer.setChannels([
    //       IChannel(buffer: bufferA),
    //     ]);
    //     return ShaderBuffers(
    //       key: UniqueKey(),
    //       controller: controller,
    //       mainImage: mainLayer,
    //       buffers: [bufferA],
    //     );
    //   },
    // ),
    // Builder(
    //   builder: (context) {
    //     // shaders/e/Elevated.frag
    //     final mainLayer = LayerBuffer(shaderAssetsName: 'shaders/e/Elevated.frag');
    //     final bufferA = LayerBuffer(shaderAssetsName: 'shaders/e/Elevated_buffera.frag');
    //     bufferA.setChannels([
    //       IChannel(assetsTexturePath: 'assets/Noise Image Generator.png'),
    //     ]);
    //     mainLayer.setChannels([
    //       IChannel(buffer: bufferA),
    //     ]);
    //     return ShaderBuffers(
    //       key: UniqueKey(),
    //       controller: controller,
    //       mainImage: mainLayer,
    //       buffers: [bufferA],
    //     );
    //   },
    // ),
  ];
}
