#include <../common/common_header.frag>

/*origianls https://glslsandbox.com/e#73866.0 and other*/

// source deleted
struct ray {
	vec3 p;
	vec3 d;
	vec3 light;
	vec3 transmit;
};
struct sphere {
	vec3 p;
	float r;
};
float raySphereDet(ray r, sphere s, inout float b) {
	vec3 rc = r.p - s.p;
	float c = dot(rc, rc);
	c -= s.r * s.r;
	b = dot(r.d, rc);
	return b * b - c;
}
precision highp float;

uniform vec2 resolution;
uniform float time;
uniform vec2 mouse;

const float PI = acos(-1.);
const float TAU = PI * 2.;

#define saturate(x) clamp(x,0.,2.)
#define _tail2x(p,n) (mod(p,1.)-2.)

float Hash(vec2 p, in float s) {
	return fract(sin(dot(vec3(p.xy, 10.0 * abs(sin(s))), vec3(27.1, 61.7, 12.4))) * 273758.5453123);
}

float noise(in vec2 p, in float s) {
	vec2 i = floor(p);
	vec2 f = fract(p);
	return mix(mix(Hash(i + vec2(0., 0.), s), Hash(i + vec2(1., 0.), s), f.x), mix(Hash(i + vec2(0., 1.), s), Hash(i + vec2(1., 1.), s), f.x), f.y) * s;
}

vec2 mPolar(vec2 p) {
	float a = atan(p.y, p.x);
	float r = length(p * 0.1);
	return vec2(a, r);
}

vec2 tailY2x(vec2 p, float n) {
	p += n;
	return vec2(p.x, _tail2x(p.x, p.y));
}

highp float rand(vec2 p) {
	highp float a = 12.9898;
	highp float b = 78.233;
	highp float c = 43758.5453;
	highp float dt = dot(p, vec2(a, b));
	highp float sn = mod(dt, 3.14);
	return fract(sin(sn) * c);
}

// signed distance
float sd(float d, float r) {
	return r - d;
}
float sd(float d) {
	return 1. - d;
} 
// glow + fill
float gf(float d, float r) {
	return r / d;
}
float gf(float d) {
	return 1. / d;
}

float fill_na(float d) {
	return step(0., d);
}
float fill(float d) {
	return smoothstep(0., 0.01, d);
}
float stroke(float d, float w) {
	return 1. - smoothstep(w, w + 0.01, abs(d));
}
float strokeInner(float d, float w) {
	return stroke(d - w, w);
}
float strokeOuter(float d, float w) {
	return stroke(d + w, w);
}

float lSquare(vec2 p) {
	p = abs(p);
	return max(p.x, p.y);
}

float lPoly(vec2 p, float n) {
	float a = atan(p.x, p.y) + PI;
	float r = TAU / n;
	return cos(floor(0.5 + a / r) * r - a) * length(p) / cos(r * .5);
}

float strokeStar(vec2 p, float n, float w) {
	float l = strokeInner(sd(lPoly(p, n * .5)), w);
	l += strokeInner(sd(lPoly(mod(n, 2.) != 0. ? vec2(-p.x, p.y) : p, n * .05)), w);
	return l;
}

vec2 mPoly(vec2 p, float n, float s) {
	float r = TAU / n;
	float a = floor(atan(p.y, p.x) / r) * r + r * .5;
	return (vec2(cos(a), sin(a)) * s - p);
}

float wsaw(float x) {
	return fract(x * .5 + .5) * 2. - 1.;
}
float wtri(float x) {
	return abs(2. * fract(x * .5 - .25) - 1.) * 2. - 1.;
}
float utri(float x) {
	return abs(2. * fract(x * 1.5 - .5) - 1.);
}
float wtrz(float x, float w) {
	return clamp(wtri(x * 2.) * w, -1., 1.);
} // 台形波 trapezoidal wave

// ease
float o2(float t) {
	t = 1. - t;
	return 1. - t * t;
}
float oN(float t, float n) {
	return 1. - pow(1. - t, n);
}

