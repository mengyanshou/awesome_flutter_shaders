#include <common/common_header.frag>

uniform sampler2D iChannel0;
float pi = 3.14159265;
void mainImage( out vec4 O, vec2 U ){

    if (U.x > 1.) return;

    O = texelFetch(iChannel0, ivec2(0), 0);

    vec2 r = iResolution.xy;
    vec2 muv = iMouse.z>0.?(2.*iMouse.xy-r)/r.y:O.xy;
    
    O.xy = mix(
        O.xy + vec2(.2/60., (.3-O.y)*.1),
        muv,
    O.z);
    O.x = mod(O.x+pi, 2.*pi)-pi;
    O.z = mix(O.z, iMouse.z>0.?.2:0., 1e-2);
    O.w = muv.x;
}
#include <common/main_shadertoy.frag>
