// 'Space Jockey' dean_the_coder (Twitter: @deanthecoder)
// https://www.shadertoy.com/view/mdB3Rh (YouTube: https://youtu.be/6ZFq3TlvHBA)
//
// Processed by 'GLSL Shader Shrinker'
// (https://github.com/deanthecoder/GLSLShaderShrinker)
//
// Another Alien scene to add to my collection. :)
// I nearly gave up on this one several times as modelling
// all the details was a bit daunting, but I'm glad I
// perservered to the end.
//
// Tricks to try to improve performance:
//   - Precalculate function results and simplify calculations
//     when possible (see GLSL Shader Shrinker).
//   - Noise functions called once in the lighting code,
//     and re-used multiple times.
//   - Bounding shapes are applied to each part of the scene
//     so the SDF calculations can return early if the ray
//     position is deemed too far away to warrant calculating
//     the fine details.
//
// Thanks to Evvvvil, Flopine, Nusan, BigWings, Iq, Shane,
// totetmatt, Blackle, Dave Hoskins, byt3_m3chanic, tater,
// and a bunch of others for sharing their time and knowledge!

// License: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License

#include <../common/common_header.frag>

#define SKY_RGB	vec3(.5, .6, .65)
#define R	iResolution
#define Z0	0.
#define I0	0
#define sat(x)	clamp(x, 0., 1.)
#define S(a, b, c)	smoothstep(a, b, c)
#define S01(a)	S(0., 1., a)

float t;
float min2(vec2 v) { return min(v.x, v.y); }

float max2(vec2 v) { return max(v.x, v.y); }

float max3(vec3 v) { return max(v.x, max(v.y, v.z)); }

float sum2(vec2 v) { return dot(v, vec2(1)); }

float h31(vec3 p3) {
	p3 = fract(p3 * .1031);
	p3 += dot(p3, p3.yzx + 333.3456);
	return fract(sum2(p3.xy) * p3.z);
}

float h21(vec2 p) { return h31(p.xyx); }

float n31(vec3 p) {
	// Thanks Shane - https://www.shadertoy.com/view/lstGRB
	const vec3 s = vec3(7, 157, 113);
	vec3 ip = floor(p);
	p = fract(p);
	p = p * p * (3. - 2. * p);
	vec4 h = vec4(0, s.yz, sum2(s.yz)) + dot(ip, s);
	h = mix(fract(sin(h) * 43758.545), fract(sin(h + s.x) * 43758.545), p.x);
	h.xy = mix(h.xz, h.yw, p.y);
	return mix(h.x, h.y, p.z);
}

// Two n31 results from two scales.
vec2 n331(vec3 p) {
	const vec2 s = vec2(20, 38);
	vec2 ns = vec2(0.0);
	for (int i = I0; i < 2; i++)
		ns[i] = n31(p * s[i]);

	return ns;
}

float n21(vec2 p) { return n31(vec3(p, 1)); }

float smin(float a, float b, float k) {
	float h = sat(.5 + .5 * (b - a) / k);
	return mix(b, a, h) - k * h * (1. - h);
}

mat2 rot(float a) {
	float c = cos(a),
	      s = sin(a);
	return mat2(c, s, -s, c);
}

vec3 ax(vec3 p) { return vec3(abs(p.x) - .18, p.yz); }

float opRep(float p, float c) {
	float c2 = c * .5;
	return mod(p + c2, c) - c2;
}

vec2 opModPolar(vec2 p, float n, float o) {
	float angle = 3.141 / n,
	      a = mod(atan(p.x, p.y) + angle + o, 2. * angle) - angle;
	return length(p) * vec2(cos(a), sin(a));
}

vec3 bend(vec3 p, float k) {
	float c = cos(k * p.x);
	float s = sin(k * p.x);
	p.xy *= mat2(c, s, -s, c);
	return p;
}

