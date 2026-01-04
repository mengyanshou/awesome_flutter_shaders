import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:path/path.dart';
import 'package:shader_buffers/shader_buffers.dart';
import 'package:shader_graph/shader_graph.dart';
import 'shader_widgets/a.dart' as a;
import 'shader_widgets/b.dart' as b;
import 'shader_widgets/c.dart' as c;
import 'shader_widgets/d.dart' as d;
import 'shader_widgets/e.dart' as e;
import 'shader_widgets/f.dart' as f;
import 'shader_widgets/g.dart' as g;
import 'shader_widgets/h.dart' as h;
import 'shader_widgets/i.dart' as i;
import 'shader_widgets/l.dart' as l;
import 'shader_widgets/m.dart' as m;
import 'shader_widgets/n.dart' as n;
import 'shader_widgets/o.dart' as o;
import 'shader_widgets/p.dart' as p;
import 'shader_widgets/r.dart' as r;
import 'shader_widgets/s.dart' as s;
import 'shader_widgets/t.dart' as t;
import 'shader_widgets/u.dart' as u;
import 'shader_widgets/v.dart' as v;
import 'shader_widgets/w.dart' as w;
import 'shader_widgets/z.dart' as z;
import 'shaders.dart';

typedef Shaders = List<ShaderBuffer>;

class AwesomeShader extends StatelessWidget {
  const AwesomeShader(this.buffer, {this.upSideDown = true, super.key, KeyboardController? keyboardController});
  final dynamic buffer;
  final bool upSideDown;

  @override
  Widget build(BuildContext context) {
    final buffers = <ShaderBuffer>[];
    print('buffer runtimeType: ${buffer.runtimeType}');
    if (buffer is String) {
      buffers.add((buffer as String).shaderBuffer);
    } else if (buffer is ShaderBuffer) {
      buffers.add(buffer);
    } else if (buffer is Shaders) {
      buffers.addAll(buffer);
    } else {
      throw ArgumentError('buffer must be String or ShaderBuffer, got ${buffer.runtimeType}');
    }
    for (final buf in buffers) {
      buf.scale = 0.4;
    }
    return Column(
      children: [
        Expanded(
          child: ShaderSurface.buffers(
            key: ValueKey(buffers.map((e) => e.shaderAssetPath).join(',')),
            buffers,
            upSideDown: upSideDown,
          ),
        ),
        Text(
          basenameWithoutExtension(buffers.last.shaderAssetPath),
          style: shaderTitleStyle,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }
}

void main() {
  runApp(const MyApp());
  if (GetPlatform.isMacOS) {
    enableImpller = true;
  }
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarBrightness: Brightness.dark,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.transparent,
      systemNavigationBarDividerColor: Colors.transparent,
    ),
  );
}

TextStyle shaderTitleStyle = const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold);
Map<String, ShaderController> controllers = {};
Widget shader(String asset, {List<String> channels = const [], bool upSideDown = true}) {
  // ! 0.5 to reduce GPU load
  LayerBuffer layerBuffer = LayerBuffer(shaderAssetsName: asset, scaleRenderView: 0.5);
  layerBuffer.setChannels(channels.map((channel) => IChannel(assetsTexturePath: channel)).toList());
  return Column(
    mainAxisSize: MainAxisSize.min,
    children: [
      Transform.flip(
        flipY: upSideDown,
        child: LayoutBuilder(
          builder: (context, con) {
            return ShaderBuffers(
              key: UniqueKey(),
              height: con.maxWidth * 9 / 16,
              controller: ShaderController(),
              mainImage: layerBuffer,
            );
          },
        ),
      ),
      Text(basenameWithoutExtension(asset), style: shaderTitleStyle, maxLines: 1, overflow: TextOverflow.ellipsis),
    ],
  );
}

bool enableImpller = false;

ui.Image? noise;
bool get isAndroid => GetPlatform.isAndroid;

List<Widget> shadersWidget() {
  List<Widget> children = [
    // Lights in Smoke
    // // electron
    // AwesomeShader('shaders/a/anamorphic rendering.frag'.feed(SA.textureLondon), upSideDown: false),
    ...z.shadersWidget(),
    ...w.shadersWidget(),
    ...v.shadersWidget(),
    ...u.shadersWidget(),
    ...t.shadersWidget(),
    ...s.shadersWidget(),
    ...r.shadersWidget(),
    ...p.shadersWidget(),
    ...o.shadersWidget(),
    ...n.shadersWidget(),
    ...m.shadersWidget(),
    ...l.shadersWidget(),
    ...i.shadersWidget(),
    ...h.shadersWidget(),
    ...g.shadersWidget(),
    ...f.shadersWidget(),
    ...e.shadersWidget(),
    ...d.shadersWidget(),
    ...c.shadersWidget(),
    ...b.shadersWidget(),
    ...a.shadersWidget(),
  ];
  return children;
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    List<Widget> children = shadersWidget();
    return MaterialApp(
      title: 'Shaders Gallery',
      theme: ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple), useMaterial3: true),
      home: Scaffold(
        backgroundColor: Colors.black,
        body: Builder(
          builder: (context) {
            double width = MediaQuery.of(context).size.width / 2;
            double height = width * 9 / 16 + 24;
            double childAspectRatio = width / height;
            return GridView.builder(
              gridDelegate: SliverGridDelegateWithMaxCrossAxisExtent(
                maxCrossAxisExtent: MediaQuery.of(context).size.width / 2,
                mainAxisSpacing: 8,
                crossAxisSpacing: 8,
                childAspectRatio: childAspectRatio,
              ),
              itemCount: children.length,
              itemBuilder: (context, index) {
                return GestureDetector(
                  onTap: () async {
                    controllers.values.forEach((ctl) {
                      ctl.pause();
                    });
                    await Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (context) {
                          return Material(
                            color: Colors.black,
                            child: GestureDetector(
                              onDoubleTap: () async {
                                Navigator.of(context).pop();
                                // TODO: Fix this
                                await Future.delayed(const Duration(milliseconds: 4000));
                                controllers.values.forEach((ctl) {
                                  ctl.play();
                                });
                              },
                              child: Center(child: children[index]),
                            ),
                          );
                        },
                      ),
                    );
                  },
                  behavior: HitTestBehavior.translucent,
                  child: children[index],
                );
              },
            );
          },
        ),
      ),
    );
  }
}
