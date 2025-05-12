// CC0: Inside the mandelbulb II
//  Received some "complaints" about the old mandelbulb suffering from 
//  alias effects. So thought I make a quick try to apply the FXAA
//  thing I learnt from XorDev. It did improve it but not perfect still.

// When experimenting with this shader I realized this entire shader is 
// basically just a lucky bug (apart from the aliasing)

#include <../common/common_header.frag>
uniform sampler2D iChannel0;
// --
#define LOOPS   2    // 4+ and higher to show off you expensive GPU
#define POWER   8.0
#define ANIMATE
// --

#define PI              3.141592654
#define TAU             (2.0*PI)
#define PHI             (sqrt(5.0)*0.5 + 0.5)

#define TIME            iTime
#define RESOLUTION      iResolution

#define TOLERANCE       0.0001
#define MAX_RAY_LENGTH  20.0
#define MAX_RAY_MARCHES 60
#define NORM_OFF        0.005
#define MAX_BOUNCES     5

mat3 g_rot = mat3(1.0); 

// License: WTFPL, author: sam hocevar, found: https://stackoverflow.com/a/17897228/418488
const vec4 hsv2rgb_K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
vec3 hsv2rgb(vec3 c) {
    vec3 p = abs(fract(c.xxx + hsv2rgb_K.xyz) * 6.0 - hsv2rgb_K.www);
    return c.z * mix(hsv2rgb_K.xxx, clamp(p - hsv2rgb_K.xxx, 0.0, 1.0), c.y);
}
// License: WTFPL, author: sam hocevar, found: https://stackoverflow.com/a/17897228/418488
//  Macro version of above to enable compile-time constants
#define HSV2RGB(c)  (c.z * mix(hsv2rgb_K.xxx, clamp(abs(fract(c.xxx + hsv2rgb_K.xyz) * 6.0 - hsv2rgb_K.www) - hsv2rgb_K.xxx, 0.0, 1.0), c.y))

const float hoff = 0.0;

const vec3 skyCol = HSV2RGB(vec3(hoff + 0.6, 0.86, 1.0));
const vec3 glowCol = HSV2RGB(vec3(hoff + 0.065, 0.8, 6.0));
const vec3 diffuseCol = HSV2RGB(vec3(hoff + 0.6, 0.85, 1.0));
const vec3 lightPos = vec3(0.0, 10.0, 0.0);
const vec3 mat = vec3(0.8, 0.5, (1. + 0.05));
const vec3 beer = -HSV2RGB(vec3(0.05, 0.95, 2.0));
const float initt = 0.1; 

// License: Unknown, author: nmz (twitter: @stormoid), found: https://www.shadertoy.com/view/NdfyRM
vec3 sRGB(vec3 t) {
    return mix(1.055 * pow(t, vec3(1. / 2.4)) - 0.055, 12.92 * t, step(t, vec3(0.0031308)));
}

// License: Unknown, author: Matt Taylor (https://github.com/64), found: https://64.github.io/tonemapping/
vec3 aces_approx(vec3 v) {
    v = max(v, 0.0);
    v *= 0.6;
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    return clamp((v * (a * v + b)) / (v * (c * v + d) + e), 0.0, 1.0);
}

