// --- Migrate Log ---
// 初始化局部变量以避免未定义行为
// 将位移/位与操作替换为兼容函数（SkSL 不支持 >> 和 &）
// 将 for 循环的浮点索引替换为整数索引
// 定义 ZERO 宏以替换 min(iFrame, 0) 的混合类型用法
// --- Migrate Log (EN) ---
// Initialize local variables to avoid undefined behavior
// Replace bitshift/bitwise ops with compatible helper functions (SkSL doesn't support >> and &)
// Replace float loop counters with int counters
// Define ZERO macro to replace min(iFrame, 0) mixed-type usage

#include <../common/common_header.frag>

#define ZERO int(min(iFrame, 0.0))

int bit(int v, int sh) {
    // Returns the bit (0 or 1) of v at position sh.
    // Implemented using floor and mod to avoid >> and & operators.
    return int(mod(floor(float(v) / pow(2.0, float(sh))), 2.0));
}

float T = 0.0, g = 0.0;
struct Hit {
	float d;
	int id;
	vec3 uv;
};

// Thanks Dave Hoskins - https://www.shadertoy.com/view/4djSRW
vec4 hash44(vec4 p4) {
	p4 = fract(p4 * vec4(.1031, .103, .0973, .1099));
	p4 += dot(p4, p4.wzxy + 33.33);
	return fract((p4.xxyz + p4.yzzw) * p4.zywx);
}

// Thanks Shane - https://www.shadertoy.com/view/lstGRB
float n31(vec3 p) {
	const vec3 s = vec3(7, 157, 113);
	vec3 ip = floor(p);
	p = fract(p);
	p = p * p * (3. - 2. * p);
	vec4 h = vec4(0, s.yz, s.y + s.z) + dot(ip, s);
	h = mix(hash44(h), hash44(h + s.x), p.x);
	h.xy = mix(h.xz, h.yw, p.y);
	return mix(h.x, h.y, p.z);
}

void minH(inout Hit a, Hit b) { if (b.d < a.d) a = b; }

mat2 rot(float a) {
	float c = cos(a),
	      s = sin(a);
	return mat2(c, s, -s, c);
}

vec2 opModPolar(vec2 p, float n, float o) {
	float angle = 3.141 / n,
	      a = mod(atan(p.y, p.x) + angle + o, 2. * angle) - angle;
	return length(p) * vec2(cos(a), sin(a));
}

float sdHex(vec3 p, vec2 h) {
	const vec3 k = vec3(-.866, .5, .577);
	p = abs(p);
	p.xy -= 2. * min(dot(k.xy, p.xy), 0.) * k.xy;
	vec2 d = vec2(length(p.xy - vec2(clamp(p.x, -k.z * h.x, k.z * h.x), h.x)) * sign(p.y - h.x), p.z - h.y);
	return min(max(d.x, d.y), 0.) + length(max(d, 0.));
}

float sdBox(vec3 p, vec3 b) {
	vec3 q = abs(p) - b;
	return length(max(q, 0.)) + min(max(q.x, max(q.y, q.z)), 0.);
}

float sdPlane(vec3 p, vec3 n) { return dot(p, n); }

float dot2(vec3 a) { return dot(a, a); }

float sdTri(vec3 p, vec3 a, vec3 b, vec3 c) {
	vec3 ba = b - a,
	     pa = p - a,
	     cb = c - b,
	     pb = p - b,
	     ac = a - c,
	     pc = p - c,
	     n = cross(ba, ac);
	return sqrt((sign(dot(cross(ba, n), pa)) + sign(dot(cross(cb, n), pb)) + sign(dot(cross(ac, n), pc)) < 2.) ? min(min(dot2(ba * clamp(dot(ba, pa) / dot2(ba), 0., 1.) - pa), dot2(cb * clamp(dot(cb, pb) / dot2(cb), 0., 1.) - pb)), dot2(ac * clamp(dot(ac, pc) / dot2(ac), 0., 1.) - pc)) : dot(n, pa) * dot(n, pa) / dot2(n));
}

