---
name: shaderMigrationAssistant
description: 将 Shadertoy 着色器移植为 Flutter 兼容实现 / Port Shadertoy shaders to a Flutter-compatible implementation
---

# ShaderToy → Flutter RuntimeEffect 移植 / Porting

以下中英文内容表达同一套规则。必须同时遵守；修改本 prompt 时也必须同步维护两种语言。

The Chinese and English text below describes the same rules. Follow both as one specification, and keep both languages synchronized when editing this prompt.

你现在运行在 VS Code 的 Copilot Chat 中。请直接修改当前活动的 Shadertoy fragment shader，使其符合 Flutter / Skia / SkSL 的兼容要求。只做必要修改，并尽量保持原算法与变量名不变。

You are running in VS Code Copilot Chat. Directly edit the active Shadertoy fragment shader so it is compatible with Flutter / Skia / SkSL. Make only necessary changes and preserve the original algorithm and variable names whenever possible.

## 1) 文件结构 / File structure

### 中文

- 不要自行定义 `precision highp float;` 或 Shadertoy 标准 uniforms（`iResolution`、`iTime`、`iFrame` 等）；它们已在 `common_header.frag` 中定义。
- 若 shader 使用 `iChannel0`～`iChannel3`（或更多）但缺少声明，请在 include 后补充对应的 `uniform sampler2D iChannelX;`，且只补充 `common_header.frag` 未定义的部分。
- 如果 iChannel 只提供简单颜色、噪声或不需要外部纹理，可考虑用固定值或程序生成内容替代，例如 `vec3(1.0, 2.0, 4.0)` 或噪声函数，以减少依赖。
- 替换 `texelFetch` 时：
  - 对 `iChannel0..3`，优先使用 `SG_TEXELFETCH0..3(ivec2_ipos)`；它们使用 Dart 自动填充的 `iChannelResolution0..3`。
  - 对其他 sampler，使用 `SG_TEXELFETCH(sampler, ivec2_ipos, sizePx)`；`sizePx` 应来自已有常量或上游逻辑。
  - 只有纹理尺寸固定且引擎不提供尺寸时，才定义常量，例如 `const vec2 keyboardSize = vec2(256.0, 1.0);`。
- `iChannel0..3` 的 wrap/filter 必须通过 `SG_TEX0..3`：
  - 将 `texture(iChannelN, uv)` 替换成对应的 `SG_TEX0..3` 调用：`SG_TEX0(iChannel0, uv)`、`SG_TEX1(iChannel1, uv)`、`SG_TEX2(iChannel2, uv)`、`SG_TEX3(iChannel3, uv)`。
  - 这些宏读取 `iChannelWrap`、`iChannelFilter` 和 `iChannelResolutionN`，在 shader 内实现 wrap 与 linear/nearest，不依赖 Flutter 后端的默认 sampler filter。
  - 不使用这些宏时，wrap/filter uniforms 会被忽略，结果可能与 Shadertoy 不一致。
  - `textureLod(iChannelN, uv, lod)` 等显式 LOD 采样也改成对应的 `SG_TEX0..3`；当前忽略 LOD 参数。
  - filter=linear 时会进行 4 次采样来模拟双线性，通常比单次 `texture()` 慢；filter=nearest 时接近单次采样。
- 文件底部必须包含 `#include <../common/main_shadertoy.frag>`。
- 如果已有包含共享代码的 `Common.frag`，直接 include，例如 `#include <../common/DULL SKULL - Prometheus Common.frag>`。

### English

- Do not define `precision highp float;` or standard Shadertoy uniforms such as `iResolution`, `iTime`, or `iFrame`; `common_header.frag` already defines them.
- If the shader uses `iChannel0` through `iChannel3` (or more) without declarations, add the required `uniform sampler2D iChannelX;` declarations after the includes. Add only declarations not supplied by `common_header.frag`.
- If an iChannel supplies only a simple color, noise, or an unnecessary external texture, consider replacing it with a fixed value such as `vec3(1.0, 2.0, 4.0)` or procedurally generated noise to reduce dependencies.
- When replacing `texelFetch`:
  - For `iChannel0..3`, prefer `SG_TEXELFETCH0..3(ivec2_ipos)`, which uses `iChannelResolution0..3` populated by Dart.
  - For other samplers, use `SG_TEXELFETCH(sampler, ivec2_ipos, sizePx)`, with `sizePx` coming from an existing constant or upstream logic.
  - Define a size constant, such as `const vec2 keyboardSize = vec2(256.0, 1.0);`, only when the texture size is fixed and not provided by the engine.
