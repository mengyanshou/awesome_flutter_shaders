
// --- Migrate Log ---
// 添加 Flutter 兼容性 includes，重写 mainImage 使用标准参数并初始化变量
// Added Flutter compatibility includes, rewrote mainImage to use standard parameters and initialize variables

#include <../common/common_header.frag>

/*
    -4 chars from iapafoto 333->329 (p-p+ instead of vec3())
*/

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    float i = 0.0, d = 0.0, s = 0.0, t = iTime;
    vec3 q = vec3(0.0), p = vec3(iResolution, 0.0);
    vec2 u = (fragCoord - iResolution.xy / 2.0) / iResolution.y;
    fragColor = vec4(0.0);
    for(; i < 100.0; i++) {
        d += s = 0.01 + min(0.03 + abs(9.0 - q.y) * 0.1,
                           0.01 + abs(1.0 + p.y) * 0.2);
        fragColor += 1.0 / s;
        for (q = p = vec3(u * d, d + t), s = 0.01; s < 2.0;
             p += abs(dot(sin(p * s * 24.0), p - p + 0.01)) / s,
             q += abs(dot(sin(0.3 * t + q * s * 16.0), p - p + 0.005)) / s,
             s += s);
    }
    fragColor = tanh(fragColor * vec4(1, 2, 4, 0) / 1e4 / length(u - 0.2));
}

#include <../common/main_shadertoy.frag>

/*

    Playing with turbulence and translucency from
    @Xor's recent shaders, e.g.
        https://www.shadertoy.com/view/wXjSRt
        https://www.shadertoy.com/view/wXSXzV
*/