// --- Migrate Log ---
// 1) 使用 SG_TEX 宏以支持 wrap/filter uniform（替代 texture(iChannelN, uv)）
// 2) 按 Dart 接线顺序重映射通道：iChannel0=A, iChannel1=Blur(C), iChannel2=Noise（不再使用 iChannel3）
// 3) 修改 iChannelResolution[3] 为 iChannelResolution2（对应 Noise 输入）
// 4) 强制 fragColor.a=1，避免 Flutter alpha 合成导致“白屏/透明”
//
// 1) Use SG_TEX macros to honor wrap/filter uniforms (replace texture(iChannelN, uv))
// 2) Remap channels to match Dart feed order: iChannel0=A, iChannel1=Blur(C), iChannel2=Noise (no iChannel3)
// 3) Change iChannelResolution[3] to iChannelResolution2 for the Noise input
// 4) Force fragColor.a=1 to avoid alpha-compositing artifacts in Flutter

#include <../common/common_header.frag>

uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / iResolution.xy;
    vec2 pixelSize = 1. / iResolution.xy;
    vec2 aspect = vec2(1.,iResolution.y/iResolution.x);

	vec4 noise = SG_TEX2(iChannel2, fragCoord.xy / iChannelResolution2.xy + fract(vec2(42,56)*iTime));

	vec2 lightSize=vec2(4.);

    // get the gradients from the blurred image
	vec2 d = pixelSize*2.;
	vec4 dx = (SG_TEX1(iChannel1, uv + vec2(1,0)*d) - SG_TEX1(iChannel1, uv - vec2(1,0)*d))*0.5;
	vec4 dy = (SG_TEX1(iChannel1, uv + vec2(0,1)*d) - SG_TEX1(iChannel1, uv - vec2(0,1)*d))*0.5;

	// add the pixel gradients
	d = pixelSize*1.;
	dx += SG_TEX0(iChannel0, uv + vec2(1,0)*d) - SG_TEX0(iChannel0, uv - vec2(1,0)*d);
	dy += SG_TEX0(iChannel0, uv + vec2(0,1)*d) - SG_TEX0(iChannel0, uv - vec2(0,1)*d);

	vec2 displacement = vec2(dx.x,dy.x)*lightSize; // using only the red gradient as displacement vector
	float light = pow(max(1.-distance(0.5+(uv-0.5)*aspect*lightSize + displacement,0.5+(iMouse.xy*pixelSize-0.5)*aspect*lightSize),0.),4.);

	// recolor the red channel
	vec4 rd = vec4(SG_TEX0(iChannel0,uv+vec2(dx.x,dy.x)*pixelSize*8.).x)*vec4(0.7,1.5,2.0,1.0)-vec4(0.3,1.0,1.0,1.0);

    // and add the light map


	fragColor = mix(rd,vec4(8.0,6.,2.,1.), light*0.75*vec4(1.-SG_TEX0(iChannel0,uv+vec2(dx.x,dy.x)*pixelSize*8.).x));

	// Flutter composites using alpha; ensure the pass is opaque.
	fragColor.a = 1.0;

	//fragColor = SG_TEX0(iChannel0, uv); // bypass
}

#include <../common/main_shadertoy.frag>