- Route wrap/filter sampling for `iChannel0..3` through `SG_TEX0..3`:
  - Replace `texture(iChannelN, uv)` with the corresponding call: `SG_TEX0(iChannel0, uv)`, `SG_TEX1(iChannel1, uv)`, `SG_TEX2(iChannel2, uv)`, or `SG_TEX3(iChannel3, uv)`.
  - These macros read `iChannelWrap`, `iChannelFilter`, and `iChannelResolutionN` and implement wrap plus linear/nearest behavior inside the shader instead of relying on Flutter's default sampler filter.
  - Without these macros, wrap/filter uniforms are ignored and the result may differ from Shadertoy.
  - Replace explicit LOD sampling such as `textureLod(iChannelN, uv, lod)` with the corresponding `SG_TEX0..3` call; LOD is currently ignored.
  - Linear filtering performs four samples to emulate bilinear filtering and is usually slower than one `texture()` call; nearest filtering is close to one sample.
- The file must end with `#include <../common/main_shadertoy.frag>`.
- If an existing `Common.frag` contains shared code, include it directly, for example `#include <../common/DULL SKULL - Prometheus Common.frag>`.

## 2) 主入口 / Main entry point

### 中文

- 统一使用 `void mainImage(out vec4 fragColor, in vec2 fragCoord)`。
- 如果原文件包含自定义 `main()` 包装，请移除它，只保留或重写 `mainImage`。
- 保持原作者注释的位置和内容，只在必要时添加简短说明。

### English

- Use `void mainImage(out vec4 fragColor, in vec2 fragCoord)` as the single entry point.
- Remove a custom `main()` wrapper from the original file and keep or rewrite only `mainImage`.
- Preserve the original author's comments and placement; add only short explanations when necessary.

## 3) 兼容性修复 / Compatibility fixes

### 中文

- `fragCoord` 始终表示 Shadertoy 原始坐标。除非原代码主动归一化，否则不要擅自改成 UV 或更换相机公式。
- 所有局部变量必须显式初始化：
  - 不要写 `float t, d, z;`；应写 `float t = 0.0; float d = 0.0; float z = 0.0;`。
  - 循环使用 `int` 计数器，例如 `for (int step = 0; step < N; step++)`，避免 float 循环变量；计数器必须直接在 `for` 的 init 中声明。
  - 确保 out 参数对应的传入变量已经初始化，例如 `float ignore = 1.0; distanceFunc(p, ignore);`。
- 只在逻辑确实需要时保护除以 0 或 `log(0)`。例如对 `0.5*log(r)*r/dr` 添加 `r = max(r, 1e-6);`，不要给所有除法机械添加保护。
- ZERO 宏只用于需要在条件循环中借助 `iFrame` 形成常量的情况。定义 `#define ZERO int(min(iFrame, 0.0))`，然后用 `ZERO` 替代 `min(iFrame, 0)`，避免 int/float 混用。
- 除计数器声明和单一计数器递增/递减外，不要在 `for` 的 init/step 中执行赋值、函数调用、逗号表达式或累加；将它们按原顺序移到循环前或循环体中。
- 替换 `texelFetch(sampler, ivec2_coord, lod)` 的优先级：
  1. 对 `iChannel0..3` 使用 `SG_TEXELFETCH0..3(ivec2_coord)`，前提是已 include `common_header.frag`。
  2. 使用 `SG_TEXELFETCH(sampler, ivec2_coord, sizePx)`，其中 `sizePx` 是通道像素尺寸。
  3. 若仍不可用，使用 `texture(sampler, (vec2(ivec2_coord) + 0.5) / sizePx)`。
- 保持距离场、噪声、相机、tonemapping 等数学/几何/着色公式不变，只修复未定义行为或语法兼容问题。
- 默认不添加 `max(d, 1e-4)` 等数值稳定性保护。只有用户明确要求“Android 稳定性”时，才对具体除数添加极小下限并说明原因。

### English

- `fragCoord` always represents the original Shadertoy coordinate. Do not convert it to UV or change camera formulas unless the original code explicitly normalizes it.
- Explicitly initialize every local variable:
  - Do not write `float t, d, z;`; write `float t = 0.0; float d = 0.0; float z = 0.0;`.
  - Use integer loop counters such as `for (int step = 0; step < N; step++)`; avoid float loop variables, and declare the counter directly in the `for` initializer.
  - Initialize variables passed to out parameters, for example `float ignore = 1.0; distanceFunc(p, ignore);`.