float sdCyl(vec3 p, vec2 hr) {
	vec2 d = abs(vec2(length(p.xy), p.z)) - hr;
	return min(max(d.x, d.y), 0.) + length(max(d, 0.));
}

vec3 getRayDir(vec3 ro, vec3 lookAt, vec2 uv) {
	vec3 f = normalize(lookAt - ro),
	     r = normalize(cross(vec3(0, 1, 0), f));
	return normalize(f + r * uv.x + cross(f, r) * uv.y);
}

Hit sdWings(vec3 p) {
	p.xy = abs(p.xy);
	p.z = abs(p.z) - 2.3;
	return Hit(min(sdTri(p, vec3(0), vec3(2, 3, 0), vec3(-2, 3, 0)), sdTri(p, vec3(0), vec3(3.3, 0, 0), vec3(2, 3, 0))) - .03, 2, p);
}

Hit sdTie(vec3 p) {
	p = p.zyx - vec3(10, 0, 0);

	// Wings.
	Hit h = sdWings(p);
	if (h.d > 2.5) return h; // Bail early - Point is too far away.
	// Wing ribs.
	vec3 op = p;
	p.xy = abs(p.xy);
	p.z = abs(p.z) - 2.3;
	float f = 0.0,
	      d = 0.0;
	if ((f = abs(p.y)) < .1) d = .03 + step(f, .025) * .02;
	else if ((f = abs(p.y - p.x * 1.5)) < .15) d = .03 + step(f, .025) * .02;
	else if (abs(p.y - 3.) < .1) d = .03;
	else if (abs(p.x - 3.3 + p.y * .43) < .1) d = .03;

	if (d > 0.) {
		h.d -= d;
		h.id = 1;
	}

	// Wing center hexes.
	d = min(sdHex(p, vec2(.7, .06)), sdHex(p, vec2(.5, .12)));

	// Crossbar.
	d = min(d, sdCyl(op, vec2(mix(.21, .23, step(p.y, .04)), 2.3))); // Main bar
	p.z = abs(p.z + .8) - .5;
	f = sdCyl(p, vec2(mix(.21, .33, (p.z + .33) / .48), .24));
	p.x -= .25;
	p.z += .02;
	d = min(d, max(f, -sdBox(p, vec3(.1, .4, .08)))); // Join to wing/cockpit.
	p = op;
	p.yz = abs(p.yz);
	minH(h, Hit(min(d, sdTri(p, vec3(0), vec3(0, .8, 0), vec3(0, 0, 2)) - .05), 1, p)); // Triangle cockpit supports.
	// Cockpit - Sphere.
	f = step(.75, p.y);
	minH(h, Hit(length(op) - .9 - .02 * (f + step(p.y, .03) + f * step(p.z, .1)), 6, p));

	// Cockpit - Glass.
	p = op;
	p.x += .27;
	p.yz = opModPolar(p.yz, 8., .4);
	minH(h, Hit(max(length(p) - .7, sdPlane(p + vec3(.77, 0, 0), vec3(vec2(-1, 0) * rot(.5), 0))), 3, p));

	// Cockpit - Window frame.
	minH(h, Hit(max(length(p) - .71, .45 - length(p.yz)), 5, p));

	// Gunz.
	p = op;
	p.x += .7;
	p.y += .6;
	p.z = abs(p.z) - .2;
	minH(h, Hit(sdCyl(p.zyx, vec2(.05, .2)), 7, p));
	return h;
}

// Position of the lead TIE.
vec3 tiePos(vec3 p, float t) {
	float x = cos(t * .7);
	p += vec3(x, cos(t), sin(t * 1.1));
	p.xy *= rot(x * -.1);
	return p;
}