float box(vec3 p, vec3 b) {
	vec3 q = abs(p) - b;
	return length(max(q, 0.)) + min(max3(q), 0.);
}

float box2(vec2 p, vec2 b) {
	vec2 q = abs(p) - b;
	return length(max(q, 0.)) + min(max2(q), 0.);
}

float cyl(vec3 p, vec2 hr) {
	vec2 d = abs(vec2(length(p.zy), p.x)) - hr;
	return min(max(d.x, d.y), 0.) + length(max(d, 0.));
}

float cap(vec3 p, float h, float r) {
	p.x -= clamp(p.x, -h, 0.);
	return length(p) - r;
}

float capTor(vec3 p, vec2 sc, float r) {
	p.x = abs(p.x);
	return sqrt(dot(p, p) + r * r - 2. * r * (sc.y * p.x > sc.x * p.y ? dot(p.xy, sc) : length(p.xy)));
}

float tor(vec3 p, vec2 t) {
	vec2 q = vec2(length(p.yz) - t.x, p.x);
	return length(q) - t.y;
}

vec3 rayDir(vec3 ro, vec2 uv) {
	vec3 f = normalize(vec3(0, -1, 0) - ro),
	     r = normalize(cross(vec3(0, 1, 0), f));
	return normalize(f + r * uv.x + cross(f, r) * uv.y);
}

float walls(vec3 p) {
	p.y -= 6.;

	// Walls.
	float d = 10.75 - length(p.yz);

	// Ray too far away - Bail early.
	if (d > 5.) return d;

	// Wobbles.
	float ox = p.x;
	p.x = opRep(p.x - 5., 6.);
	float a = atan(p.y, p.z);
	d -= .01 * sin(a * 172.);
	d -= .1 * cos(p.x * p.x * .7);

	// Main pipes.
	p.x = abs(p.x) - .7;
	float f = S(.5, 1., sin(a * 250.));
	f = tor(p, vec2(10, f * -.03 + .5));

	// Side pipe.
	p.x -= .5;
	f = min(f, tor(p, vec2(9.7, .15)));

	// Ball bones.
	p.zy = opModPolar(p.zy, 30., 0.);
	p.z -= 10.8;
	p.y = abs(p.y) - .5;
	p = bend(p, .11 * p.x * sin(12. * (a + floor(ox / 2.))));
	p.x -= 1.4;
	return smin(min(d, smin(length(p) - .25, cap(p, 1.5, .2), .1)), f, 1.);
}

float dais(vec3 p) {
	float a = atan(p.z, p.x);
	float l = length(p.xz);

	// Inner column.
	vec2 q = vec2(l, p.y);
	float d = box2(q, vec2(1.2 - abs(sin(a * 20.)) * .02, .8));

	// Ray too far away - Bail early.
	if (d > 4.) return d;

	// Middle ring.
	float l40 = abs(sin(l * 40.));
	d = min(d, box2(q - vec2(2.8, -.2), vec2(.16, .7 + l40 * .01)));

	// Radial pipes.
	vec3 v = p;
	v.xz = opModPolar(p.xz, 8., .2);
	d = smin(d, length(v.yz - vec2(.5, 0)) - .15 - l40 * .01, .1);

	// Radial struts.
	v.xz = opModPolar(p.xz, 32., 0.);
	v.z = abs(v.z) - .05;
	d = min(d, box2(v.yz - vec2(.2, 0), vec2(.2, 0)));

	// Clip content to dais radius.
	d = max(d, l - 4.12);

	// Geared outer ring.
	d = min(d, box2(q - vec2(4, -.1), vec2(.28 - S01(sin(a * 130.)) * .03, .7 + l40 * .02 * step(l, 4.16))));

	// Round edges off.
	return d - .03;
}

