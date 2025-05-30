import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_buffers/shader_buffers.dart';

List<Widget> shadersWidget() {
  return [
    if (enableImpller) shader(ShaderAssets.bytdaily013),
    if (!isAndroid) shader(ShaderAssets.brokenTimePortal),
    // Builder(builder: (context) {
    //   LayerBuffer layerBuffer = LayerBuffer(shaderAssetsName: ShaderAssets.brokenTimePortal);
    //   layerBuffer.setChannels([
    //     IChannel(
    //       child: Image.asset(
    //         'assets/noise.png',
    //         width: 1024,
    //         height: 1024,
    //       ),
    //     )
    //   ]);
    //   return ShaderBuffers(
    //     key: UniqueKey(),
    //     controller: ShaderController(),
    //     mainImage: layerBuffer,
    //   );
    // }),
    shader(ShaderAssets.bubbles),
    shader(ShaderAssets.blue),
    shader(ShaderAssets.blackHolesAndCrosses),
    shader(ShaderAssets.blackHoleOdeGeodesicSolverFrag, channels: ['assets/Black Hole ODE Geodesic Solver.png']),
  ];
}