// License: MIT, author: Inigo Quilez, found: https://iquilezles.org/www/articles/distfunctions2d/distfunctions2d.htm
float box(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

// License: MIT, author: Inigo Quilez, found: https://iquilezles.org/www/articles/intersectors/intersectors.htm
float rayPlane(vec3 ro, vec3 rd, vec4 p) {
    return -(dot(ro, p.xyz) + p.w) / dot(rd, p.xyz);
}

// License: Unknown, author: EvilRyu, found: https://www.shadertoy.com/view/MdXSWn
float mandelBulb(vec3 p) {

    const float power = POWER;
    vec3 z = p;
    vec3 dz = vec3(0.0);
    float r, theta, phi;
    float dr = 1.0;

    for(int i = 0; i < LOOPS; ++i) {
        r = length(z);
        if(r > 2.0)
            continue;
        theta = atan(z.y, z.x);
#ifdef ANIMATE
        phi = asin(z.z / r) + TIME * 0.2;
#else
        phi = asin(z.z / r);
#endif

        dr = pow(r, power - 1.0) * dr * power + 1.0;

        r = pow(r, power);
        theta = theta * power;
        phi = phi * power;

        z = r * vec3(cos(theta) * cos(phi), sin(theta) * cos(phi), sin(phi)) + p;
    }
    return 0.5 * log(r) * r / dr;
}

mat3 rot_z(float a) {
    float c = cos(a);
    float s = sin(a);
    return mat3(c, s, 0, -s, c, 0, 0, 0, 1);
}

mat3 rot_y(float a) {
    float c = cos(a);
    float s = sin(a);
    return mat3(c, 0, s, 0, 1, 0, -s, 0, c);
}

mat3 rot_x(float a) {
    float c = cos(a);
    float s = sin(a);
    return mat3(1, 0, 0, 0, c, s, 0, -s, c);
}

vec3 skyColor(vec3 ro, vec3 rd) {
    vec3 col = clamp(vec3(0.0025 / abs(rd.y)) * skyCol, 0.0, 1.0);

    float tp0 = rayPlane(ro, rd, vec4(vec3(0.0, 1.0, 0.0), 4.0));
    float tp1 = rayPlane(ro, rd, vec4(vec3(0.0, -1.0, 0.0), 6.0));
    float tp = tp1;
    tp = max(tp0, tp1);

    if(tp1 > 0.0) {
        vec3 pos = ro + tp1 * rd;
        vec2 pp = pos.xz;
        float db = box(pp, vec2(6.0, 9.0)) - 1.0;

        col += vec3(4.0) * skyCol * rd.y * rd.y * smoothstep(0.25, 0.0, db);
        col += vec3(0.8) * skyCol * exp(-0.5 * max(db, 0.0));
    }

    if(tp0 > 0.0) {
        vec3 pos = ro + tp0 * rd;
        vec2 pp = pos.xz;
        float ds = length(pp) - 0.5;

        col += vec3(0.25) * skyCol * exp(-.5 * max(ds, 0.0));
    }

    return clamp(col, 0.0, 10.0);
}

float df(vec3 p) {
    p *= g_rot;
    const float z1 = 2.0;
    return mandelBulb(p / z1) * z1;
}

vec3 normal(vec3 pos) {
    vec2 eps = vec2(NORM_OFF, 0.0);
    vec3 nor;
    nor.x = df(pos + eps.xyy) - df(pos - eps.xyy);
    nor.y = df(pos + eps.yxy) - df(pos - eps.yxy);
    nor.z = df(pos + eps.yyx) - df(pos - eps.yyx);
    return normalize(nor);
}

float rayMarch(vec3 ro, vec3 rd, float dfactor, out int ii) {
    float t = 0.0;
    float tol = dfactor * TOLERANCE;
    ii = MAX_RAY_MARCHES;
    for(int i = 0; i < MAX_RAY_MARCHES; ++i) {
        if(t > MAX_RAY_LENGTH) {
            t = MAX_RAY_LENGTH;
            break;
        }
        float d = dfactor * df(ro + rd * t);
        if(d < TOLERANCE) {
            ii = i;
            break;
        }
        t += d;
    }
    return t;
}

vec3 render(vec3 ro, vec3 rd) {
    vec3 agg = vec3(0.0, 0.0, 0.0);
    vec3 ragg = vec3(1.0);

    bool isInside = df(ro) < 0.0;

    for(int bounce = 0; bounce < MAX_BOUNCES; ++bounce) {
        float dfactor = isInside ? -1.0 : 1.0;
        float mragg = max(max(ragg.x, ragg.y), ragg.z);
        if(mragg < 0.025)
            break;
        int iter;
        float st = rayMarch(ro, rd, dfactor, iter);
        const float mrm = 1.0 / float(MAX_RAY_MARCHES);
        float ii = float(iter) * mrm;
        if(st >= MAX_RAY_LENGTH) {
            agg += ragg * skyColor(ro, rd);
            break;
        }

        vec3 sp = ro + rd * st;

        vec3 sn = dfactor * normal(sp);
        float fre = 1.0 + dot(rd, sn);
        fre *= fre;
        fre = mix(0.1, 1.0, fre);

        vec3 ld = normalize(lightPos - sp);

        float dif = max(dot(ld, sn), 0.0);
        vec3 ref = reflect(rd, sn);
        float re = mat.z;
        float ire = 1.0 / re;
        vec3 refr = refract(rd, sn, !isInside ? re : ire);
        vec3 rsky = skyColor(sp, ref);
        vec3 col = vec3(0.0);
        col += diffuseCol * dif * dif * (1.0 - mat.x);
        float edge = smoothstep(1.0, 0.9, fre);
        col += rsky * mat.y * fre * vec3(1.0) * edge;
        if(isInside) {
            ragg *= exp(-(st + initt) * beer);
        }
        agg += ragg * col;

        if(refr == vec3(0.0)) {
            rd = ref;
        } else {
            ragg *= mat.x;
            isInside = !isInside;
            rd = refr;
        }

        ro = sp + initt * rd;
    }

    return agg;
}

vec3 effect(vec2 p) {
    g_rot = rot_x(0.2 * TIME) * rot_y(0.3 * TIME);
    vec3 ro = 0.6 * vec3(0.0, 2.0, 5.0);
    const vec3 la = vec3(0.0, 0.0, 0.0);
    const vec3 up = vec3(0.0, 1.0, 0.0);

    vec3 ww = normalize(la - ro);
    vec3 uu = normalize(cross(up, ww));
    vec3 vv = (cross(ww, uu));
    const float fov = tan(TAU / 6.);
    vec3 rd = normalize(-p.x * uu + p.y * vv + fov * ww);

    vec3 col = render(ro, rd);

    return col;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 q = fragCoord / RESOLUTION.xy;
    vec2 p = -1. + 2. * q;
    p.x *= RESOLUTION.x / RESOLUTION.y;
    vec3 col = vec3(0.0);
    col = effect(p);
    col = aces_approx(col);
    col = sRGB(col);
    fragColor = vec4(col, 1.0);
}

#include <../common/main_shadertoy.frag>