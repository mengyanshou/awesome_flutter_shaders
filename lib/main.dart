import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_shaders/flutter_shaders.dart';
import 'package:shader_buffers/shader_buffers.dart';
import 'normal_shader.dart';
import 'shaders.dart';
import 'time_wrapper.dart';

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

ShaderBuffers shader(String asset, {List<String> channels = const []}) {
  return ShaderBuffers(
    // width: 100,
    // height: 100,
    key: UniqueKey(),
    controller: ShaderController(),
    mainImage: LayerBuffer(shaderAssetsName: asset)
      ..setChannels(
        channels.map((channel) => IChannel(assetsTexturePath: channel)).toList(),
      ),
  );
}

bool enableImpller = false;

List<Widget> shadersWidget(BuildContext context) {
  List<Widget> children = [
    // NormalShader(asset: ShaderAssets.deathStar),
    ShaderBuffers(
      // width: 100,
      // height: 100,
      key: UniqueKey(),
      controller: ShaderController(),
      mainImage: LayerBuffer(shaderAssetsName: ShaderAssets.deathStar),
    ),
    // shader(ShaderAssets.deathStar),
    // ShaderBuffers(
    //   key: UniqueKey(),
    //   controller: controller,
    //   mainImage: LayerBuffer(
    //     shaderAssetsName: ShaderAssets.inputTime,
    //     uniforms: Uniforms(
    //       [
    //         Uniform(
    //           name: 'time',
    //           value: 0.0,
    //           range: const RangeValues(0, 10),
    //           defaultValue: 0,
    //         ),
    //       ],
    //     ),
    //   ),
    // ),
    // electron.frag
    // ShaderBuffers(
    //   key: UniqueKey(),
    //   controller: controller,
    //   mainImage: LayerBuffer(
    //     shaderAssetsName: ShaderAssets.electron,
    //   ),
    // ),

    // ShaderBuffers(
    //   key: UniqueKey(),
    //   controller: controller,
    //   mainImage: LayerBuffer(
    //     shaderAssetsName: 'shaders/Hex Glitch.frag',
    //   )..setChannels([
    //       IChannel(assetsTexturePath: 'shaders/Hex Glitch BufferA.frag'),
    //       IChannel(assetsTexturePath: 'shaders/Hex Glitch BufferB.frag'),
    //     ]),
    // ),
    // shader('shaders/Broken.frag', channels: [ShaderAssets.brokenTimePortalChannel]),
    // shader(ShaderAssets.brokenTimePortal, channels: [ShaderAssets.brokenTimePortalChannel]),
    // ShaderBuffers(
    //   key: UniqueKey(),
    //   controller: ShaderController(),
    //   mainImage: LayerBuffer(
    //     shaderAssetsName: 'shaders/sula.frag',
    //     uniforms: Uniforms(
    //       [
    //         Uniform(
    //           name: 'time',
    //           value: 0.0,
    //           range: const RangeValues(0, 10),
    //           defaultValue: 0,
    //         ),
    //       ],
    //     ),
    //   ),
    // ),
    if (enableImpller) shader('shaders/ED-209.frag'),
    shader(ShaderAssets.octagrams),
    shader(ShaderAssets.fractalPyramid),
    if (enableImpller) shader('shaders/Byt3-daily-013.frag'),
    shader(ShaderAssets.starry),
    if (enableImpller) shader('shaders/Mandelbulb 3D Fractal.frag'),
    shader(ShaderAssets.electron),
    if (enableImpller) shader('shaders/Input Time.frag'),
    if (enableImpller)
      shader('shaders/Refraction post proc.frag', channels: [
        'shaders/Refraction post proc BufferA.frag',
        'shaders/Refraction post proc BufferB.frag',
      ]),
    if (enableImpller) shader('shaders/Dive to Cloud.frag'),
    if (enableImpller) shader('shaders/Galvanize.frag'),
    shader(ShaderAssets.bubbles),
    shader(ShaderAssets.inverseBilinear, channels: [ShaderAssets.wall]),
    shader(ShaderAssets.warpSpeed2, channels: [ShaderAssets.noiseImageGenerator]),
    shader(ShaderAssets.rainierMood, channels: [ShaderAssets.wall]),
    shader(ShaderAssets.mengerSponge),
    shader(ShaderAssets.notSoGreeeenChromaticHole, channels: [ShaderAssets.wall]),
    shader(ShaderAssets.mandelbulbDeconstructed),
    shader(ShaderAssets.mandelbulbDerivative),
    Builder(
      builder: (context) {
        final bufferA = LayerBuffer(shaderAssetsName: ShaderAssets.basicHowToUseBufferDemoBufferA);
        final mainLayer = LayerBuffer(shaderAssetsName: ShaderAssets.basicHowToUseBufferDemo);
        mainLayer.setChannels([
          IChannel(buffer: bufferA),
        ]);
        return ShaderBuffers(
          key: UniqueKey(),
          controller: controller,
          mainImage: mainLayer,
          buffers: [bufferA],
        );
      },
    ),
    // shader(ShaderAssets.basicHowToUseBufferDemo, channels: [ShaderAssets.basicHowToUseBufferDemoBufferA]),
    shader(ShaderAssets.fwaLogo),
    shader(ShaderAssets.cubular, channels: [ShaderAssets.cubularChannel]),
    shader(ShaderAssets.monster),
    shader(ShaderAssets.starandblackhole),
    shader(ShaderAssets.colorfulKaleidoscope7),
    NormalShader(asset: ShaderAssets.phantomStarForCineShader),
    // shader(ShaderAssets.phantomStarForCineShader),
    shader(ShaderAssets.blue),
    shader(ShaderAssets.mandelbulb),
    shader(ShaderAssets.raymarchingBasic),
    shader(ShaderAssets.rotateAndPointsCircle),
    shader(ShaderAssets.pinku),
    shader(ShaderAssets.blackHolesAndCrosses),
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

    shader(ShaderAssets.blackHoleOdeGeodesicSolverFrag, channels: ['assets/Black Hole ODE Geodesic Solver.png']),

    shader(ShaderAssets.simpleSuperSphericalShading),
    shader(
      ShaderAssets.mainSequenceStar,
      channels: [
        ShaderAssets.mainSequenceStarPng,
        ShaderAssets.wall,
      ],
    ),
    shader(ShaderAssets.noiseLab3D),
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
    NormalShader(asset: ShaderAssets.six),
    NormalShader(asset: ShaderAssets.seven),
    NormalShader(asset: ShaderAssets.shaderArtCodingIntroduction),
    // shader(ShaderAssets.shaderArtCodingIntroduction),
    // ShaderBuffers(
    //   key: UniqueKey(),
    //   controller: controller,
    //   mainImage: LayerBuffer(
    //     shaderAssetsName: ShaderAssets.shaderArtCodingIntroduction,
    //   )..setChannels([IChannel(assetsTexturePath: ShaderAssets.wall)]),
    // ),
    NormalShader(asset: ShaderAssets.rayMarchingPart2),
    NormalShader(asset: ShaderAssets.rayMarchingPart3),
    NormalShader(asset: ShaderAssets.rayMarchingPart4),
    NormalShader(asset: ShaderAssets.warpingProcedural2),
    NormalShader(asset: ShaderAssets.discoteq2),
    NormalShader(asset: ShaderAssets.devilGlass),
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
    double height = MediaQuery.of(context).size.width / 1.7777777;
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
        child: ListView.builder(
          itemCount: children.length,
          itemBuilder: (context, index) {
            String message() {
              Widget child = children[index];
              if (child is ShaderBuffers) {
                return child.mainImage.shaderAssetsName;
              }
              return child.toString();
            }

            return Tooltip(
              message: message(),
              child: GestureDetector(
                onTap: () {
                  Navigator.of(context).push(MaterialPageRoute(builder: (context) {
                    return Scaffold(
                      backgroundColor: Colors.black,
                      body: children[index],
                    );
                  }));
                },
                child: SizedBox(
                  height: height,
                  width: double.infinity,
                  child: children[index],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