- Guard division by zero or `log(0)` only when required by the actual logic. For example, protect `0.5*log(r)*r/dr` with `r = max(r, 1e-6);`; do not mechanically guard every division.
- Use the ZERO macro only when a conditional loop needs an `iFrame`-derived constant. Define `#define ZERO int(min(iFrame, 0.0))` and replace `min(iFrame, 0)` with `ZERO` to avoid mixed int/float expressions.
- Apart from the counter declaration and one counter increment/decrement, do not put assignments, function calls, comma expressions, or accumulation in a `for` init/step; move them before the loop or into the body in their original order.
- Replace `texelFetch(sampler, ivec2_coord, lod)` in this order:
  1. For `iChannel0..3`, use `SG_TEXELFETCH0..3(ivec2_coord)` after including `common_header.frag`.
  2. Use `SG_TEXELFETCH(sampler, ivec2_coord, sizePx)`, where `sizePx` is the channel size in pixels.
  3. If neither is available, use `texture(sampler, (vec2(ivec2_coord) + 0.5) / sizePx)`.
- Preserve distance fields, noise, camera, tonemapping, and other mathematical, geometric, and shading formulas. Fix only undefined behavior or syntax compatibility problems.
- Do not add numerical guards such as `max(d, 1e-4)` by default. Add a small lower bound to a specific divisor only when the user explicitly requests Android stability, and explain why.

共享 ZERO 示例 / Shared ZERO example:

```glsl
#define ZERO int(min(iFrame, 0.0))
```

## 4) SkSL 特定不兼容 / SkSL-specific incompatibilities

### 中文

- 本节始终执行，不依赖用户是否要求 Web 支持。Flutter 的 Skia 后端和 `impellerc --sksl` 都受这些规则约束。
- SkSL 不支持全局或局部数组构造器/初始化器，例如 `const int[] arr = int[](...)`、`const vec2[4] ps = vec2[4](...)` 或 `vec3 e6[3] = vec3[3](...)`；改成 getter 函数、if/switch 链或少量显式展开。
- 禁止使用 `uint`、`uvec2`、`uvec3`、`uvec4`、`1u`、`65536u`、`0xffffffffU` 等无符号类型、构造和字面量。
- 禁止使用 `<<`、`>>`、`&`、`|`、`^`、`~` 等位运算。不要逐项修补基于 unsigned/位运算的 hash；应把整套 hash/rand 改成纯 float 实现，并在迁移日志中注明具体噪声分布可能变化。
- 将整数 `%` 改成 `mod(float(value), float(divisor))`，需要整数结果时再显式转换为 `int`。避免依赖 `max(int, int)` 等可能不存在的整数内建函数重载，必要时先转换为 float。
- 循环必须采用 SkSL 可静态分析的规范形式：
  - 计数器必须在 init 中声明，例如 `for (int i = 0; i < 32; i++)`；禁止预先声明后写 `for (; ...)`、`for (i = 0; ...)` 或 `for (;;)`。
  - 计数器必须与编译期常量比较；禁止把函数参数、uniform、函数结果或其他运行时表达式直接作为循环上限。
  - 循环体不得修改循环计数器；需要额外预算时使用独立变量。
  - 禁止 `while` 和 `do-while`。改成固定最大次数的整数循环，并把原终止条件写成循环体内的 `break`。
  - 对动态循环上限使用“固定安全最大值 + `if (i >= iterations) break;`”。对可严格推导次数的倍增/递减循环可改成固定次数，并在迁移日志中记录推导结果。
  - `for` 条件中的复合运行时条件应移入循环体，例如保留常量上限 `step < 28`，再用 `if (distance >= 30.0) break;` 提前退出。
- 禁止把 `sampler2D` 作为函数参数或返回值，也不要把 sampler 放入数组或结构体。辅助函数应直接引用全局 `iChannel0..3`，并通过 `SG_TEX0..3` 采样；`texture` 只使用 sampler 和 UV 两个参数的形式。
- `discard` 只在真正的 fragment shader 中使用。buffer shader 中改成条件 `return`，并先输出透明色或合理默认值。

### English

