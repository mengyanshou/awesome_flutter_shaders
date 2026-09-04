import 'dart:ui' as ui;
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:path/path.dart';
import 'package:shader_buffers/shader_buffers.dart' hide ShaderController;
import 'package:shader_graph/shader_graph.dart';
import 'package:signale/signale.dart';
import 'bricks_game.dart';
import 'pacman_game.dart';
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
typedef ShaderBuilder = Shaders Function();

class AwesomeShader extends StatelessWidget {
  AwesomeShader(
    this.buffer, {
    this.upSideDown = true,
    this.inputs,
    this.keyboardController,
    this.shaderController,
    super.key,
  }) {
    switch (buffer) {
      case ShaderBuilder builder:
        final buffer = builder();
        buffers.addAll(buffer);
        if (buffer.length == 1) {
          final sb = buffer.first;
          if (inputs != null) {
            for (var inp in inputs!) {
              sb.feed(inp);
            }
          }
        }
      case String s:
        final buf = s.shaderBuffer;
        if (inputs != null) {
          for (var inp in inputs!) {
            buf.feed(inp);
          }
        }
        buffers.add(buf);
      case ShaderBuffer sb:
        buffers.add(sb);
        if (inputs != null) {
          for (var inp in inputs!) {
            sb.feed(inp);
          }
        }
      case List<ShaderBuffer> list:
        buffers.addAll(list);
      default:
        throw ArgumentError('buffer must be String/ShaderBuffer/List<ShaderBuffer>, got ${buffer.runtimeType}');
    }
  }
  final dynamic buffer;
  final bool upSideDown;
  final List<dynamic>? inputs;
  final ShaderController? shaderController;
  final KeyboardController? keyboardController;
  final buffers = <ShaderBuffer>[];

  /// See https://github.com/flutter/flutter/issues/180959

  @override
  Widget build(BuildContext context) {
    for (final buf in buffers) {
      buf.scale = (kDebugMode && kIsWeb) ? 0.2 : 0.6;
    }
    Log.i('Building AwesomeShader with buffers: ${buffers.map((e) => e.shaderAssetPath).join(', ')}');
    return ShaderSurface.auto(
      buffers,
      key: key ?? ValueKey(buffers.map((e) => e.shaderAssetPath).join(',')),
      upSideDown: upSideDown,
      shaderController: shaderController,
      onLoading: (context) {
        return const Center(
          child: LinearProgressIndicator(),
        );
      },
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
// Map<String, ShaderController> controllers = {};
// Widget shader(String asset, {List<String> channels = const [], bool upSideDown = true}) {
//   // ! 0.5 to reduce GPU load
//   LayerBuffer layerBuffer = LayerBuffer(shaderAssetsName: asset, scaleRenderView: 0.5);
//   layerBuffer.setChannels(channels.map((channel) => IChannel(assetsTexturePath: channel)).toList());
//   return Column(
//     mainAxisSize: MainAxisSize.min,
//     children: [
//       Transform.flip(
//         flipY: upSideDown,
//         child: LayoutBuilder(
//           builder: (context, con) {
//             return ShaderBuffers(
//               key: UniqueKey(),
//               height: con.maxWidth * 9 / 16,
//               controller: ShaderController(),
//               mainImage: layerBuffer,
//             );
//           },
//         ),
//       ),
//       Text(basenameWithoutExtension(asset), style: shaderTitleStyle, maxLines: 1, overflow: TextOverflow.ellipsis),
//     ],
//   );
// }

bool enableImpller = false;

ui.Image? noise;
bool get isAndroid => GetPlatform.isAndroid;

List<Widget> buildShaderGames() {
  return [
    BricksGame(),
    PacmanGame(),
  ];
}

List<Widget> buildShaderWidgets() {
  List<Widget> children = [
    ...z.buildShaderWidgets(),
    ...w.buildShaderWidgets(),
    ...v.buildShaderWidgets(),
    ...u.buildShaderWidgets(),
    ...t.buildShaderWidgets(),
    ...s.buildShaderWidgets(),
    ...r.buildShaderWidgets(),
    ...p.buildShaderWidgets(),
    ...o.buildShaderWidgets(),
    ...n.buildShaderWidgets(),
    ...m.buildShaderWidgets(),
    ...l.buildShaderWidgets(),
    ...i.buildShaderWidgets(),
    ...h.buildShaderWidgets(),
    ...g.buildShaderWidgets(),
    ...f.buildShaderWidgets(),
    ...e.buildShaderWidgets(),
    ...d.buildShaderWidgets(),
    ...c.buildShaderWidgets(),
    ...b.buildShaderWidgets(),
    ...a.buildShaderWidgets(),
    // Derivatives Repro.frag
    // AwesomeShader('shaders/repro/Derivatives Repro.frag'),
  ];
  return children;
}

AwesomeShader? findShaderByName(String shaderAsset) {
  for (final widget in buildShaderWidgets()) {
    if (widget is AwesomeShader) {
      final as = widget;
      final name = basenameWithoutExtension(as.buffers.last.shaderAssetPath);
      Log.i('Checking shader asset: $name');
      if (name == shaderAsset) {
        return as;
      }
    }
  }
  return null;
}

Iterable<AwesomeShader> get imageEffectsWidgets sync* {
  for (final widget in buildShaderWidgets()) {
    if (widget is AwesomeShader && widget.inputs != null) {
      yield widget;
    }
  }
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Shaders Gallery',
      theme: ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple), useMaterial3: true),
      onGenerateRoute: (settings) {
        // 在 Web 平台解析 URL 查询参数
        String? shaderParam;
        if (kIsWeb) {
          final uri = Uri.base;
          shaderParam = uri.queryParameters['shader'];
          Log.i('URL query parameter "shader": $shaderParam');
        }

        // 如果有 shader 参数，尝试直接渲染该 shader
        if (shaderParam != null && shaderParam.isNotEmpty) {
          final shaderWidget = findShaderByName(shaderParam);
          if (shaderWidget != null) {
            return MaterialPageRoute(
              builder: (context) => ShaderDetailPage(shaderWidget),
              settings: settings,
            );
          } else {
            Log.w('Shader not found: $shaderParam');
          }
        }

        // 默认显示画廊首页
        return MaterialPageRoute(
          builder: (context) => const GalleryPage(),
          settings: settings,
        );
      },
    );
  }
}

