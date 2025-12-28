// 这个 include 对所有 shader 都是强制的，因为 [LayerBuffer] 总会设置这里定义的 uniforms。
//
// This include is mandatory for all shaders since the [LayerBuffer] always
// sets the uniforms defined here.
#version 460 core
#include <flutter/runtime_effect.glsl>
precision highp float;


// 按需在 shader 源码里添加：`uniform sampler2D iChannel[0-N];`
//
// Add `uniform sampler2D iChannel[0-N];` into the fragment source as needed.
uniform vec2 iResolution;
uniform float iTime;
uniform float iFrame;
uniform vec4 iMouse;

// Shadertoy 风格的每通道 wrap 模式（x/y/z/w == iChannel0..3）。
// 用 float 编码：
// 0 = clamp，1 = repeat，2 = mirror。
//
// Shadertoy-style per-channel wrap modes (x/y/z/w == iChannel0..3).
// Encoded as floats:
// 0 = clamp, 1 = repeat, 2 = mirror.
uniform vec4 iChannelWrap;

// iChannel0..3 对应输入纹理的像素尺寸（width,height），用于 texel-center / texelFetch 替代。
//
// Per-channel input texture resolution in pixels (width,height) for iChannel0..3.
uniform vec2 iChannelResolution0;
uniform vec2 iChannelResolution1;
uniform vec2 iChannelResolution2;
uniform vec2 iChannelResolution3;

vec2 sg_wrapUv(vec2 uv, float mode) {
	// Clamp / Clamp
	if (mode < 0.5) {
		return clamp(uv, 0.0, 1.0);
	}

	// Repeat / Repeat
	if (mode < 1.5) {
		return fract(uv);
	}

	// 镜像重复
	// 把 ...,-1..0..1..2.. 映射成 ... 1..0..1..0..
	//
	// Mirror repeat
	// Map ...,-1..0..1..2.. to ... 1..0..1..0..
	vec2 t = fract(uv * 0.5) * 2.0; // [0,2)
	return 1.0 - abs(t - 1.0);
}
//
// Flutter 可用的 texelFetch 替代方案（避免 sampler2D 作为函数参数）
//
// Flutter-usable texelFetch replacement (no sampler2D params)
//

// 把整型 texel 坐标转换为 texel center 的 UV，并再次“吸附”到中心，
// 用于减少某些 GPU 上因微小 UV 误差造成的线性混合。
//
// Convert integer texel coord -> UV at texel center, then "snap" to center again
// to reduce accidental linear mixing due to tiny UV errors on some GPUs.
vec2 sg_texelCenterUv(ivec2 ipos, vec2 sizePx) {
    vec2 uv = (vec2(ipos) + 0.5) / sizePx;
    return (floor(uv * sizePx) + 0.5) / sizePx;
}
#define SG_HAS_TEXEL_CENTER_UV 1

// 注意：这里不支持 LOD（Flutter runtime shader 通常不暴露 mip 控制）。
//
// NOTE: LOD is not supported here (Flutter runtime shaders generally don't expose mip control).
#define SG_TEXELFETCH(tex, ipos, sizePx) texture((tex), sg_texelCenterUv((ipos), (sizePx)))
#define SG_HAS_TEXELFETCH 1

// Convenience: channel sizes and texel fetch without manually passing size.
//
// 便捷宏：直接使用通道分辨率，无需手动传 sizePx。
#define SG_CHANNEL_SIZE0 (iChannelResolution0)
#define SG_CHANNEL_SIZE1 (iChannelResolution1)
#define SG_CHANNEL_SIZE2 (iChannelResolution2)
#define SG_CHANNEL_SIZE3 (iChannelResolution3)

#define SG_TEXELFETCH0(ipos) SG_TEXELFETCH(iChannel0, (ipos), SG_CHANNEL_SIZE0)
#define SG_TEXELFETCH1(ipos) SG_TEXELFETCH(iChannel1, (ipos), SG_CHANNEL_SIZE1)
#define SG_TEXELFETCH2(ipos) SG_TEXELFETCH(iChannel2, (ipos), SG_CHANNEL_SIZE2)
#define SG_TEXELFETCH3(ipos) SG_TEXELFETCH(iChannel3, (ipos), SG_CHANNEL_SIZE3)

// 可选便捷宏：当你希望使用 Shadertoy 风格的通道名时（前提是这些 uniform 已声明）。
// 如果你的 shader 没有声明 iChannel0..，就不要使用这些宏。
//
// Optional convenience when you want Shadertoy-like channel names (requires those uniforms exist).
// If your shader didn't declare iChannel0.., don't use these.
#define SG_TEXEL0(ipos, sizePx) SG_TEXELFETCH(iChannel0, ipos, sizePx)
#define SG_TEXEL1(ipos, sizePx) SG_TEXELFETCH(iChannel1, ipos, sizePx)
#define SG_TEXEL2(ipos, sizePx) SG_TEXELFETCH(iChannel2, ipos, sizePx)
#define SG_TEXEL3(ipos, sizePx) SG_TEXELFETCH(iChannel3, ipos, sizePx)
// 便捷采样宏（只在被使用时才会展开生效）。
// 重要：避免把 `sampler2D` 作为函数参数传递（在 SkSL/Impeller 下可能失败）。
//
// Convenience macros (only take effect when used).
// IMPORTANT: avoid passing `sampler2D` as a function parameter (may fail on SkSL/Impeller).
#define SG_SAMPLE(tex, uv, mode) texture(tex, sg_wrapUv(uv, mode))
#define SG_TEX0(tex, uv) SG_SAMPLE(tex, uv, iChannelWrap.x)
#define SG_TEX1(tex, uv) SG_SAMPLE(tex, uv, iChannelWrap.y)
#define SG_TEX2(tex, uv) SG_SAMPLE(tex, uv, iChannelWrap.z)
#define SG_TEX3(tex, uv) SG_SAMPLE(tex, uv, iChannelWrap.w)
out vec4 fragColor;