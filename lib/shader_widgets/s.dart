import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_buffers/shader_buffers.dart';

List<Widget> shadersWidget() {
  return [
    Builder(
      builder: (context) {
        return ShaderBuffers(
          key: UniqueKey(),
          controller: ShaderController(),
          mainImage: LayerBuffer(shaderAssetsName: ShaderAssets.shockWaveWithSaturation)
            ..setChannels(
              [
                IChannel(
                  child: Container(
                    width: MediaQuery.of(context).size.width,
                    height: MediaQuery.of(context).size.width / 1.7777777,
                    color: Colors.white,
                    child: Image(
                      image: AssetImage(ShaderAssets.wall),
                    ),
                  ),
                  assetsTexturePath: ShaderAssets.wall,
                ),
              ],
            ),
        );
      },
    ),
    shader(ShaderAssets.starry),
    shader(ShaderAssets.starandblackhole),
    shader(ShaderAssets.studiogustoComGooeyCover),
    shader(ShaderAssets.soundEclipseRpm, channels: [ShaderAssets.blackHoleOdeGeodesicSolver]),
    shader(ShaderAssets.simpleSuperSphericalShading),
    if (!isAndroid) shader(ShaderAssets.starsAndCosmos8),
    if (!isAndroid) shader(ShaderAssets.seascape),
    shader(ShaderAssets.shaderArtCodingIntroduction),
    //
  ];
}
