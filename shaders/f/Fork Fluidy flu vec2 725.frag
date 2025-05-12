// MIT License
// Copyright 2021 Mykhailo Moroz
#include <../common/common_header.frag>
#include <Fork Fluidy flu vec2 725 Common.frag>
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
vec3 hsv2rgb(in vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    rgb = rgb * rgb * (3.0 - 2.0 * rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
}

void mainImage(out vec4 C, in vec2 P) {
    R = iResolution.xy;
    time = iTime;
    Mouse = iMouse;
    P = floor(P);

    if(iMouse.z < 0.) {
        // P = iMouse.xy + 100.*(P/R.x - 0.5);
    }

    float m = 0.0;
    float rho = 0.0;
    vec2 v = vec2(0.0);
    vec2 nor = vec2(0.0);
    range(i, -2, 2) range(j, -2, 2) {
        // load data
        vec2 di = vec2(i, j);
        vec4 data0 = A(P + di);
        vec4 data1 = B(P + di);

        // unpack data
        float m0 = data0.y;
        vec2 x0 = 0.1 * decode(data0.x) - fract(P);
        vec2 v0 = decode(data1.x);
        mat2 B0 = mat2(decode(data1.y), decode(data1.z)); // velocity gradient
        // update particle position

        // find cell contribution
        vec3 o = overlap(2.0 * x0 + di + v0 * dt, vec2(0.1));
        x0 = x0 + di;

        m += m0 * o.z;

        float w = k1(1.0 * x0);

        v += (v0 + 4.0 * B0 * x0) * w;
        rho += m0 * w;
    }
    // rho = step(0.1, rho)*rho; //isosurface
    float arg = 0.5 * (atan(v.y, v.x) / PI + 1.0);
    float d = 2.5 * length(v);
    vec3 fluid = hsv2rgb(vec3(arg, 0.5, 0.3 * d + 0. * rho));

    C = vec4(vec3(pow(max(1.0 - rho, 0.01), 3.0)), 1.0);
    C += -step(border(P), 0.0) * 0.5;
    // C = vec4(vec3(), 1.0);
}
#include <../common/main_shadertoy.frag>