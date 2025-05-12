/*originals https://glslsandbox.com/e#53340.0 https://glslsandbox.com/e#53541.1*/

#include <../common/common_header.frag>
#define R(p,a,r)mix(a*dot(p,a),p,cos(r))+sin(r)*cross(p,a)
#define H(h)(cos((h)*6.3+vec3(23,43,31))*.5+.5)
const mat3 m = mat3(0.00, 0.80, 0.60, -0.80, 0.36, -0.48, -0.60, -0.48, 0.64);

float hash(float n) {
    return fract(sin(n) * 43758.5453);
}

float noise(in vec3 x) { // in [0,1]
    vec3 p = floor(x);
    vec3 f = fract(x);

    f = f * f * (3. - 2. * f);

    float n = p.x + p.y * 57. + 113. * p.z;

    float res = mix(mix(mix(hash(n + 0.), hash(n + 1.), f.x), mix(hash(n + 57.), hash(n + 58.), f.x), f.y), mix(mix(hash(n + 113.), hash(n + 114.), f.x), mix(hash(n + 170.), hash(n + 171.), f.x), f.y), f.z);
    return res;
}

float snoise(in vec3 x) {
    return noise(x) * 2.0 - 1.0;
}

float sfbm(vec3 p) { // in [-1,1]
    float f;
    f = 0.5000 * snoise(p);
    p = m * p * 2.02;
    f += 0.2500 * snoise(p);
    p = m * p * 2.03;
    f += 0.1250 * snoise(p);
    p = m * p * 2.01;
    f += 0.0625 * snoise(p);
    return f;
}

// --------------------------------------------------------
// SDF
// https://iquilezles.org/articles/distfunctions
// --------------------------------------------------------

float sdSphere(vec3 p, float s) {
    return length(p) - s;
}

float sdBox(vec3 p, vec3 b) {
    vec3 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, max(d.y, d.z)), 0.0); // remove this line for an only partially signed sdf 
}

float opSmoothUnion(float d1, float d2, float k) {
    float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
    return mix(d2, d1, h) - k * h * (1.0 - h);
}

float opSmoothSubtraction(float d1, float d2, float k) {
    float h = clamp(0.5 - 0.5 * (d2 + d1) / k, 0.0, 1.0);
    return mix(d2, -d1, h) + k * h * (1.0 - h);
}

float opSmoothIntersection(float d1, float d2, float k) {
    float h = clamp(0.5 - 0.5 * (d2 - d1) / k, 0.0, 1.0);
    return mix(d2, d1, h) + k * h * (1.0 - h);
}

// --------------------------------------------------------
// Spectrum colour palette
// IQ https://www.shadertoy.com/view/ll2GD3	
// --------------------------------------------------------

