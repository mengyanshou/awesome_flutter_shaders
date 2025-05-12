// Perlin sin sphere
// By Paulo Falcao
//
// Inspired on https://x.com/andrewray/status/1791630436789355001
//
// Made in Material Maker ( https://www.materialmaker.org/material?id=987 )
//
// Generated shader revised for shadertoy
//
#include <../common/common_header.frag>
// simplifying 5567 chars "Perlin sin sphere" by PauloFalcao. https://shadertoy.com/view/M333RH

// Perlin sin sphere   By Paulo Falcao
// Inspired on https://x.com/andrewray/status/1791630436789355001
// Made in Material Maker ( https://www.materialmaker.org/material?id=987 )
// Generated shader revised for shadertoy

#define N normalize
#define R(a) mat2(cos(a + vec4(0, 11, 33, 0)))

vec3 rot3(vec3 p, vec3 a) {
	p.yz *= R(a.x);
	p.xz *= R(a.y);
	p.xy *= R(a.z);
	return p;
}
#define H3(p) fract(sin((p) * mat3(127.1, 311.7, 74.7, 269.5, 183.3, 246.1, 113.5, 271.9, 124.6)) * 43758.545) * 2. - 1.
#define G(i, j, k) dot(N(H3(o + vec3(i, j, k)) - .5), f - vec3(i, j, k))

float perlin3(vec3 p) {
	vec3 o = floor(p * .5) + .5, f = fract(p * .5), t = f * f * f * (f * (f * 6. - 15.) + 10.);
	return .5 + mix(mix(mix(G(0, 0, 0), G(1, 0, 0), t.x), mix(G(0, 1, 0), G(1, 1, 0), t.x), t.y), mix(mix(G(0, 0, 1), G(1, 0, 1), t.x), mix(G(0, 1, 1), G(1, 1, 1), t.x), t.y), t.z);
}

#define equirectangularMap(d) vec2(atan(d.y, d.x), acos(d.z)) / 3.1415926 / vec2(2, 1)

float H(vec2 p) {
	vec3 p3 = fract(p.xyx * .1031);
	p3 += dot(p3, p3.yzx + 33.33);
	return fract((p3.x + p3.y) * p3.z);
}

float n(vec2 v) {
	vec2 v1 = floor(v), v2 = smoothstep(0., 1., fract(v));
	return mix(mix(H(v1), H(v1 + vec2(0, 1)), v2.y), mix(H(v1 + vec2(1, 0)), H(v1 + vec2(1)), v2.y), v2.x);
}

#define perlin2(p) n(p) * .5 + n(p * 2. + 13.) * .25 + n(p * 4. + 23.) * .15 + n(p * 8. + 33.) * .1 + n(p * 16. + 43.) * .05

vec3 skyColor(vec3 p) {
	float v = perlin2(p.xz * .1) - .5;
	float d = length(p);
	return mix(vec3(.15, .3, .6) + v, vec3(.2, .5, 1) + v * 12. / max(d, 20.), min(d * .1, 1.));
}

#define floorColor(p) (perlin2(p.xz * .1) * .5 + .25) * vec3(.7, .5, .4)

vec3 render360(vec3 rd) {
	float y = abs(rd.y), ds = clamp(dot(vec3(-1, 1, -1), rd) * .57735, 0., 1.);
	vec3 p = rd * 5. / y;
	return (rd.y > 0. ? skyColor(p) + .3 * pow(1. - y, 3.) * .7 : mix(floorColor(2. * p), vec3(.5, .7, 1), max(1. - sqrt(y) * 3., 0.))) +
		(ds > .9997 ? 2. : 0.) + pow(ds, 512.) * 4. + pow(ds, 128.) * .5 + pow(ds, 4.) * .5;
}

#define S(p) length(p) - 1.6

// #define input_tex3d(p)  sin(vec3(fbm3d_perlin_nowrap(p)) * 68.442 - iTime * 5.) * .868

vec4 distortHeighByNormal(vec3 uv) {
	float d = S(uv);
	if(d <= .081) {
		vec3 n = N(uv), s = sin(vec3(perlin3(uv - d * n)) * 68.442 - iTime * 5.) * .868; // input_tex3d(uv - d * n)
		return vec4(s, S(uv - n * s * .071));
	}
	return vec4(0, 0, 0, d);
}

// #define input_BaseColor_tex3d(p) (distortHeighByNormal(p).xyz * .882 + .636)
// #define input_sdf3d(p) distortHeighByNormal((p).xyz).w / 1.98882

vec4 O(vec3 uv, int w) {
	vec3 p = rot3(uv, iTime * vec3(9, 5, 7) * .01745329);
	vec4 B = distortHeighByNormal(p);
	return vec4(w > 0 ? clamp(B.xyz * .882 + .636, 0., 1.) : vec3(0), B.w / 1.98882);
}

vec3 env(vec2 p) {
	p = (vec2(p.x, 1. - p.y) * 2. - 1.) * 3.1416 / vec2(1, 2);
	return render360(vec3(cos(p.y) * cos(p.x), sin(p.y), cos(p.y) * sin(p.x)));
}
vec3 normal(vec3 p) {
	vec3 e = vec3(.001, -.001, 0);
	float v1 = O(p + e.xyy, 0).w, v2 = O(p + e.yyx, 0).w, v3 = O(p + e.yxy, 0).w, v4 = O(p + e.xxx, 0).w;
	return N(vec3(v4 + v1 - v3 - v2, v3 + v4 - v1 - v2, v2 + v4 - v3 - v1));
}

void march(inout float d, inout vec3 p, float dS, vec3 ro, vec3 rd) {
	dS++;
	for(int i; ++i < 500 && d < 50. && abs(dS) > 1e-4;) d += dS = O(p = ro + rd * d, 0).w;
}

vec3 raymarch(vec2 uv) {
	float d, dS;
	uv -= .5;
	vec3 cam = vec3(sin(iTime * .2) * 5., sin(iTime * .13) + 2., 5), ray = N(-cam), cX = N(cross(vec3(0, 1, 0), ray)), rd = N(ray * 1.5 + cX * uv.x + cross(cX, ray) * uv.y), p;
	march(d, p, dS, cam, rd);
	vec3 color = d < 50. ? env(equirectangularMap(N(reflect(rd, -normal(p))).xzy)).xyz * mix(vec3(1), O(p, 1).xyz, .9) : env(equirectangularMap(rd.xzy)).xyz;

	return pow(color, vec3(.71429));
}

void mainImage(out vec4 O, vec2 u) {
	vec2 R = iResolution.xy;
	float m = min(R.x, R.y);
	O = vec4(raymarch(vec2(0, 1) + vec2(1, -1) * (u - .5 * (R - m)) / m), 1);
}
#include <../common/main_shadertoy.frag>