// --- Migrate Log ---
// 1) 使用 SG_TEX 宏以支持 wrap/filter uniform（替代 texture(iChannel0, uv)）
// 2) 修改 iChannelResolution[0] 为 iChannelResolution0
//
// 1) Use SG_TEX macros to honor wrap/filter uniforms (replace texture(iChannel0, uv))
// 2) Change iChannelResolution[0] to iChannelResolution0

#include <../common/common_header.frag>

uniform sampler2D iChannel0;

// horizontal Gaussian blur pass

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 pixelSize = 1./ iChannelResolution0.xy;
    vec2 uv = fragCoord.xy * pixelSize;

    float h = pixelSize.x;
	vec4 sum = vec4(0.0);
	sum += SG_TEX0(iChannel0, fract(vec2(uv.x - 4.0*h, uv.y)) ) * 0.05;
	sum += SG_TEX0(iChannel0, fract(vec2(uv.x - 3.0*h, uv.y)) ) * 0.09;
	sum += SG_TEX0(iChannel0, fract(vec2(uv.x - 2.0*h, uv.y)) ) * 0.12;
	sum += SG_TEX0(iChannel0, fract(vec2(uv.x - 1.0*h, uv.y)) ) * 0.15;
	sum += SG_TEX0(iChannel0, fract(vec2(uv.x + 0.0*h, uv.y)) ) * 0.16;
	sum += SG_TEX0(iChannel0, fract(vec2(uv.x + 1.0*h, uv.y)) ) * 0.15;
	sum += SG_TEX0(iChannel0, fract(vec2(uv.x + 2.0*h, uv.y)) ) * 0.12;
	sum += SG_TEX0(iChannel0, fract(vec2(uv.x + 3.0*h, uv.y)) ) * 0.09;
	sum += SG_TEX0(iChannel0, fract(vec2(uv.x + 4.0*h, uv.y)) ) * 0.05;

    fragColor.xyz = sum.xyz/0.98; // normalize
	fragColor.a = 1.;
}

#include <../common/main_shadertoy.frag>
