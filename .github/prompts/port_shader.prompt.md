---
agent: 'agent'
---
---
name: shaderMigrationAssistant
description: Adjust the current shader file to follow the Flutter-compatible Shadertoy porting rules
---
你现在运行在 VS Code 的 Copilot Chat 里，需要直接修改当前活动的 Shadertoy fragment shader，使其符合 Flutter / Skia / SkSL 环境的兼容要求。请按以下步骤处理：

1. **文件结构（顺序必须遵守）**
   - **文件最上方**（在所有其他代码之前）：
     ```glsl
     // --- Migrate Log ---
     // {中文改动摘要}
     // --- Migrate Log (EN) ---
     // {English change summary}
     
     #include <../common/common_header.frag>
     ```
   - 如果当前 pass 需要使用 RGBA8 feedback（sg_feedback_rgba8），则在 `common_header.frag` 之后紧接着添加：
     ```glsl
     #include <../common/sg_feedback_rgba8.frag>
     ```
     并使用 `SG_LOAD_*` 宏做读取（例如 `SG_LOAD_VEC4(iChannel0, vpos, VSIZE)`），用 `sg_store*` 做写入。
   - **不要自己定义** `precision highp float;` 或 Shadertoy 的标准 uniforms（`iResolution`, `iTime`, `iFrame` 等）—— 这些已在 `common_header.frag` 中定义。
   - 若 shader 使用了 `iChannel0`~`iChannel3`（或更多），但缺少声明，请在 include 之后补齐对应的 `uniform sampler2D iChannelX;`（仅补充 common_header 未定义的部分）。
   - 如果 iChannel 用于简单颜色、噪声或不需要外部纹理，可以考虑替换为固定值或程序生成，例如 `vec3(1.0, 2.0, 4.0)` 或噪声函数，以减少依赖。
   - 若需要替换 `texelFetch`：
     - 对 `iChannel0..3`：优先用 `SG_TEXELFETCH0..3(ivec2_ipos)`（使用 `common_header.frag` 内的 `iChannelResolution0..3`，由 Dart 侧自动填充）
     - 其他 sampler：使用 `SG_TEXELFETCH(sampler, ivec2_ipos, sizePx)`，其中 `sizePx` 可来自你已有的常量，或从上游逻辑传入
     - 只有在“纹理尺寸是固定且不由引擎提供”的情况下，才定义常量（例如 `const vec2 keyboardSize = vec2(256.0, 1.0);`）
   - **文件底部**必须包含 `#include <../common/main_shadertoy.frag>`。
   - 如果 shader 有共同的代码或函数，且有现有的 Common.frag 文件，直接导入，例如 `#include <../common/DULL SKULL - Prometheus Common.frag>`。

2. **主入口**
   - 统一入口为 `void mainImage( out vec4 fragColor, in vec2 fragCoord )`；如果原文件有自带的 `main()` 包装，将其移除，仅保留/重写 `mainImage`。
   - 保持原作者注释位置不变，只在必要时添加简短说明。

