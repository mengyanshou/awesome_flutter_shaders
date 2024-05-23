// ignore_for_file: prefer_const_literals_to_create_immutables

import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_shaders/flutter_shaders.dart';
import 'package:shader_buffers/shader_buffers.dart';
import 'normal_shader.dart';
import 'dart:ui' as ui;
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

Future<FragmentShader> getShader(String asset) async {
  var program = await FragmentProgram.fromAsset(asset);
  return program.fragmentShader();
}

typedef Layers = ({LayerBuffer mainImage, List<LayerBuffer> buffers});
ValueNotifier<List<Uniform>> uniform = ValueNotifier([]);
ShaderController controller = ShaderController();

late Layers shader;

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    List children = [
      ShaderBuffers(
        key: UniqueKey(),
        width: MediaQuery.of(context).size.width,
        height: 300,
        controller: controller,
        mainImage: LayerBuffer(
          shaderAssetsName: 'shaders/Broken Time Portal.frag',
        )..setChannels([IChannel(assetsTexturePath: 'assets/Base warp fBM.png')]),
      ),
      ShaderBuffers(
        key: UniqueKey(),
        width: MediaQuery.of(context).size.width,
        height: 300,
        controller: controller,
        mainImage: LayerBuffer(
          shaderAssetsName: 'shaders/cubular.frag',
        )..setChannels([IChannel(assetsTexturePath: 'assets/Cubular.png')]),
      ),
      // const NormalShader(
      //   width: 300,
      //   height: 300,
      //   asset: 'shaders/Full Spectrum Cyber.frag',
      // ),
      //
      ShaderBuffers(
        key: UniqueKey(),
        width: MediaQuery.of(context).size.width,
        height: 300,
        controller: controller,
        mainImage: LayerBuffer(
          shaderAssetsName: 'shaders/MONSTER.frag',
        ),
      ),
      const NormalShader(
        width: 300,
        height: 300,
        asset: 'shaders/star and black hole.frag',
      ),
      const NormalShader(
        width: 300,
        height: 300,
        asset: 'shaders/colorful Kaleidoscope 7.frag',
      ),
      const NormalShader(
        width: 300,
        height: 300,
        asset: 'shaders/Base warp fBM.frag',
        simplers: ['assets/Base warp fBM.png'],
      ),
      const NormalShader(
        width: 300,
        height: 300,
        asset: 'shaders/Phantom Star for CineShader.frag',
      ),
      const NormalShader(
        width: 300,
        height: 300,
        asset: 'shaders/Blue.frag',
      ),
      const NormalShader(
        width: 300,
        height: 300,
        asset: 'shaders/mandelbulb.frag',
      ),
      const NormalShader(
        width: 300,
        height: 300,
        asset: 'shaders/Raymarching Basic.frag',
      ),
      const NormalShader(
        width: 300,
        height: 300,
        asset: 'shaders/rotate and points circle.frag',
      ),
      const NormalShader(
        width: 300,
        height: 300,
        asset: 'shaders/Pinku.frag',
      ),
      const NormalShader(
        width: 300,
        height: 300,
        asset: 'shaders/black holes and crosses.frag',
      ),
      const NormalShader(
        width: 300,
        height: 300,
        asset: 'shaders/Studiogusto.com Gooey Cover.frag',
      ),
      SizedBox(
        width: 300 * 1.7,
        height: 300,
        child: Builder(builder: (context) {
          final mainLayer = LayerBuffer(
            shaderAssetsName: 'shaders/page_curl.frag',
          );
          mainLayer.setChannels([
            IChannel(assetsTexturePath: 'assets/Wall.jpg'),
            IChannel(assetsTexturePath: 'assets/bricks.jpg'),
          ]);
          return ShaderBuffers(
            key: UniqueKey(),
            width: MediaQuery.of(context).size.width,
            height: 300,
            controller: controller,
            mainImage: mainLayer,
          );
        }),
      ),
      ShaderBuffers(
        key: UniqueKey(),
        width: MediaQuery.of(context).size.width,
        height: 300,
        controller: controller,
        mainImage: LayerBuffer(
          shaderAssetsName: 'shaders/SoundEclipse rpm.frag',
        )..setChannels([IChannel(assetsTexturePath: 'assets/Black Hole ODE Geodesic Solver.png')]),
      ),
      ShaderBuffers(
        key: UniqueKey(),
        width: MediaQuery.of(context).size.width,
        height: 300,
        controller: controller,
        mainImage: LayerBuffer(
          shaderAssetsName: 'shaders/Black Hole ODE Geodesic Solver.frag',
        )..setChannels([IChannel(assetsTexturePath: 'assets/Black Hole ODE Geodesic Solver.png')]),
      ),
      ShaderBuffers(
        key: UniqueKey(),
        width: MediaQuery.of(context).size.width,
        height: 300,
        controller: controller,
        mainImage: LayerBuffer(
          shaderAssetsName: 'shaders/Simple super spherical shading.frag',
        ),
      ),
      ShaderBuffers(
        key: UniqueKey(),
        width: MediaQuery.of(context).size.width,
        height: 300,
        controller: controller,
        mainImage: LayerBuffer(
          shaderAssetsName: 'shaders/Main Sequence Star.frag',
        )..setChannels([
            IChannel(assetsTexturePath: 'assets/Main Sequence Star.png'),
            IChannel(assetsTexturePath: 'assets/Wall.jpg'),
          ]),
      ),
      ShaderBuffers(
        key: UniqueKey(),
        width: MediaQuery.of(context).size.width,
        height: 300,
        controller: controller,
        mainImage: LayerBuffer(
          shaderAssetsName: 'shaders/Noise Lab 3D.frag',
          // floatUniforms: [0.1],
        ),
      ),
      SizedBox(
        width: 300 * 1.7,
        height: 300,
        child: Builder(builder: (context) {
          final bufferA = LayerBuffer(shaderAssetsName: 'shaders/Fluid solver BufferA.frag');
          final mainBuffer = LayerBuffer(shaderAssetsName: 'shaders/Fluid solver.frag');
          bufferA.setChannels([IChannel(buffer: bufferA)]);
          mainBuffer.setChannels([
            IChannel(buffer: bufferA),
          ]);
          // final bufferB = LayerBuffer(shaderAssetsName: 'shaders/Refraction post proc BufferB.frag');
          // bufferB.setChannels([
          //   IChannel(buffer: bufferA),
          //   IChannel(buffer: bufferB),
          // ]);
          return ShaderBuffers(
            key: UniqueKey(),
            controller: controller,
            mainImage: mainBuffer,
            buffers: [
              bufferA,
            ],
          );
        }),
      ),
      SizedBox(
        width: 300 * 1.7,
        height: 300,
        child: Builder(builder: (context) {
          final bufferA = LayerBuffer(shaderAssetsName: 'shaders/expansive reaction-diffusion BufferA.frag');
          final bufferB = LayerBuffer(shaderAssetsName: 'shaders/expansive reaction-diffusion BufferB.frag');
          final bufferC = LayerBuffer(shaderAssetsName: 'shaders/expansive reaction-diffusion BufferC.frag');
          final bufferD = LayerBuffer(shaderAssetsName: 'shaders/expansive reaction-diffusion BufferD.frag');
          final mainBuffer = LayerBuffer(shaderAssetsName: 'shaders/expansive reaction-diffusion.frag');
          bufferA.setChannels([
            IChannel(buffer: bufferA),
            IChannel(buffer: bufferC),
            IChannel(buffer: bufferD),
            IChannel(assetsTexturePath: 'assets/nosie.png'),
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
            IChannel(assetsTexturePath: 'assets/back.png'),
            IChannel(assetsTexturePath: 'assets/nosie.png'),
          ]);
          // final bufferB = LayerBuffer(shaderAssetsName: 'shaders/Refraction post proc BufferB.frag');
          // bufferB.setChannels([
          //   IChannel(buffer: bufferA),
          //   IChannel(buffer: bufferB),
          // ]);
          return ShaderBuffers(
            key: UniqueKey(),
            controller: controller,
            mainImage: mainBuffer,
            buffers: [
              bufferA,
              bufferB,
              bufferC,
              bufferD,
            ],
          );
        }),
      ),
      SizedBox(
        width: 300 * 1.7,
        height: 300,
        child: Builder(builder: (context) {
          final bufferA = LayerBuffer(shaderAssetsName: 'shaders/Protoplanet BufferA.frag');
          final mainBuffer = LayerBuffer(shaderAssetsName: 'shaders/Protoplanet.frag');
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
            buffers: [
              bufferA,
            ],
          );
        }),
      ),
      const NormalShader(
        width: 300,
        height: 300,
        asset: 'shaders/stars and cosmos 8.frag',
      ),
      const NormalShader(
        width: 300,
        height: 300,
        asset: 'shaders/Mario World.frag',
      ),
      const NormalShader(
        width: 300,
        height: 300,
        asset: 'shaders/Clouds-2D.frag',
      ),
      // const NormalShader(
      //   width: 300,
      //   height: 300,
      //   asset: 'shaders/colorful vision.frag',
      // ),
      const NormalShader(
        width: 300,
        height: 300,
        asset: 'shaders/Palace of Mind.frag',
      ),
      ShaderBuffers(
        key: UniqueKey(),
        width: MediaQuery.of(context).size.width,
        height: 300,
        controller: controller,
        mainImage: LayerBuffer(
          shaderAssetsName: 'shaders/wavyfire.frag',
        )..setChannels([IChannel(assetsTexturePath: 'assets/Wall.jpg')]),
      ),
      ShaderBuffers(
        key: UniqueKey(),
        width: MediaQuery.of(context).size.width,
        height: 300,
        controller: controller,
        mainImage: LayerBuffer(
          shaderAssetsName: 'shaders/grayscale.frag',
          // floatUniforms: [0.1],
        )..setChannels([IChannel(assetsTexturePath: 'assets/Wall.jpg')]),
        buffers: [],
      ),
      NormalShader(
        width: MediaQuery.of(context).size.width,
        height: 300,
        asset: 'shaders/Seascape.frag',
      ),
      NormalShader(
        width: MediaQuery.of(context).size.width,
        height: 300,
        asset: 'shaders/6.frag',
      ),
      NormalShader(
        asset: 'shaders/7.frag',
        width: MediaQuery.of(context).size.width,
        height: 300,
      ),
      NormalShader(
        width: MediaQuery.of(context).size.width,
        height: 300,
        asset: 'shaders/Shader Art Coding Introduction.frag',
      ),
      ShaderBuffers(
        key: UniqueKey(),
        width: MediaQuery.of(context).size.width,
        height: 300,
        controller: controller,
        mainImage: LayerBuffer(
          shaderAssetsName: 'shaders/Starleidoscope.frag',
        )..setChannels([IChannel(assetsTexturePath: 'assets/Wall.jpg')]),
      ),
      NormalShader(
        width: MediaQuery.of(context).size.width,
        height: 300,
        asset: 'shaders/DeathStar.frag',
      ),
      NormalShader(
        width: MediaQuery.of(context).size.width,
        height: 300,
        asset: 'shaders/Octagrams.frag',
      ),
      NormalShader(
        width: MediaQuery.of(context).size.width,
        height: 300,
        asset: 'shaders/Ray Marching Part 2.frag',
      ),
      NormalShader(
        width: MediaQuery.of(context).size.width,
        height: 300,
        asset: 'shaders/Ray Marching Part 3.frag',
      ),
      NormalShader(
        width: MediaQuery.of(context).size.width,
        height: 300,
        asset: 'shaders/Ray Marching Part 4.frag',
      ),
      NormalShader(
        asset: 'shaders/Warping procedural 2.frag',
        width: MediaQuery.of(context).size.width,
        height: 300,
      ),
      NormalShader(
        asset: 'shaders/Discoteq 2.frag',
        width: MediaQuery.of(context).size.width,
        height: 300,
      ),
      NormalShader(
        asset: 'shaders/Devil Glass.frag',
        width: MediaQuery.of(context).size.width,
        height: 300,
      ),
      SizedBox(
        width: MediaQuery.of(context).size.width,
        height: 300,
        child: ShaderBuilder(assetKey: 'shaders/warp.frag', (BuildContext context, FragmentShader shader, _) {
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
                          fontSize: 100,
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
        width: MediaQuery.of(context).size.width,
        height: 300,
        child: ShaderBuilder(
          assetKey: 'shaders/warp.frag',
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
    return MaterialApp(
      title: 'Flutter Demo',
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
              child: children[index],
            );
          },
        ),
      ),
    );
  }
}
