// 'M-O'
// by dean_the_coder (Twitter: @deanthecoder)
//
// Processed by 'GLSL Shader Shrinker'
// (https://github.com/deanthecoder/GLSLShaderShrinker)
//
// Anyone remember 'M-O' from Pixar's 'Wall-E' movie?
// Here's my tribute to that little chap.
//
// Technically I wanted to practice writing a shader that
// performs well enough that I can enable anti-aliasing by
// default, has quite a small codebase (my shaders usually
// tend to be a bit on the large side), and doesn't require
// any external textures.
//
// With more GPU power I would have liked to make the red
// light spin around within refracted glass. I might
// come back to that if I ever get a more powerful laptop.
//
// Thanks to Evvvvil, Flopine, Nusan, BigWings, Iq, Shane
// and a bunch of others for sharing their knowledge!

// License: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License
#include <../common/common_header.frag>

float arms, time, g = 0.;

#define AA	// Enable this line if your GPU can take it!

struct Hit {
    float d; // SDF distance.
    int id; // Material ID.
    vec2 t; // uv texture coords.
};

float n21(vec2 p) {
    const vec3 s = vec3(7, 157, 0);
    vec2 h, ip = floor(p);
    p = fract(p);
    p = p * p * (3. - 2. * p);
    h = s.zy + dot(ip, s.xy);
    h = mix(fract(sin(h) * 43.5453), fract(sin(h + s.x) * 43.5453), p.x);
    return mix(h.x, h.y, p.y);
}

void minH(inout Hit a, Hit b) {
    if(b.d < a.d)
        a = b;
}

mat2 rot(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, s, -s, c);
}

float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.)) + min(max(q.x, max(q.y, q.z)), 0.);
}

float sdCyl(vec3 p, vec2 hr) {
    vec2 d = abs(vec2(length(p.zy), p.x)) - hr;
    return min(max(d.x, d.y), 0.) + length(max(d, 0.));
}

float sdTaper(vec2 p, vec3 r) {
    p.x = abs(p.x);
    p.y = -p.y;
    float b = (r.x - r.y) / r.z, a = sqrt(1. - b * b), k = dot(p, vec2(-b, a));
    if(k > a * r.z)
        return length(p - vec2(0, r.z)) - r.y;
    return (k < 0. ? length(p) : dot(p, vec2(a, b))) - r.x;
}

float sdArm(vec3 p, float c) {
    return max(max(sdTaper(p.yz, vec3(.5, .2, 2)), abs(abs(p.x) - 1.55)) - .1,  // Main arm.
    (p.z + 1.5 + sin(p.y * 7.) * .1) * c);
}

// The sine wave applied to the dirt track.
float trk(float z) {
    return sin(z * .2 - time);
}

// Map the scene using SDF functions.
Hit map(vec3 p) {
	// Floor.
    Hit h = Hit(length(p.y), 1, p.xz);

	// Walls.
    minH(h, Hit(min(dot(p, vec3(-.707, .707, 0)) + 9., dot(p, vec3(-1, 0, 0)) + 20.), 0, p.yz));

	// Wall lights.
    float f, b, d = sdBox(vec3(p.xy, mod(p.z - time * 8., 40.)) - vec3(20, 7.25, 20), vec3(.1, .1, 8));
    g += .01 / (.01 + d * d);
    minH(h, Hit(d - .7, 4, p.xy));
    p.x += trk(-.9);
    p.xz *= rot(trk(7.) * .2);

	// Ball.
    minH(h, Hit(length(p - vec3(0, 1, 0)) - 1., 2, p.xy));
    p.yz *= rot(-arms);
    p.y -= 1.7;
    minH(h, Hit(sdBox(p, vec3(1.2, .9, .8 + cos((p.y + 5.1) * 1.33) * .5)) - .2, 3, p.xy)); // Lower body.
    vec3 op = p;

	// Arms/Hands.
    p.y -= .5;
    p.yz *= rot(-arms);
    d = sdArm(p, -1.);
    p.z += arms + cos(time * 15.) * .1;
    minH(h, Hit(min(d, sdArm(p, 1.)), 0, op.xy));

	// Brush.
    b = .2 + .8 * abs(sin(p.x * 18.)) * .1;
    minH(h, Hit(sdCyl(p + vec3(0, 0, 2), vec2(.1 + b, 1.4)), 2, p.xy));

	// Arm extenders.
    p.x = abs(p.x) - 1.55;
    p.z++;
    minH(h, Hit(sdBox(p, vec3(.08, .22, .6)), 2, p.xz));

	// Head.
    p = op;
    p.yz *= rot(arms * -.7);
    p.xz *= rot(trk(0.) * .1);
    p.y -= 2.;
    p.z += .5;
    f = cos(p.y + .8);
    minH(h, Hit(max(sdBox(p, vec3(mix(1.2, 1.4, f), .8, mix(.9, 1.2, f))),  // Head.
    2.5 - length(p.yz + vec2(2.5, -.8)) // Rear cut-out.
    ) - .2, 6, p.xy));

	// Light - Top.
    p.y -= mix(.96, 2.5, arms);
    minH(h, Hit(sdBox(p, vec3(.5, .04, .5)), 3, p.xy));
    minH(h, Hit(sdBox(p + vec3(0, .3, 0), vec3(.45, .3, .45)), 5, p.xy));
    return h;
}

