#include <common/common_header.frag>
uniform sampler2D iChannel0;
#define N 30
#define PI 3.14159
#define TAU 6.28318
float circle(vec2 o, vec2 uv, float t) {
    float g = 0.2;
    t -= g;
    float d = length(o - uv);
    if(d < t) {
        return 0.0;
    } else {
        return 0.01 + 1.0 - smoothstep(t, g + t, d);
    }

}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord / iResolution.y;
    float r = iResolution.x / iResolution.y;
    float t = float(N);
    vec3 col = vec3(0.0);

    vec2 pts[N];
    int mpt = 0;
    float mt = 10.0;
    float l = 20.0;
    float s = 0.5;

    for(int i = 0; i < N; i++) {
        float ft = mod(iTime * s + float(i) / l, t / l);
        pts[i] = vec2(cos(TAU * float(i) / float(N)), sin(TAU * float(i) / float(N))) * 0.3 + vec2(r / 2.0, 0.5);
        if(ft < mt) {
            mpt = i;
            mt = ft;
        };
    }

    // This is the worst for loop
    for(int i = mpt; i != int(mod(float(mpt - 1), float(N))); i = int(mod(float(i + 1), float(N)))) {
        float ft = mod(iTime * s + float(i) / l, t / l);
        float c = circle(pts[i], uv, ft);
        if(c != 0.0) {
            col = vec3(0.3, 1.0, 0.3) * c * (0.2 + smoothstep(0.0, t / l, ft) * 0.8) * (1.0 - smoothstep(t / l - 0.8, t / l, ft));
        }
    }

    // Output to screen
    fragColor = vec4(col, 1.0);
}
#include <common/main_shadertoy.frag>