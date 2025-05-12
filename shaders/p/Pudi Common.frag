
#include <../common/common_header.frag>
const float PI = acos(-1.);
const float TAU = 2. * PI;

float AAstep(float thre, float val) {
    return smoothstep(-.5, .5, (val - thre) / min(0.03, fwidth(val - thre)));
}
float AAstep(float val) {
    return AAstep(val, 0.);
}

struct Hit {
    float t;
    vec3 pos;
    uint id;
};

Hit default_hit() {
    return Hit(1e9, vec3(0.), 999u);
}

Hit hit_min(Hit a, Hit b) {
    if(a.t < b.t) {
        return a;
    }
    return b;
}
Hit hit_max(Hit a, Hit b) {
    if(a.t > b.t) {
        return a;
    }
    return b;
}

mat2 rot(float x) {
    float c = cos(x), s = sin(x);
    return mat2(c, -s, s, c);
}

vec3 erot(vec3 p, vec3 d, float ro) {
    return mix(dot(p, d) * d, p, cos(ro)) + cross(p, d) * sin(ro);
}

float smin(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0);
    return min(a, b) - h * h * 0.25 / k;
}

// float smin(float a, float b, float k) { return smax(a, b, -k); }
float smax(float a, float b, float k) {
    k *= 1.4;
    float h = max(k - abs(a - b), 0.0);
    return max(a, b) + h * h * h / (6.0 * k * k);
}

vec3 carve(in vec3 p1, in vec3 p2) {
    return p1.z > -p2.z ? p1 : vec3(p2.xy, -p2.z);
}

vec3 carve(in vec3 p1, in vec3 p2, float k) {
    return vec3(p1.z > -p2.z ? p1.xy : p2.xy, -smin(-p1.z, p2.z, k));
}