vec3 calcN(vec3 p) {
    const vec2 e = vec2(.024, -.024);
    return normalize(e.xyy * map(p + e.xyy).d + e.yyx * map(p + e.yyx).d + e.yxy * map(p + e.yxy).d + e.xxx * map(p + e.xxx).d);
}

float calcShadow(vec3 p, vec3 ld) {
    float h, s = 1., t = .1;
    for(int i = 0; i < 20; i++) {
        h = map(p + ld * t).d;
        s = min(s, 15. * h / t);
        t += h;
        if(s < .001 || t > 2.7)
            break;
    }

    return clamp(s, 0., 1.);
}

// Quick ambient occlusion.
float ao(vec3 p, vec3 n, float h) {
    return map(p + h * n).d / h;
}

/**********************************************************************************/
vec3 vig(vec3 c, vec2 fc) {
    vec2 q = fc.xy / iResolution.xy;
    c *= .5 + .5 * pow(16. * q.x * q.y * (1. - q.x) * (1. - q.y), .4);
    return c;
}

// Calculate the floor normal vector.
vec2 flrN(vec2 t) {
    return n21(vec2(t.x * 1.2, t.y)) * .3 +  // Surface texture.
        smoothstep(0., .04, abs(sin(t * .5)));
}

vec3 mat(Hit h, vec3 p, inout vec3 n) {
    if(h.id == 1) {
		// Floor
        vec2 d, t = h.t + vec2(trk(p.z), time * -5.);
        n.xz += flrN(vec2(h.t.x, t.y));
        n = normalize(n);
        float mm = n21(mod(t * 10., 20.));
        d = abs(vec2(abs(abs(t.x) - .8) - .3, mod(t.y, .4) - .1)) - vec2(.2, .1);
        return vec3(.3, .4, .5) * mix(1., mm, (1. - step(0., min(max(d.x, d.y), 0.))) * step(p.z, -2.5));
    }

    if(h.id == 2)
        return vec3(.1); // Ball, brush
    if(h.id == 3)
        return vec3(1. - step(abs(h.t.y + .7), .15) * .9); // White body
    if(h.id == 4)
        return vec3(25); // Wall light.
    if(h.id == 5)
        return vec3(1, 0, 0);
    if(h.id == 6) {
		// Face
        vec2 t = vec2(abs(h.t.x), h.t.y);
        if(t.y < -.3 && t.x < 1.) {
            t.x += arms * .4;
            float l = .3 + .7 * abs(sin(t.y * 50.));
            t *= rot(.6 * arms);
            return .01 + vec3(1.5, 1.5, 0) * step(abs(t.x - .3), .25) * step(abs(t.y + .7), .1 - arms * .1) * l;
        }
    }

    return vec3(1);
}

vec3 lights(vec3 p, vec3 rd, Hit h) {
    vec3 n = calcN(p), ld = normalize(vec3(6, 3, -10) - p);
    return mat(h, p, n) // Material color.
    * ((max(0., .1 + .9 * dot(ld, n)) // Primary light.
    + max(0., .1 + .9 * dot(ld * vec3(-1, 0, -1), n)) // Bounce light.
    ) * mix(.3, .6, calcShadow(p, ld)) // Shadows.
    * mix(ao(p, n, .3), ao(p, n, 2.), .7) // Ambient occlusion.
    + pow(max(0., dot(rd, reflect(ld, n))), 30.) // Specular.
    ) * vec3(2, 1.8, 1.7);
}

vec3 march(vec3 ro, vec3 rd) {
	// Raymarch.
    vec3 p, n, c;
    float d = .01;
    Hit h;
    for(int i = 0; i < 110; i++) {
        p = ro + rd * d;
        h = map(p);
        if(abs(h.d) < .0015)
            break;
        d += h.d;
    }

	// Calculate pixel color.
    c = lights(p, rd, h) + g;
    if(h.id == 1) {
		// Ray hit the floor - Apply reflection.
        n = calcN(p);
        n.xz -= flrN(p.xz - vec2(0, time * 5.)) * .024;
        rd = reflect(rd, normalize(n));
        d = .5;
        ro = p;
        for(int i = 0; i < 90; i++) {
            p = ro + rd * d;
            h = map(p);
            if(abs(h.d) < .0015)
                break;
            d += h.d;
        }

        if(abs(h.d) < .0015)
            c = mix(c, mat(h, p, n), .01);
    }

    return c;
}

void mainImage(out vec4 c, vec2 fc) {
    time = mod(iTime, 30.) - 1.;
    arms = (time < 0. ? smoothstep(-1., 0., time) : abs(sin(time * 10.) * .1) + .9) * .38;
    time = max(0., time);
    vec3 ro = vec3(-7, 4, -7. - sin(time * .3)), col = vec3(0);
#ifdef AA
    for(float dx = 0.; dx <= 1.; dx++) {
        for(float dy = 0.; dy <= 1.; dy++) {
            vec2 uv = (fc + vec2(dx, dy) * .5 - .5 * iResolution.xy) / iResolution.y;
#else
            vec2 uv = (fc - .5 * iResolution.xy) / iResolution.y;
#endif
            vec3 f = normalize(vec3(0, 3, -4) - ro), r = normalize(cross(vec3(0, 1, 0), f));
            col += march(ro, normalize(f + r * uv.x + cross(f, r) * uv.y));
#ifdef AA
        }
    }

    col /= 4.;
#endif
    c.rgb = vig(pow(col, vec3(.45)), fc);
}
#include <../common/main_shadertoy.frag>
