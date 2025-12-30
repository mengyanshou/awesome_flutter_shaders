// --- Migrate Log ---
// 替换 texelFetch 为 SG_TEXELFETCH0，以使用 common_header 中的 texel-fetch 封装；
// 在文件顶部加入共用 include，并补充缺失的 `uniform sampler2D iChannel0`。
// 保证局部变量已显式初始化（无其他未初始化变量需要修改）。
//
// Replace texelFetch with SG_TEXELFETCH0 to use the common texel-fetch wrapper;
// Add common include at top and declare missing `uniform sampler2D iChannel0`.
// Ensure local variables are explicitly initialized (no other changes needed).

#include <../common/common_header.frag>
uniform sampler2D iChannel0;

float pi = 3.14159265;
void mainImage( out vec4 O, vec2 U ){

    if (U.x > 1.) return;

    O = SG_TEXELFETCH0(ivec2(0));

    vec2 r = iResolution.xy;
    vec2 muv = iMouse.z>0.?(2.*iMouse.xy-r)/r.y:O.xy;
    
    O.xy = mix(
        O.xy + vec2(.2/60., (.3-O.y)*.1),
        muv,
    O.z);
    O.x = mod(O.x+pi, 2.*pi)-pi;
    O.z = mix(O.z, iMouse.z>0.?.2:0., 1e-2);
    O.w = muv.x;
}

#include <../common/main_shadertoy.frag>