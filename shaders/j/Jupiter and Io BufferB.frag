#include <../common/common_header.frag>
#include <Jupiter and Io Common.frag>
uniform sampler2D iChannel0;
//Sharpen Buffer
#define strength 5.0
#define clampValue 0.02

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    float xPixelOffset = 1.0 / iResolution.x;
    float yPixelOffset = 1.0 / iResolution.y;
    vec3 centerSample = texture(iChannel0, uv).xyz;
    vec3 northSample = texture(iChannel0, uv + vec2(0.0, yPixelOffset)).xyz;
    vec3 southSample = texture(iChannel0, uv + vec2(0.0, -yPixelOffset)).xyz;
    vec3 eastSample = texture(iChannel0, uv + vec2(xPixelOffset, 0.0)).xyz;
    vec3 westSample = texture(iChannel0, uv + vec2(-xPixelOffset, 0.0)).xyz;
    vec3 sharpen = (4.0 * centerSample - northSample - southSample - eastSample - westSample) * strength;
    sharpen = clamp(sharpen, -clampValue, clampValue);
    vec3 sharpenedInput = clamp(centerSample + sharpen, 0.0, 1.0);
    fragColor = vec4(sharpenedInput, 1.0);

}
#include <../common/main_shadertoy.frag>