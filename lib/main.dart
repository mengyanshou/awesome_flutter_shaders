import 'dart:io';
import 'dart:ui' as ui;
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_shaders/flutter_shaders.dart';
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
  if (Platform.isMacOS) {
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
      child: ShaderBuffers(
        key: UniqueKey(),
        controller: controllers[asset] ??= ShaderController(),
        mainImage: layerBuffer,
      ),
    ),
  );
}

bool enableImpller = false;

ui.Image? noise;

List<Widget> shadersWidget(BuildContext context) {
  List<Widget> children = [
    // Builder(
    //   builder: (context) {
    //     final mainLayer = LayerBuffer(shaderAssetsName: 'shaders/b/Black Hole Raymarcher 3.frag');
    //     final bufferA = LayerBuffer(shaderAssetsName: 'shaders/b/Black Hole Raymarcher 3 BufferA.frag');
    //     final bufferB = LayerBuffer(shaderAssetsName: 'shaders/b/Black Hole Raymarcher 3 BufferB.frag');
    //     final bufferC = LayerBuffer(shaderAssetsName: 'shaders/b/Black Hole Raymarcher 3 BufferC.frag');
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

    shader('shaders/v/Very fast procedural ocean.frag'),
    shader('shaders/t/tm gyroids.frag'),
    shader('shaders/t/TIE Fighters.frag'),
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
    Builder(
      builder: (context) {
        final mainLayer = LayerBuffer(shaderAssetsName: 'shaders/p/Portal - iOS AR.frag');
        final bufferA = LayerBuffer(shaderAssetsName: 'shaders/p/Portal - iOS AR BufferA.frag');
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
    shader('shaders/p/Plasma Globe.frag', channels: [
      'assets/noise.png',
    ]),
    Builder(
      builder: (context) {
        final mainLayer = LayerBuffer(shaderAssetsName: 'shaders/m/Mirror Looping w Mouse Control.frag');
        final bufferA = LayerBuffer(shaderAssetsName: 'shaders/m/Mirror Looping w Mouse Control BufferA.frag');
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
    // Builder(
    //   builder: (context) {
    //     final mainLayer = LayerBuffer(shaderAssetsName: 'shaders/i/Inside the mandelbulb II.frag');
    //     final bufferA = LayerBuffer(shaderAssetsName: 'shaders/i/Inside the mandelbulb II BufferA.frag');
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
    // TIE Fighters
    shader('shaders/h/Hell.frag'),
    shader(
      'shaders/w/Warped Extruded Skewed Grid.frag',
      channels: ['assets/texture1.png'],
    ),
    // w/Where the River Goes
    shader(
      'shaders/w/Where the River Goes.frag',
      channels: ['assets/texture1.png'],
    ),
    // shaders/g/Goodbye Dream Clouds
    shader('shaders/g/Goodbye Dream Clouds.frag'),
    shader('shaders/m/M-O from Wall-E.frag'),
    // s/Sphere Gears
    shader('shaders/s/Sphere Gears.frag', channels: ['assets/Wall.jpg'], upSideDown: true),
    shader('shaders/o/Origami.frag'),
    shader('shaders/f/Full Spectrum Cyber.frag'),
    shader('shaders/d/drifting.frag'),
    shader('shaders/c/colorful cosmos spiral.frag', channels: ['assets/Wall.jpg']),
    shader('shaders/p/Perspex Web Lattice.frag', channels: ['assets/Wall.jpg']),
    shader('shaders/p/Perlin sin sphere.frag'),
    shader('shaders/p/Protean clouds.frag'),
    shader('shaders/d/divergence-free flow curly noise.frag'),
    shader('shaders/c/cobweb.frag'),
    shader('shaders/g/Gradient Flow.frag'),
    shader('shaders/t/Tunnel Cylinders.frag'),
    shader('shaders/t/Tunnel Cable.frag'),
    shader('shaders/u/Undular Substratum.frag'),
    shader('shaders/t/Traced Minkowski Tube.frag'),
    shader('shaders/c/CineShader Lava.frag'),
    shader('shaders/d/DULL SKULL.frag', channels: ['assets/Wall.jpg'], upSideDown: true),
    shader('shaders/c/Cube lines.frag', upSideDown: true),
    shader('shaders/z/Zippy Zaps.frag'),
    shader('shaders/g/Ghosts.frag'),
    shader('shaders/s/Singularity.frag'),
    shader(
      'shaders/p/Page Curl Effect on Ball.frag',
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
    List<Widget> children = shadersWidget(context);
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
            crossAxisCount: 3,
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
