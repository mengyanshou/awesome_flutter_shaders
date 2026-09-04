import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> buildShaderWidgets() {
  return [
    AwesomeShader(
      SA.pageCurlEffectOnBall.shaderBuffer.feed(SA.cubemapUffiziGalleryBlurred).feed(SA.textureAbstract1).feed(SA.textureOrganic2),
    ),
    AwesomeShader(SA.pulsarExplained),
    AwesomeShader(SA.palaceOfMind),
    AwesomeShader(
      SA.parallaxTransitionWithMouse.shaderBuffer.feed(SA.textureLondon).feed(SA.textureOrganic2),
      upSideDown: false,
    ),
    AwesomeShader(SA.perlinSinSphere),
    if (!kIsWeb) AwesomeShader(SA.perspexWebLattice.shaderBuffer.feed(SA.textureLondon), upSideDown: false),
    AwesomeShader(SA.phantomStarForCineShader),
    AwesomeShader(SA.pigSquad9YearAnniversary),
    // keep this code for compare different noise inputs
    // if (!kIsWeb)
    //   AwesomeShader(() {
    //     final buffer = SA.pistonsWithMotionBlur.buffer;
    //     buffer.feed(SA.cubemapUffiziGalleryBlurred).feed(SA.textureRgbaNoiseMedium);
    //     return buffer;
    //   }),
    if (!kIsWeb)
      AwesomeShader(() {
        final buffer = SA.pistonsWithMotionBlur.shaderBuffer;
        buffer.feed(SA.cubemapUffiziGalleryBlurred).feed(rgbaNoiseMediumInput);
        return buffer;
      }),
    // keep this code for compare different noise inputs
    // AwesomeShader(SA.plasmaGlobe.feed(SA.textureRgbaNoiseMedium)),
    AwesomeShader(SA.plasmaGlobe.feed(rgbaNoiseMediumInput)),
    if (!kIsWeb)
      AwesomeShader(() {
        final shader = SA.portalIosAr.shaderBuffer;
        final bufferA = SA.portalIosArBufferA.shaderBuffer;
        bufferA.feedback();
        shader.feed(bufferA);
        shader.feed(SA.textureLondon);
        return [bufferA, shader];
      }),
    if (!kIsWeb)
      AwesomeShader(
        () {
          final shader = SA.portal2BoxFlipRotation.shaderBuffer;
          shader.feed(SA.textureLondon);
          shader.feed(SA.textureWood);
          return [shader];
        },
        upSideDown: false,
      ),
    AwesomeShader(SA.proteanClouds, upSideDown: false),
    AwesomeShader(
      SA.simplePageCurlEffect.feed(SA.textureLondon).feed(SA.textureWood),
      upSideDown: false,
    ),
  ];
}
