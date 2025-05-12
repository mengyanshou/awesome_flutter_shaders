#include <flutter/runtime_effect.glsl>
// https://www.shadertoy.com/view/DtXfDr
uniform vec2 uSize;
uniform float iTime;
vec2 iResolution;
out vec4 fragColor;
#define S smoothstep

vec4 Line(vec2 uv, float speed, float height, vec3 col) {
    uv.y += S(1., 0., abs(uv.x)) * sin(iTime * speed + uv.x * height) * .2;
    return vec4(S(.06 * S(.2, .9, abs(uv.x)), 0., abs(uv.y) - .004) * col, 1.0) * S(1., .3, abs(uv.x));
}

void main() {
    iResolution = uSize;
    vec2 fragCoord = FlutterFragCoord();
    vec2 uv = (fragCoord - .5 * iResolution.xy) / iResolution.y;
    fragColor = vec4 (0.);
    for (float i = 0.; i <= 5.; i += 1.) {
        float t = i / 5.;
        fragColor += Line(uv, 1. + t, 4. + t, vec3(.2 + t * .7, .2 + t * .4, 0.3));
    }
}