/// 画廊首页 - 显示所有 shader 的网格视图
class GalleryPage extends StatelessWidget {
  const GalleryPage({super.key});

  @override
  Widget build(BuildContext context) {
    List<Widget> children = buildShaderWidgets();
    return Scaffold(
      backgroundColor: Colors.black,
      body: Builder(
        builder: (context) {
          double width = MediaQuery.of(context).size.width / 2;
          double height = width * 9 / 16 + 24;
          double childAspectRatio = width / height;
          return GridView.builder(
            gridDelegate: SliverGridDelegateWithMaxCrossAxisExtent(
              maxCrossAxisExtent: width,
              mainAxisSpacing: 8,
              crossAxisSpacing: 8,
              childAspectRatio: childAspectRatio,
            ),
            itemCount: children.length,
            itemBuilder: (context, index) {
              return GestureDetector(
                onTap: () async {
                  await Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (context) {
                        return ShaderDetailPage(children[index]);
                      },
                    ),
                  );
                },
                behavior: HitTestBehavior.translucent,
                child: Column(
                  children: [
                    Expanded(child: children[index]),
                    Builder(
                      builder: (context) {
                        Log.i(children[index].runtimeType);
                        if (children[index] is AwesomeShader) {
                          final as = children[index] as AwesomeShader;
                          return Text(
                            basenameWithoutExtension(as.buffers.last.shaderAssetPath),
                            style: shaderTitleStyle,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          );
                        }
                        return const SizedBox.shrink();
                      },
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }
}

/// Shader 详情页 - 全屏显示单个 shader
class ShaderDetailPage extends StatelessWidget {
  final Widget shaderWidget;

  const ShaderDetailPage(this.shaderWidget, {super.key});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.black,
      child: GestureDetector(
        onDoubleTap: () {
          Navigator.of(context).pop();
        },
        child: Center(
          child: SizedBox(
            width: double.infinity,
            height: MediaQuery.of(context).size.width * 9 / 16,
            child: shaderWidget,
          ),
        ),
      ),
    );
  }
}
