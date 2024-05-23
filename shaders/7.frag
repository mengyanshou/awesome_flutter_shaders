#include <flutter/runtime_effect.glsl>
// Source: @XorDev https://twitter.com/XorDev/status/1475524322785640455

uniform vec2 uSize;
uniform float iTime;
vec2 iResolution;
out vec4 fragColor;
void main(void) {
    iResolution = uSize;
    vec2 fragCoord = FlutterFragCoord();
    vec4 o = vec4(0);
    vec2 p = vec2(0), c = p, u = fragCoord.xy * 2. - iResolution.xy;
    float a;
    for(float i = 0; i < 4e2; i++) {
        a = i / 2e2 - 1.;
        p = cos(i * 2.4 + iTime + vec2(0, 11)) * sqrt(1. - a * a);
        c = u / iResolution.y + vec2(p.x, a) / (p.y + 2.);
        o += (cos(i + vec4(0, 2, 4, 0)) + 1.) / dot(c, c) * (1. - p.y) / 3e4;
    }
    fragColor = o;
}
