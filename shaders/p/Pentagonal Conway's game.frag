#include <../common/common_header.frag>
#include <Pentagonal Conway's game Common.frag>
uniform sampler2D iChannel0;
#define r3 1.73205080757

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = uvmap(fragCoord, iResolution.xy);
    float pxunit = uvmap(vec2(0, 1), iResolution.xy).y;

    ivec3 pcoord = coordtopenta(uv);
    fragColor = mix(vec4(0.337, 0.404, 0.443, 1), vec4(0.580, 0.608, 0.573, 1), texelFetch(iChannel0, pcoord.xy, 0)[pcoord.z]) * smoothstep(0.0, pxunit * 4.0, pentagrid(uv) - 0.01);
}
#include <../common/main_shadertoy.frag>