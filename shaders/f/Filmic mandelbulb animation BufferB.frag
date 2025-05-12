//First DoF pass
#include <../common/common_header.frag>
#include <Filmic mandelbulb animation Common.frag>
uniform sampler2D iChannel0;
#define DoFSamples 5
#define Aperture .07

float dofRadius(float depth) {
    return Aperture * iResolution.y * atan(abs(depth - FocalDistance), depth);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {

    vec4 colorAndDepth;
    float samples;
    float r = 0.0, phi;
    vec2 sc = vec2(sqrt(1.0 / LensRatio), sqrt(LensRatio)) * iResolution.y * Aperture / Pi / 2.0;
    for(int i = 0; i < DoFSamples; i++) {

        r = sqrt(float(i) / float(DoFSamples - 1));
        phi = 2.3998277 * float(i);

        vec2 d = r * vec2(cos(phi), sin(phi)) * sc;
        vec4 p = texture(iChannel0, (fragCoord.xy + d) / iResolution.xy);
        float dr = dofRadius(p.a);
        float influence = clamp(dr - length(d) + .5, 0.0, 1.0) / (dr * dr + .01);
        colorAndDepth += influence * p;
        samples += influence;
    }
    fragColor = colorAndDepth / samples;
}

#include <../common/main_shadertoy.frag>