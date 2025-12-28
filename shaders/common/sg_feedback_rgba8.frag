#ifndef SG_FEEDBACK_RGBA8
#define SG_FEEDBACK_RGBA8

//
// 重要说明（Flutter/SkSL 限制）
//
// Important notes (Flutter/SkSL limitation)
//
// Flutter RuntimeEffect 会把 sampler2D 翻译为 SkSL 的 `shader`。
// SkSL 不允许在函数参数里传递 `shader` 类型，因此我们不能写：
//   vec4 f(sampler2D tex, ...)
// 因此读取时只能“看起来像传参”：用宏把 `iChannel0/iChannel1...` 这种 token
// 直接展开到 texture(...) 调用中（避免函数参数出现 sampler2D）。
//
// Flutter RuntimeEffect translates sampler2D into SkSL `shader`.
// SkSL does not allow passing `shader` as a function parameter, so we cannot write:
//   vec4 f(sampler2D tex, ...)
// Therefore all reads must *look* like passing a sampler by using macros that expand
// tokens like `iChannel0/iChannel1...` directly into texture(...) calls.
//
// 统一使用宏 API（显式传入通道 token）：
//   SG_LOAD_VEC4(iChannel0, re, VSIZE)
//   SG_LOAD_FLOAT(iChannel1, re, VSIZE)
//
// Use the macro API everywhere (explicit channel token):
//   SG_LOAD_VEC4(iChannel0, re, VSIZE)
//   SG_LOAD_FLOAT(iChannel1, re, VSIZE)

//
// ShaderGraph 通用反馈方案（适配 Flutter 的 RGBA8 feedback）
//
// ShaderGraph feedback scheme (adapted for Flutter RGBA8 feedback)
//
// 背景：Flutter RuntimeEffect 的 feedback 链路基本是
//   Shader(float) -> RGBA8 -> ui.Image -> 下一帧 sampler
// 因此如果你在 Shadertoy 里把 buffer 当 float texture 用（texelFetch 读写任意 float），
// 在 Flutter 里直接读写会变成 8bit/通道，导致精度严重损失。
//
// Background: Flutter RuntimeEffect feedback is effectively:
//   Shader(float) -> RGBA8 -> ui.Image -> next frame sampler
// If you treat a buffer as a float texture in Shadertoy (texelFetch read/write arbitrary floats),
// in Flutter you will only get 8-bit per channel, causing severe precision loss.
//
// 约束：Flutter/SkSL 环境常常缺少 uint/bit ops/floatBitsToUint/uintBitsToFloat。
//
// Constraints: Flutter/SkSL often lacks uint/bit ops/floatBitsToUint/uintBitsToFloat.
//
// 方案：
// - 用纯 float 算术，把一个 [-1,1] 的值打包到 RGB 三通道（≈24bit），A 固定为 1。
// - 为了保留 Shadertoy 的“一个 texel = vec4”语义，我们把每个虚拟 texel 展开成 4 个物理像素：
//     lane0 = x, lane1 = y, lane2 = z, lane3 = w
//   这样原 shader 里的寄存器地址（txBallPosVel 等）不用重排，只需要替换 load/store。
// - 物理纹理尺寸 = vec2(virtualSize.x*4, virtualSize.y)
//
// 你需要在 Dart 侧把该 buffer 的输出尺寸固定为物理尺寸（见 ShaderBuffer.fixedOutputSize）。
//
// Approach:
// - Use pure float math to pack a [-1,1] value into RGB (≈24-bit); alpha is fixed to 1.
// - To preserve Shadertoy's “one texel = vec4” semantics, expand each virtual texel into 4 physical pixels:
//     lane0 = x, lane1 = y, lane2 = z, lane3 = w
//   So original register addresses (txBallPosVel, etc.) stay unchanged; you only swap load/store.
// - Physical texture size = vec2(virtualSize.x*4, virtualSize.y)
//
// On the Dart side, you must fix the output size to the physical size (see ShaderBuffer.fixedOutputSize).
//

// 将虚拟 texel 坐标 vpos 映射到“展开后的物理纹理”上的 lane 像素坐标。
//
// Map virtual texel coord vpos to a lane pixel coord in the expanded physical texture.
ivec2 sg_lanePos(ivec2 vpos, int lane) {
    return ivec2(vpos.x * 4 + lane, vpos.y);
}

// 计算物理纹理尺寸：virtualSize.x 方向按 4 倍展开（lane0..3）。
//
// Compute physical texture size: x is expanded by 4 (lane0..3).
vec2 sg_physicalSize(vec2 virtualSize) {
    return vec2(virtualSize.x * 4.0, virtualSize.y);
}

