import 'dart:ui' as ui;
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_shaders/flutter_shaders.dart';
import 'package:get/get.dart';
import 'package:shader_buffers/shader_buffers.dart';
import 'shaders.dart';
import 'time_wrapper.dart';
import 'shader_widgets/b.dart' as b;
import 'shader_widgets/c.dart' as c;
import 'shader_widgets/d.dart' as d;
import 'shader_widgets/e.dart' as e;
import 'shader_widgets/f.dart' as f;
import 'shader_widgets/g.dart' as g;
import 'shader_widgets/h.dart' as h;
import 'shader_widgets/p.dart' as p;
import 'shader_widgets/i.dart' as i;
import 'shader_widgets/m.dart' as m;
import 'shader_widgets/n.dart' as n;
import 'shader_widgets/r.dart' as r;
import 'shader_widgets/s.dart' as s;
import 'shader_widgets/w.dart' as w;

class ShaderCustomPainter extends CustomPainter {
  final FragmentShader shader;
  final Duration currentTime;

  ShaderCustomPainter(this.shader, this.currentTime);

  @override
  void paint(Canvas canvas, Size size) {
    shader.setFloat(0, size.width);
    shader.setFloat(1, size.height);
    shader.setFloat(2, currentTime.inMilliseconds.toDouble() / 1000.0);
    final Paint paint = Paint()..shader = shader;
    canvas.drawRect(Offset.zero & size, paint);
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => true;
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

Map<String, ShaderController> controllers = {};
Widget shader(
  String asset, {
  List<String> channels = const [],
  bool upSideDown = true,
}) {
  LayerBuffer layerBuffer = LayerBuffer(shaderAssetsName: asset);
  layerBuffer.setChannels(
    channels.map((channel) => IChannel(assetsTexturePath: channel)).toList(),
  );
  return Tooltip(
    message: asset,
    child: Transform.flip(
      flipY: upSideDown,
      child: LayoutBuilder(
        builder: (context, con) {
          return ShaderBuffers(
            width: MediaQuery.of(context).size.width,
            height: MediaQuery.of(context).size.height,
            key: UniqueKey(),
            controller: ShaderController(),
            mainImage: layerBuffer,
          );
        },
      ),
    ),
  );
}

bool enableImpller = false;

ui.Image? noise;
bool get isAndroid => GetPlatform.isAndroid;

List<Widget> shadersWidget() {
  List<Widget> children = [
    Builder(
      builder: (context) {
        final mainLayer = LayerBuffer(shaderAssetsName: ShaderAssets.pageCurl);
        mainLayer.setChannels([
          IChannel(assetsTexturePath: ShaderAssets.wall),
          IChannel(assetsTexturePath: ShaderAssets.bricks),
        ]);
        return ShaderBuffers(
          key: UniqueKey(),
          controller: controller,
          mainImage: mainLayer,
        );
      },
    ),
    shader(
      ShaderAssets.portal2BoxFlipRotation,
      channels: [
        ShaderAssets.texture1,
        ShaderAssets.wall,
      ],
      upSideDown: false,
    ),
    shader(
      ShaderAssets.zoomBlurTransition,
      channels: [
        ShaderAssets.texture1,
        ShaderAssets.wall,
      ],
      upSideDown: false,
    ),
    shader(ShaderAssets.transitionBurning, channels: [
      ShaderAssets.texture1,
      ShaderAssets.wall,
    ]),
    shader(
      ShaderAssets.reclaimTheStreets,
    ),
    shader(
      ShaderAssets.montereyWannabe,
    ),
    shader(
      ShaderAssets.transitionWithImage,
      channels: [
        ShaderAssets.texture2,
        ShaderAssets.wall,
        ShaderAssets.wall,
      ],
      upSideDown: false,
    ),
    shader(
      ShaderAssets.crosswarpTransition,
      channels: [
        ShaderAssets.wall,
        ShaderAssets.wall,
      ],
      upSideDown: false,
    ),
    Builder(
      builder: (context) {
        // shaders/e/Elevated.frag
        final mainLayer = LayerBuffer(shaderAssetsName: 'shaders/m/macOS_Monterey_2.frag.frag');
        final bufferA = LayerBuffer(shaderAssetsName: 'shaders/m/macOS_Monterey_2.frag_BufferA.frag');
        bufferA.setChannels([
          IChannel(buffer: bufferA),
        ]);
        mainLayer.setChannels([
          IChannel(buffer: bufferA),
        ]);
        return ShaderBuffers(
          key: UniqueKey(),
          controller: controller,
          mainImage: mainLayer,
        );
      },
    ),

    // shaders/m/MacOS_Monterey_wallpaper.frag
    Builder(
      builder: (context) {
        // shaders/e/Elevated.frag
        final mainLayer = LayerBuffer(shaderAssetsName: ShaderAssets.macOSMontereyWallpaper);
        final bufferA = LayerBuffer(shaderAssetsName: ShaderAssets.macOSMontereyWallpaperBufferA);
        bufferA.setChannels([
          IChannel(buffer: bufferA),
        ]);
        mainLayer.setChannels([
          IChannel(buffer: bufferA),
        ]);
        return ShaderBuffers(
          key: UniqueKey(),
          controller: controller,
          mainImage: mainLayer,
        );
      },
    ),
    Builder(
      builder: (context) {
        // shaders/e/Elevated.frag
        final mainLayer = LayerBuffer(shaderAssetsName: ShaderAssets.freeze);
        mainLayer.setChannels([
          IChannel(assetsTexturePath: ShaderAssets.wall),
          IChannel(assetsTexturePath: ShaderAssets.wall),
        ]);
        return ShaderBuffers(
          key: UniqueKey(),
          controller: controller,
          mainImage: mainLayer,
        );
      },
    ),
    // shaders/h/Hall_of_Mirrors.frag
    shader(
      ShaderAssets.hallOfMirrors,
      channels: [
        ShaderAssets.wall,
      ],
      upSideDown: false,
    ),
    // shaders/g/genie.frag
    shader(
      ShaderAssets.genie,
      channels: [
        ShaderAssets.wall,
      ],
      upSideDown: false,
    ),
    if (!isAndroid)
      shader(
        ShaderAssets.redBlueSwirl,
      ),
    //   builder: (context) {
    //     // shaders/e/Elevated.frag
    //     final mainLayer = LayerBuffer(shaderAssetsName: 'shaders/e/Elevated.frag');
    //     final bufferA = LayerBuffer(shaderAssetsName: 'shaders/e/Elevated_buffera.frag');
    //     bufferA.setChannels([
    //       IChannel(assetsTexturePath: 'assets/noise2.png'),
    //     ]);
    //     mainLayer.setChannels([
    //       IChannel(buffer: bufferA),
    //     ]);
    //     return ShaderBuffers(
    //       key: UniqueKey(),
    //       controller: controller,
    //       mainImage: mainLayer,
    //     );
    //   },
    // ),
    // Builder(
    //   builder: (context) {
    //     // shaders/s/superResolution.frag
    //     final mainLayer = LayerBuffer(shaderAssetsName: 'shaders/s/superResolution.frag');
    //     final bufferA = LayerBuffer(shaderAssetsName: 'shaders/s/superResolution buffera.frag');
    //     final bufferB = LayerBuffer(shaderAssetsName: 'shaders/s/superResolution bufferb.frag');
    //     final bufferC = LayerBuffer(shaderAssetsName: 'shaders/s/superResolution bufferc.frag');
    //     final bufferD = LayerBuffer(shaderAssetsName: 'shaders/s/superResolution bufferd.frag');
    //     bufferA.setChannels([
    //       IChannel(assetsTexturePath: ShaderAssets.wall),
    //       IChannel(buffer: bufferA),
    //     ]);
    //     bufferB.setChannels([
    //       IChannel(buffer: bufferA),
    //     ]);
    //     bufferC.setChannels([
    //       IChannel(buffer: bufferB),
    //     ]);
    //     bufferD.setChannels([
    //       IChannel(buffer: bufferA),
    //       IChannel(buffer: bufferC),
    //     ]);
    //     mainLayer.setChannels([
    //       IChannel(buffer: bufferC),
    //       IChannel(assetsTexturePath: ShaderAssets.wall),
    //       IChannel(buffer: bufferD),
    //       IChannel(buffer: bufferA),
    //     ]);
    //     return ShaderBuffers(
    //       key: UniqueKey(),
    //       controller: controller,
    //       mainImage: bufferD,
    //     );
    //   },
    // ),
    // Builder(
    //   builder: (context) {
    //     final mainLayer = LayerBuffer(shaderAssetsName: 'shaders/b/Black_Hole_Raymarcher_3.frag');
    //     final bufferA = LayerBuffer(shaderAssetsName: 'shaders/b/Black_Hole_Raymarcher_3_BufferA.frag');
    //     final bufferB = LayerBuffer(shaderAssetsName: 'shaders/b/Black_Hole_Raymarcher_3_BufferB.frag');
    //     final bufferC = LayerBuffer(shaderAssetsName: 'shaders/b/Black_Hole_Raymarcher_3_BufferC.frag');
    //     bufferB.setChannels([
    //       IChannel(buffer: bufferA),
    //     ]);
    //     bufferC.setChannels([
    //       IChannel(buffer: bufferB),
    //     ]);
    //     mainLayer.setChannels([
    //       IChannel(buffer: bufferC),
    //     ]);
    //     return ShaderBuffers(
    //       key: UniqueKey(),
    //       controller: controller,
    //       mainImage: mainLayer,
    //     );
    //   },
    // ),
    // shader('shaders/c/Canyon.frag', channels: [
    //   'assets/texture1.png',
    //   'assets/texture2.png',
    //   'assets/image.png',
    //   'assets/texture3.png',
    // ]),

    // Builder(
    //   builder: (context) {
    //     final mainLayer = LayerBuffer(shaderAssetsName: 'shaders/e/Elevated.frag');
    //     final bufferA = LayerBuffer(shaderAssetsName: 'shaders/e/Elevated BufferA.frag');
    //     bufferA.setChannels([
    //       IChannel(assetsTexturePath: 'assets/noise.png'),
    //     ]);
    //     mainLayer.setChannels([
    //       IChannel(buffer: bufferA),
    //     ]);
    //     return ShaderBuffers(
    //       key: UniqueKey(),
    //       controller: controller,
    //       mainImage: mainLayer,
    //     );
    //   },
    // ),
    // Plasma

    // shader('shaders/h/Hell.frag', channels: [
    //   'assets/Wall.jpg',
    // ]),
    // shader('shaders/c/Cold.frag'),
    // Builder(
    //   builder: (context) {
    //     final mainLayer = LayerBuffer(shaderAssetsName: 'shaders/i/Inside_the_mandelbulb_II.frag');
    //     final bufferA = LayerBuffer(shaderAssetsName: 'shaders/i/Inside_the_mandelbulb_II_BufferA.frag');
    //     mainLayer.setChannels([
    //       IChannel(buffer: bufferA),
    //     ]);
    //     return ShaderBuffers(
    //       key: UniqueKey(),
    //       controller: controller,
    //       mainImage: mainLayer,
    //     );
    //   },
    // ),
    // shader('shaders/p/Plasma.frag'),
    // shader('shaders/p/Pulsar_Explained.frag'),
    // s/Split Prism
    shader(
      ShaderAssets.splitPrism,
      channels: [
        ShaderAssets.wall,
      ],
    ),

    shader(
      ShaderAssets.spreadingFrost,
      channels: [
        ShaderAssets.wall,
        ShaderAssets.texture1,
        ShaderAssets.texture2,
      ],
      upSideDown: false,
    ),

    shader(ShaderAssets.uiNoiseHalo),
    if (!isAndroid) shader(ShaderAssets.littleFractalFlight3),
    shader(ShaderAssets.colorStarTunnel),
    shader(ShaderAssets.whirlExplained),
    if (!isAndroid) shader(ShaderAssets.serverRoom),
    shader(ShaderAssets.ballsAreRubbing),
    if (!isAndroid) shader(ShaderAssets.colorfulUnderwaterBubblesII),
    if (!isAndroid) shader(ShaderAssets.vortex),
    if (!isAndroid) shader(ShaderAssets.veryFastProceduralOcean),
    shader(ShaderAssets.tmGyroids),
    if (!isAndroid)
      Builder(
        builder: (context) {
          final mainLayer = LayerBuffer(shaderAssetsName: 'shaders/p/Pentagonal Conway\'s game.frag');
          final bufferA = LayerBuffer(shaderAssetsName: 'shaders/p/Pentagonal Conway\'s game BufferA.frag');
          bufferA.setChannels([
            IChannel(buffer: bufferA),
          ]);
          mainLayer.setChannels([
            IChannel(buffer: bufferA),
          ]);
          return ShaderBuffers(
            key: UniqueKey(),
            controller: controller,
            mainImage: mainLayer,
          );
        },
      ),
    if (!isAndroid)
      Builder(
        builder: (context) {
          final mainLayer = LayerBuffer(shaderAssetsName: 'shaders/p/Portal_iOS_AR.frag');
          final bufferA = LayerBuffer(shaderAssetsName: 'shaders/p/Portal_iOS_AR_BufferA.frag');
          // bufferA.setChannels([
          //   IChannel(buffer: bufferA),
          // ]);
          mainLayer.setChannels([
            IChannel(buffer: bufferA),
            IChannel(assetsTexturePath: 'assets/Wall.jpg'),
            // IChannel(assetsTexturePath: 'assets/texture2.png'),
          ]);
          return ShaderBuffers(
            key: UniqueKey(),
            controller: controller,
            mainImage: mainLayer,
          );
        },
      ),
    if (!isAndroid)
      shader(ShaderAssets.plasmaGlobe, channels: [
        ShaderAssets.noise,
      ]),
    if (!isAndroid)
      Builder(
        builder: (context) {
          final mainLayer = LayerBuffer(shaderAssetsName: 'shaders/m/Mirror_Looping_w_Mouse_Control.frag');
          final bufferA = LayerBuffer(shaderAssetsName: 'shaders/m/Mirror_Looping_w_Mouse_Control_BufferA.frag');
          bufferA.setChannels([
            IChannel(buffer: bufferA),
          ]);
          mainLayer.setChannels([
            IChannel(assetsTexturePath: 'assets/texture1.png'),
            IChannel(assetsTexturePath: 'assets/texture2.png'),
            IChannel(buffer: bufferA),
          ]);
          return ShaderBuffers(
            key: UniqueKey(),
            controller: controller,
            mainImage: mainLayer,
          );
        },
      ),
    shader(
      ShaderAssets.warpedExtrudedSkewedGrid,
      channels: [ShaderAssets.texture1],
    ),
    // w/Where the River Goes
    if (!isAndroid)
      shader(
        ShaderAssets.whereTheRiverGoes,
        channels: [ShaderAssets.texture1],
      ),
    if (!isAndroid) shader(ShaderAssets.goodbyeDreamClouds),
    shader(ShaderAssets.wallE),
    // s/Sphere Gears
    shader(ShaderAssets.sphereGears, channels: [ShaderAssets.wall]),
    shader(ShaderAssets.origami),
    shader(ShaderAssets.fullSpectrumCyber),
    if (!isAndroid) shader(ShaderAssets.drifting),
    shader(ShaderAssets.colorfulCosmosSpiral, channels: [
      ShaderAssets.wall,
    ]),
    if (!isAndroid)
      shader(ShaderAssets.perspexWebLattice, channels: [
        ShaderAssets.wall,
      ]),
    if (!isAndroid) shader(ShaderAssets.perlinSinSphere),
    shader(ShaderAssets.proteanClouds),
    if (!isAndroid) shader(ShaderAssets.divergenceFreeFlowCurlyNoise),
    shader(ShaderAssets.cobweb),
    shader(ShaderAssets.gradientFlow),
    shader(ShaderAssets.tunnelCylinders),
    shader(ShaderAssets.tunnelCable),
    shader(ShaderAssets.undularSubstratum),
    if (!isAndroid) shader(ShaderAssets.tracedMinkowskiTube),
    if (!isAndroid) shader(ShaderAssets.cineShaderLava),
    if (!isAndroid)
      shader(ShaderAssets.dullSkull, channels: [
        ShaderAssets.wall,
      ]),
    shader(ShaderAssets.cubeLines, upSideDown: true),
    if (!isAndroid) shader(ShaderAssets.zippyZaps),
    if (!isAndroid) shader(ShaderAssets.ghosts),
    shader(ShaderAssets.singularity),
    if (!isAndroid)
      shader(
        'shaders/p/Page_Curl_Effect_on_Ball.frag',
        channels: [
          'assets/Wall.jpg',
          'assets/Industrial Complex Crossview.png',
          'assets/Main Sequence Star.png',
        ],
      ),
    ...b.shadersWidget(),
    ...c.shadersWidget(),
    ...d.shadersWidget(),
    ...e.shadersWidget(),
    ...f.shadersWidget(),
    ...g.shadersWidget(),
    ...h.shadersWidget(),
    ...i.shadersWidget(),
    ...m.shadersWidget(),
    ...n.shadersWidget(),
    ...p.shadersWidget(),
    ...r.shadersWidget(),
    ...s.shadersWidget(),
    ...w.shadersWidget(),
    SizedBox(
      child: ShaderBuilder(assetKey: ShaderAssets.pinku, (BuildContext context, FragmentShader shader, _) {
        return Material(
          color: Colors.black,
          child: Center(
            child: Align(
              alignment: Alignment.center,
              child: TimeWrapper(
                builder: (Duration time) {
                  return ShaderMask(
                    shaderCallback: (Rect bounds) {
                      shader.setFloat(0, bounds.width);
                      shader.setFloat(1, bounds.height);
                      shader.setFloat(2, time.inMilliseconds.toDouble() / 1000);
                      return shader;
                    },
                    blendMode: BlendMode.srcIn,
                    child: const Text(
                      'nightmare',
                      style: TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 36,
                        color: Colors.white,
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
        );
      }),
    ),
  ];
  return children;
}

Future<FragmentShader> getShader(String asset) async {
  var program = await FragmentProgram.fromAsset(asset);
  return program.fragmentShader();
}

ShaderController controller = ShaderController();

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    List<Widget> children = shadersWidget();
    return MaterialApp(
      title: 'Shaders Gallery',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: SizedBox(
        height: MediaQuery.of(context).size.height,
        width: MediaQuery.of(context).size.width,
        child: GridView.builder(
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: 0,
            crossAxisSpacing: 0,
            childAspectRatio: 16 / 9,
          ),
          itemCount: children.length,
          itemBuilder: (context, index) {
            return GestureDetector(
              onTap: () async {
                controllers.values.forEach((ctl) {
                  // ctl.pause();
                });
                await Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) {
                      return GestureDetector(
                        onDoubleTap: () {
                          Navigator.of(context).pop();
                          controllers.values.forEach((ctl) {
                            ctl.play();
                          });
                        },
                        child: Center(
                          child: SizedBox(
                            width: MediaQuery.of(context).size.width,
                            height: MediaQuery.of(context).size.width / 1.7777777,
                            child: children[index],
                          ),
                        ),
                      );
                    },
                  ),
                );
              },
              child: children[index],
            );
          },
        ),
      ),
    );
  }
}
