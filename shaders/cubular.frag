#include <common/common_header.frag>
uniform sampler2D iChannel0;
#define t 6.28318530718
#define r 6.
vec3 g(vec3 a, vec3 b, float n)
{
    vec3 aa = a * n;
    vec3 bb = b * (1. - n);
    return aa + bb;
}
float SDFhex(vec2 p)
{
    float L = length(p);
    return L + (L * .034 * cos(6. * atan(p.y, p.x)));
}
vec2 R(vec2 p)
{
    vec2 sc = vec2(sin(iTime), cos(iTime));
    return vec2((p.x * sc.y) - (p.y * sc.x), (p.x * sc.x) + (p.y * sc.y));
}
void mainImage(out vec4 O, in vec2 F)
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 h = .5 * iResolution.xy;
    vec2 uv = R(F - h) / 40.;
    // Time varying pixel color
    float s = SDFhex(uv);
    float c = fract(s - iTime * .5);
    vec3 col = vec3(g(vec3(.48, 0., 1.), vec3(.3, 0., 0.85), sqrt(c)));
    // if (s>r) col = vec3(0.);

    // Output to screen
    O = vec4(col, 1.0);
}
#include <common/main_shadertoy.frag>