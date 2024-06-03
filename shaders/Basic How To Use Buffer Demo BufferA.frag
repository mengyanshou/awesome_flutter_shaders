//### Buffer A
//This shader performs some initial computation and stores the result in a texture.
#include <common/common_header.frag>
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;

    // Example: Create a simple gradient
    vec3 color = vec3(uv.x, uv.y, 0.5);

    fragColor = vec4(color, 1.0);
}
#include <common/main_shadertoy.frag>