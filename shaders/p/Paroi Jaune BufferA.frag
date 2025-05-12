// ---------------------------------------------
// Main Rendering
// ---------------------------------------------
#define ENABLE_CLOUDS
#define ENABLE_CLOUDS_SHADOWING
//#define ENABLE_TEMPORAL_JITTERING

#include <../common/common_header.frag>
#include <Paroi Jaune Common.frag>
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
// raymarching
vec3 raymarch(vec3 ro, vec3 rd, const vec2 nf, const float eps);
vec3 normal(vec3 p, const float eps);
float ambientOcclusion(vec3 p, vec3 n, float maxDist, float falloff);
float shadow(vec3 ro, vec3 rd, float mint, float tmax);
float shadowFast(vec3 ro, vec3 rd, float mint, float tmax);

vec3 sunDir;

// ---------------------------------------------
// SDF
// ---------------------------------------------
float displacement(vec3 p) {
    // more cool tricks -> https://developer.nvidia.com/gpugems/GPUGems3/gpugems3_ch01.html
    vec3 pp = p;
    float mgn = .5;
    float d = 0.;
    float s = 1.;
    for(int i = 0; i < 5; i++) {
        vec4 rnd = noised(p + 10.);
        d += rnd.w * mgn;

        p *= 2.;
        p += rnd.xyz * .2 * s;
        if(i == 2)
            s *= -1.;
        mgn *= .5;

    }

    p = pp * pow(2., 5.);
    for(int i = 0; i < 4; i++) {
        vec4 rnd = noised(p);
        d += rnd.w * mgn;

        p *= 2.;
        mgn *= .5;

    }

    return d;
}

float clouds(vec3 p) {
    vec3 pp = p;
    p.y -= time * .1;
    p *= .23;
    float mgn = .5;
    float d = 0.;
    for(int i = 0; i < 5; i++) {
        float rnd = noise(p);
        d += rnd * mgn;

        p *= 2.;
        mgn *= .6;

    }
    return -(pp.y * .2 + 1.) + d * .5 + .5;
}

float map(vec3 p) {
    float d = p.y * .5 + (displacement(p * .1)) * 10.3;

    return d * .4;
}

// ---------------------------------------------
// Shading
// ---------------------------------------------
vec3 skyColor(vec3 rd) {
    // Heavely inspired by https://www.shadertoy.com/view/Ml2cWG
    rd.y = max(rd.y + 0.03, 0.02);
    const float anisotropicIntensity = 0.03;
    const float density = .3;

    float l = length(rd - sunDir);

    vec3 col = vec3(0.39, 0.57, 1.0) * (1.0 + anisotropicIntensity);

    float zenith = density / pow(max(rd.y, 0.35e-2), 0.75);
    vec3 absorption = exp2(col * -zenith) * 2.;
    float rayleig = 1.0 + pow(1.0 - clamp(l, 0.0, 1.0), 2.0) * PI * 0.5;

    vec3 sun = vec3(1., .5, .1) * smoothstep(0.03, 0.0, l) * 100.0;

    return col * zenith * rayleig * absorption * .5 + sun;
}
vec3 clouds(vec3 col, vec3 ro, vec3 rd, float l) {
    for(int i = 0; i < 32; i++) {
        vec3 p = ro + rd * (1. - float(i) / 64.) * l;
        float d = clouds(p);

        #ifdef ENABLE_CLOUDS_SHADOWING
        float shad = 1.;
        if(d > .01)
            shad = shadowFast(p, sunDir, .4, 30.);
        #else
        float shad = 1.;
        #endif
        vec3 c = vec3(.4) * exp(-d * 10.) + vec3(1., .7, .4) * 3. * shad * pow(saturate(d - clouds(p + sunDir) * 2.), 1.);

        col = mix(col, c, saturate(d * .7));
    }
    return col;
}
vec3 shade(vec3 p, vec3 n, vec3 ro, vec3 rd) {
    float d = length(p - ro);
    vec3 sky = skyColor(rd);
    vec3 col = sky;

    if(d < 80.) {
        vec3 albedo = mix(vec3(1., .6, .34) * .1, vec3(.7) * .1, pow(saturate(n.y), 4.) + (noised(p * vec3(.1, 1., 1.)).w * .3));

        n = bumpMapping(iChannel0, p * 1.5, n, 1.);

        float ao = ambientOcclusion(p, n, 5.1, 2.) * ambientOcclusion(p, n, 1., 1.5);
        float shad = shadow(vec3(p), vec3(sunDir), float(0.4), float(30.));

        vec3 amb = vec3(.3, .4, .5) * ao;
        vec3 diff = vec3(1., .9, .7) * max(0., dot(n, sunDir)) * shad;
        vec3 bnc = vec3(1., .7, .4) * saturate(-n.y) * ao;

        col = albedo * (diff * 10. + amb * 10. + bnc * 3.);

        //return vec3(ao);
        #ifdef ENABLE_CLOUDS
        col = clouds(col, ro, rd, d);
        #endif
        col = mix(col, vec3(.6, .7, 1.) * .5, 1. - exp(-0.005 * d));

    }

    return col;
}

