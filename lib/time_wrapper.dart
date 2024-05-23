import 'dart:async';
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter_shaders/flutter_shaders.dart';

typedef TimeBuilder = Widget Function(Duration time);

class TimeWrapper extends StatefulWidget {
  const TimeWrapper({super.key, required this.builder});
  final TimeBuilder builder;

  @override
  State<TimeWrapper> createState() => _TimeWrapperState();
}

class _TimeWrapperState extends State<TimeWrapper> with SingleTickerProviderStateMixin {
  late Ticker _ticker;
  Duration _elapsed = Duration.zero;

  @override
  void initState() {
    super.initState();
    _ticker = createTicker((elapsed) {
      setState(() {
        _elapsed = elapsed;
      });
    });
    _ticker.start();
  }

  @override
  void dispose() {
    _ticker.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return widget.builder(_elapsed);
  }
}
