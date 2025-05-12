import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';

List<Widget> shadersWidget() {
  return [
    if (enableImpller) shader(ShaderAssets.bytdaily013),
    shader(ShaderAssets.bubbles),
    shader(ShaderAssets.blue),
    shader(ShaderAssets.blackHolesAndCrosses),
    shader(ShaderAssets.blackHoleOdeGeodesicSolverFrag, channels: ['assets/Black Hole ODE Geodesic Solver.png']),
  ];
}
