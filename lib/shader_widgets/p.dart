import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_buffers/shader_buffers.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> shadersWidget() {
  return [
    // Pulsar Explained
    AwesomeShader(SA.v2pPulsarExplained),
    // TODO 奇卡无比
    // ShaderSurfaceWrapper.builder(() {
    //   final shader = 'shaders/p/Pistons with Motion Blur.frag'.shaderBuffer;
    //   shader.feedImageFromAsset(UffiziGallery);
    //   shader.feedImageFromAsset(RGBANoiseMedium);
    //   return [shader];
    // }),
    AwesomeShader('shaders/p/Phantom Star for CineShader.frag'),
    // TODO 效果不一样
    AwesomeShader(
      SA.v2pPlasmaGlobe.feed(SA.textureRgbaNoiseMedium),
    ),
    // TODO 和 Shadertoy 上的效果不一样
    Builder(builder: (_) {
      final shader = SA.v2pPortal2BoxFlipRotation.shaderBuffer;
      shader.feed(SA.textureLondon);
      shader.feed(SA.textureWood);
      return AwesomeShader([shader]);
    }),
    AwesomeShader(SA.v2pProteanClouds),
    AwesomeShader(
      SA.v2pPerspexWebLattice.feed(SA.textureLondon),
    ),
    AwesomeShader(SA.v2pPerlinSinSphere),
    AwesomeShader(
      SA.v2pSimplePageCurlEffect.feed(SA.textureLondon).feed(SA.textureWood),
      upSideDown: false,
    ),
    // TODO 这个的效果和 https://www.shadertoy.com/view/flVGWK 不一样
    // Up side down
    AwesomeShader(SA.v2pParallaxTransitionWithMouse.shaderBuffer.feed(SA.textureLondon).feed(SA.textureOrganic2)),
    AwesomeShader(SA.v2pPalaceOfMind),
    AwesomeShader(SA.v2pPigSquad9YearAnniversary),
    AwesomeShader(SA.v2pPageCurlEffectOnBall.shaderBuffer
        .feed(SA.cubemapUffiziGallery)
        .feed(SA.textureAbstract1)
        .feed(SA.textureOrganic2)),
  ];
}
