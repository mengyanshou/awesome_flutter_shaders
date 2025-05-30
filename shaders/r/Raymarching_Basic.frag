
#include <../common/common_header.frag>
/*

	Minor changes to Gyabo's "Raymarching Basic" shader:
    https://www.shadertoy.com/view/Ml2XRD

*/

float map(vec3 p) {

	vec3 q = sin(p * 1.9);

	float w1 = 4.0 - abs(p.y) + (q.x + q.z) * 0.8;
	float w2 = 4.0 - abs(p.x) + (q.y + q.z) * 0.8;

	float s1 = length(mod(p.xy + vec2(sin((p.z + p.x) * 2.0) * 0.25, cos((p.z + p.x) * 1.0) * 0.5), 2.0) - 1.0) - 0.2;
	float s2 = length(mod(0.5 + p.yz + vec2(sin((p.z + p.x) * 2.0) * 0.25, cos((p.z + p.x) * 1.0) * 0.3), 2.0) - 1.0) - 0.2;

	return min(w1, min(w2, min(s1, s2)));

}

vec2 rot(vec2 p, float a) {
	return vec2(p.x * cos(a) - p.y * sin(a), p.x * sin(a) + p.y * cos(a));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {

	vec2 uv = (2. * fragCoord.xy - iResolution.xy) / iResolution.y;
	vec3 dir = normalize(vec3(uv, 1.0));
	dir.xz = rot(dir.xz, iTime * 0.23);
	dir = dir.yzx;
	dir.xz = rot(dir.xz, iTime * 0.2);
	dir = dir.yzx;
	vec3 pos = vec3(0, 0, iTime);
	vec3 col = vec3(0.0);

	float t = 0.0, tt;

	for(int i = 0; i < 100; i++) {
		tt = map(pos + dir * t);
		if(abs(tt) < 0.003)
			break;
		t += tt * 0.7;
	}

	vec3 ip = pos + dir * t;
	col = vec3(t * 0.1);
	col = sqrt(col);
	fragColor = vec4(0.05 * t + abs(dir) * col + max(0.0, map(ip - 0.1) - tt), 1.0);
}
#include <../common/main_shadertoy.frag>