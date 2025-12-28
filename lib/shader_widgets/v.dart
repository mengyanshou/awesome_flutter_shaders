import 'package:awesome_flutter_shaders/main.dart';
import 'package:flutter/material.dart';

List<Widget> shadersWidget() {
  return [
    // Very fast procedural ocean
    const AwesomeShader('shaders/v/Very fast procedural ocean.frag'),
  ];
}