// ---------------------------------------------
// SDF
// ---------------------------------------------
void mainImage(out vec4 fragColor, vec2 fragCoord) {
    vec2 invRes = vec2(1.) / iResolution.xy;
    vec2 uv = fragCoord * invRes;

    vec2 jitt = vec2(0.);
    #ifdef ENABLE_TEMPORAL_JITTERING
    jitt = vec2(hash(iTime) - .5, hash(iTime + 1.) - .5) * invRes;
	#endif
    vec2 v = -1.0 + 2.0 * (uv + jitt);
    v.x *= iResolution.x / iResolution.y;

    sunDir = normalize(vec3(cos(time * .02 + 1.) + 1., 1., .4));

    // camera ray
    vec3 ro = vec3(-1., 4.5, 182.);
    vec3 rd = normalize(vec3(v, 1.45));
    rd.yz = rotate(.15) * rd.yz;
    rd.xz = rotate(.1) * rd.xz;

    // classic sdf rendering
    vec3 p = raymarch(ro, rd, vec2(5., 80.), 0.001);
    vec3 n = normal(p, 0.001);
    vec3 col = shade(p, n, ro, rd);

    float depth = length(ro - p) / 100.;
    float coc = saturate(pow(depth + .65, 50.));
    fragColor = vec4(col, coc);

    // temporal jittering
    #ifdef ENABLE_TEMPORAL_JITTERING
    fragColor = mix(fragColor, texture(iChannel1, uv), vec4(.8));
    #endif
}

// ---------------------------------------------
// Raymarching
// Can't be to Common because of the map() dependency :(
// ---------------------------------------------
vec3 raymarch(vec3 ro, vec3 rd, const vec2 nf, const float eps) {
    vec3 p = ro + rd * nf.x;
    float l = 0.;
    for(int i = 0; i < 128; i++) {
        float d = map(p);
        l += d;
        p += rd * d;

        if(d < eps || l > nf.y)
            break;
    }

    return p;
}

vec3 normal(vec3 p, const float eps) {
    float d = map(p);
    vec2 e = vec2(eps, 0.);

    vec3 n;

    n.x = d - map(p - e.xyy);
    n.y = d - map(p - e.yxy);
    n.z = d - map(p - e.yyx);

    return normalize(n);
}

float ambientOcclusion(vec3 p, vec3 n, float maxDist, float falloff) {
    const int nbIte = 8;
    const float nbIteInv = 1. / float(nbIte);
    const float rad = 1. - 1. * nbIteInv; //Hemispherical factor (self occlusion correction)

    float ao = 0.0;

    for(int i = 0; i < nbIte; i++) {
        float l = hash(float(i)) * maxDist;
        vec3 rd = normalize(n + randomHemisphereDir(n, l) * rad) * l; // mix direction with the normal
        													    // for self occlusion problems!

        ao += (l - max(map(p + rd), 0.)) / maxDist * falloff;
    }

    return clamp(1. - ao * nbIteInv, 0., 1.);
}

// https://www.shadertoy.com/view/lsKcDD
float shadow(vec3 ro, vec3 rd, float mint, float tmax) {
    float res = 1.0;
    float t = mint;

    for(int i = 0; i < 32; i++) {
        float h = map(ro + rd * t);
        res = min(res, 10.0 * h / t);
        t += h;

        if(res < 0.0001 || t > tmax)
            break;

    }
    return clamp(res, 0.0, 1.0);
}
float shadowFast(vec3 ro, vec3 rd, float mint, float tmax) {
    float res = 1.0;
    float t = mint;

    for(int i = 0; i < 16; i++) {
        float h = map(ro + rd * t) * 2.;
        res = min(res, 10.0 * h / t);
        t += h;

        if(res < 0.0001 || t > tmax)
            break;

    }
    return clamp(res, 0.0, 1.0);
}
#include <../common/main_shadertoy.frag>