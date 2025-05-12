import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';

List<Widget> shadersWidget() {
  return [
    if (enableImpller) shader('shaders/Dive to Cloud.frag'),
    shader(ShaderAssets.deathStar),
  ];
}
