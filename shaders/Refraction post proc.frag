// CC0: Refraction + post proc
// Added a bit of post processing to the earlier refraction experiment
#include <common/common_header.frag>
uniform sampler2D iChannel0;
#define TIME            iTime
#define RESOLUTION      iResolution
#define ROT(a)          mat2(cos(a), sin(a), -sin(a), cos(a))

// License: Unknown, author: nmz (twitter: @stormoid), found: https://www.shadertoy.com/view/NdfyRM
vec3 sRGB(vec3 t) {
    return mix(1.055 * pow(t, vec3(1. / 2.4)) - 0.055, 12.92 * t, step(t, vec3(0.0031308)));
}

// License: Unknown, author: Matt Taylor (https://github.com/64), found: https://64.github.io/tonemapping/
vec3 aces_approx(vec3 v) {
    v = max(v, 0.0);
    v *= 0.6;
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    return clamp((v * (a * v + b)) / (v * (c * v + d) + e), 0.0, 1.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 q = fragCoord / RESOLUTION.xy;
    vec3 col = vec3(0.0);
    col = texture(iChannel0, q).xyz;
    col = aces_approx(col);
    col = sRGB(col);
    fragColor = vec4(col, 1.0);
}
#include <common/main_shadertoy.frag>
