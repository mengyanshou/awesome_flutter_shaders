import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_buffers/shader_buffers.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> shadersWidget() {
  return [
    AwesomeShader(SA.seascape),
    AwesomeShader(SA.serverRoom),
    AwesomeShader(SA.shaderArtCodingIntroduction),
    AwesomeShader(SA.shockWaveWithSaturation.feed(SA.textureStars)),
    AwesomeShader(SA.simpleRefractionTest.feed(SA.cubemapUffiziGallery)),
    AwesomeShader(SA.simpleRippleShader.feed(SA.textureStars)),
    AwesomeShader(SA.singularity),
    AwesomeShader(
      SA.spaceCurvature.feed(SA.textureStars, wrap: .repeat).feed(SA.textureOrganic2, wrap: .repeat),
    ),
    AwesomeShader(SA.sphereGears.feed(SA.textureRustyMetal)),
    AwesomeShader(SA.splitPrism.feed(SA.textureLondon)),
    Builder(
      builder: (context) {
        final shader = SA.spreadingFrost.shaderBuffer;
        shader.feedImageFromAsset(SA.textureLondon);
        shader.feedImageFromAsset(SA.textureLichen);
        shader.feedImageFromAsset(SA.textureOrganic2);
        return AwesomeShader(
          shader,
          upSideDown: false,
        );
      },
    ),
    AwesomeShader(SA.starfieldNew.feed(SA.textureRgbaNoiseMedium, wrap: .repeat)),

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
