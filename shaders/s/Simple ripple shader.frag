// --- Migrate Log ---
// 添加 common_header 引入并补充 iChannel0 声明；在计算 cl 时添加除零保护以避免中心点导致 NaN
// --- Migrate Log (EN) ---
// Added common_header include and declared missing iChannel0; add division-by-zero protection for cl

#include <../common/common_header.frag>
uniform sampler2D iChannel0;

// Based on Adrian Boeing's blog: Ripple effect in WebGL, published on February 07, 2011
// http://adrianboeing.blogspot.com/2011/02/ripple-effect-in-webgl.html
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 cp = -1.0 + 2.0 * fragCoord / iResolution.xy;
    float cl = length(cp);
    cl = max(cl, 1e-6); // protect against division by zero at center
    vec2 uv = fragCoord / iResolution.xy + (cp / cl) * cos(cl * 12.0 - iTime * 4.0) * 0.02;
    vec3 col = texture(iChannel0, uv).xyz;
    fragColor = vec4(col, 1.0);
}

#include <../common/main_shadertoy.frag>