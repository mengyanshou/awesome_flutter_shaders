// G2P

#include <common/common_header.frag>
#include <Fork Fluidy flu vec2 725 Common.frag>
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
void mainImage(out vec4 C, in vec2 P)
{
    R = iResolution.xy;
    time = iTime;
    Mouse = iMouse;
    frame = iFrame;
    P = floor(P);
    C = G2P(iChannel0, iChannel1, P);
}
#include <common/main_shadertoy.frag>