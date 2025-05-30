#include <../common/common_header.frag>
void mainImage(out vec4 o, vec2 u) {
    float i,d,s,t=iTime;
    vec3  q,p = iResolution;
    u = (u-p.xy/2.)/p.y;
    for(o*=i; i++<1e2;
        d += s = .01 + min(.03+abs(9.- q.y)*.1,
                           .01+abs( 1.+ p.y)*.2),
        o += 1. /  s)
        for (q = p = vec3(u*d,d+t),s = .01; s < 2.;
             p += abs(dot(sin(p * s *24.), vec3(.01))) / s,
             q += abs(dot(sin(.3*t+q * s * 16.), vec3(.005))) / s,
             s += s);
    o = tanh(o * vec4(1,2,4,0) / 1e4 / length(u-.2));
}

#include <../common/main_shadertoy.frag>
/*
    Playing with turbulence and translucency from
    @Xor's recent shaders, e.g.
        https://www.shadertoy.com/view/wXjSRt
        https://www.shadertoy.com/view/wXSXzV
*/