#version 460 core
#include <flutter/runtime_effect.glsl>

uniform vec2 uSize;
uniform float iTime;
vec2 iResolution;
out vec4 fragColor;
// https://www.shadertoy.com/view/X3d3Rn
#define H(p) 2.*fract(sin((p)*mat2(127.1,311.7,269.5,183.3))*43758.54) -1.

float noise(in vec2 p) {
    float K1 = .366, K2 = .2113;
    vec2 i = floor(p + (p.x + p.y) * K1), a = p - i + (i.x + i.y) * K2, o = a.x > a.y ? vec2(1, 0) : vec2(0, 1), b = a - o + K2, c = a + 2. * K2 - 1.;
    vec3 h = max(.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.), n = h * h * h * h * vec3(dot(a, H(i)), dot(b, H(i + o)), dot(c, H(i + 1.)));
    return dot(n, vec3(70));
}

float fbm(vec2 uv) {
    float f, s = 2.;
    mat2 m = mat2(1.6, -1.2, 1.2, 1.6);
    // for(int i; ++i < 5; s += s, uv *= m) {
    //     f += noise(uv) / s;
    // }
    for(int i = 0; i < 5; i++) {
        s = s * 2;
        uv = uv * m;
        float noiseValue = noise(uv);
        f += noiseValue / s;
    }
    return .5 + .5 * f;
}

void main() {
    iResolution = uSize;
    vec2 fragCoord = FlutterFragCoord();
    vec2 uv = fragCoord.xy / iResolution.xy;
    vec2 q = uv;
    q *= vec2(5., 2.);
    float strength = 1.2;
    float width = 1.0;
    q -= vec2(2.5, 0.3);
    float n = fbm(strength * q - vec2(0, max(2.5, 1.25 * strength) * iTime));
    float c = 1.0 - 16.0 * pow(max(0., length(q * vec2(width + q.y * 1.5, 0.75)) - n * max(0., q.y + .25)), 1.2);
    float x = n * c * (1.5 - pow(1.2 * uv.y, 4.));
    x = clamp(x, 0., 1.);
    vec3 col = vec3(0.0);
    col += vec3(1.5 * x, 1.2 * pow(x, 3.), pow(x, 5.));
    float l = clamp(uv.y, q.y, q.y + 0.2);
    fragColor = vec4(mix(vec3(0.), col, c / l * 0.25), 1.0);
}