// 把 [0,1] 的标量打包进 RGB 三通道（近似 24-bit），不依赖位运算。
//
// Pack a [0,1] scalar into RGB (≈24-bit) without bit ops.
vec3 sg_pack01ToRGB(float v01) {
    // 重要：使用真实 24-bit（base-256）的映射。
    // 每个通道存一个 [0..255] 的整数 byte（以 byte/255 的形式写入）。
    // 避免使用 65025/16581375 这类很大的乘数，以免在某些移动 GPU 上放大精度问题。
    //
    // IMPORTANT: Use a true 24-bit (base-256) mapping.
    // Each channel stores an integer byte in [0..255] as (byte/255).
    // We avoid large multipliers like 65025/16581375 that can amplify precision
    // issues on some mobile GPUs.
    float v = clamp(v01, 0.0, 1.0 - (1.0 / 16777216.0));

    float x = floor(v * 256.0);
    v = v * 256.0 - x;
    float y = floor(v * 256.0);
    v = v * 256.0 - y;
    float z = floor(v * 256.0);

    return vec3(x, y, z) / 255.0;
}

// 从 RGB 三通道解包得到 [0,1) 标量（与 sg_pack01ToRGB 配对）。
//
// Unpack a [0,1) scalar from RGB (paired with sg_pack01ToRGB).
float sg_unpack01FromRGB(vec3 rgb) {
    // 从 RGB 还原 byte，并用 base-256 小数重建 v01（范围 [0..1)）：
    //   v01 = x/256 + y/256^2 + z/256^3
    // 这样可以避免使用 ~1.6e7 量级的“大整数式乘法”，在部分移动 GPU 上会损失精度。
    //
    // Recover bytes and reconstruct v01 in [0..1) using a base-256 fraction:
    //   v01 = x/256 + y/256^2 + z/256^3
    // This avoids large (1.6e7) integer-like multipliers that can lose precision
    // on some mobile GPUs.
    vec3 c = floor(rgb * 255.0 + 0.5);
    return clamp(
        c.x / 256.0 + c.y / 65536.0 + c.z / 16777216.0,
        0.0,
        1.0
    );
}

// 把 [-1,1] 的标量映射并打包为 RGBA（A 固定为 1）。
//
// Map and pack a [-1,1] scalar into RGBA (A is fixed to 1).
vec4 sg_packSigned(float vSigned) {
    vSigned = clamp(vSigned, -1.0, 1.0);
    float v01 = vSigned * 0.5 + 0.5;
    return vec4(sg_pack01ToRGB(v01), 1.0);
}

// 从 RGBA 解包得到 [-1,1] 的标量（与 sg_packSigned 配对）。
//
// Unpack a [-1,1] scalar from RGBA (paired with sg_packSigned).
float sg_unpackSigned(vec4 rgba) {
    float v01 = sg_unpack01FromRGB(rgba.rgb);
    return v01 * 2.0 - 1.0;
}

// 使用 common_header.frag 中的 `SG_TEXELFETCH`（以 texel center 的方式做 nearest 类读取）。
// 注意：本文件刻意不 `#include <.../common_header.frag>`，因为 common_header.frag 含有 `#version ...`，
// 且 `#version` 必须在最终 shader 源码最顶部且只能出现一次。
// 你的 shader 里推荐 include 顺序：
//   #include <../common/common_header.frag>
//   #include <../common/sg_feedback_rgba8.frag>
// 为了保持“公共实现集中”，这里不再提供 fallback。
//
// Use `SG_TEXELFETCH` from common_header.frag (texel-center sampling for nearest-like reads).
// NOTE: This file intentionally does NOT `#include <.../common_header.frag>` because common_header.frag
// contains `#version ...`, and `#version` must appear exactly once at the very top of the final shader.
// Recommended include order in your shader:
//   #include <../common/common_header.frag>
//   #include <../common/sg_feedback_rgba8.frag>
// To keep the implementation centralized, this file provides no fallback.
#ifndef SG_HAS_TEXELFETCH
#error "SG_TEXELFETCH is required. Include <../common/common_header.frag> before <../common/sg_feedback_rgba8.frag>."
#endif

//
// 宏 API（用 token“看起来像传 sampler2D”）
//
// Macro API ("pass sampler2D" via token)
//
// 用法：
//   vec4 raw = SG_FETCH_RAW(iChannel0, ipos, sizePx);
//   vec4 v   = SG_LOAD_VEC4(iChannel1, re, VSIZE);
//
// 说明：
// - `tex` 是类似 `iChannel0` 的 token，不是函数参数。
// - 不存在任何以 sampler2D 为参数的函数，因此兼容 Flutter/SkSL。
//
// Usage:
//   vec4 raw = SG_FETCH_RAW(iChannel0, ipos, sizePx);
//   vec4 v   = SG_LOAD_VEC4(iChannel1, re, VSIZE);
//
// Notes:
// - `tex` is a token like `iChannel0`, not a function parameter.
// - No function takes `sampler2D`, so this is SkSL-friendly.
#define SG_FETCH_RAW(tex, ipos, sizePx) \
    SG_TEXELFETCH((tex), (ipos), (sizePx))

#define SG_LOAD_FLOAT(tex, vpos, virtualSize) \
    (sg_unpackSigned(SG_FETCH_RAW((tex), sg_lanePos((vpos), 0), sg_physicalSize((virtualSize)))))

