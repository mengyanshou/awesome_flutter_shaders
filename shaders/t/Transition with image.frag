// --- Migrate Log ---
// 使用 common_header 的 iChannelWrap 做 wrap（repeat/mirror/clamp），移除自定义 mirror()
// 统一用 SG_TEX0/1/2 采样，保证 Flutter/SkSL 兼容
// --- Migrate Log (EN) ---
// Use common_header iChannelWrap for wrap (repeat/mirror/clamp), remove custom mirror()
// Sample via SG_TEX0/1/2 for Flutter/SkSL compatibility

#include <../common/common_header.frag>

uniform sampler2D iChannel0; // mask
uniform sampler2D iChannel1; // image A
uniform sampler2D iChannel2; // image B

#define S(v) smoothstep(0.0, 1.5 * fwidth(v), (v))

float cubicInOut(float t) {
    return (t < 0.5)
        ? (4.0 * t * t * t)
        : (0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = fragCoord / iResolution.xy;

    float progress = iMouse.x / iResolution.x;
    progress = cubicInOut(smoothstep(0.1, 0.9, sin(iTime * 2.0) * 0.5 + 0.5));

    float mask = SG_TEX0(iChannel0, uv).r;
    float stepMask = S(mask - progress);

    vec2 uv2 = vec2(uv.x + progress * mask, uv.y);
    vec2 uv1 = vec2(uv.x - (1.0 - progress) * mask, uv.y);

    vec4 img2 = SG_TEX2(iChannel2, uv2);
    vec4 img1 = SG_TEX1(iChannel1, uv1);

    vec4 outCol = mix(img1, img2, stepMask);
    outCol.a = 1.0;
    fragColor = outCol;
}

#include <../common/main_shadertoy.frag>