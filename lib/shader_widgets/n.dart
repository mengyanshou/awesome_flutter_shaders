import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';

List<Widget> shadersWidget() {
  return [
    shader(ShaderAssets.noiseLab3D),
    shader(ShaderAssets.notSoGreeeenChromaticHole, channels: [ShaderAssets.wall]),
  ];
}
