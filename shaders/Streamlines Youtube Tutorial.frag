#include <common/common_header.frag>
#include <Streamlines Youtube Tutorial Common.frag>
uniform sampler2D iChannel0;


void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // Normalized pixel coordinates (from 0 to 1)
   // vec2 uv = (fragCoord*2.-iResolution.xy)/iResolution.y;
    vec3 col = texture(iChannel0, fragCoord.xy / iResolution.xy).rgb;
    // Output to screen
    fragColor = vec4(col, .0);
}
#include <common/main_shadertoy.frag>
