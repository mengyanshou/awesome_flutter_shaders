#include <../common/common_header.frag>
// This work is licensed under a CC BY-NC-SA 4.0 license
// https://creativecommons.org/licenses/by-nc-sa/4.0/

#define C(U) cos(cos(U*i + t/i) + cos(U.yx*i) + o.x*i*i + t*i)/i/9.

void mainImage( out vec4 o, vec2 u )
{
    vec2 R = iResolution.xy,
         v = u = 4.*(u+u-R)/R.y;
    u /= 1. + .013*dot(u,u);
    o = vec4(.1,.4,.6,0);
    
    for (float t = iTime/2., i; i++ < 19.;
         o += cos(u.x + i + o.y*9. + t/i)/4./i) 
        u += C(u) + C(u.yx),
        u *= 1.17*mat2(cos(i + length(u)*.3/i 
                             - t/2./i 
                             + vec4(0,11,33,0)));
         
    o = 1. + cos(o*3. + vec4(8,2,1.8,0));
    o = 1.1 - exp(-1.3*o*sqrt(o))
      + dot(v,v)*min(.02, 4e-6*exp(-.2*u.y));
}
#include <../common/main_shadertoy.frag>