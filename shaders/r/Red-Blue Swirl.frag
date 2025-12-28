// --- Migrate Log ---
// 初始化局部变量并显式初始化以避免未定义行为
// 使用 int 迭代器并在循环内转换为 float
// 将宏替换为函数，避免在 for 头进行累加；重命名参数为 fragCoord/fragColor
// --- Migrate Log (EN) ---
// Initialize local variables to avoid undefined behavior
// Use int loop counters and convert to float inside loop
// Replace macro by function, move accumulations into loop body, rename params to fragCoord/fragColor
#include <../common/common_header.frag>

// This work is licensed under a CC BY-NC-SA 4.0 license
// https://creativecommons.org/licenses/by-nc-sa/4.0/

vec2 C(vec2 U, float fi, float tt, float ox) {
    return cos(cos(U * fi + tt) + cos(U.yx * fi) + (ox + tt) * fi * fi) / fi / 9.0;
}


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 u = fragCoord;
    vec4 o = vec4(0.0);
    o.xy = iResolution.xy;
    u = 4.0 * (u + u - o.xy) / o.y;
    float d = dot(u, u);
    float t = 0.0;
    u /= 1.0 + 0.013 * d;
    
    o = vec4(0.1, 0.4, 0.6, 0.0);
    for (int k = 1; k <= 19; k++) {
        float i = float(k);
        t = iTime / 2.0 / i;
        o += cos(u.x + i + o.y * 9.0 + t) / 4.0 / i;
        u += C(u, i, t, o.x) + C(u.yx, i, t, o.x);
        u *= 1.17 * mat2(cos(i + length(u) * 0.3 / i - t / 2.0 + vec4(0.0, 11.0, 33.0, 0.0)));
    }
         
    o = 1.0 + cos(o * 3.0 + vec4(8.0, 2.0, 1.8, 0.0));
    o = 1.1 - exp(-1.3 * o * sqrt(o))
      + d * min(0.02, 4e-6 / exp(0.2 * u.y));
    fragColor = o;
}

#include <../common/main_shadertoy.frag>
