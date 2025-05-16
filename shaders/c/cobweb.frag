// https://www.shadertoy.com/view/W3sSzf
#include <../common/common_header.frag>
// Shader from paranoidray, Who in turn took it from xordev.
// Paranoid ray prettified the shader.
// I added more waves, Changed palette, Rotated waves as iTime passes.
// -----------------------------------------------------------------------

// original code from XorDev all credit belongs to him!
// https://x.com/XorDev/status/1914698293554139442
// https://twigl.app?ol=true&ss=-OOTrxZCfc7skbElm-8u

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
    vec3 r = vec3(uv, 1.0);
    vec4 o = vec4(0.0);
    float t = iTime;
    vec3 p;

    for (float i = 0.0, z = 0.0, d; i < 400.0; i++) {
        // Ray direction, modulated by time and camera
        p = z * normalize(vec3(uv, 0.5));
        p.z += t;

        // Rotating plane using a cos matrix
        vec4 angle = vec4(2.0, 33.0, 11.0 * iTime, 0.0);
        vec4 a = z * 0.2 + t * 0.1 + angle;
        p.xy *= mat2(cos(a.x), -sin(a.x), sin(a.x), cos(a.x));

        // Distance estimator
        z += d = length(cos(p + cos(p.yzx + p.z - t * 0.2)).xy) / 6.0;

        // Color accumulation using sin palette
        o += (sin(p.x + t + vec4(0.0, 2.0, 2.0, 0.0)) + 1.0) / d;
    }

    o = tanh(o / 6300.0);
    fragColor = vec4(o.rgb, 1.0);
}
#include <../common/main_shadertoy.frag>