3. **兼容性修复（只做必要修改）**
   - `fragCoord` 始终表示 Shadertoy 的原始坐标，除非原代码主动归一化，否则不要私自改成 uv 或更换相机公式。
   - **所有局部变量必须显式初始化**：
     - 不要写 `float t, d, z;` —— 要写 `float t = 0.0; float d = 0.0; float z = 0.0;`
     - 使用 `int` 计数器循环，例如 `for (int step = 0; step < N; step++)`，避免 float 循环变量。
     - 确保 out 参数的初始值设定（如 `float ignore = 1.0; distanceFunc(p, ignore);`）。
   - **保护潜在的除以 0 或 log(0) 的情况**：
     - 例如在 `0.5*log(r)*r/dr` 中，添加 `r = max(r, 1e-6);` 来保护 log 和除法。
     - 仅在逻辑需要时添加，不是所有除法都需要保护。
   - **关于 ZERO 宏**（仅在使用 iFrame 的条件循环中）：
     - 若需要在 for 循环中使用 `iFrame` 作为常数，定义并使用：
       ```glsl
       #define ZERO int(min(iFrame, 0.0))
       ```
     - 然后用 `ZERO` 代替 `min(iFrame, 0)` 以避免 int/float 混用编译错误。
   - 不在 `for` 的 init/step 中做累加运算；把 `fragColor *= i`、`fragColor += ...` 等逻辑移入循环体。
   - 替换 `texelFetch(sampler, ivec2_coord, lod)`：
     - **优先（iChannel0..3）**：`SG_TEXELFETCH0..3(ivec2_coord)`（前提是已 include `common_header.frag`）
     - **其次（通用宏）**：`SG_TEXELFETCH(sampler, ivec2_coord, sizePx)`（`sizePx` 是 vec2 像素尺寸，可用 `iChannelResolutionN` 或已知常量）
     - 若仍不能用，则改为 `texture(sampler, (vec2(ivec2_coord) + 0.5) / sizePx)`
   - 保持所有数学/几何/着色公式原样（距离场、噪声、相机、tonemapping 等），只修复未定义行为或语法兼容性问题。
   - **默认不添加数值稳定性保护**（如 `max(d, 1e-4)`）；仅当我在对话中明确要求"Android 稳定性"时，才对具体除数添加极小下限，并说明原因。

4. **SkSL 特定的不兼容修复（必须处理）**
   - **全局数组初始化**：`const int[] arr = int[](...)` 不支持，改为 getter 函数：
     ```glsl
     int GetArrayValue(int index) {
         if (index == 0) return value0;
         if (index == 1) return value1;
         ...
         return 0;
     }
     ```
   - **位移运算符 `>>`**：改为 `floor(float(value) / pow(2.0, float(shift)))`
   - **位与运算符 `&`**：改为 `int(mod(shifted, 2.0))`
   - **取模运算符 `%`**（整数）：改为 `int(mod(float(value), float(divisor)))`
   - **`discard` 语句**：仅在真正的 fragment shader 中可用；如果在 buffer shader 中使用，改为条件 `return` 或输出透明/默认颜色：
     ```glsl
     if (condition) {
         fragColor = vec4(0.0);  // 或其他默认值
         return;
     }
     ```

5. **编辑方式和工作流**
   - **顺序很重要**：在文件最顶端依次添加迁移日志 → include → 其他代码
   - 使用应用编辑功能直接修改当前文件，不要把完整文件内容回显给我，除非明确要求。
   - 修改后用简短文字概述变更点和目的，例如"初始化 z/d，防止未定义行为""把 for 头尾的累加移入循环体""保护 log(r) 防 r=0""用 getter 函数替换全局数组"。
   - **迁移日志的位置和格式**（必须在文件最上方，include 之前）：
     ```glsl
     // --- Migrate Log ---
     // 初始化局部变量以避免未定义行为
     // 保护 log(r)*r/dr 防止 r=0
     // --- Migrate Log (EN) ---
     // Initialize local variables to avoid undefined behavior
     // Protect log(r)*r/dr against r=0
     ```
   - 如果原文件已有自定义迁移日志或注释，保持原作者信息不变，只在必要时补充新的改动说明。

6. **Android 特殊稳定性请求（仅在我明确要求时执行，默认不做）**
   - 若我明确说"请添加 Android 稳定性调整"或类似表述，才进行以下操作：
     - 在保持视角等价的前提下，可将 `vec3(I+I,0) - iResolution.xyy` 等相机写法改成推导出的 `uv` 形式以提升数值稳定性。
     - 可在特定除数上添加 `max(d, 1e-4)` 或类似保护。
     - 完成后在迁移日志中注明"Android 稳定性调整"。
   - 默认情况下，**不添加任何数值保护或相机改写**，仅保持原始算法的逻辑。

请根据以上规则对当前文件执行修改。除非我另有指示，否则不要输出完整代码，只需描述所做变更。