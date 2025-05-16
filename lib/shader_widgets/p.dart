import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_buffers/shader_buffers.dart';

List<Widget> shadersWidget() {
  return [
    shader(ShaderAssets.phantomStarForCineShader),
    shader(ShaderAssets.pinku),
    Builder(
      builder: (context) {
        final mainLayer = LayerBuffer(shaderAssetsName: ShaderAssets.pageCurl);
        mainLayer.setChannels([
          IChannel(assetsTexturePath: ShaderAssets.wall),
          IChannel(assetsTexturePath: ShaderAssets.bricks),
        ]);
        return ShaderBuffers(
          key: UniqueKey(),
          controller: controller,
          mainImage: mainLayer,
        );
      },
    ),
    SizedBox(
      child: Builder(builder: (context) {
        final bufferA = LayerBuffer(shaderAssetsName: ShaderAssets.protoplanetBufferA);
        final mainBuffer = LayerBuffer(shaderAssetsName: ShaderAssets.protoplanet);
        bufferA.setChannels([
          IChannel(buffer: bufferA),
        ]);
        mainBuffer.setChannels([
          IChannel(buffer: bufferA),
        ]);
        return ShaderBuffers(
          key: UniqueKey(),
          controller: controller,
          mainImage: mainBuffer,
          buffers: [bufferA],
        );
      }),
    ),
  ];
}
