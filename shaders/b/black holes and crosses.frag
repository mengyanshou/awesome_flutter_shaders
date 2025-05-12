#include <../common/common_header.frag>
#define PI 3.141592

vec3 palette(vec3 a, vec3 b, vec3 c, vec3 d, float t) {

    return a + b * cos(2.0 * PI * (c * d + t));
}

float line(vec2 uv, vec2 a, vec2 b) {

    vec2 pa = uv - a;
    vec2 ba = b - a;
    float t = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * t);
}

void mainImage(out vec4 c_out, in vec2 u) {

    vec2 rr = iResolution.xy, uv = (u + u - rr) / rr.y;
    uv *= 0.8;

    float ff = length(uv + vec2(cos(iTime * 0.25), sin(iTime * 0.25)));
    uv *= (1.0 - ff * (sin(iTime * 0.25) + 1.0));
    uv.x += iTime;
    uv.y += iTime * 0.5;
    vec2 uvc = uv;

    vec3 aa = vec3(sin(ff + iTime * 1.3));
    vec3 bb = vec3(cos(ff + iTime * 2.74), cos(ff + iTime * 3.3), cos(ff));
    vec3 cc = vec3(sin(ff + 2.0), sin(ff + 3.0), sin(ff));
    vec3 dd = vec3(cos(ff + PI * 0.5 + iTime), cos(ff + PI + iTime * 2.0), cos(ff + PI * 2.0 + iTime * 3.0));

    vec2 v = floor(uv * 5.0);
    uv = fract(uv * 5.0) - 0.5;

    float scale = 0.25;

    float add = sin(length(uvc) * 4.0);
    scale += sin(uvc.x * 2.0 + iTime) * 0.09;
    scale += cos(uvc.y * 2.0 + iTime) * 0.09;
    vec2 a = vec2(cos(iTime + add), sin(iTime + add)) * scale;
    vec2 b = vec2(cos(iTime + PI + add), sin(iTime + PI + add)) * scale;

    float f = 0.01 / line(uv, a, b);

    vec2 c = vec2(cos(iTime + PI * 0.5 + add), sin(iTime + PI * 0.5 + add)) * scale;
    vec2 d = vec2(cos(iTime + PI * (3.0 / 2.0) + add), sin(iTime + PI * (3.0 / 2.0) + add)) * scale;

    f += 0.01 / line(uv, c, d);

    vec3 cl = vec3(f) * palette(aa, bb, cc, dd, f) * 2.0;
    cl = pow(cl, vec3(2.0));

    c_out = vec4(vec3(cl), 1.0);
}

#include <../common/main_shadertoy.frag>