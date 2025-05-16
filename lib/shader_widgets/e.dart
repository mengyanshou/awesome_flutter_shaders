import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_buffers/shader_buffers.dart';

List<Widget> shadersWidget() {
  return [
    if (enableImpller) shader('shaders/e/ED-209.frag', upSideDown: true),
    // shader(ShaderAssets.electron),
    // SizedBox(
    //   child: Builder(builder: (context) {
    //     final bufferA = LayerBuffer(shaderAssetsName: ShaderAssets.expansiveReactionDiffusionBufferA);
    //     final bufferB = LayerBuffer(shaderAssetsName: ShaderAssets.expansiveReactionDiffusionBufferB);
    //     final bufferC = LayerBuffer(shaderAssetsName: ShaderAssets.expansiveReactionDiffusionBufferC);
    //     final bufferD = LayerBuffer(shaderAssetsName: ShaderAssets.expansiveReactionDiffusionBufferD);
    //     final mainBuffer = LayerBuffer(shaderAssetsName: ShaderAssets.expansiveReactionDiffusion);
    //     bufferA.setChannels([
    //       IChannel(buffer: bufferA),
    //       IChannel(buffer: bufferC),
    //       IChannel(buffer: bufferD),
    //       IChannel(assetsTexturePath: ShaderAssets.nosiePng),
    //     ]);
    //     bufferB.setChannels([
    //       IChannel(buffer: bufferA),
    //     ]);
    //     bufferC.setChannels([
    //       IChannel(buffer: bufferB),
    //     ]);
    //     bufferD.setChannels([
    //       IChannel(buffer: bufferA),
    //     ]);
    //     mainBuffer.setChannels([
    //       IChannel(buffer: bufferA),
    //       IChannel(buffer: bufferC),
    //       IChannel(assetsTexturePath: ShaderAssets.backPng),
    //       IChannel(assetsTexturePath: ShaderAssets.nosiePng),
    //     ]);
    //     return ShaderBuffers(
    //       key: UniqueKey(),
    //       controller: controller,
    //       mainImage: mainBuffer,
    //       buffers: [bufferA, bufferB, bufferC, bufferD],
    //     );
    //   }),
    // ),
  ];
}
