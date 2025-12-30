# Awesome Flutter Shaders

一个 Flutter Shader 作品集（Gallery）：将 Shadertoy 风格的片元着色器（`.frag`）迁移到 Flutter runtime shader，并以网格列表方式展示与预览。

本仓库定位是“可运行的迁移样例集合”：每个 shader 都对应一个小组件，必要时会绑定纹理输入（iChannel0..）或使用 BufferA/BufferB 做多 pass。

## 功能

- 首页 `GridView` 展示多个 shader 卡片（包含缩略渲染 + 名称）
- 点击卡片进入全屏；双击退出并恢复播放
- 支持单 pass / 多 pass 与纹理输入

入口：`lib/main.dart`

## 运行要求

- Dart：`>=3.10.0 <4.0.0`（见 `pubspec.yaml`）
- Flutter：按常规方式运行到 iOS/Android/macOS/Web 均可

## 重要：依赖包含本地 path（需要你自行调整）

当前 `pubspec.yaml` 里存在作者本机绝对路径依赖：

- `shader_graph: path: /Users/.../shader_graph`
- `dependency_overrides.shader_buffers: path: /Users/.../shader_buffers`

如果你不在相同环境下开发，`flutter pub get` 会失败。你可以选择：

1) 把 `path:` 改成你本地真实路径（适合本地开发）
2) 改回 pub.dev / git 依赖并移除 `dependency_overrides`（适合开源/CI）

## 快速开始

```bash
flutter pub get
flutter run
```

运行到指定设备：

```bash
flutter run -d macos
flutter run -d chrome
```

## Shader 文件约定（Shadertoy 风格）

shader 通常实现 Shadertoy 风格入口函数：

```glsl
void mainImage(out vec4 fragColor, in vec2 fragCoord);
```

每个 `.frag` 顶部/底部分别 include：

```glsl
#include <common/common_header.frag>
// ... your shader code ...
#include <common/main_shadertoy.frag>
```

公共文件位置：

- `shaders/common/common_header.frag`
- `shaders/common/main_shadertoy.frag`

### iChannel 输入

如果 shader 需要纹理输入，按需声明：

```glsl
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
```

然后在 Dart 侧把纹理“喂”给 shader（见下节）。

## 如何新增一个 shader

1) 新增 `.frag`

- 放到 `shaders/<首字母>/`（仓库按字母分组）
- 确保 include 了公共头尾（上一节）

2) 在 `pubspec.yaml` 注册 shader

把 shader 路径加入 `flutter:` -> `shaders:` 列表，否则 Flutter 不会编译/打包。

3) 加到展示列表

在 `lib/shader_widgets/<字母>.dart` 中加入一个卡片：

```dart
AwesomeShader('shaders/x/Your Shader.frag')
```

4) 绑定纹理/多 pass（示例）

```dart
final mainBuffer = 'shaders/.../Main.frag'.shaderBuffer;
final bufferA = 'shaders/.../BufferA.frag'.shaderBuffer;

mainBuffer.feed(bufferA).feed(SA.textureRgbaNoiseSmall);
return AwesomeShader([mainBuffer, bufferA]);
```

常用纹理/cubemap 路径常量在 `lib/shaders.dart`（`SA.texture...` / `SA.cubemap...`）。

## 目录结构

- `lib/main.dart`：网格展示、点击全屏逻辑
- `lib/shaders.dart`：shader/纹理/cubemap 路径常量
- `lib/shader_widgets/`：按字母分组的 shader 列表
- `shaders/`：`.frag` 源码（含 `common/` 公共 include）
- `assets/`：纹理与 cubemap

## 常见问题

不同平台的 Flutter runtime shader/编译器限制不完全一致，常见问题包括：

- 编译失败：采样限制、语法差异、部分类型/特性不可用
- 黑屏/崩溃：循环/数组/程序体积限制
- 效果不一致：多 pass、精度（highp/mediump）、坐标系差异

排查建议：

1) 确认该 shader 已加入 `pubspec.yaml` 的 `flutter.shaders`
2) 确认所需 iChannel 已在 Dart 侧喂入
3) 逐步降低复杂度（循环次数、采样次数、分支）定位不兼容点