float dot2(vec2 p) {
	return dot(p, p);
}

vec2 mSimplePerspective(vec2 p) {
	p.y += .2;
	p.y *= 3.;
	return p;
}

float ring(vec2 p, float t) {
	float alpha = fract(-t);
	float l = 0.;
	vec2 p3 = mPoly(p, 1., 1.);
	l += saturate(gf(abs(p3.x), .03) * fill(sd(length(p), 1.1 + fract(t))) * (1. - fill(sd(length(p), .9 + fract(t)))));

	l += saturate(.02 / abs(sd(length(p), 1.1 + fract(t))) * alpha);
	vec2 p4 = mPolar(p * (1.57 - oN(t, 1.3) * .28)).yx;

	l += saturate(abs(1. / ((p4.x) * 50.0)) * sd(1., .9) * alpha);
	return l;
}

float summoningCircle(vec2 p) {
	float l = 0.;

	l = saturate(l);

	l = saturate(l);
	float r = atan(p.y, p.x);
	l += strokeOuter(sd(length(p), .98), .008 + wtrz(r / TAU * 3., 12.) * .005);
	l += strokeInner(sd(length(p), .95), .005);
	l += strokeInner(sd(lPoly(p, 3.)), .01);
	l += strokeInner(sd(lPoly(p, 3.), .88), .02);
	l += strokeInner(sd(lPoly(p, 6.), .53), .01);
	vec2 q = mPoly(p, 3., .5);
	l += fill(sd(lPoly(q, 3.), .3));
	vec2 q2 = mPoly(p, 3., .7);
	l += fill(sd(lPoly(q2, 3.), .1));
	l += strokeInner(sd(lPoly(p, 3.), .5), .02);
	l += fill(sd(length(p), .05));
	vec2 q3 = mPoly(p, 3., 1.);
	l = saturate(l);
	l -= fill(sd(length(q3), .2));
	l = saturate(l);
	l += strokeInner(sd(length(q3), .18), .005);
	l += strokeInner(sd(length(q3), .15), .005);

	return l;
}

float render(vec2 p) {
	float time = iTime * 0.1;
	p.xy *= mat2(cos(-iTime), sin(-iTime), -sin(-iTime), cos(-iTime));

	p *= 5.;
	float tt = time * 1.75;
	float l2 = ring(p, o2(fract(tt)));
	l2 += ring(p, o2(fract(tt + .5)));
	float l = 0.;
	l = summoningCircle(p *= 3.);
	return l + l2;
}

float rayIntersectsSphere(ray r, sphere s, inout vec3 nml, float closestHit) {
	float b;
	float d = raySphereDet(r, s, b);
	if(d < 0.0) {
		return closestHit;
	}
	float t = -b - sqrt(d);
	float nd = sign(t);
	if(t < 0.0) {
		t += 2.0 * sqrt(d);
	}
	if(t < 0.0 || t > closestHit) {
		return closestHit;
	}
	nml = nd * normalize(s.p - (r.p + r.d * t));
	return t;
}
vec3 shadeBg(vec3 nml) {
	vec3 lightPos_ = vec3(-cos(iTime) * -12.0, 3.5 + sin(iTime * 2.05) * 8.0, (sin(iTime) * 12.0 - 5.4));
	vec3 bgLight = normalize(lightPos_);
	vec3 lightPos = bgLight * 9999.0;
	vec3 sun = vec3(5.0, 4.0, 2.0);
	vec3 bgCol = vec3(0.2, 0.15, 0.1);
	float bgDiff = dot(nml, vec3(0.0, 1.0, 0.0));
	float sunPow = dot(nml, bgLight);
	bgCol += 0.1 * sun * pow(max(sunPow, 0.0), 2.0);
	bgCol += 2.0 * bgCol * pow(max(-sunPow, 0.0), 2.0);
	bgCol += max(-0.5, bgDiff) * vec3(0.25, 0.5, 0.5);
	bgCol += sun * pow(max(sunPow, 0.0), 256.0);
	bgCol += bgCol * pow(max(sunPow, 0.0), 128.0 + abs(bgLight.y) * 128.0);
	return max(vec3(0.0), bgCol);
}
mat3 rotationXY(vec2 angle) {
	float cp = cos(angle.x);
	float sp = sin(angle.x);
	float cy = cos(angle.y);
	float sy = sin(angle.y);

	return mat3(cy, 0.0, -sy, sy * sp, cp, cy * sp, sy * cp, -sp, cy * cp);
}
bool getBit(float n, float i) {
	return (mod(n / pow(2.0, i), 2.0) < 1.0);
}