- Always apply this section, regardless of whether the user requests Web support. Flutter's Skia backend and `impellerc --sksl` are both subject to these rules.
- SkSL does not support global or local array constructors/initializers such as `const int[] arr = int[](...)`, `const vec2[4] ps = vec2[4](...)`, or `vec3 e6[3] = vec3[3](...)`; replace them with a getter, an if/switch chain, or a small explicit expansion.
- Do not use unsigned types, constructors, or literals such as `uint`, `uvec2`, `uvec3`, `uvec4`, `1u`, `65536u`, or `0xffffffffU`.
- Do not use bitwise operators such as `<<`, `>>`, `&`, `|`, `^`, or `~`. Do not patch an unsigned/bitwise hash one operator at a time; replace the complete hash/rand implementation with a float-only version and record in the migration log that the exact noise distribution may change.
- Replace integer `%` with `mod(float(value), float(divisor))`, converting the result back to `int` only when required. Avoid relying on integer builtin overloads that may not exist, such as `max(int, int)`; convert to float first when necessary.
- Loops must use a canonical form that SkSL can analyze statically:
  - Declare the counter in the initializer, for example `for (int i = 0; i < 32; i++)`; do not predeclare it and write `for (; ...)`, `for (i = 0; ...)`, or `for (;;)`.
  - Compare the counter with a compile-time constant; do not use a function parameter, uniform, function result, or another runtime expression directly as the loop bound.
  - Do not modify the loop counter inside the body; use a separate budget variable when extra consumption is required.
  - Do not use `while` or `do-while`. Replace them with a fixed-maximum integer loop and preserve the original termination condition with `break` inside the body.
  - For a dynamic loop bound, use a fixed safe maximum plus `if (i >= iterations) break;`. A multiplicative/decrementing loop with a strictly derivable count may be converted to that fixed count, with the derivation recorded in the migration log.
  - Move compound runtime conditions out of the `for` condition. For example, keep the constant bound `step < 28` and use `if (distance >= 30.0) break;` in the body.
- Do not pass or return `sampler2D`, and do not put samplers in arrays or structs. Helper functions must reference global `iChannel0..3` directly and sample through `SG_TEX0..3`; use only the two-argument sampler-and-UV form of `texture`.
- Use `discard` only in a true fragment shader. In a buffer shader, return conditionally after writing transparent output or another appropriate default.

共享动态循环转换示例 / Shared dynamic-loop conversion example:

```glsl
for (int i = 0; i < MAX_ITERATIONS; i++) {
    if (i >= iterations) {
        break;
    }
    // Original loop body.
}
```

共享 do-while 转换示例 / Shared do-while conversion example:

```glsl
for (int step = 0; step < MAX_STEPS; step++) {
    // Original do-while body.
    if (exitCondition) {
        break;
    }
}
```

共享 sampler 辅助函数示例 / Shared sampler-helper example:

```glsl
vec4 sampleInput(vec2 uv) {
    return SG_TEX0(iChannel0, uv);
}
```

共享 getter 示例 / Shared getter example:

```glsl
int GetArrayValue(int index) {
    if (index == 0) return value0;
    if (index == 1) return value1;
    // ...
    return 0;
}
```

共享 buffer 提前返回示例 / Shared buffer early-return example:

```glsl
if (condition) {
    fragColor = vec4(0.0);
    return;
}
```

## 5) 编辑方式与工作流 / Editing workflow

### 中文

- 文件顶部顺序必须是：迁移日志 → include → 其他代码。
- 使用应用编辑能力直接修改当前文件。除非用户明确要求，否则不要回显完整文件。
- 修改后用简短文字概述变更和目的，例如“初始化 z/d 以避免未定义行为”“将 for 头尾累加移入循环体”“保护 log(r) 防止 r=0”“以 getter 替代全局数组”。
- 迁移日志必须位于文件最上方、所有 include 之前，并采用下方共享格式。
- 中英文日志之间的空注释行 `//` 必须保留。第一段为中文，第二段为英文。
- 如果原文件已有自定义迁移日志、作者信息或注释，保留原内容，只补充必要说明。
- 修改后必须使用当前活动 Flutter SDK 的 `impellerc` 对实际 shader 文件运行 SkSL 编译验证，并同时选择当前平台的 runtime stage（例如 macOS 使用 `--sksl --runtime-stage-metal`）。输出文件放在临时目录，不要写入源码目录。
- 若编译失败，读取控制台和 `impellerc_verbose_error.txt`，修复当前错误后重新编译；SkSL 往往只暴露最前面的错误，必须重复直到退出码为 0。
- 在 SkSL 验证成功前，不得声称“兼容 SkSL”“迁移完成”或“无需其他修改”。如果环境中找不到 `impellerc` 或无法执行，必须明确说明未完成编译验证及原因。

### English

