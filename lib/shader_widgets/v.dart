import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';

List<Widget> shadersWidget() {
  return [
    // Very fast procedural ocean
    AwesomeShader(SA.veryFastProceduralOcean),
  ];
}