vec3 pal(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {
    return a + b * cos(6.28318 * (c * t + d));
}

vec3 spectrum(float n) {
    return pal(n, vec3(0.5, 0.5, 0.5), vec3(0.5, 0.5, 0.5), vec3(1.0, 1.0, 1.0), vec3(0.0, 0.33, 0.67));
}

// --------------------------------------------------------
// Main SDF
// --------------------------------------------------------

float map(vec3 p) {

    float d1, d2;

    vec3 p2 = p;
    p2.x += 0.1 * sin(iTime + 2.0 * p.y);
    p2.y += 0.1 * sin(iTime + 2.0 * p.x);
    p2.z += 0.1 * sin(iTime + 2.0 * p.y);

    d1 = sdSphere(p, 2.0);
    d2 = sfbm(p2 * 1.5 + sin(0.1 * iTime));

    float d = opSmoothSubtraction(d2, d1, 0.0);

    return d;
}

// --------------------------------------------------------
// Rendering
// raytracing colorization by Thomas Hooper.
// https://www.shadertoy.com/view/WdB3Dw
// --------------------------------------------------------

mat3 calcLookAtMatrix(vec3 ro, vec3 ta, vec3 up) {
    vec3 ww = normalize(ta - ro);
    vec3 uu = normalize(cross(ww, up));
    vec3 vv = normalize(cross(uu, ww));
    return mat3(uu, vv, ww);
}       

#define boxsize 1.5

#define time iTime
#define mouse iMouse.xy
#define resolution iResolution.xy 
float box(vec3 p) {
    vec3 d = abs(p) - boxsize;
    return length(max(d, 0.0)) + min(max(d.x, max(d.y, d.z)), 0.0);
}

vec3 Julia(vec2 p, vec2 c) {
    vec2 s = p * 0.8;
    float d = 0.0, l;
    for(int i = 0; i < 256; i++) {
        s = vec2(s.x * s.x - s.y * s.y + c.x, 2.0 * s.x * s.y + c.y);
        l = length(s);
        d += l + 0.2;
        if(l > 2.0)
            break;
    }
    return vec3(sin(d * 0.3), sin(d * 0.2), sin(d * 0.1)) / (1.0 + 0.2 * length(s));
}

vec3 mandelbrot(vec2 p) {
    const float pi = atan(1.0) * 4.0, a = 0.315 / 2.0;
    float ang = mod(time * 0.01, 4.0 * pi);
    float t = cos(ang), r = 0.5 * (1. - t);

    vec2 c1 = vec2((r + 0.005) * t + 0.25, (r + 0.005) * sin(ang));
    vec2 c2 = vec2(0.251 * cos(ang) - 1.0, 0.251 * sin(ang));
    vec2 c3 = vec2(0.25 / 4.0 * cos(ang) - 1.0 - 0.25 - 0.25 / 4.0, 0.25 / 4.0 * sin(ang));
    vec2 c4 = vec2(-0.125, 0.7445) + 0.095 * vec2(cos(ang), sin(ang));
    vec2 c5 = vec2((a + 0.5 * a) * cos(ang) - 0.5 * a * cos(3.0 * ang), (a + 0.5 * a) * sin(ang) - 0.5 * a * sin(3.0 * ang));
    vec2 c6 = vec2(0.0, 1.087) + 0.158 * (1.0 - sin(ang)) * vec2(cos(ang), sin(ang));
    vec2 c7 = vec2(4.0 * a * cos(ang) - a * cos(4.0 * ang), 4.0 * a * sin(ang) - a * sin(4.0 * ang));
    vec2 c = (ang < 2.0 * pi) ? c1 : c2;
    p.x += 1.5;
    vec2 s = p * 0.5;
    float d = 0.0, l;
    for(int i = 0; i < 256; i++) {
        s = vec2(s.x * s.x - s.y * s.y + p.x, 2.0 * s.x * s.y + p.y);
        l = length(s);
        d += l + 0.2;
        if(length(p - c) < 0.01)
            return vec3(1.0);
        if(l > 2.0)
            break;
    }
    return vec3(sin(d * 0.31), sin(d * 0.2), sin(d * 0.1)) / (1.0 + 0.2 * length(p));
}
float calcolor(vec2 pos) {
    float s = 0.2;
    pos = mod(pos, 2.0 * s) - s;
    pos = abs(pos);
    float d = pos.x + pos.y - s, e = min(pos.x, pos.y), f = length(pos) - s * 0.5 * sqrt(2.0), g = length(pos - vec2(s, s)) - s, h = length(pos - 0.5 * vec2(s, s)) - 0.5 * s;
    return smoothstep(0.01, 0.0, min(abs(h), min(abs(g), min(abs(f), min(abs(d) / 1.414, e)))));
}
float trace(vec3 p, vec3 dir, out vec3 target) {
    float d, td = 0.0;
    for(int i = 0; i < 50; i++) {
        d = box(p / 1.0);
        p += dir * d;
        td += d;
        if(d < 0.001)
            break;
    }
    target = p;
    return td;
}
vec3 getcolor(vec3 p, vec3 dir) {
    const float pi = atan(1.0) * 4.0, a = 0.315 / 2.0;
    float ang = mod(time * 0.01, 4.0 * pi);
    float t = cos(ang), r = 0.5 * (1. - t);

    vec2 c1 = vec2((r + 0.005) * t + 0.25, (r + 0.005) * sin(ang));
    vec2 c2 = vec2(0.251 * cos(ang) - 1.0, 0.251 * sin(ang));
    vec2 c3 = vec2(0.25 / 4.0 * cos(ang) - 1.0 - 0.25 - 0.25 / 4.0, 0.25 / 4.0 * sin(ang));
    vec2 c4 = vec2(-0.125, 0.7445) + 0.095 * vec2(cos(ang), sin(ang));
    vec2 c5 = vec2((a + 0.5 * a) * cos(ang) - 0.5 * a * cos(3.0 * ang), (a + 0.5 * a) * sin(ang) - 0.5 * a * sin(3.0 * ang));
    vec2 c6 = vec2(0.0, 1.087) + 0.158 * (1.0 - sin(ang)) * vec2(cos(ang), sin(ang));
    vec2 c7 = vec2(4.0 * a * cos(ang) - a * cos(4.0 * ang), 4.0 * a * sin(ang) - a * sin(4.0 * ang));
    vec2 c = (ang < 2.0 * pi) ? c1 : c2;
    vec3 target, color;
    float d = trace(p, dir, target);
    vec2 pos;

    if(d < 4.0) {
        vec3 q = abs(target);
        if(abs(q.x - boxsize) < 0.002) {
            pos = target.yz;
            color = Julia(2.0 * pos, c3);
        } else if(abs(q.y - boxsize) < 0.002) {
            pos = target.xz;
            color = Julia(2.0 * pos, c1);
        } else if(abs(q.z - boxsize) < 0.002) {
            pos = target.xy;
            color = Julia(2.0 * pos, c2);
        }
    }
    return color;
}
vec4 mul4(vec4 a, vec4 b) {
    return vec4(a.xyz * b.w + a.w * b.xyz - cross(a.xyz, b.xyz), a.w * b.w - dot(a.xyz, b.xyz));
}
vec4 inv4(vec4 a) {
    a.xyz = -a.xyz;
    return a / dot(a, a);
}
vec3 rotate(vec3 pos, vec3 dir, float ang) {
    dir = normalize(dir);
    vec4 q = vec4(dir * sin(ang * 0.5), cos(0.5 * ang));
    vec4 pos1 = vec4(pos, 1.0);
    q = mul4(q, mul4(pos1, inv4(q)));
    return q.xyz;
}

void mainImage(out vec4 O, vec2 C) {
    O = vec4(0);

    vec3 camPos = vec3(0, -7, -7);
    vec3 camTar = vec3(0, 0, 0);
    vec3 camUp = vec3(0, 0, -1);
    mat3 camMat = calcLookAtMatrix(camPos, camTar, camUp);
    float focalLength = 5.;
    vec2 p = (-iResolution.xy + 2. * C.xy) / iResolution.y;
    vec2 position = 2.0 * (2.0 * gl_FragCoord.xy - resolution.xy) / min(resolution.x, resolution.y);
    vec3 pos = vec3(position, 3.0), dir = normalize(pos - vec3(0.0, 0.0, 8.0)), rotdir = normalize(vec3(mouse, 1.0));
    pos = rotate(pos, rotdir, 1.0 * time);
    dir = rotate(dir, rotdir, 1.0 * time);

    vec3 rayDirection = normalize(camMat * vec3(p, focalLength));
    vec3 rayPosition = camPos;
    float rayLength = 0.;

    float distance = 0.;
    vec3 color = vec3(0);

    vec3 c;

    // Keep iteration count too low to pass through entire model,
    // giving the effect of fogged glass
    const float ITER = 82.;
    const float FUDGE_FACTORR = .8;
    const float INTERSECTION_PRECISION = .001;
    const float MAX_DIST = 20.;

    for(float i = 0.; i < ITER; i++) {

        // Step a little slower so we can accumilate glow
        rayLength += max(INTERSECTION_PRECISION, abs(distance) * FUDGE_FACTORR);
        rayPosition = camPos + rayDirection * rayLength;
        distance = map(rayPosition);

        // Add a lot of light when we're really close to the surface
        c = vec3(max(0., .01 - abs(distance)) * .5);
        c *= vec3(1.4, 2.1, 1.7); // blue green tint

        // Accumilate some purple glow for every step
        c += vec3(.6, .25, .7) * FUDGE_FACTORR / 160.;
        c *= smoothstep(20., 7., length(rayPosition));

        // Fade out further away from the camera
        float rl = smoothstep(MAX_DIST, .1, rayLength);
        c *= rl;

        // Vary colour as we move through space
        c *= spectrum(rl * 6. - .6);

        color += c;

        if(rayLength > MAX_DIST) {
            break;
        }
    }

    // Tonemapping and gamma
    color = pow(color, vec3(1. / 1.8)) * 2.;
    color = pow(color, vec3(2.)) * 3.;
    //color = pow(color, vec3(1. / 2.2));
    vec3 n1, q, r = iResolution, d = normalize(vec3((C * 2. - r.xy) / r.y, 1));
    for(float i = 0., a, s, e, g = 0.; ++i < 110.; O.xyz += mix(vec3(1), H(g * .1), sin(.8)) * 1. / e / 8e3) {
        n1 = g * d;

        a = 10.;
        p = mod(p - a, a * 2.) - a;
        s = 6.;
        for(int i = 0; i++ < 8;) {
            n1 = .3 - abs(n1);

            n1.x < n1.z ? n1 = n1.zyx : n1;
            n1.z < n1.y ? n1 = n1.xzy : n1;

            s *= e = 1.4 + sin(iTime * .234) * .1;
            n1 = abs(n1) * e -
                vec3(5. + cos(iTime * .3 + .5 * sin(iTime * .3)) * 3., 120, 8. + cos(iTime * .5) * 5.) + color;
        }
        g += e = length(n1.yz) / s;
    }
    O += vec4(getcolor(pos, dir), 1.);

}
#include <../common/main_shadertoy.frag>