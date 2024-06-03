// Recreation of the dino game!
//
// Play with up and down arrows or left mouse click.
//
#include <common/common_header.frag>
#include <Chrome Dino game Common.frag>
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord.xy / iResolution.xy;
    float col = texture(iChannel0, uv).b;

    fragColor = vec4(vec3(col), 1.);

}

#include <common/main_shadertoy.frag>