Hit sdTies(vec3 p) {
	vec3 op = p;

	// Front tie.
	p = tiePos(p, T);
	Hit h = sdTie(p);
	if (sin(T) - step(T, 0.) * 10. > -.7) {
		// Weapon fire.
		p.x = abs(p.x) - .2;
		p.y += .6;
		p.z = mod(p.z + T * 50., 8.) - 4.;
		float x = max(sdCyl(p, vec2(.03, 1)), op.z - 8.);
		minH(h, Hit(x, 9, p));
		g += .001 / (.01 + x * x);
	}

	// Rear tie.
	if (h.d > .0015) {
		float x = -cos(T);
		p = op + vec3(14, -4. - .5 * cos(T * .5), -20. + 4. * sin(T * .6));
		p.xy *= rot(x * -.1);
		minH(h, sdTie(p));
	}

	return h;
}

Hit sdTerrain(vec3 p) {
	p.z -= T * 7e2; // Number controls the terrain speed.
	vec2 d = sin(p.xz * vec2(.01476, .01345)) * 10. + sin(p.xz * vec2(.05212, .04512)) * 2.;
	return Hit(abs(p.y - d.x + d.y + 25.), 4, p);
}

Hit map(vec3 p) {
	Hit h = sdTerrain(p);
	minH(h, sdTies(p));
	return h;
}

vec3 calcN(vec3 p, float t) {
	float h = t * .2;
	vec3 n = vec3(0);
	for (int i = ZERO; i < 4; i++) {
		vec3 bits = vec3(float(bit(i + 3, 1)), float(bit(i, 1)), float(bit(i, 0)));
		vec3 e = .005773 * (2. * bits - 1.);
		n += e * sdTies(p + e * h).d;
	}

	return normalize(n);
}

// Terrian normal.
// (Special case, but faster than using the SDF for the entire scene.)
vec3 calcTN(vec3 p, float t) {
	float h = t * 2.;
	vec3 n = vec3(0);
	for (int i = ZERO; i < 4; i++) {
		vec3 bits = vec3(float(bit(i + 3, 1)), float(bit(i, 1)), float(bit(i, 0)));
		vec3 e = .005773 * (2. * bits - 1.);
		n += e * sdTerrain(p + e * h).d;
	}

	return normalize(n);
}

// Note: For performance, shadows are only cast by tie fighters.
float calcShadow(vec3 p, vec3 ld) {
	// Thanks iq.
	float s = 1.,
	      t = 1.;
	for (int iter = 0; iter < 30; iter++) {
		float h = sdTies(p + ld * t).d;
		s = min(s, 30. * h / t);
		t += h;
		if (s < .001 || t > 1e2) break;
	}

	return clamp(s, 0., 1.);
}

// Note: For performance, occlusion only applied to tie fighters.
float ao(vec3 p, vec3 n, float h) { return clamp(sdTies(p + h * n).d / h, 0., 1.); }

// Sub-surface scattering (Applied to the snow).
#define SSS(h)	clamp(sdTerrain(p + ld * h).d / h, 0., 1.)

/**********************************************************************************/
vec3 vignette(vec3 c, vec2 fc) {
	vec2 q = fc.xy / iResolution.xy;
	c *= .5 + .5 * pow(16. * q.x * q.y * (1. - q.x) * (1. - q.y), .4);
	return c;
}

