import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> buildShaderWidgets() {
  return [
    if (!kIsWeb) AwesomeShader(SA.fire3D),
    AwesomeShader(SA.flame),
    AwesomeShader(SA.fractalPyramid),
    if (!kIsWeb)
      AwesomeShader(() {
        final bufferA = SA.fracturedOrbBufferA.shaderBuffer;
        // bufferA.feed(
        //   SA.textureRgbaNoiseMedium,
        //   wrap: WrapMode.repeat,
        //   filter: FilterMode.linear,
        // );
        // 不增加  wrap: WrapMode.repeat, filter: FilterMode.linear 效果也类似
        // 原 ShaderToy 输入的 repeat, vflip, mipmap
        // Do not add wrap: WrapMode.repeat, filter: FilterMode.linear, the effect is similar
        // The original ShaderToy input is repeat, vflip, mipmap
        bufferA.feed(rgbaNoiseMediumInput);
        final bufferB = SA.fracturedOrb.feed(bufferA);
        return [bufferA, bufferB];
      }),
    if (!kIsWeb) AwesomeShader(SA.fullSpectrumCyber),
  ];
}
