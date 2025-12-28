import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_buffers/shader_buffers.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> shadersWidget() {
  return [
    // Shock Wave with Saturation
    AwesomeShader('shaders/s/Shock Wave with Saturation.frag'.feed(SA.textureStars)),
    AwesomeShader('shaders/s/Simple ripple shader.frag'.feed(SA.textureStars)),
    AwesomeShader('shaders/s/Singularity.frag'),
    // TODO: 效果不一样
    AwesomeShader('shaders/s/Space Curvature.frag'.feed(SA.textureStars).feed(SA.textureOrganic2)),
    AwesomeShader('shaders/s/Sphere Gears.frag'.feed(SA.textureRustyMetal)),
    const AwesomeShader('shaders/s/Seascape.frag'),
    const AwesomeShader('shaders/s/Server Room.frag'),
    const AwesomeShader('shaders/s/Shader Art Coding Introduction.frag'),
    AwesomeShader('shaders/s/simple refraction test.frag'.feed(SA.cubemapUffiziGallery)),
    AwesomeShader('shaders/s/Split Prism.frag'.feed(SA.textureLondon)),
    // // TODO: 效果不一样
    Builder(builder: (context) {
      final shader = 'shaders/s/Spreading Frost.frag'.shaderBuffer;
      shader.feedImageFromAsset(SA.textureLondon);
      shader.feedImageFromAsset(SA.textureOrganic2);
      shader.feedImageFromAsset(SA.textureLichen);
      return AwesomeShader(
        shader,
        upSideDown: false,
      );
    }),
    AwesomeShader('shaders/s/starfield new.frag'.feed(SA.textureRgbaNoiseMedium)),

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
