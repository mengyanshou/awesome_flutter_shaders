//Chromatic aberration, film grain and tone mapping
#include <../common/common_header.frag>
#include <Filmic mandelbulb animation Common.frag>
uniform sampler2D iChannel0;
float NoiseSeed;

float randomFloat() {
    NoiseSeed = sin(NoiseSeed) * 84522.13219145687;
    return fract(NoiseSeed);
}

vec3 ACESFilm(vec3 x) {
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    return (x * (a * x + b)) / (x * (c * x + d) + e);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {

    if(fragCoord.y / iResolution.y < Margins || fragCoord.y / iResolution.y > 1.0 - Margins) {
        fragColor = vec4(ACESFilm(vec3(0)), 1.0);
        return;
    }

    NoiseSeed = float(iFrame) * .003186154 + fragCoord.y * 17.2986546543 + fragCoord.x;

    vec2 uv = fragCoord.xy / iResolution.xy;

    vec2 d = (uv - vec2(.5)) * .0075;
    vec3 color = vec3(texture(iChannel0, uv - 0.0 * d).r, texture(iChannel0, uv - 1.0 * d).g, texture(iChannel0, uv - 2.0 * d).b);

    float noise = .9 + randomFloat() * .15;
    fragColor = vec4(ACESFilm(color * noise), 1.0);
}

#include <../common/main_shadertoy.frag>