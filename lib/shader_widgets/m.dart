import 'dart:io';

import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_buffers/shader_buffers.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> shadersWidget() {
  return [
    AwesomeShader('shaders/m/Metal Vortex.frag'),
    AwesomeShader(SA.v2mMonster),
    AwesomeShader(SA.v2mMandelbulb),
    if (!Platform.isAndroid) AwesomeShader(SA.v2mMandelbulb3DFractal),
    AwesomeShader(SA.v2mMarioWorld11),
    AwesomeShader(SA.v2mMoFromWallE),
    Builder(builder: (context) {
      final bufferA = ShaderBuffer(SA.v2mMacOsMonterey2BufferA);
      final mainBuffer = ShaderBuffer(SA.v2mMacOsMonterey2);
      mainBuffer.feedShader(bufferA);
      return AwesomeShader([bufferA, mainBuffer]);
    }),
    AwesomeShader(SA.v2mMacOsMonterey2BufferA),
    AwesomeShader(SA.v2mMontereyWannabe),
    Builder(builder: (context) {
      final bufferA = ShaderBuffer(SA.v2mMacOsMontereyWallpaperBufferA);
      final mainBuffer = ShaderBuffer(SA.v2mMacOsMontereyWallpaper);
      mainBuffer.feedShader(bufferA);
      return AwesomeShader([bufferA, mainBuffer]);
    }),
    AwesomeShader(SA.v2mMacOsMontereyWallpaperBufferA),
  ];
}
