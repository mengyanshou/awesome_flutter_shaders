import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';

List<Widget> shadersWidget() {
  return [
    if (enableImpller) shader('shaders/d/Dive to Cloud.frag'),
    shader(ShaderAssets.deathStar),
    shader(ShaderAssets.devilGlass),
  ];
}
