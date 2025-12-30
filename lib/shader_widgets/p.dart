import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> shadersWidget() {
  return [
    AwesomeShader(
      SA.pageCurlEffectOnBall.shaderBuffer
          .feed(SA.cubemapUffiziGallery)
          .feed(SA.textureAbstract1)
          .feed(SA.textureOrganic2),
    ),
    AwesomeShader(SA.pulsarExplained),
    AwesomeShader(SA.palaceOfMind),
    AwesomeShader(
      SA.parallaxTransitionWithMouse.shaderBuffer.feed(SA.textureLondon).feed(SA.textureOrganic2),
      upSideDown: false,
    ),
    AwesomeShader(SA.perlinSinSphere),
    AwesomeShader(SA.perspexWebLattice.feed(SA.textureLondon), upSideDown: false),
    AwesomeShader(SA.phantomStarForCineShader),
    AwesomeShader(SA.pigSquad9YearAnniversary),
    AwesomeShader(
      SA.pistonsWithMotionBlur.shaderBuffer.feed(SA.cubemapUffiziGallery).feed(SA.textureRgbaNoiseMedium),
    ),
    AwesomeShader(SA.plasmaGlobe.feed(SA.textureRgbaNoiseMedium)),
    Builder(
      builder: (_) {
        final shader = SA.portalIosAr.shaderBuffer;
        final bufferA = SA.portalIosArBufferA.shaderBuffer;
        bufferA.feedback();
        shader.feedShader(bufferA);
        shader.feedImageFromAsset(SA.textureLondon);
        return AwesomeShader([bufferA, shader]);
      },
    ),
    Builder(
      builder: (_) {
        final shader = SA.portal2BoxFlipRotation.shaderBuffer;
        shader.feed(SA.textureLondon);
        shader.feed(SA.textureWood);
        return AwesomeShader(shader, upSideDown: false);
      },
    ),
    AwesomeShader(SA.proteanClouds, upSideDown: false),
    AwesomeShader(
      SA.simplePageCurlEffect.feed(SA.textureLondon).feed(SA.textureWood),
      upSideDown: false,
    ),
  ];
}
