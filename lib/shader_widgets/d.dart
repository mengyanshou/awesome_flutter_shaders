import 'package:awesome_flutter_shaders/main.dart';
import 'package:awesome_flutter_shaders/shaders.dart';
import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

List<Widget> shadersWidget() {
  return [
    AwesomeShader(SA.v2dDevilGlass),
    AwesomeShader(SA.v2dDiveToCloud),
    // TODO，需要输入颜色
    // AswsomeShader('shaders/d/Digital Brain.frag'),
    // divergence-free flow curly noise
    // ! 比较卡，但能正常显示，先注释
    // AswsomeShader('shaders/d/divergence-free flow curly noise.frag'),
    // DULL SKULL - Prometheus.frag
    AwesomeShader(SA.v2dDullSkullPrometheus.feed(SA.wall)),
    // 需要鼠标点内部才有画面
    AwesomeShader(SA.v2dDrifting),
  ];
}