float chair(vec3 p) {
	p.y--;
	vec3 op = p;

	// Mounting struts.
	float d = cyl(ax(p) - vec3(0, 0, .1), vec2(1, S01(.5 - p.y) * .2 + .06));
	d += .005 * S(0., .03, abs(abs(p.y - .3) - .3));
	d = smin(d, p.y - .7, -.05);

	// Ray too far away - Bail early.
	if (d > 3.) return d;

	// Primary base exhaust.
	p.x = abs(p.x);
	p.y += .3 * S(.8, 1.6, p.x) * sin(p.x * 1.9);
	float f = cyl(p - vec3(.8, .12, .7), vec2(.2, 1));
	f = abs(f) - .005;
	f += .05 * S(.04, -.16, abs(p.y - .2));
	float q = length(p - vec3(1.8, .3, .85));
	f = smin(f, .2 - q, -.1);
	f += .01 * S(0., .03, abs(q - .35));

	// Seconardy pipe.
	q = S(.2, .9, -op.x);
	f = smin(f, cap(p - vec3(.7, .4 - q * .25, .6), .8, .15), .1 * q);
	d = min(d, f);

	// Central tube.
	f = cyl(op - vec3(.7, .3, 0), vec2(.3, 1.2)) - .1;

	// Toral pipe.
	f = max(f, .44 - length(op.xy - vec2(1.55, 1)));
	p = op.zyx - vec3(0, .25, .94);
	f = min(f, max(tor(p, vec2(.83, .08 - .005 * abs(sin(atan(p.y, p.z) * 40.)))), -p.z));

	// Organic scope mount.
	p = bend(op, -.08 * p.y);
	f = smin(f, box(p - vec3(.75, 1.45, 0), vec3(.2 - p.y * .1, 1, .1)) - .15 - abs(sin(p.y * 10.) * .01), .12);
	d = min(d, f);

	// Chair back.
	p = op;
	p.y -= 1.74;
	p.xy *= mat2(-.80114, .59847, -.59847, -.80114);
	float a = atan(p.x, p.y);
	float l = length(p);
	f = sat(sin(a * 1e2) - .6);
	f *= S(1.6, 1.1, l);
	const vec2 v = vec2(.64422, .76484);
	d = min(d, capTor(p, v, 1.56) - .5 - .02 * S(.7, .75, a) - .02 * f);
	f = length(p.xy - vec2(1.35, 0));
	d = smin(d, 1. - f, -.04);
	f *= S(.99, .95, f) * .4;
	f *= S(.25, .1, abs(p.x - 1.15));
	d -= .05 * (S(.2, .1, p.z) + sin(p.x * 50.) * f);

	// Chair side pipe.
	f = sin(a * 50.);
	d = min(d, capTor(p - vec3(0, 0, .5), v, 1.56) - .05 - .01 * f * f);
	d = min(d, capTor(p - vec3(0, 0, .5), v, 1.5) - .02);

	// Torso.
	p.xy *= mat2(.98007, .19867, -.19867, .98007);
	f *= S(0., .15, p.z);
	d = min(d, capTor(p, v, 1.25) - .36 - f * .015);

	// Shoulders.
	p -= vec3(.74, .9, .28);
	d = min(d, length(p) - .16);

	// Arms.
	p.z -= .075;
	p.xy *= rot(mix(.06, -.24, S(.15, -.6, op.x)));
	f = .086 - f * f * .002 * S(.3, .5, -op.x);
	f += .03 * S(.35, .05, abs(p.x + .3));
	f = cap(p, 1.4, f);
	a = atan(p.y, p.z);
	f += .01 * sin(a * 6.5) * S(1.3, 0., abs(p.x));
	f += .007 * sin(a * 9.) * S(.035, .3, op.x);
	d = min(d, f);

	// Head.
	p = op;
	p -= vec3(-1, 1.5, 0);
	f = mix(box(p, vec3(.25, .28, .26)), length(p) - .23, .9);
	p.xy = op.xy * mat2(.07074, -.99749, .99749, .07074);
	return smin(d, max(smin(f, capTor(p + vec3(1, 1.46, 0), v, 1.) - .04, .16), .05 - length(p.xz - vec2(-1.6, .15))), .3 * S(-1.5, -1., p.x)) - .02;
}