vec3 lights(vec3 p, vec3 rd, float d, Hit h) {
	float am = 0.0, ldt = 0.0, l = 0.0, spe = 0.0,
	      sped = 4.0;
	vec3 c = vec3(0.0), n = vec3(0.0), lig = vec3(0.0),
	     ld = normalize(vec3(30, 50, -40) - p);
	if (h.id == 4) {
		// Snow
		c = vec3(1.2 + SSS(1.) * .44);
		n = normalize(calcTN(p, d) + n31(h.uv) * .1);
		am = mix(.3, .9, sdTerrain(p + n).d);
		sped = .4;
	}
	else {
		n = calcN(p, d);
		am = mix(ao(p, n, .5), ao(p, n, 1.2), .75);
		if (h.id == 1 || h.id == 6) {
			// Metal
			c = vec3(.3 - n31(h.uv * 18.7) * .1);
			sped = .5;
			if (h.id == 6) c *= 1. - .8 * step(abs(atan(h.uv.y, h.uv.z) - .8), .01); // Cockpit.
		}
		else if (h.id == 2) {
			// Black wing area.
			if (h.uv.x < h.uv.y * .7) h.uv.y = 0.;
			c = vec3(.005 + .045 * pow(abs(sin((h.uv.x - h.uv.y) * 12.)), 20.));
			sped = .2;
		}
		else if (h.id == 7) {
			// Gunz.
			c = vec3(.02);
			sped = .2;
		}
		else if (h.id == 3) c = vec3(.05); // Cockpit glass.
		else if (h.id == 5) c = vec3(.1); // Glass surround.
		else c = vec3(.3, 1, .3); // Fire!
	}

	// Primary light.
	ldt = dot(ld, n);
	l = max(0., .2 + .8 * ldt) + max(0., .2 - .8 * ldt) * .3;
	spe = smoothstep(0., 1., pow(max(0., dot(rd, reflect(ld, n))), 50.)) * sped;

	// Combine.
	lig = l * am * mix(.4, 1., calcShadow(p, ld)) * vec3(2, 1.8, 1.7) + clamp(n.y, .05, 1.) * vec3(.9, .95, 1); // Sky light.
	return c * lig + spe;
}

vec3 march(vec3 ro, vec3 rd) {
	// Raymarch.
	vec3 p = vec3(0.0), c = vec3(0.0);
	float gg = 0.0,
	      d = .01;
	Hit h = Hit(1e6, 0, vec3(0.0));
	for (int iter = 0; iter < 120; iter++) {
		p = ro + rd * d;
		h = map(p);
		if (abs(h.d) < .0015 || d > 6e2) break;
		d += h.d; // No hit, so keep marching.
	}

	gg = g; // Cache the 'glow'.
	if (d > 6e2) c = vec3(.85, .9, 1);
	else c = mix(lights(p, rd, d, h), vec3(1), smoothstep(2e2, 540., d));

	c += gg * vec3(0, 1, 0);
	if (h.id == 3 || h.id == 1) {
		// Reflections applied to cockpit glass and tie metal.
		rd = reflect(rd, calcN(p, d));
		float alpha = (h.id == 3 ? .4 : .2) * smoothstep(0., 1., -rd.y);
		if (alpha < .001) return c; // Only reflect downwards.
		d = .01;
		ro = p;
		for (int iter = 0; iter < 40; iter++) {
			p = ro + rd * d;
			h = sdTerrain(p);
			if (abs(h.d) < .0015 || d > 3e2) break;
			d += h.d; // No hit, so keep marching.
		}

		// Combine a % of the reflected color.
		c = mix(c, d > 3e2 ? vec3(1) : lights(p, rd, d, h), alpha);
	}

	return c;
}

void mainImage(out vec4 fragColor, vec2 fc) {
	T = mod(iTime, 40.) - 4.;
	g = 0.;
	float t = smoothstep(0., 5., T);
	vec3 lookAt = mix(vec3(0, 0, 6) - tiePos(vec3(0), T - .2), vec3(2.5, 0, 0), t),
	     ro = mix(lookAt - vec3(0, 0, 1), vec3(4. + cos(T), sin(T) * .2, -8. + cos(T * .2) * 6.), t);
	fragColor = vec4(vignette(pow(march(ro, getRayDir(ro, lookAt, (fc - .5 * iResolution.xy) / iResolution.y)), vec3(.45)), fc), 0);
}

#include <../common/main_shadertoy.frag>
