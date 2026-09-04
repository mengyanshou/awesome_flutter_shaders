import 'package:flutter/material.dart';
import 'package:shader_graph/shader_graph.dart';

import 'shaders.dart';

class BricksGame extends StatefulWidget {
  const BricksGame({super.key});

  @override
  State<BricksGame> createState() => _BricksGameState();
}

class _BricksGameState extends State<BricksGame> {
  KeyboardController keyboardController = KeyboardController();
  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, con) {
        bool needVirtualKeyboard = con.maxWidth < 400;
        return Stack(
          alignment: Alignment.center,
          children: [
            LayoutBuilder(
              builder: (context, constraints) {
                double width = constraints.maxWidth;
                double height = constraints.maxHeight;

                return SizedBox(
                  width: width,
                  height: height,
                  child: ShaderSurface.builder(
                    () {
                      final bufferA = '${SA.package}shaders/game/Bricks Game BufferA.frag'.shaderBuffer.feedback().feedKeyboard();
                      final mainBuffer = '${SA.package}shaders/game/Bricks Game.frag'.feed(bufferA);
                      // Standard scheme: physical width = virtual * 4
                      bufferA.fixedOutputSize = const Size(14 * 4.0, 14);

                      return [bufferA, mainBuffer];
                    },
                    keyboardController: keyboardController,
                  ),
                );
              },
            ),
            Align(
              alignment: Alignment.bottomCenter,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: VirtualButtoon(keyboardController: keyboardController),
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }
}

class VirtualButtoon extends StatefulWidget {
  const VirtualButtoon({super.key, required this.keyboardController});
  final KeyboardController keyboardController;

  @override
  State<VirtualButtoon> createState() => _VirtualButtoonState();
}

class _VirtualButtoonState extends State<VirtualButtoon> {
  late KeyboardController keyboardController = widget.keyboardController;
  Material buildButton(int keyCode, {Widget? child}) {
    return Material(
      color: Theme.of(context).colorScheme.primary.withOpacity(0.15),
      borderRadius: BorderRadius.circular(20),
      child: SizedBox(
        width: 40,
        height: 40,
        child: InkWell(
          onTapDown: (_) {
            keyboardController.pressKey(keyCode);
          },
          onTapUp: (_) {
            keyboardController.releaseKey(keyCode, 0);
          },
          onTapCancel: () {
            keyboardController.releaseKey(keyCode, 0);
          },
          borderRadius: BorderRadius.circular(20),
          child: IconTheme(
            data: IconThemeData(color: Theme.of(context).colorScheme.primary),
            child: child ?? SizedBox(),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 84,
      child: Material(
        color: Colors.transparent,
        child: Row(
          crossAxisAlignment: .end,
          children: [
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Material(
                color: Theme.of(context).colorScheme.primary.withOpacity(0.15),
                borderRadius: BorderRadius.circular(12),
                child: InkWell(
                  onTap: () {
                    keyboardController.pressKey(32);
                    Future.delayed(const Duration(milliseconds: 100), () {
                      keyboardController.releaseKey(32, 0);
                    });
                  },
                  borderRadius: BorderRadius.circular(12),
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
                    child: Text(
                      'Space',
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.primary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ),
            ),
            Column(
              mainAxisAlignment: .end,
              spacing: 4,
              children: [
                // up
                buildButton(38, child: const Icon(Icons.arrow_upward, size: 32)),
                Row(
                  spacing: 10,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // left
                    buildButton(37, child: const Icon(Icons.arrow_back, size: 32)),
                    // down
                    buildButton(40, child: const Icon(Icons.arrow_downward, size: 32)),
                    // right
                    buildButton(39, child: const Icon(Icons.arrow_forward, size: 32)),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
