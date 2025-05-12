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
  bool upSideDown = false,
}) {
  LayerBuffer layerBuffer = LayerBuffer(shaderAssetsName: asset);
  layerBuffer.setChannels(
    channels.map((channel) => IChannel(assetsTexturePath: channel)).toList(),
  );
  return Tooltip(
    message: asset,
    child: RotatedBox(
      quarterTurns: upSideDown ? 2 : 0,
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
    // b
    ...b.shadersWidget(),
    // c
    ...c.shadersWidget(),
    // d
    ...d.shadersWidget(),
    if (enableImpller) shader('shaders/ED-209.frag', upSideDown: true),
    shader(ShaderAssets.electron),
    shader(ShaderAssets.fractalPyramid),
    shader(ShaderAssets.fwaLogo),
    SizedBox(
      child: Builder(builder: (context) {
        final bufferA = LayerBuffer(shaderAssetsName: ShaderAssets.fluidSolverBufferA);
        final mainBuffer = LayerBuffer(shaderAssetsName: ShaderAssets.fluidSolver);
        bufferA.setChannels([IChannel(buffer: bufferA)]);
        mainBuffer.setChannels([
          IChannel(buffer: bufferA),
        ]);
        return ShaderBuffers(
          key: UniqueKey(),
          controller: controller,
          mainImage: mainBuffer,
          buffers: [bufferA],
        );
      }),
    ),
    if (enableImpller) shader('shaders/Galvanize.frag'),
    shader(ShaderAssets.inverseBilinear, channels: [ShaderAssets.wall]),
    shader(ShaderAssets.mengerSponge),
    shader(ShaderAssets.mandelbulbDeconstructed),
    shader(ShaderAssets.mandelbulbDerivative),
    shader(ShaderAssets.monster),
    shader(ShaderAssets.mandelbulb),
    shader(
      ShaderAssets.mainSequenceStar,
      channels: [
        ShaderAssets.mainSequenceStarPng,
        ShaderAssets.wall,
      ],
    ),
    shader(ShaderAssets.noiseLab3D),
    shader(ShaderAssets.notSoGreeeenChromaticHole, channels: [ShaderAssets.wall]),
    shader(ShaderAssets.octagrams),
    shader(ShaderAssets.rainierMood, channels: [ShaderAssets.wall]),
    ShaderBuffers(
      // width: 100,
      // height: 100,
      key: UniqueKey(),
      controller: ShaderController(),
      mainImage: LayerBuffer(shaderAssetsName: ShaderAssets.shockWaveWithSaturation)
        ..setChannels(
          [
            IChannel(
              child: Container(
                width: MediaQuery.of(context).size.width,
                height: MediaQuery.of(context).size.width / 1.7777777,
                color: Colors.white,
                child: Image(
                  image: AssetImage(ShaderAssets.wall),
                ),
              ),
              assetsTexturePath: ShaderAssets.wall,
            ),
          ],
        ),
    ),
    shader(ShaderAssets.starry),
    if (enableImpller) shader('shaders/Input Time.frag'),
    if (enableImpller) shader('shaders/Mandelbulb 3D Fractal.frag'),
    if (enableImpller)
      shader('shaders/Refraction post proc.frag', channels: [
        'shaders/Refraction post proc BufferA.frag',
        'shaders/Refraction post proc BufferB.frag',
      ]),
    shader(ShaderAssets.phantomStarForCineShader),
    shader(ShaderAssets.pinku),
    shader(ShaderAssets.raymarchingBasic),
    shader(ShaderAssets.rotateAndPointsCircle),
    shader(ShaderAssets.starandblackhole),
    Builder(
      builder: (context) {
        final mainLayer = LayerBuffer(shaderAssetsName: ShaderAssets.rainierMood);
        mainLayer.setChannels([
          IChannel(
            child: shader(ShaderAssets.mengerSponge),
          ),
        ]);
        return ShaderBuffers(
          key: UniqueKey(),
          controller: controller,
          mainImage: mainLayer,
        );
      },
    ),
    shader(ShaderAssets.studiogustoComGooeyCover),
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
    shader(ShaderAssets.soundEclipseRpm, channels: [ShaderAssets.blackHoleOdeGeodesicSolver]),

    shader(ShaderAssets.simpleSuperSphericalShading),
    shader(ShaderAssets.warpSpeed2, channels: [ShaderAssets.noiseImageGenerator]),
    SizedBox(
      child: Builder(builder: (context) {
        final bufferA = LayerBuffer(shaderAssetsName: ShaderAssets.expansiveReactionDiffusionBufferA);
        final bufferB = LayerBuffer(shaderAssetsName: ShaderAssets.expansiveReactionDiffusionBufferB);
        final bufferC = LayerBuffer(shaderAssetsName: ShaderAssets.expansiveReactionDiffusionBufferC);
        final bufferD = LayerBuffer(shaderAssetsName: ShaderAssets.expansiveReactionDiffusionBufferD);
        final mainBuffer = LayerBuffer(shaderAssetsName: ShaderAssets.expansiveReactionDiffusion);
        bufferA.setChannels([
          IChannel(buffer: bufferA),
          IChannel(buffer: bufferC),
          IChannel(buffer: bufferD),
          IChannel(assetsTexturePath: ShaderAssets.nosiePng),
        ]);
        bufferB.setChannels([
          IChannel(buffer: bufferA),
        ]);
        bufferC.setChannels([
          IChannel(buffer: bufferB),
        ]);
        bufferD.setChannels([
          IChannel(buffer: bufferA),
        ]);
        mainBuffer.setChannels([
          IChannel(buffer: bufferA),
          IChannel(buffer: bufferC),
          IChannel(assetsTexturePath: ShaderAssets.backPng),
          IChannel(assetsTexturePath: ShaderAssets.nosiePng),
        ]);
        return ShaderBuffers(
          key: UniqueKey(),
          controller: controller,
          mainImage: mainBuffer,
          buffers: [bufferA, bufferB, bufferC, bufferD],
        );
      }),
    ),
    SizedBox(
      child: Builder(builder: (context) {
        final bufferA = LayerBuffer(shaderAssetsName: ShaderAssets.protoplanetBufferA);
        final mainBuffer = LayerBuffer(shaderAssetsName: ShaderAssets.protoplanet);
        bufferA.setChannels([
          IChannel(buffer: bufferA),
        ]);
        mainBuffer.setChannels([
          IChannel(buffer: bufferA),
        ]);
        return ShaderBuffers(
          key: UniqueKey(),
          controller: controller,
          mainImage: mainBuffer,
          buffers: [bufferA],
        );
      }),
    ),
    shader(ShaderAssets.starsAndCosmos8),
    shader(ShaderAssets.marioWorld),
    // shader(ShaderAssets.clouds2D),
    // shader(ShaderAssets.palaceOfMind),
    shader(ShaderAssets.wavyfire, channels: [ShaderAssets.wall]),
    ShaderBuffers(
      key: UniqueKey(),
      controller: controller,
      mainImage: LayerBuffer(
        shaderAssetsName: ShaderAssets.grayscale,
      )..setChannels([IChannel(assetsTexturePath: ShaderAssets.wall)]),
    ),
    // shader(ShaderAssets.grayscale,channels: [ShaderAssets.wall]),
    shader(ShaderAssets.seascape),
    shader(ShaderAssets.shaderArtCodingIntroduction),
    // shader(ShaderAssets.shaderArtCodingIntroduction),
    // ShaderBuffers(
    //   key: UniqueKey(),
    //   controller: controller,
    //   mainImage: LayerBuffer(
    //     shaderAssetsName: ShaderAssets.shaderArtCodingIntroduction,
    //   )..setChannels([IChannel(assetsTexturePath: ShaderAssets.wall)]),
    // ),
    shader(ShaderAssets.rayMarchingPart2),
    shader(ShaderAssets.rayMarchingPart3),
    shader(ShaderAssets.rayMarchingPart4),
    shader(ShaderAssets.warpingProcedural2),
    shader(ShaderAssets.discoteq2),
    shader(ShaderAssets.devilGlass),
    SizedBox(
      child: ShaderBuilder(assetKey: ShaderAssets.warp, (BuildContext context, FragmentShader shader, _) {
        return Material(
          color: Colors.black,
          child: Center(
            child: Align(
              alignment: Alignment.center,
              child: TimeWrapper(
                builder: (Duration time) {
                  return ShaderMask(
                    shaderCallback: (Rect bounds) {
                      shader.setFloat(0, bounds.width * 5);
                      shader.setFloat(1, bounds.height * 5);
                      shader.setFloat(2, time.inMilliseconds.toDouble() / 1000);
                      return shader;
                    },
                    blendMode: BlendMode.srcIn,
                    child: const Text(
                      'nightmare',
                      style: TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 48,
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
    SizedBox(
      child: ShaderBuilder(
        assetKey: ShaderAssets.warp,
        (BuildContext context, FragmentShader shader, _) {
          return TimeWrapper(
            builder: (Duration time) {
              return CustomPaint(
                size: MediaQuery.of(context).size,
                painter: ShaderCustomPainter(shader, time),
              );
            },
          );
        },
      ),
    )
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
                  ctl.pause();
                });
                await Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) {
                      return GestureDetector(
                        onTap: () {
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
