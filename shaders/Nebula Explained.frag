/*
    Explanation for "Nebula":
    https://twitter.com/XorDev/status/1666179395260694529
*/
#include <common/common_header.frag>
uniform sampler2D iChannel0;
void mainImage(out vec4 color, vec2 coord)
{
    vec3 res = iResolution;
    // Output Buf A
    color = texture(iChannel0, coord / res.xy);
}
#include <common/main_shadertoy.frag>