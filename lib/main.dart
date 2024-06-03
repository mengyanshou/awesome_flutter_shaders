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

List<Widget> shadersWidget(BuildContext context) {
  List<Widget> children = [
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
    ShaderBuffers(
      key: UniqueKey(),
      controller: controller,
      mainImage: LayerBuffer(
        shaderAssetsName: ShaderAssets.bubbles,
      ),
    ),
    ShaderBuffers(
      key: UniqueKey(),
      controller: controller,
      mainImage: LayerBuffer(
        shaderAssetsName: ShaderAssets.inverseBilinear,
      )..setChannels([IChannel(assetsTexturePath: ShaderAssets.wall)]),
    ),
    // ShaderBuffers(
    //   key: UniqueKey(),
    //   controller: controller,
    //   mainImage: LayerBuffer(
    //     shaderAssetsName: ShaderAssets.noiseImageGenerator,
    //   )..setChannels([IChannel(assetsTexturePath: ShaderAssets.wall)]),
    // ),
    ShaderBuffers(
      key: UniqueKey(),
      controller: controller,
      mainImage: LayerBuffer(
        shaderAssetsName: ShaderAssets.warpSpeed2,
      )..setChannels([IChannel(assetsTexturePath: ShaderAssets.noiseImageGenerator)]),
    ),
    ShaderBuffers(
      key: UniqueKey(),
      controller: controller,
      mainImage: LayerBuffer(
        shaderAssetsName: ShaderAssets.rainierMood,
      )..setChannels([IChannel(assetsTexturePath: ShaderAssets.wall)]),
    ),

    ShaderBuffers(
      key: UniqueKey(),
      controller: controller,
      mainImage: LayerBuffer(
        shaderAssetsName: ShaderAssets.mengerSponge,
      ),
    ),
    ShaderBuffers(
      key: UniqueKey(),
      controller: controller,
      mainImage: LayerBuffer(
        shaderAssetsName: ShaderAssets.notSoGreeeenChromaticHole,
      )..setChannels([IChannel(assetsTexturePath: ShaderAssets.wall)]),
    ),
    ShaderBuffers(
      key: UniqueKey(),
      controller: controller,
      mainImage: LayerBuffer(shaderAssetsName: ShaderAssets.fractalPyramid),
    ),
    Builder(
      builder: (context) {
        final mainLayer = LayerBuffer(shaderAssetsName: ShaderAssets.mandelbulbDeconstructed);
        return ShaderBuffers(
          key: UniqueKey(),
          controller: controller,
          mainImage: mainLayer,
        );
      },
    ),
    Builder(
      builder: (context) {
        final mainLayer = LayerBuffer(shaderAssetsName: ShaderAssets.mandelbulbDerivative);
        return ShaderBuffers(
          key: UniqueKey(),
          controller: controller,
          mainImage: mainLayer,
        );
      },
    ),
    SizedBox(
      child: Builder(
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
    ),
    NormalShader(asset: ShaderAssets.fwaLogo),
    ShaderBuffers(
      key: UniqueKey(),
      controller: controller,
      mainImage: LayerBuffer(
        shaderAssetsName: ShaderAssets.brokenTimePortal,
      )..setChannels([IChannel(assetsTexturePath: ShaderAssets.brokenTimePortalChannel)]),
    ),
    ShaderBuffers(
      key: UniqueKey(),
      controller: controller,
      mainImage: LayerBuffer(
        shaderAssetsName: ShaderAssets.cubular,
      )..setChannels([IChannel(assetsTexturePath: ShaderAssets.cubularChannel)]),
    ),
    ShaderBuffers(
      key: UniqueKey(),
      controller: controller,
      mainImage: LayerBuffer(
        shaderAssetsName: ShaderAssets.monster,
      ),
    ),
    NormalShader(asset: ShaderAssets.starandblackhole),
    NormalShader(asset: ShaderAssets.colorfulKaleidoscope7),
    NormalShader(asset: ShaderAssets.baseWarpFbm, simplers: [ShaderAssets.baseWarpFbmChannel]),
    NormalShader(asset: ShaderAssets.phantomStarForCineShader),
    NormalShader(asset: ShaderAssets.blue),
    NormalShader(asset: ShaderAssets.mandelbulb),
    NormalShader(asset: ShaderAssets.raymarchingBasic),
    NormalShader(asset: ShaderAssets.rotateAndPointsCircle),
    NormalShader(asset: ShaderAssets.pinku),
    NormalShader(asset: ShaderAssets.blackHolesAndCrosses),
    NormalShader(asset: ShaderAssets.studiogustoComGooeyCover),
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
    ShaderBuffers(
      key: UniqueKey(),
      controller: controller,
      mainImage: LayerBuffer(
        shaderAssetsName: ShaderAssets.soundEclipseRpm,
      )..setChannels([IChannel(assetsTexturePath: ShaderAssets.blackHoleOdeGeodesicSolver)]),
    ),
    ShaderBuffers(
      key: UniqueKey(),
      controller: controller,
      mainImage: LayerBuffer(
        shaderAssetsName: ShaderAssets.blackHoleOdeGeodesicSolverFrag,
      )..setChannels([IChannel(assetsTexturePath: 'assets/Black Hole ODE Geodesic Solver.png')]),
    ),
    ShaderBuffers(
      key: UniqueKey(),
      controller: controller,
      mainImage: LayerBuffer(shaderAssetsName: ShaderAssets.simpleSuperSphericalShading),
    ),
    ShaderBuffers(
      key: UniqueKey(),
      controller: controller,
      mainImage: LayerBuffer(shaderAssetsName: ShaderAssets.mainSequenceStar)
        ..setChannels([
          IChannel(assetsTexturePath: ShaderAssets.mainSequenceStarPng),
          IChannel(assetsTexturePath: ShaderAssets.wall),
        ]),
    ),
    ShaderBuffers(
      key: UniqueKey(),
      controller: controller,
      mainImage: LayerBuffer(shaderAssetsName: ShaderAssets.noiseLab3D),
    ),
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
    NormalShader(asset: ShaderAssets.starsAndCosmos8),
    ShaderBuffers(
      controller: controller,
      mainImage: LayerBuffer(
        shaderAssetsName: ShaderAssets.marioWorld,
      ),
    ),
    NormalShader(asset: ShaderAssets.clouds2D),
    NormalShader(asset: ShaderAssets.palaceOfMind),
    ShaderBuffers(
      key: UniqueKey(),
      controller: controller,
      mainImage: LayerBuffer(
        shaderAssetsName: ShaderAssets.wavyfire,
      )..setChannels([IChannel(assetsTexturePath: ShaderAssets.wall)]),
    ),
    ShaderBuffers(
      key: UniqueKey(),
      controller: controller,
      mainImage: LayerBuffer(
        shaderAssetsName: ShaderAssets.grayscale,
      )..setChannels([IChannel(assetsTexturePath: ShaderAssets.wall)]),
    ),
    NormalShader(asset: ShaderAssets.seascape),
    NormalShader(asset: ShaderAssets.six),
    NormalShader(asset: ShaderAssets.seven),
    NormalShader(asset: ShaderAssets.shaderArtCodingIntroduction),
    ShaderBuffers(
      key: UniqueKey(),
      controller: controller,
      mainImage: LayerBuffer(
        shaderAssetsName: ShaderAssets.shaderArtCodingIntroduction,
      )..setChannels([IChannel(assetsTexturePath: ShaderAssets.wall)]),
    ),
    NormalShader(asset: ShaderAssets.deathStar),
    NormalShader(asset: ShaderAssets.octagrams),
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
            return GestureDetector(
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
                child: children[index],
              ),
            );
          },
        ),
      ),
    );
  }
}