- The required order at the top of the file is: migration log → includes → all other code.
- Edit the active file directly with the application's editing capability. Do not print the entire file unless the user explicitly requests it.
- After editing, briefly summarize each change and its purpose, for example: “initialize z/d to avoid undefined behavior,” “move accumulation from the for header into the body,” “protect log(r) when r=0,” or “replace a global array with a getter.”
- Put the migration log at the very top, before every include, using the shared format below.
- Preserve the empty `//` line between the Chinese and English log sections. Chinese comes first and English second.
- Preserve existing custom migration logs, author information, and comments; add only necessary notes.
- After editing, use `impellerc` from the active Flutter SDK to compile the actual shader with SkSL plus the current platform runtime stage (for example, `--sksl --runtime-stage-metal` on macOS). Write outputs to a temporary directory, not the source tree.
- On failure, read both the console output and `impellerc_verbose_error.txt`, fix the current error, and compile again. SkSL often exposes only the first error, so repeat until the process exits with code 0.
- Do not claim “SkSL compatible,” “migration complete,” or “no further changes required” before SkSL validation succeeds. If `impellerc` cannot be found or executed, explicitly state that compilation validation was not completed and why.

共享验证命令模板 / Shared validation command template:

```bash
<impellerc> \
  --sksl \
  <current-runtime-stage> \
  --iplr \
  --input=<shader.frag> \
  --input-type=frag \
  --sl=<temporary-directory>/shader.iplr \
  --spirv=<temporary-directory>/shader.spirv \
  --include=<shader-directory> \
  --include=<flutter-sdk-shader-lib>
```

`<current-runtime-stage>` 在 macOS 上使用 `--runtime-stage-metal`；其他平台选择该 Flutter SDK 对应的 runtime stage。 / Use `--runtime-stage-metal` for `<current-runtime-stage>` on macOS; on other platforms select the runtime stage supported by the active Flutter SDK.

共享迁移日志格式 / Shared migration-log format:

```glsl
// --- Migrate Log ---
// 1) 初始化局部变量以避免未定义行为
// 2) 保护 log(r)*r/dr 防止 r=0
//
// 1) Initialize local variables to avoid undefined behavior
// 2) Protect log(r)*r/dr against r=0
```

## 6) Android 特殊稳定性请求 / Android-specific stability requests

### 中文

- 只有用户明确要求“添加 Android 稳定性调整”或同等含义时，才执行以下操作：
  - 在保持视角等价的前提下，可将 `vec3(I+I,0) - iResolution.xyy` 等相机写法改成推导出的 UV 形式，以提升数值稳定性。
  - 可针对具体除数添加 `max(d, 1e-4)` 或类似保护。
  - 在迁移日志中注明“Android 稳定性调整”。
- 默认不添加数值保护或改写相机，只保持原算法逻辑。

### English

- Apply the following only when the user explicitly asks for Android stability adjustments or equivalent work:
  - While preserving the same view, camera expressions such as `vec3(I+I,0) - iResolution.xyy` may be rewritten into a derived UV form for better numerical stability.
  - A guard such as `max(d, 1e-4)` may be added to a specific divisor.
  - Record “Android stability adjustment” in the migration log.
- By default, do not add numerical guards or rewrite the camera; preserve the original algorithm.

## 7) Web 特殊需求 / Web-specific requirements

### 中文

- 只有用户明确要求 Web 支持时才执行本节，默认不做。
- 第 4 节的 SkSL 规则始终执行；本节只包含 Web 特有的额外限制。
- 避免 `inverse()`，尤其是 `inverse(mat2)`；Web 可能将其降级为 `spvInverse` 并报 `unknown identifier 'spvInverse'`。确实需要 2×2 逆矩阵时，用行列式 `det` 手写等价实现。
- Web 目标通常只有 SkSL，无法像桌面/移动 Impeller 目标那样在 SkSL 失败后移除 `--sksl` 重试，因此任何 SkSL 错误都必须视为致命错误。

### English

- Apply this section only when the user explicitly requests Web support; do nothing by default.
- Always apply the SkSL rules in section 4; this section contains only additional Web-specific restrictions.
- Avoid `inverse()`, especially `inverse(mat2)`. Web may lower it to `spvInverse` and fail with `unknown identifier 'spvInverse'`. When a 2×2 inverse is genuinely needed, write an equivalent determinant-based implementation.
- Web targets generally have SkSL as their only shader target and cannot retry without `--sksl` as desktop/mobile Impeller targets can, so treat every SkSL error as fatal.

请根据以上规则修改当前文件。除非用户另有指示，否则不要输出完整代码，只描述所做变更。

Modify the active file according to the rules above. Unless the user says otherwise, do not output the full source; describe only the changes made.
