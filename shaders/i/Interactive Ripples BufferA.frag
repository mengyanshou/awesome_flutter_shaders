// by Nikos Papadopoulos, 4rknova / 2019
// Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

//#define AUTO
#include <../common/common_header.frag>
uniform sampler2D iChannel0;

#define STRENGTH     (1.75)
#define MODIFIER     (0.99)
#define STEP         (2.00)

#define S(e) (texture(iChannel0, p+e).x) // Sample

vec3 getPos() {
#ifdef AUTO
	float t = iTime * 5.0;
	vec2 s = fract(floor(t) * vec2(0.456665, 0.708618)) * iResolution.xy;
	return vec3(s, 1);
#else
	if(iMouse.z > 0.)
		return vec3(iMouse.xy, 1);
	return vec3(0);
#endif /* AUTO */
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
	float d = 0.;
	vec2 p = gl_FragCoord.xy / iResolution.xy;
	vec4 c = texture(iChannel0, p);
	vec3 e = vec3(vec2(STEP) / iResolution.xy, 0.);
	float s0 = c.y, s1 = S(-e.zy), s2 = S(-e.xz), s3 = S(e.xz), s4 = S(e.zy);

	vec3 pos = getPos();
	if(pos.z > 0.5)
		d = STRENGTH * smoothstep(3., 0.5, length(pos.xy - gl_FragCoord.xy));

   	// Calculate new state
	d += -(s0 - .5) * 2. + (s1 + s2 + s3 + s4 - 2.);
	d *= MODIFIER;
	d *= smoothstep(0., 1., float(iFrame >= 60)); // Clean buffer at startup
	d = d * 0.5 + 0.5;
	fragColor = vec4(d, c.x, 0, 0); // Save current and previous state
}

#include <../common/main_shadertoy.frag>