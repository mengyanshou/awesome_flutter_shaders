#include <../common/common_header.frag>
// Drammaticalia by Orblivius. https://shadertoy.com/view/wcyGRR
// 2025-05-20 03:13:06

void mainImage(out vec4 o, vec2 u) {
    float i,d,s,t=iTime;
    vec3 q,p;
    p = vec3(iResolution.x, iResolution.y, 0.0); // 修复：正确初始化3D向量
    u = (u-p.xy/2.)/p.y;
    for(o*=i; i++<60.;
        d += s = .01 + min(.03+abs(9.- q.y)*.2,
                           .01+abs( 1.+ p.y)*.3),
        o += 1. /  s)
        for (q = p = vec3(u*d,d+t),s = .01; s < 2.;
             p += abs(dot(sin(p * s *24.), vec3(.01))) / s,
             q += abs(dot(sin(.35*t+q * s * 16.), vec3(.001))) / s,
             s += s);
    o = tanh(o * vec4(3,1,9,0) * 3e-4 / (3.+cos(max(p.y,0.))) / length(u-.2));
}

/*
    Playing with turbulence and translucency from
    @Xor's recent shaders, e.g.
        https://www.shadertoy.com/view/wXjSRt
        https://www.shadertoy.com/view/wXSXzV
*/
#include <../common/main_shadertoy.frag>