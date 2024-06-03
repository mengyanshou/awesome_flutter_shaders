#include <common/common_header.frag>
uniform sampler2D iChannel0;
// ShaderToy GLSL code for a posterization effect with anti-aliasing
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    vec4 texColor = texture(iChannel0, uv);

    // Define your input colors
    const vec3 colors[6] = vec3[](vec3(0.0, 0.0, 0.0), // BLACK
    vec3(1.0, 1.0, 1.0),  // WHITE
    vec3(0.0, 1.0, 0.0), // Green
    vec3(0.0, 0.0, 1.0), // Blue
    vec3(1.0, 1.0, 0.0), // Yellow
    vec3(0.0, 1.0, 1.0)  // Cyan

    );

    // Find the nearest color for the current pixel color
    vec3 nearestColor = colors[0];
    float minDistance = distance(texColor.rgb, colors[0]);

    for(int i = 1; i < 6; i++) {
        float d = distance(texColor.rgb, colors[i]);
        if(d < minDistance) {
            minDistance = d;
            nearestColor = colors[i];
        }
    }

    // Posterize the color
    vec3 posterizedColor = nearestColor;

    // Anti-aliasing
    float aaRadius = 2.0 / iResolution.x; // Anti-aliasing radius
    vec3 sumColor = vec3(0.0);
    float totalWeight = 0.0;

    for(int dx = -1; dx <= 1; dx++) {
        for(int dy = -1; dy <= 1; dy++) {
            vec2 offset = vec2(dx, dy) * aaRadius;
            vec4 sampleColor = texture(iChannel0, uv + offset);

            // Find the nearest color for the sample color
            vec3 nearestSampleColor = colors[0];
            float minSampleDistance = distance(sampleColor.rgb, colors[0]);

            for(int j = 1; j < 6; j++) {
                float d = distance(sampleColor.rgb, colors[j]);
                if(d < minSampleDistance) {
                    minSampleDistance = d;
                    nearestSampleColor = colors[j];
                }
            }

            float weight = 1.0 / (1.0 + distance(texColor.rgb, sampleColor.rgb));
            sumColor += nearestSampleColor * weight;
            totalWeight += weight;
        }
    }

    vec3 finalColor = sumColor / totalWeight;

    fragColor = vec4(finalColor, 1.0);
}
#include <common/main_shadertoy.frag>