float mount(vec3 p, float x, float a) {
	p.xy *= rot(-.15 - a);
	p = p.zyx * vec3(-1, 1, 1);
	float d = cap(p, .3, .1);
	p.x += .3;
	p = p.yxz;
	p.xy *= rot(a);
	vec3 v = vec3(p.y + .176, opRep(p.x, .08), p.z - .11);
	float q = 1.1 + x;
	d = smin(d, cap(p, q, .1), .04);
	p.x += q;
	p = p.zyx;
	p.xz *= mat2(.87758, .47943, -.47943, .87758);
	d = smin(d, cap(p, .3, .1), .04);
	p.x += .3;
	p.xz *= mat2(.5403, -.84147, .84147, .5403);
	d = smin(d, cap(p, .1, .1), .04);
	d = smin(d, -p.y - .09, -.003);

	// Square cut-outs.
	return max(d, -box(v, vec3(.1, .02, .1)));
}

float mounts(vec3 p) {
	float d = mount(p - vec3(.9, 2.95, 0), .2, .05);

	// Ray too far away - Bail early.
	if (d > 3.) return d;
	return min(min(d, mount(p - vec3(1.2, 3.1, 0), .3, .1)), mount(p - vec3(1.5, 3.2, 0), -.2, .2));
}

float scope(vec3 p) {
	p.y -= 2.9;
	p.xy *= mat2(-.89676, -.44252, .44252, -.89676);
	vec3 op = p;

	// Barrel.
	float a = atan(p.y, p.z);
	float f = .005 * sat(-sin(a * 24. + 3.141));
	f = max(f, .04 * S(.2, 0., p.x + 2.9 - p.y * .4));
	p.y += .8 * S01(p.y + .3) * S(1., 0., p.x + 3.8);
	float d = cap(p, 3.2, .4 + f);

	// Ray too far away - Bail early.
	if (d > 1.) return d;

	// Side pipes.
	p.y = abs(p.y);
	p.zy = opModPolar(p.zy, 9., 0.);
	p -= vec3(-.4, 0, .35);
	d = min(d, cap(p, 2.6, .07 + abs(sin(p.x * 90.)) * .004));

	// End Bulge.
	p = op.zyx;
	d = smin(d, cyl(p + vec3(0, .2, 0), vec2(.4, .4 - abs(p.y) * .6)), .3);

	// Viewscreen.
	p.yz += vec2(.1, -1.23);
	return min(d, smin(cyl(p, vec2(.8, .2)), -cyl(p - vec3(0, 0, 1.12), vec2(1.8, 1)), -.14));
}

float map(vec3 p) {
	float d = walls(p);
	p.y += 2.8;
	d = min(d, dais(p));
	p.xz *= mat2(.76484, -.64422, .64422, .76484);
	p.z = abs(p.z);
	return min(min(min(d, chair(p)), scope(p)), mounts(p));
}

vec3 N(vec3 p, float t) {
	float h = t * .1;
	vec3 n = vec3(0);
	for (int i = I0; i < 4; i++) {
		vec3 e = .005773 * (2. * vec3(((i + 3) >> 1) & 1, (i >> 1) & 1, i & 1) - 1.);
		n += e * map(p + e * h);
	}

	return normalize(n);
}

float shadow(vec3 p, vec3 ld, vec3 n) {
	// Quick abort if light is behind the normal.
	if (dot(ld, n) < -.1) return 0.;
	float d = 0.0;
	float s = 1.;
	float t = .05;
	float mxt = length(p - vec3(-20, 3, 3));
	for (float i = Z0; i < 30.; i++) {
		d = map(t * ld + p);
		s = min(s, 15. * d / t);
		t += max(.03, d);
		if (mxt - t < .5 || s < .001) break;
	}

	return S01(s);
}

