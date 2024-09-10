#include <common/common_header.frag>
#include <Delaunay SDF To Mesh Common.frag>
uniform sampler2D iChannel0;
void mainImage( out vec4 fragColor, in vec2 fragCoord ) {

    vec2 p = (fragCoord - 0.5 * iResolution.xy) / min(iResolution.x, iResolution.y); p *= 2.0;

    vec3 col = texelFetch(iChannel0, ivec2(fragCoord), 0).xyz;
    
    fragColor = vec4(col, 1.0);
}

#include <common/main_shadertoy.frag>