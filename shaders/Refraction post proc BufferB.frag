#include <common/common_header.frag>
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;

#define TIME            iTime
#define RESOLUTION      iResolution
#define ROT(a)          mat2(cos(a), sin(a), -sin(a), cos(a))

#define PI          3.141592654
#define TAU         (2.0*PI)

const mat2 brot = ROT(2.399);
// License: Unknown, author: Dave Hoskins, found: Forgot where
vec3 dblur(vec2 q, float rad) {
    vec3 acc = vec3(0);
    const float m = 0.0025;
    vec2 pixel = vec2(m * RESOLUTION.y / RESOLUTION.x, m);
    vec2 angle = vec2(0, rad);
    rad = 1.;
    const int iter = 30;
    for(int j = 0; j < iter; ++j) {
        rad += 1. / rad;
        angle *= brot;
        vec4 col = texture(iChannel1, q + pixel * (rad - 1.) * angle);
        acc += clamp(col.xyz, 0.0, 10.0);
    }
    return acc * (1.0 / float(iter));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 q = fragCoord / RESOLUTION.xy;
    vec2 p = -1.0 + 2.0 * q;
    vec2 p2 = 0.9 * p;
    vec2 q2 = 0.5 + 0.5 * p2;
    const vec2 off = 0.0125 * vec2(0.0, -1.0);
    p.x *= RESOLUTION.x / RESOLUTION.y;

    float pp = smoothstep(0.0, 1.0, sin(0.25 * TAU * TIME));
    float bf = mix(0.66, 0.75, pp) * smoothstep(mix(0.65, 0.85, pp), 0.0, dot(p, p));
    vec3 bcol = bf > 0.05 ? dblur(q2, mix(0.5, 1.0, pp)) : vec3(0.0);

    vec3 col = vec3(0.0);
    col = texture(iChannel0, q).xyz;
    col += bcol * bf;
    fragColor = vec4(col, 1.0);
}
#include <common/main_shadertoy.frag>
