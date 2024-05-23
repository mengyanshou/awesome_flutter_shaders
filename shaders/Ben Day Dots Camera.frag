#include <common/common_header.frag>
uniform sampler2D iChannel0;
void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    fragColor.r = texelFetch(iChannel0, ivec2(fragCoord + cyanOffset * float(1 << dotSize)), 0).r;
    fragColor.g = texelFetch(iChannel0, ivec2(fragCoord + magentaOffset * float(1 << dotSize)), 0).g;
    fragColor.b = texelFetch(iChannel0, ivec2(fragCoord + yellowOffset * float(1 << dotSize)), 0).b;
}
#include <common/main_shadertoy.frag>