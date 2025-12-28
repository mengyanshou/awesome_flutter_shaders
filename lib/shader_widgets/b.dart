import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_buffers/shader_buffers.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> shadersWidget() {
  return [
    // TODO: Need input keyboard
    // Column(
    //   children: [
    //     Builder(
    //       builder: (context) {
    //         // shaders/e/Elevated.frag
    //         final mainLayer = LayerBuffer(shaderAssetsName: 'shaders/b/Bricks Game.frag');
    //         final bufferA = LayerBuffer(shaderAssetsName: 'shaders/b/Bricks Game BufferA.frag');
    //         mainLayer.setChannels([IChannel(buffer: bufferA)]);
    //         return LayoutBuilder(
    //           builder: (context, con) {
    //             return ShaderBuffers(
    //               key: UniqueKey(),
    //               height: con.maxWidth * 9 / 16,
    //               controller: controller,
    //               mainImage: mainLayer,
    //               buffers: [bufferA],
    //             );
    //           },
    //         );
    //       },
    //     ),
    //     Text('Bricks Game', style: shaderTitleStyle),
    //   ],
    // ),
    // ShaderSurfaceWrapper.builder(() {
    //   final mainBuffer = 'shaders/b/Bricks Game.frag'.shaderBuffer;
    //   final bufferA = 'shaders/b/Bricks Game BufferA.frag'.shaderBuffer;
    //   bufferA.feedback().addKeyboardInput();
    //   mainBuffer.addShaderBuffer(bufferA);
    //   return [mainBuffer, bufferA];
    // }),
    AwesomeShader(SA.v2bBallsAreRubbing),
    AwesomeShader(SA.v2bBaseWarpFbm),
    AwesomeShader('shaders/b/Broken Time Gate.frag'.feed(SA.textureGreyNoiseMedium, wrap: .repeat)),
    AwesomeShader(SA.v2bBubbles),
    AwesomeShader(SA.v2bByt3Daily013),
  ];
}
