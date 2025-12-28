import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> shadersWidget() {
  return [
    AwesomeShader(SA.v2gGradientFlow),
    // 这个也是需要输入噪声的，目前用内部函数替代了，但是会很卡，但是Flutter输入噪声有问题
    // TODO 找一个解决方法
    AwesomeShader(SA.v2gGoodbyeDreamClouds),
    AwesomeShader(SA.v2gGalaxyOfUniverses),
    AwesomeShader(SA.v2gGhosts),
    AwesomeShader(SA.v2gGalvanize),
  ];
}