float scene(inout ray r, inout vec3 nml) {
	float dist;
	sphere s;
	dist = 10000.0;
	s.p = vec3(0.0);
	s.r = 0.95;
	dist = rayIntersectsSphere(r, s, nml, dist);
	s.p = vec3(1.0, 1.0, -1.0);
	s.r = 0.35;
	dist = rayIntersectsSphere(r, s, nml, dist);
	s.p = vec3(1.0, -1.0, 1.0);
	dist = rayIntersectsSphere(r, s, nml, dist);
	s.p = vec3(-1.0, -1.0, -1.0);
	dist = rayIntersectsSphere(r, s, nml, dist);
	s.p = vec3(-1.0, 1.0, 1.0);
	dist = rayIntersectsSphere(r, s, nml, dist);
	return dist;
}
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
	//vec2 aspect = vec2(iResolution.x / iResolution.y, 1.0);
	vec2 uv = 4.0 * (fragCoord.xy - 0.5 * iResolution.xy) / min(iResolution.x, iResolution.y);

	mat3 rot = rotationXY(vec2(iTime, iTime * 0.32));
	vec2 resolution = iResolution.xy;
	vec2 p = (fragCoord.xy * 2.0 - resolution) / max(resolution.x, resolution.y);
	float l = 0.;
	l = (render(p) + render(p + vec2(0., 1. / min(resolution.x, resolution.y)))) * 1.5;

	ray r;
	r.p = vec3(uv, 6.0);
	r.d = normalize(vec3(0., 0., -1.0));
	r.d *= rot;
	r.p *= rot;
	r.transmit = vec3(1.0);
	r.light = vec3(0.0);

	float epsilon = 0.015;
	float rayCount = 0.0, rayBounceCount = 0.0;
	bool rayComplete = false;
	float maxRays = 16.0;
	float maxBounceCount = 5.0;
	for(int i = 0; i < 16 * 4; i++) {
		vec3 nml;
		float dist = scene(r, nml);

		if(dist != 10000.0) {
			r.p += r.d * dist;
			float f = pow(1.0 - clamp(0.0, 1.0, dot(nml, r.d)), 5.0);
			if(!getBit(rayCount, rayBounceCount)) {
				r.d = reflect(r.d, nml);
				r.transmit *= (1.0 + f) * vec3(0.95);
			} else {
				float eta = 1.000239 / 1.15;
				r.d = refract(r.d, -nml, eta);
				r.transmit *= (1.0 - f) * vec3(1.0);
			}

			rayBounceCount++;
			if(rayBounceCount > maxBounceCount) {
				rayComplete = true;
			}
			r.p += r.d * epsilon;

		} else {
			r.light += r.transmit * shadeBg(-r.d);
			rayComplete = true;

		}

		if(rayComplete) {

			rayComplete = false;
			rayCount++;
			if(rayBounceCount == 0.0 || rayCount == maxRays) {
				break;
			}
			rayBounceCount = 0.0;
			r.p = vec3(uv * 0.2, -3.0);
			r.d = normalize(vec3(uv, 1.0));
			r.d *= rot;
			r.p *= rot;
			r.transmit = vec3(1.0);
		}
	}
	fragColor = vec4(1.0 - exp(-r.light / rayCount * 2.5), 1.0);
	fragColor += vec4(l * vec3(0.75, 0.5, .05) * 2., 1.0);
}

#include <../common/main_shadertoy.frag>