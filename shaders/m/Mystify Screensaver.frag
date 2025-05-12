#include <../common/common_header.frag>
#include <Mystify Screensaver Common.frag>

uniform sampler2D iChannel0;

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord / iResolution.xy;

    fragColor = texture(iChannel0, uv);
}
#include <../common/main_shadertoy.frag>