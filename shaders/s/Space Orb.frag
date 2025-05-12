
#include <../common/common_header.frag>
#include <Space Orb Common.frag>
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
void mainImage(out vec4 O, in vec2 I) {
    vec2 uv = I / iResolution.xy;
    vec2 p = (2. * I - iResolution.xy) / iResolution.y;

    vec4 t = texture(iChannel0, uv) * 1.2;

    #if HW_PERFORMANCE != 0
    t += blur(iChannel0, uv, iResolution.xy, 5.) * .2;
    t += blur(iChannel0, uv, iResolution.xy, 2.) * .4;
    #endif

    vec2 nuv = pow(uv * (1.0 - uv), vec2(.3));
    t *= clamp(nuv.x * nuv.y * 3., 0., 1.);
    t *= smoothstep(2., .8, length(p));

    t = t * vec4(1.2, 1.2, 1.44, 1.);
    t = pow(t * t, vec4(.43));
    t = vec4(aces_tonemap(t.rgb * 1.5), 1.);

    t += texture(iChannel1, p) * .2 - .1;

    O = t;
}
#include <../common/main_shadertoy.frag>