#define SG_LOAD_VEC2(tex, vpos, virtualSize) \
    vec2( \
        sg_unpackSigned(SG_FETCH_RAW((tex), sg_lanePos((vpos), 0), sg_physicalSize((virtualSize)))), \
        sg_unpackSigned(SG_FETCH_RAW((tex), sg_lanePos((vpos), 1), sg_physicalSize((virtualSize)))) \
    )

#define SG_LOAD_VEC3(tex, vpos, virtualSize) \
    vec3( \
        sg_unpackSigned(SG_FETCH_RAW((tex), sg_lanePos((vpos), 0), sg_physicalSize((virtualSize)))), \
        sg_unpackSigned(SG_FETCH_RAW((tex), sg_lanePos((vpos), 1), sg_physicalSize((virtualSize)))), \
        sg_unpackSigned(SG_FETCH_RAW((tex), sg_lanePos((vpos), 2), sg_physicalSize((virtualSize)))) \
    )

#define SG_LOAD_VEC4(tex, vpos, virtualSize) \
    vec4( \
        sg_unpackSigned(SG_FETCH_RAW((tex), sg_lanePos((vpos), 0), sg_physicalSize((virtualSize)))), \
        sg_unpackSigned(SG_FETCH_RAW((tex), sg_lanePos((vpos), 1), sg_physicalSize((virtualSize)))), \
        sg_unpackSigned(SG_FETCH_RAW((tex), sg_lanePos((vpos), 2), sg_physicalSize((virtualSize)))), \
        sg_unpackSigned(SG_FETCH_RAW((tex), sg_lanePos((vpos), 3), sg_physicalSize((virtualSize)))) \
    )

// 写入（store）辅助函数：当前 fragment 对应的物理像素坐标 p = ivec2(fragCoord - 0.5)。
// 这些 store* 会在 “p 命中 re 对应 lane” 时写入 fragColor。
//
// Store helpers: current physical pixel coord is p = ivec2(fragCoord - 0.5).
// These store* functions only write fragColor when p hits a lane of the target virtual coord.

// 写入单个虚拟 texel 的 vec4：仅当当前物理像素 p 落在 re 的某个 lane 时才输出。
//
// Store a vec4 for one virtual texel: only outputs when pixel p hits a lane of re.
void sg_storeVec4(ivec2 re, vec4 vaSigned, inout vec4 fragColor, ivec2 p) {
    ivec2 vpos = ivec2(p.x / 4, p.y);
    if (vpos != re) return;
    int lane = p.x - vpos.x * 4;

    float v = 0.0;
    if (lane == 0) v = vaSigned.x;
    else if (lane == 1) v = vaSigned.y;
    else if (lane == 2) v = vaSigned.z;
    else if (lane == 3) v = vaSigned.w;

    fragColor = sg_packSigned(v);
}

// 写入一个虚拟矩形区域 [re.xy .. re.zw] 的 vec4：命中区域内的 lane 才输出。
//
// Store vec4 over a virtual rect [re.xy .. re.zw]: only outputs for pixels in-range.
void sg_storeVec4Range(ivec4 re, vec4 vaSigned, inout vec4 fragColor, ivec2 p) {
    ivec2 vpos = ivec2(p.x / 4, p.y);
    if (vpos.x < re.x || vpos.y < re.y || vpos.x > re.z || vpos.y > re.w) return;
    int lane = p.x - vpos.x * 4;

    float v = 0.0;
    if (lane == 0) v = vaSigned.x;
    else if (lane == 1) v = vaSigned.y;
    else if (lane == 2) v = vaSigned.z;
    else if (lane == 3) v = vaSigned.w;

    fragColor = sg_packSigned(v);
}

// 将 [0,1] 映射到 [-1,1]（用于把非对称范围压到 signed 存储域）。
//
// Map [0,1] -> [-1,1] (useful for encoding ranges into signed storage).
float sg_encode01ToSigned(float v01) { return v01 * 2.0 - 1.0; }

// 将 [-1,1] 反映射回 [0,1]。
//
// Map [-1,1] -> [0,1].
float sg_decodeSignedTo01(float vs) { return vs * 0.5 + 0.5; }

// 把 [vMin,vMax] 范围的值线性映射到 signed [-1,1] 以便存储。
//
// Linearly map a value from [vMin,vMax] into signed [-1,1] for storage.
float sg_encodeRangeToSigned(float v, float vMin, float vMax) {
    float v01 = (v - vMin) / (vMax - vMin);
    return sg_encode01ToSigned(clamp(v01, 0.0, 1.0));
}

// 将 signed [-1,1] 解码回 [vMin,vMax] 范围。
//
// Decode signed [-1,1] back into [vMin,vMax].
float sg_decodeSignedToRange(float vs, float vMin, float vMax) {
    float v01 = clamp(sg_decodeSignedTo01(vs), 0.0, 1.0);
    return vMin + v01 * (vMax - vMin);
}

#endif
