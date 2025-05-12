#include <../common/common_header.frag>
uniform sampler2D iChannel0;
#define N 30

float circle(vec2 o, vec2 uv, float t) {
    float g = .2, d = length(o - uv);
    return d < t - g ? 0. : .01 + smoothstep(t, t - g, d);
}

void mainImage(out vec4 O, vec2 u) {
    vec2 R = iResolution.xy, uv = (u - .5 * R) / R.y, pts;
    float mt = 10., l = 20., s = .5, t = float(N), r = 0. * R.x / R.y, mpt, col, i, j, ft, c;

    for(; i < t; i++) {
        ft = mod(iTime * s + i / l, t / l);
        if(ft < mt)
            mpt = i, mt = ft;
    }

    for(; j < t; j++) {
        i = mod(j + mpt, t);
        ft = mod(iTime * s + i / l, t / l);
        pts = cos(6.28 * i / t + vec2(0, 11)) * .3;
        c = circle(pts, uv, ft);
        if(c != 0.)
            col = c * (.2 + smoothstep(0., t / l, ft) * .8) * smoothstep(0., -.8, ft - t / l);
    }

    O = vec4(sqrt(vec3(.3, 1, .3) * col * .7), 1);
}
#include <../common/main_shadertoy.frag>