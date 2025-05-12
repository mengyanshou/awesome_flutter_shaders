#include <../common/common_header.frag>
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord / iResolution.xy;

    vec4 data = texture(iChannel0, uv);

    // Brightness = water height
    //fragColor.xyz = vec3(data.x + 1.0) / 2.0;

    // Color = texture
    fragColor = texture(iChannel1, uv + 0.2 * data.zw);

    // Sunlight glint
    vec3 normal = normalize(vec3(-data.z, 0.2, -data.w));
    fragColor += vec4(1) * pow(max(0.0, dot(normal, normalize(vec3(-3, 10, 3)))), 60.0);
}
#include <../common/main_shadertoy.frag>