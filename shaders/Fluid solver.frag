#include <common/common_header.frag>
uniform sampler2D iChannel0;
#define PI 3.141592653589793

void mainImage(out vec4 o, in vec2 p) {
    vec4 c = texture(iChannel0, p.xy / iResolution.xy);
    o.rgb = .6 + .6 * cos(6.3 * atan(c.y,c.x)/(2.*PI) + vec3(0,23,21)); // velocity
	o.rgb *= c.w/5.; // ink
	o.rgb += clamp(c.z - 1., 0., 1.)/10.; // local fluid density
    o.a = 1.;
}
#include <common/main_shadertoy.frag>
