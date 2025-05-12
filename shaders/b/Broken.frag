#include <../common/common_header.frag>
#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D iChannel0;

mat2 makem2(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat2(c, -s, s, c);
}

float noise(vec2 x) {
    return texture(iChannel0, x * .01).x;
}

float fbm(vec2 p) {
    float z = 2.0;
    float rz = 0.0;
    vec2 bp = p;
    for(float i = 1.0; i < 6.0; i++) {
        rz += abs((noise(p) - 0.5) * 2.0) / z;
        z = z * 2.0;
        p = p * 2.0;
    }
    return rz;
}

float dualfbm(vec2 p) {
    vec2 p2 = p * 0.7;
    vec2 basis = vec2(fbm(p2 - iTime * 1.6), fbm(p2 + iTime * 1.7));
    basis = (basis - 0.5) * 0.2;
    p += basis;
    return fbm(p * makem2(iTime * 0.2));
}

float circ(vec2 p) {
    float r = length(p);
    r = log(sqrt(r));
    return abs(mod(r * 4.0, 6.28318530718) - 3.14) * 3.0 + 0.2;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 p = fragCoord.xy / iResolution.xy - 0.5;
    p.x *= iResolution.x / iResolution.y;
    float len = length(p);
    p *= 4.0;

    float rz = dualfbm(p);
    float artifacts_radious_fade = pow(max(1.0, 6.5 * len), 0.2);

    // Set the fragment color
    fragColor = vec4(rz, rz, rz, 1.0);
}

#include <../common/main_shadertoy.frag>