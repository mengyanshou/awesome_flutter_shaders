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

// Shadertoy-style per-channel filter modes (x/y/z/w == iChannel0..3).
// Encoded as floats:
// 0 = linear, 1 = nearest, 2 = mipmap (currently best-effort / may be unsupported).
uniform vec4 iChannelFilter;

// iChannel0..3 对应输入纹理的像素尺寸（width,height），用于 texel-center / texelFetch 替代。
//
// Per-channel input texture resolution in pixels (width,height) for iChannel0..3.
uniform vec2 iChannelResolution0;
uniform vec2 iChannelResolution1;
uniform vec2 iChannelResolution2;
uniform vec2 iChannelResolution3;

// TODO: 要不要考虑直接在这里定义各个 iChannelN 的 sampler2D？

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

// Shader-side bilinear filtering (best-effort).
// We implement this explicitly so `FilterMode.linear` remains meaningful even
// if the backend uses a fixed sampler filter (e.g. nearest).
//
// Notes:
// - `wrapMode` is applied in UV space first.
// - Texel coords are clamped to the texture bounds.
// - This matches our existing wrap-as-UV-transform approach (no true sampler wrap).
#define SG_LINEAR_ST(uv, wrapMode, sizePx) (sg_wrapUv((uv), (wrapMode)) * (sizePx) - 0.5)
#define SG_LINEAR_I0(uv, wrapMode, sizePx) (floor(SG_LINEAR_ST((uv), (wrapMode), (sizePx))))
#define SG_LINEAR_F(uv, wrapMode, sizePx) (fract(SG_LINEAR_ST((uv), (wrapMode), (sizePx))))
#define SG_TEXEL_UV_FROM_I(i, sizePx) ((clamp((i), vec2(0.0), (sizePx) - 1.0) + 0.5) / (sizePx))

#define SG_SAMPLE_LINEAR(tex, uv, wrapMode, sizePx) \
	(mix( \
		mix( \
			texture((tex), SG_TEXEL_UV_FROM_I(SG_LINEAR_I0((uv), (wrapMode), (sizePx)), (sizePx))), \
			texture((tex), SG_TEXEL_UV_FROM_I(SG_LINEAR_I0((uv), (wrapMode), (sizePx)) + vec2(1.0, 0.0), (sizePx))), \
			SG_LINEAR_F((uv), (wrapMode), (sizePx)).x \
		), \
		mix( \
			texture((tex), SG_TEXEL_UV_FROM_I(SG_LINEAR_I0((uv), (wrapMode), (sizePx)) + vec2(0.0, 1.0), (sizePx))), \
			texture((tex), SG_TEXEL_UV_FROM_I(SG_LINEAR_I0((uv), (wrapMode), (sizePx)) + vec2(1.0, 1.0), (sizePx))), \
			SG_LINEAR_F((uv), (wrapMode), (sizePx)).x \
		), \
		SG_LINEAR_F((uv), (wrapMode), (sizePx)).y \
	))

// Helper: compute UV for nearest sampling (round to nearest texel, clamp, then to texel-center)
#define SG_NEAREST_UV(uv, wrapMode, sizePx) \
	(clamp(floor(sg_wrapUv((uv), (wrapMode)) * (sizePx) + 0.5), vec2(0.0), (sizePx) - 1.0) + 0.5) / (sizePx)

// Filtered sampling: 0=linear, 1=nearest. (2=mipmap reserved)
// Implemented shader-side to avoid relying on backend sampler state.
#define SG_SAMPLE_FILTER(tex, uv, wrapMode, filterMode, sizePx) \
	(((filterMode) < 0.5) ? SG_SAMPLE_LINEAR((tex), (uv), (wrapMode), (sizePx)) : texture((tex), SG_NEAREST_UV((uv), (wrapMode), (sizePx))))


#define SG_TEX0(tex, uv) SG_SAMPLE_FILTER((tex), (uv), iChannelWrap.x, iChannelFilter.x, SG_CHANNEL_SIZE0)
#define SG_TEX1(tex, uv) SG_SAMPLE_FILTER((tex), (uv), iChannelWrap.y, iChannelFilter.y, SG_CHANNEL_SIZE1)
#define SG_TEX2(tex, uv) SG_SAMPLE_FILTER((tex), (uv), iChannelWrap.z, iChannelFilter.z, SG_CHANNEL_SIZE2)
#define SG_TEX3(tex, uv) SG_SAMPLE_FILTER((tex), (uv), iChannelWrap.w, iChannelFilter.w, SG_CHANNEL_SIZE3)

// Filtered sampling: 0=linear, 1=nearest. (2=mipmap reserved)
// Implemented shader-side to avoid relying on backend sampler state.
vec4 sg_sample_filter(sampler2D tex, vec2 uv, float wrapMode, float filterMode, vec2 sizePx) {
    if (filterMode < 0.5) {
        return SG_SAMPLE_LINEAR(tex, uv, wrapMode, sizePx);
    } else {
        return texture(tex, SG_NEAREST_UV(uv, wrapMode, sizePx));
    }
}
vec4 sg_texture0(sampler2D tex, vec2 uv) {
	return sg_sample_filter(tex, uv, iChannelWrap.x, iChannelFilter.x, SG_CHANNEL_SIZE0);
}

// TODO: 非常奇怪，在编写的过程中，传递 sampler2D 作为参数一直有运行报错，但现在又没了
vec4 sg_texture(int idx, sampler2D tex, vec2 uv) {
    switch (idx) {
        case 0: return SG_TEX0(tex, uv);
        case 1: return SG_TEX1(tex, uv);
        case 2: return SG_TEX2(tex, uv);
        default: return SG_TEX3(tex, uv);
    }
}

out vec4 fragColor;