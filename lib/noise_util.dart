import 'dart:async';
import 'dart:math' as math;
import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:shader_graph/shader_graph.dart';

class GeneratedNoiseInput extends ShaderInput {
  GeneratedNoiseInput(
    this.image, {
    this.wrap = WrapMode.clamp,
    this.filter = FilterMode.linear,
  });

  final ui.Image image;

  @override
  final WrapMode wrap;

  @override
  final FilterMode filter;

  @override
  ui.Image resolve() => image;
}

int _u8FromUnit(double v) {
  if (v <= 0.0) return 0;
  if (v >= 1.0) return 255;
  // 原理说明：
  // 1. 为什么用 256 而不是 255？
  //    我们需要将 [0, 1) 的连续区间均匀划分为 256 个等宽的“桶”（对应 0-255 色阶）。
  //    如果用 v * 255，那么得到 255 的概率几乎为 0（只有 v 严格等于 1.0 时）。
  //    使用 v * 256 并向下取整，使得每个整数色阶都能获得 1/256 的均等出现概率。
  // 2. 解决断层：
  //    这种均匀量化确保了生成的贴图拥有完整的 256 级色域分布，配合 Shader 的采样
  //    能产生最平滑的过渡，消除肉眼可见的色彩断层。
  final out = (v * 256.0).floor();
  return out.clamp(0, 255);
}

/// 快速、确定性的 2D->1D hash（比 sin-hash 更适合做贴图噪声）。
int _hash2i(int x, int y, int seed) {
  // 基于 32-bit 混合（常见的整数 hash 结构），让结果在 0..2^32-1 近似均匀。
  var h = 0x9E3779B9 ^ seed;
  h = (h + x) & 0xFFFFFFFF;
  h = (h ^ (h >> 16)) & 0xFFFFFFFF;
  h = (h * 0x85EBCA6B) & 0xFFFFFFFF;
  h = (h + y) & 0xFFFFFFFF;
  h = (h ^ (h >> 13)) & 0xFFFFFFFF;
  h = (h * 0xC2B2AE35) & 0xFFFFFFFF;
  h = (h ^ (h >> 16)) & 0xFFFFFFFF;
  return h;
}

/// Shadertoy 风格 sin-hash
double _hash(double x, double y) {
  final v = math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return v - v.floor();
}

double _hash01i(int x, int y, int seed) {
  final h = _hash2i(x, y, seed);
  // 取高位映射到 [0,1)
  return ((h >>> 8) & 0x00FFFFFF) / 0x01000000;
}

Future<ui.Image> generateShaderToyRGBNoise(
  int width,
  int height, {
  double gamma = 1.8, // 关键：压暗曲线
  bool useSinHash = false, // 是否使用 sin-based hash (Shadertoy 原生风格)
}) async {
  final pixels = Uint8List(width * height * 4);

  // 生成可 repeat 的 tileable 噪声：最后一行/列与第一行/列一致，避免线性过滤跨边界产生“断层/接缝”。
  for (int y = 0; y < height; y++) {
    for (int x = 0; x < width; x++) {
      final tx = (x == width - 1) ? 0 : x;
      final ty = (y == height - 1) ? 0 : y;

      double r, g, b, a;
      if (useSinHash) {
        final fx = tx.toDouble();
        final fy = ty.toDouble();
        // 每个通道使用完全不同的 hash seed
        r = _hash(fx + 37.0, fy + 17.0);
        g = _hash(fx + 11.0, fy + 83.0);
        b = _hash(fx + 59.0, fy + 29.0);
        a = _hash(fx + 27.0, fy + 47.0);
      } else {
        r = _hash01i(tx, ty, 0xA53A9E37);
        g = _hash01i(tx, ty, 0xC2B2AE35);
        b = _hash01i(tx, ty, 0x165667B1);
        a = _hash01i(tx, ty, 0x27D4EB2D);
      }

      // 你希望保留的 Shadertoy 风格 gamma（更像“线性化/压暗”）。
      if (gamma != 1.0) {
        r = math.pow(r, gamma).toDouble();
        g = math.pow(g, gamma).toDouble();
        b = math.pow(b, gamma).toDouble();
      }

      final idx = (y * width + x) * 4;
      pixels[idx + 0] = _u8FromUnit(r);
      pixels[idx + 1] = _u8FromUnit(g);
      pixels[idx + 2] = _u8FromUnit(b);
      pixels[idx + 3] = _u8FromUnit(a);
    }
  }

  final completer = Completer<ui.Image>();
  ui.decodeImageFromPixels(
    pixels,
    width,
    height,
    ui.PixelFormat.rgba8888,
    completer.complete,
  );
  return completer.future;
}

Future<ui.Image> generateShaderToyGreyNoise(
  int width,
  int height, {
  double gamma = 1.8,
  bool useSinHash = false,
}) async {
  final pixels = Uint8List(width * height * 4);

  for (int y = 0; y < height; y++) {
    for (int x = 0; x < width; x++) {
      final tx = (x == width - 1) ? 0 : x;
      final ty = (y == height - 1) ? 0 : y;

      double n;
      if (useSinHash) {
        n = _hash(tx.toDouble(), ty.toDouble());
      } else {
        n = _hash01i(tx, ty, 0x9E3779B9);
      }

      if (gamma != 1.0) {
        n = math.pow(n, gamma).toDouble();
      }
      final g = _u8FromUnit(n);

      final idx = (y * width + x) * 4;
      pixels[idx + 0] = g;
      pixels[idx + 1] = g;
      pixels[idx + 2] = g;
      pixels[idx + 3] = 255;
    }
  }

  final completer = Completer<ui.Image>();
  ui.decodeImageFromPixels(
    pixels,
    width,
    height,
    ui.PixelFormat.rgba8888,
    completer.complete,
  );
  return completer.future;
}
