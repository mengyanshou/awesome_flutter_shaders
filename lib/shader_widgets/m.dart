import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';

List<Widget> shadersWidget() {
  return [
    shader(ShaderAssets.mengerSponge),
    shader(ShaderAssets.mandelbulbDeconstructed),
    shader(ShaderAssets.mandelbulbDerivative),
    // shader(ShaderAssets.monster),
    shader(ShaderAssets.mandelbulb),
    shader(
      ShaderAssets.mainSequenceStar,
      channels: [
        ShaderAssets.mainSequenceStarPng,
        ShaderAssets.wall,
      ],
    ),
    if (enableImpller) shader('shaders/m/Mandelbulb 3D Fractal.frag'),
    shader(ShaderAssets.marioWorld, upSideDown: true),
  ];
}
