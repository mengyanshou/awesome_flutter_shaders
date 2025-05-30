#include <../common/common_header.frag>
 /*
    Inspired by Xor's recent raymarchers with comments!
    https://www.shadertoy.com/view/tXlXDX
*/

void mainImage(out vec4 o, vec2 u) {
    float i,d,s,t=iTime;
    for(o*=i; i++<1e2; ) {
        vec3 p = d * normalize(vec3(u+u,0) - vec3(iResolution.xy, 1.0) );
        p.z -= t;
        for (s = .1; s < 2.;
            p -= dot(cos(t+p * s* 16.), vec3(.01)) / s,
            p += sin(p.yzx*.9)*.3,
            s *= 1.42);
        d += s = .02 + abs(3.-length(p.yx))*.1;
        o += (1.+cos(d+vec4(4,2,1,0))) / s;
    }
    o = tanh(o / 2e3);
}
#include <../common/main_shadertoy.frag>