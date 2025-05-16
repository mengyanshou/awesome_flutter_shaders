// https://www.shadertoy.com/view/XXyGzh
#include <../common/common_header.frag>
vec2 stanh(vec2 a) {
    return tanh(clamp(a, -40., 40.));
}
// -13 thanks to Nguyen2007 ⚡

void mainImage(out vec4 o, vec2 u) {
    vec2 v = iResolution.xy;
    u = .2 * (u + u - v) / v.y;

    vec4 z = o = vec4(1, 2, 3, 0);

    for(float a = .5, t = iTime, i; ++i < 19.; o += (1. + cos(z + t)) / length((1. + i * dot(v, v)) * sin(1.5 * u / (.5 - dot(u, u)) - 9. * u.yx + t))) v = cos(++t - 7. * u * pow(a += .03, i)) - 5. * u, 
        // use stanh here if shader has black artifacts
        //   vvvv
        u += tanh(40. * dot(u *= mat2(cos(i + .02 * t - vec4(0, 11, 33, 0))), u) * cos(1e2 * u.yx + t)) / 2e2 + .2 * a * u + cos(4. / exp(dot(o, o) / 1e2) + t) / 3e2;

    o = 25.6 / (min(o, 13.) + 164. / o) - dot(u, u) / 250.;
}

// Original [436]
/*
void mainImage( out vec4 o, vec2 u )
{
    vec2 v = iResolution.xy, 
         w,
         k = u = .2*(u+u-v)/v.y;    
         
    o = vec4(1,2,3,0);
     
    for (float a = .5, t = iTime, i; 
         ++i < 19.; 
         o += (1.+ cos(vec4(0,1,3,0)+t)) 
           / length((1.+i*dot(v,v)) * sin(w*3.-9.*u.yx+t))
         )  
        v = cos(++t - 7.*u*pow(a += .03, i)) - 5.*u,         
        u *= mat2(cos(i+t*.02 - vec4(0,11,33,0))),
        u += .005 * tanh(40.*dot(u,u)*cos(1e2*u.yx+t))
           + .2 * a * u
           + .003 * cos(t+4.*exp(-.01*dot(o,o))),      
        w = u / (1. -2.*dot(u,u));
              
    o = pow(o = 1.-sqrt(exp(-o*o*o/2e2)), .3*o/o) 
      - dot(k-=u,k) / 250.;
}
//*/

#include <../common/main_shadertoy.frag>