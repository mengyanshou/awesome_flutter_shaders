// by Nikos Papadopoulos, 4rknova / 2019
// Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

//#define DEBUG
#include <../common/common_header.frag>
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
#define SPECULAR    (12.)
#define DEPTH       (12.)
#define WATER_COLOR vec3(0.92, 0.95, 1.0)

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord.xy / iResolution.xy;

    vec4 col = vec4(0);

    #ifdef DEBUG
    col = texture(iChannel0, uv);
    #else
    vec2 tc = texture(iChannel0, uv).xy;
    col = texture(iChannel1, tc - (0.5 - uv));
    col.xyz *= WATER_COLOR;
    vec3 n = normalize(vec3(length(dFdx(tc)), length(dFdy(tc)), DEPTH / max(iResolution.x, iResolution.y)));
    col.xyz += pow(dot(n, normalize(vec3(.9, .25, -.1))), 2.0) * pow(textureLod(iChannel2, n, 5.).xyz, vec3(SPECULAR));
    #endif /* DEBUG */

    fragColor = col;
}