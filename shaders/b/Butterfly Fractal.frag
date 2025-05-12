// just playing with colour and animation.
// I left my golf clubs at home.

// Butterfly fractal
// SnoopethDuckDuck
// https://www.shadertoy.com/view/MX3GzN
#include <../common/common_header.frag>
void mainImage(out vec4 o, vec2 u) {
    o.xyz = iResolution;
    u = (2. * u.yx - o.yx) / o.y;
    u.x = -u.x;

    o += .1 - o;

    for(int i; i++ < 9; o += exp(-5. * sqrt(length(u)))) u = vec2(dot(u, u), sin(3. * atan(u.y, u.x - sin(iTime * 0.17) + .5 * sin(5. * u.x + cos(3. * u.y) + iTime))));

    o.rgb *= vec3(sin(iTime * 0.3), sin(iTime * 0.5), sin(iTime * 0.7)) * 0.2 + vec3(0.5);
    o = 1. - exp(-30. * o * o * o);
    o.rgb = pow(o.rgb, vec3(1. / 2.2));
}

// Feather fractal [147 Chars]
/*
void mainImage( out vec4 o, vec2 u )
{
    o.xyz = iResolution;
    u = .6*(u+u-o.xy)/o.y;
    o -= o;
    
    for (float i; i++ < 9.; o += exp(-3.*length(u)))
        u = vec2(dot(u,u), sin(atan(u.y, u.x)*i));
}
//*/

#include <../common/main_shadertoy.frag>