//Second DoF pass (with noise)
#include <../common/common_header.frag>
#include <Filmic mandelbulb animation Common.frag>
uniform sampler2D iChannel0;
#define DoFSamples 5
#define Aperture .04

float NoiseSeed;

float randomFloat() {
    NoiseSeed = sin(NoiseSeed) * 84522.13219145687;
    return fract(NoiseSeed);
}
float dofRadius(float depth) {
    return Aperture * iResolution.y * atan(abs(depth - FocalDistance), depth);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {

    NoiseSeed = float(iFrame) * .0019146574 + fragCoord.y * 12.75428782 + fragCoord.x;

    vec4 colorAndDepth;
    float samples;
    float r = 0.0, phi;
    vec2 sc = vec2(sqrt(1.0 / LensRatio), sqrt(LensRatio)) * iResolution.y * Aperture / Pi / 2.0;
    for(int i = 0; i < DoFSamples; i++) {

        r = sqrt(float(i) / float(DoFSamples));
        phi = 2.0 * Pi * randomFloat();

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