import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';

List<Widget> shadersWidget() {
  return [
    shader(ShaderAssets.mengerSponge),
    shader(ShaderAssets.mandelbulbDeconstructed),
    if (!isAndroid) shader(ShaderAssets.mandelbulbDerivative),
    // shader(ShaderAssets.monster),
    shader(ShaderAssets.mandelbulb),
    if (!isAndroid)
      shader(
        ShaderAssets.mainSequenceStar,
        channels: [
          ShaderAssets.mainSequenceStarPng,
          ShaderAssets.wall,
        ],
      ),
    if (enableImpller) shader('shaders/m/Mandelbulb_3D_Fractal.frag'),
    shader(ShaderAssets.marioWorld, upSideDown: true),
  ];
}
