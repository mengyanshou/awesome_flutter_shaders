#include <common/common_header.frag>
uniform sampler2D iChannel0;
void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = fragCoord / iResolution.xy;

    // Color
    vec3 image = texture(iChannel0, uv).xyz;
    vec3 tonemappedImage = max(vec3(0), image - vec3(0.2, 0.2, 0.2));
    tonemappedImage = powRGB(tonemappedImage, vec3(1.5, 1.9, 1.7));
    tonemappedImage *= vec3(2.0, 2.0, 1.4);
    tonemappedImage = min(tonemappedImage, vec3(1.0));
    tonemappedImage = mix(vec3(dot(tonemappedImage, vec3(0.333))), tonemappedImage, 0.8);

    // Normal
    float offsetH = NORMAL_OFFSET * iResolution.y / iResolution.x;
    float offsetV = NORMAL_OFFSET;

    float heightE = FauxHeightFromColor(texture(iChannel0, uv + vec2(offsetH, 0.0)).xyz);
    float heightW = FauxHeightFromColor(texture(iChannel0, uv + vec2(-offsetH, 0.0)).xyz);
    float heightN = FauxHeightFromColor(texture(iChannel0, uv + vec2(0.0, offsetV)).xyz);
    float heightS = FauxHeightFromColor(texture(iChannel0, uv + vec2(0.0, -offsetV)).xyz);

    float ddx = (heightE - heightW) * NORMAL_STRENGTH;
    float mappedDDX = pow(abs(ddx), NORMAL_TWEAK) * sign(ddx);
    float ddy = (heightN - heightS) * NORMAL_STRENGTH;
    float mappedDDY = pow(abs(ddy), NORMAL_TWEAK) * sign(ddy);
    float mappedZ = sqrt(max(0.0, 1.0 - mappedDDX * mappedDDX - mappedDDY * mappedDDY));
    vec3 normal = vec3(mappedDDX, mappedDDY, mappedZ);

    // Light
    vec3 lightVector = normalize(vec3(1.0, 1.0, 1.0));
    float light = max(max(dot(normal, lightVector), 0.0) * 1.2 + 0.3, 0.0);
    fragColor = vec4(light * tonemappedImage, 1.0);
}
#include <common/main_shadertoy.frag>