// Quick 2-level ambient occlusion.
float ao(vec3 p, vec3 n) {
	const vec2 h = vec2(.1, 2);
	vec2 ao = vec2(0.0);
	for (int i = I0; i < 2; i++)
		ao[i] = map(h[i] * n + p);

	return sat(min2(ao / h));
}

// Sub-surface scattering. (Thanks Evvvvil)
float sss(vec3 p, vec3 ld) { return S01(map(1. * ld + p)); }

float fog(vec3 p) {
	float d = abs(p.x);
	d += 20. * S(-1.3, -4., p.y) * (.7 + .3 * n21(p.xz * 2.));
	return exp(d * d * -2e-4);
}

vec3 lights(vec3 p, vec3 rd, vec3 n) {
	vec2 ns = n331(p); // Cache noise.
	vec3 ld = normalize(vec3(-20, 3, 3) - p),
	     c = vec3(.5, .8, 1);
	c *= .3 - sum2(ns) * .06;
	c += sss(p, ld) * .1;
	float y = S(1.8, 0., length(p));
	y *= S(0., -.2, p.y + p.x + .7);
	c *= 1. + vec3(21, 19, 13) * (dot(ns, ns) * .6 + .4) * y;

	// Adjust specular power and brightness.
	y = sat(y * 6.);
	float sh1 = mix(2e2, 10., y);
	float sh2 = mix(5., .3, y);
	sh2 *= .8 * ns.x * ns.y + .2;
	vec3 l = sat(vec3(dot(ld, n),  // Key light.
	dot(-ld.xz, n.xz),  // Reverse light.
	n.y // Sky light.
	));
	l.xy = .1 + .9 * l.xy; // Diffuse.
	l.yz *= .1 + .9 * ao(p, n); // Ambient occlusion.
	l *= vec3(.05 + .95 * S(3., -10., p.x), .05, .02); // Light contributions (key, reverse, sky).
	l.x += pow(sat(dot(normalize(ld - rd), n)), sh1) * sh2; // Specular (Blinn-Phong)
	l.x *= .05 + .95 * shadow(p, ld, n); // Shadow.
	return mix((sum2(l.xy) * vec3(.6, .51, .42) + l.z * SKY_RGB) * c, SKY_RGB, S(.6, 1., 1. + dot(rd, n)) * .02);
}

float addFade(float a) { return min(1., abs(t - a)); }

vec3 scene(vec3 p, vec3 rd) {
	// March the scene.
	float i;
	float h = 0.0;
	float d = 1.;
	for (i = Z0; i < 120.; i++) {
		h = map(p);
		if (abs(h) < 2e-4 * d || d > 40.) break;
		d += h;
		p += h * rd;
	}

	vec3 col = mix(SKY_RGB, lights(p, rd, N(p, d)), fog(p));

	// Gamma.
	return pow(max(vec3(0), col), vec3(.4545));
}

void mainImage(out vec4 fragColor, vec2 fc) {
	t = mod(iTime, 30.);
	vec2 uv = (fc - .5 * R.xy) / R.y;
	vec3 ro = mix(vec3(-1, -1, -7), vec3(-1.1, -1.8, -3), S(0., 15., t));
	float f = S(15., 30., t);
	if (f > 0.) ro = vec3(1. - f * 4., cos(f * 6.283) + .5, -3);
	vec3 col = scene(ro, rayDir(ro, uv));

	// Blue tint.
	col = pow(col * 1.2, vec3(1.2, 1.1, 1));

	// Vignette.
	col *= 1. - .3 * dot(uv, uv);

	// Grain.
	col += (h21(fc) - .5) / 20.;
	fragColor = vec4(col * addFade(0.) * addFade(15.), 0);
}

#include <../common/main_shadertoy.frag>