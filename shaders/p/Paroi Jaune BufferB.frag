// ---------------------------------------------
// Bilateral blur for the bloom
// ---------------------------------------------
#include <../common/common_header.frag>
#include <Paroi Jaune Common.frag>
uniform sampler2D iChannel0;
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 invRes = vec2(1.) / iResolution.xy;

    vec2 uv = fragCoord * invRes;
    vec2 offset = vec2(3., 0.) * invRes;

    vec3 col = vec3(0);

    for(float i = -6.; i <= 6.; i += 1.) col += textureLod(iChannel0, uv + offset * i, 3.).rgb;

    fragColor = vec4(col / 12., 1.0);
}
#include <../common/main_shadertoy.frag>