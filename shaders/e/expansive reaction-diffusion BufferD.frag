// not used (yet), but hooray for 8 channel feedback
#include <../common/common_header.frag>

uniform sampler2D iChannel0;
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord.xy / iResolution.xy;
    vec2 pixelSize = 1. / iResolution.xy;
    float eighth = 1. / 8.;
    if(uv.x > 7. * eighth && uv.x < 8. * eighth && uv.y > 2. * eighth && uv.y < 3. * eighth) {
        fragColor = vec4(iMouse.xy / iResolution.xy, iMouse.zw / iResolution.xy);
    }
}
#include <../common/main_shadertoy.frag>
