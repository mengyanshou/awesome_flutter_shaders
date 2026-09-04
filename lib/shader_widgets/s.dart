import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:shader_buffers/shader_buffers.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> buildShaderWidgets() {
  return [
    AwesomeShader(SA.seascape),
    AwesomeShader(SA.serverRoom),
    AwesomeShader(SA.shaderArtCodingIntroduction),
    AwesomeShader(SA.shockWaveWithSaturation.feed(SA.textureStars)),
    if (!kIsWeb) AwesomeShader(SA.simpleRefractionTest.feed(SA.cubemapUffiziGalleryBlurred)),
    AwesomeShader(SA.simpleRippleShader.feed(SA.textureStars)),
    AwesomeShader(SA.singularity),
    if (!kIsWeb)
      AwesomeShader(
        SA.spaceCurvature.feed(SA.textureStars, wrap: .repeat).feed(SA.textureOrganic2, wrap: .repeat),
      ),
    if (!kIsWeb) AwesomeShader(SA.sphereGears.feed(SA.textureRustyMetal)),
    AwesomeShader(SA.splitPrism.feed(SA.textureLondon)),
    AwesomeShader(upSideDown: false, () {
      final shader = SA.spreadingFrost.shaderBuffer;
      shader.feed(SA.textureLondon);
      shader.feed(SA.textureLichen);
      shader.feed(SA.textureOrganic2);
      return [shader];
    }),
    // keep this code for compare different noise inputs
    // if (!kIsWeb) AwesomeShader(SA.starfieldNew.feed(SA.textureRgbaNoiseMedium, wrap: .repeat)),
    if (!kIsWeb) AwesomeShader(SA.starfieldNew.feed(rgbaNoiseMediumInput)),

    // TODO
    // Builder(builder: (_) {
    //   final bufferA = 'shaders/s/superResolution BufferA.frag'.shaderBuffer;
    //   final bufferB = 'shaders/s/superResolution BufferB.frag'.shaderBuffer;
    //   final bufferC = 'shaders/s/superResolution BufferC.frag'.shaderBuffer;
    //   final bufferD = 'shaders/s/superResolution BufferD.frag'.shaderBuffer;
    //   final main = 'shaders/s/superResolution.frag'.shaderBuffer;
    //   bufferA.feedImageFromAsset(SA.textureLondon);
    //   bufferA.feedback();
    //   bufferB.feedShader(bufferA);
    //   bufferC.feedShader(bufferB);
    //   bufferD.feedShader(bufferA).feedShader(bufferC);
    //   main.feedShader(bufferC).feedShaderFromAsset('assets/codepage12.png');
    //   main.feedShader(bufferD).feedShader(bufferA);
    //   return AwesomeShader([bufferA, bufferB, bufferC, bufferD]);
    // }),
  ];
}