float hash11(float p) {
    p = fract(p * .1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
}

float hash31(vec3 p3) {
    p3 = fract(p3 * .1031);
    p3 += dot(p3, p3.zyx + 31.32);
    return fract((p3.x + p3.y) * p3.z);
}

// 3d noise function (linear interpolation between hash of integer bounds)
float noise(vec3 uv) {
    vec3 fuv = floor(uv);
    vec4 cell0 = vec4(hash31(fuv + vec3(0, 0, 0)), hash31(fuv + vec3(0, 1, 0)), hash31(fuv + vec3(1, 0, 0)), hash31(fuv + vec3(1, 1, 0)));
    vec2 axis0 = mix(cell0.xz, cell0.yw, fract(uv.y));
    float val0 = mix(axis0.x, axis0.y, fract(uv.x));
    vec4 cell1 = vec4(hash31(fuv + vec3(0, 0, 1)), hash31(fuv + vec3(0, 1, 1)), hash31(fuv + vec3(1, 0, 1)), hash31(fuv + vec3(1, 1, 1)));
    vec2 axis1 = mix(cell1.xz, cell1.yw, fract(uv.y));
    float val1 = mix(axis1.x, axis1.y, fract(uv.x));
    return mix(val0, val1, fract(uv.z));
}

// https://www.shadertoy.com/view/md2GWW
float stepNoise(float x, float n) {
    float i = floor(x);
    float s = 0.1;
    float u = smoothstep(0.5 - s, 0.5 + s, fract(x));
    return mix(floor(hash11(i) * n), floor(hash11(i + 1.) * n), u); // from 0. to n - 1.
}

float easeInBack(float x) {
    float c1 = 1.70158;
    float c3 = c1 + 1.;

    return c3 * x * x * x - c1 * x * x;
}

vec2 ibox(in vec3 ro, in vec3 rd, vec3 boxsize) {
    vec3 m = 1.0 / rd;
    vec3 n = m * ro;
    vec3 k = abs(m) * boxsize;
    vec3 t1 = -n - k;
    vec3 t2 = -n + k;
    float tN = max(max(t1.x, t1.y), t1.z);
    float tF = min(min(t2.x, t2.y), t2.z);
    if(tN > tF || tF < 0.0)
        return vec2(-1.0);
    return vec2(tN, tF);
}

float sd_sphere(vec3 p, float r) {
    return length(p) - r;
}
float sd_sphere(vec2 p, float r) {
    return length(p) - r;
}

float sd_box(vec3 p, vec3 h) {
    p = abs(p) - h;
    return length(max(p, 0.)) + min(0., max(p.x, max(p.y, p.z)));
}

float sd_rect(vec2 p, vec2 h) {
    p = abs(p) - h;
    return length(max(p, 0.)) + min(0., max(p.x, p.y));
}

float sd_cone(vec3 p, vec2 c, float h) {
    float q = length(p.xz);
    return max(dot(c.xy, vec2(q, p.y)), -h - p.y);
}

float sd_torus(vec3 p, vec2 t) {
    vec2 q = vec2(length(p.xz) - t.x, p.y);
    return length(q) - t.y;
}

float opSU(float a, float b, float k) {
    float h = clamp(.5 + .5 * (b - a) / k, 0., 1.);
    return mix(b, a, h) - k * h * (1. - h);
}

float sdTriangleIsosceles(in vec2 p, in vec2 q) {
    p.x = abs(p.x);
    vec2 a = p - q * clamp(dot(p, q) / dot(q, q), 0.0, 1.0);
    vec2 b = p - q * vec2(clamp(p.x / q.x, 0.0, 1.0), 1.0);
    float s = -sign(q.y);
    vec2 d = min(vec2(dot(a, a), s * (p.x * q.y - p.y * q.x)), vec2(dot(b, b), s * (p.y - q.y)));
    return -sqrt(d.x) * sign(d.y);
}

vec3 sd_capped_cone(vec3 p, vec3 a, vec3 b, float ra, float rb) {
    float rba = rb - ra;
    float baba = dot(b - a, b - a);
    float papa = dot(p - a, p - a);
    float paba = dot(p - a, b - a) / baba;
    float x = sqrt(papa - paba * paba * baba);
    float cax = max(0.0, x - ((paba < 0.5) ? ra : rb));
    float cay = abs(paba - 0.5) - 0.5;
    float k = rba * rba + baba;
    float f = clamp((rba * (x - ra) + paba * baba) / k, 0.0, 1.0);
    float cbx = x - ra - f * rba;
    float cby = paba - f;
    float s = (cbx < 0.0 && cay < 0.0) ? -1.0 : 1.0;

    float px = atan(p.x, p.z) * paba;
    float py = atan(p.y, p.x) * rba;

    return vec3(px, py, s * sqrt(min(cax * cax + cay * cay * baba, cbx * cbx + cby * cby * baba)));
}

float sd_joint2d(in vec2 p, in float l, in float a, float w) {
    // if perfectly straight
    if(abs(a) < 0.001) {
        p.y -= clamp(p.y, 0.0, l);
        return length(p);
    }

    // parameters
    vec2 sc = vec2(sin(a), cos(a));
    float ra = 0.5 * l / a;

    // recenter
    p.x -= ra;

    // reflect
    vec2 q = p - 2.0 * sc * max(0.0, dot(sc, p));

    // distance
    float u = abs(ra) - length(q);
    float d = (q.y < 0.0) ? length(q + vec2(ra, 0.0)) : abs(u);

    return d - w;
}

float sd_ellipsoid(vec3 p, vec3 r) {
    float k0 = length(p / r);
    float k1 = length(p / (r * r));
    return k0 * (k0 - 1.0) / k1;
}

float sd_line(vec2 p, float r, float l) {
    l = max(0., l);
    p.y -= clamp(p.y, -l, l);
    return length(p) - r;
}

float sd_egg2d(in vec2 p, in float ra, in float rb) {
    const float k = sqrt(3.0);

    p.x = abs(p.x);

    float r = ra - rb;

    return ((p.y < 0.0) ? length(vec2(p.x, p.y)) - r : (k * (p.x + r) < p.y) ? length(vec2(p.x, p.y - k * r)) : length(vec2(p.x + r, p.y)) - 2.0 * r) -
        rb;
}

float sd_egg(in vec3 p, in float ra, in float rb, float o) {
    vec2 q = vec2(length(p.xz) - o, p.y);
    return sd_egg2d(q, ra, rb);
}

float blend(float a, float b, float k) {
    return log(exp(a * k) + exp(b * k)) / k;
}

// http://research.microsoft.com/en-us/um/people/hoppe/ravg.pdf
// { dist, t, y (above the plane of the curve, x (away from curve in the plane
// of the curve))
float det(vec2 a, vec2 b) {
    return a.x * b.y - b.x * a.y;
}
vec4 sdBezier(vec3 p, vec3 va, vec3 vb, vec3 vc) {
    vec3 w = normalize(cross(vc - vb, va - vb));
    vec3 u = normalize(vc - vb);
    vec3 v = cross(w, u);

    vec2 m = vec2(dot(va - vb, u), dot(va - vb, v));
    vec2 n = vec2(dot(vc - vb, u), dot(vc - vb, v));
    vec3 q = vec3(dot(p - vb, u), dot(p - vb, v), dot(p - vb, w));

    float mn = det(m, n);
    float mq = det(m, q.xy);
    float nq = det(n, q.xy);

    vec2 g = (nq + mq + mn) * n + (nq + mq - mn) * m;
    float f = (nq - mq + mn) * (nq - mq + mn) + 4.0 * mq * nq;
    vec2 z = 0.5 * f * vec2(-g.y, g.x) / dot(g, g);
    // float t = clamp(0.5+0.5*(det(z,m+n)+mq+nq)/mn, 0.0 ,1.0 );
    float t = clamp(0.5 + 0.5 * (det(z - q.xy, m + n)) / mn, 0.0, 1.0);
    vec2 cp = m * (1.0 - t) * (1.0 - t) + n * t * t - q.xy;

    float d2 = dot(cp, cp);
    return vec4(sqrt(d2 + q.z * q.z), t, q.z, -sign(f) * sqrt(d2));
}

// Agx from https://www.shadertoy.com/view/cd3XWr
#define AGX_LOOK 2

// AgX
// ->

// Mean error^2: 3.6705141e-06
vec3 agxDefaultContrastApprox(vec3 x) {
    vec3 x2 = x * x;
    vec3 x4 = x2 * x2;

    return +15.5 * x4 * x2 - 40.14 * x4 * x + 31.96 * x4 - 6.868 * x2 * x +
        0.4298 * x2 + 0.1191 * x - 0.00232;
}

vec3 agx(vec3 val) {
    const mat3 agx_mat = mat3(0.842479062253094, 0.0423282422610123, 0.0423756549057051, 0.0784335999999992, 0.878468636469772, 0.0784336, 0.0792237451477643, 0.0791661274605434, 0.879142973793104);

    const float min_ev = -12.47393;
    const float max_ev = 4.026069;

    // Input transform
    val = agx_mat * val;

    // Log2 space encoding
    val = clamp(log2(val), min_ev, max_ev);
    val = (val - min_ev) / (max_ev - min_ev);

    // Apply sigmoid function approximation
    val = agxDefaultContrastApprox(val);

    return val;
}

vec3 agxEotf(vec3 val) {
    const mat3 agx_mat_inv = mat3(1.19687900512017, -0.0528968517574562, -0.0529716355144438, -0.0980208811401368, 1.15190312990417, -0.0980434501171241, -0.0990297440797205, -0.0989611768448433, 1.15107367264116);

    // Undo input transform
    val = agx_mat_inv * val;

    // sRGB IEC 61966-2-1 2.2 Exponent Reference EOTF Display
    // val = pow(val, vec3(2.2));

    return val;
}

vec3 agxLook(vec3 val) {
    const vec3 lw = vec3(0.2126, 0.7152, 0.0722);
    float luma = dot(val, lw);

    // Default
    vec3 offset = vec3(0.0);
    vec3 slope = vec3(1.0);
    vec3 power = vec3(1.0);
    float sat = 1.0;

#if AGX_LOOK == 1
    // Golden
    slope = vec3(1.0, 0.9, 0.5);
    power = vec3(0.8);
    sat = 0.8;
#elif AGX_LOOK == 2
    // Punchy
    slope = vec3(1.0);
    power = vec3(1.35, 1.35, 1.35);
    sat = 1.4;
#endif

    // ASC CDL
    val = pow(val * slope + offset, power);
    return luma + sat * (val - luma);
}

// <-

vec4 toLinear(vec4 sRGB) {
    bvec4 cutoff = lessThan(sRGB, vec4(0.04045));
    vec4 higher = pow((sRGB + vec4(0.055)) / vec4(1.055), vec4(2.4));
    vec4 lower = sRGB / vec4(12.92);

    return mix(higher, lower, cutoff);
}

vec3 color2agx(vec3 col) {
    // col = toLinear(vec4(col, 1.0)).rgb;

    col = agx(col);
    col = agxLook(col);
    col = agxEotf(col);

    return col;
}

#include <../common/main_shadertoy.frag>