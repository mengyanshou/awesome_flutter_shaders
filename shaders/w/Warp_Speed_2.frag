// 'Warp Speed 2'
// David Hoskins 2015.
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

// Fork of:-   https://www.shadertoy.com/view/Msl3WH
//----------------------------------------------------------------------------------------
#include <../common/common_header.frag>

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    float s = 0.0, v = 0.0;
    vec2 uv = (fragCoord / iResolution.xy) * 2.0 - 1.;
    float time = (iTime - 2.0) * 58.0;
    vec3 col = vec3(0);
    vec3 init = vec3(sin(time * .0032) * .3, .35 - cos(time * .005) * .3, time * 0.002);
    for(int r = 0; r < 100; r++) {
        vec3 p = init + s * vec3(uv, 0.05);
        p.z = fract(p.z);
        // Thanks to Kali's little chaotic loop...
        for(int i = 0; i < 10; i++) p = abs(p * 2.04) / dot(p, p) - .9;
        v += pow(dot(p, p), .7) * .06;
        col += vec3(v * 0.2 + .4, 12. - s * 2., .1 + v * 1.) * v * 0.00003;
        s += .025;
    }
    fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
#include <../common/main_shadertoy.frag>