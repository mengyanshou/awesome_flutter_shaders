#include <../common/common_header.frag>
uniform sampler2D iChannel0;
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    vec3 conway = (texture(iChannel0, uv).xyz);

    //cool color grading.wow
    fragColor.xyz = vec3(0.2 + conway.x * 0.6 - conway.y * 0.3, 0.2 + conway.y * 0.4, 0.25 + conway.y * 0.75) + vec3(conway.z) / 20.;
}
#include <../common/main_shadertoy.frag>