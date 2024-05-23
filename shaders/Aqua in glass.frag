#include <common/common_header.frag>
#include <Aqua in glass Common.frag>
uniform sampler2D iChannel0;
void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord / iResolution.xy;

    // Time varying pixel color
    vec4 col = texture(iChannel0, uv);
    col = vec4(col.rgb / col.a, 1.0);
    uv = uv * 2. - 1.;
    col = pow(col * pow(saturate(2.1 - length(uv)), .5), vec4(1. / 1.8));

    // Output to screen
    fragColor = col;
}