#define SPEED 10.0

// --- Migrate Log ---
// 迁移为 Flutter/Skia 兼容格式，顶部添加迁移日志和 include，补充 iChannel1 声明，所有局部变量显式初始化，for 循环变量用 int，底部 include main_shadertoy.frag。
// --- Migrate Log (EN) ---
// Migrated for Flutter/Skia compatibility: added migrate log and include at top, added iChannel1 declaration, explicit local variable initialization, int for loop variable, include main_shadertoy.frag at bottom.

#include <../common/common_header.frag>
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;

#define SPEED 10.0
#define MAX_DIST 1.0
#define CELLS 10.0

float sqrLen(vec2 vec) {
    return vec.x * vec.x + vec.y * vec.y;
}

vec2 random2(vec2 p) {
    return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}

// noise from iq
float noise(in vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    vec2 uv = (p.xy + vec2(37.0, 17.0) * p.z) + f.xy;
    vec2 rg = SG_TEX0(iChannel0, (uv + 0.5) / 256.0).yx;
    return mix(rg.x, rg.y, f.z);
}

float mapToRange(float fromMin, float fromMax, float toMin, float toMax, float val) {
    val = max(fromMin, min(fromMax, val)); // clamp in range if outside
    float fromSize = fromMax - fromMin;
    val = (val - fromMin) / fromSize;
    return mix(toMin, toMax, val);
}

vec2 pixelToNormalizedspace(vec2 pixel) {
    vec2 res = vec2(0.0);
    res.x = pixel.x * 2.0 / iResolution.x - 1.0;
    res.y = pixel.y * 2.0 / iResolution.y - 1.0;
    res.y *= iResolution.y / iResolution.x; // correct aspect ratio
    return res;
}

float opUnion(float d1, float d2) {
    return min(d1, d2);
}

float opMinus(float d1, float d2) {
    return max(-d1, d2);
}

float opIntersect(float d1, float d2) {
    return max(d1, d2);
}

float circle(vec2 diff, float radius) {
    return length(diff) - radius;
}

float line(vec2 diff, vec2 dir, float thickness) {
    vec2 proj = dot(diff, dir) * dir;
    vec2 perp = diff - proj;
    return length(perp) - thickness;
}

float signedDist2D(vec2 pos) {
    float dist = MAX_DIST;
    for (int i = 0; i < int(CELLS); ++i) {
        dist = opUnion(dist, circle(random2(vec2(float(i))), 1.0 / (CELLS * 2.0)));
    }
    return dist;
}

float FX0(float val, float noise) {
    noise = pow(noise, 6.0);
    float time = iTime * 2.0 + 0.1;
    float str = max(0.0, (val * time));
    float str2 = pow(str, 10.0);
    str = str2 * noise;
    return str;
}

float FX1(float val, float noise, float expansion, float time) {
    noise = pow(noise, 6.0);
    val = val * expansion * 0.5;
    float str = (1.0 + val * time);
    float str2 = pow(str, 20.0);
    str = mapToRange(0.3, 1.0, 0.0, 1.0, str2 * noise);
    return str;
}

float FX2(float val, float noise, float expansion, float time) {
    noise = pow(noise, 6.0);
    val = val * (expansion);
    float str = (1.0 + val * time) * (expansion);
    float str2 = pow(str, 20.0);
    str = str2 * noise;
    str = mapToRange(0.2, 1.0, 0.0, 1.0, str);
    return str;
}

float FX3(float val, float noise, float expansion, float time) {
    val = clamp(val, 0.0, 1.0);
    float str = mapToRange(0.3, 1.0, 0.0, 1.0, FX2(val, noise, expansion, time)) * expansion;
    float ins = FX2(val * pow(expansion - 0.5, 1.0), noise, expansion, time) * expansion;
    ins = mapToRange(0.0, 20.0, 0.0, 1.0, ins);
    str += ins;
    return str;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    float time = mod(iTime, 5.0) * 5.0;
    vec2 fragPos = pixelToNormalizedspace(fragCoord.xy);
    vec3 pos = vec3(fragPos, time * 0.00001 * SPEED);
    // noise sampling
    vec3 scaledPos = 8.0 * pos;
    float noiseVal = 0.0;
    float ampl = 1.0;
    float maxValue = 0.0;
    for (int i = 0; i < 8; ++i) {
        noiseVal += noise(scaledPos) * ampl;
        scaledPos *= 2.0;
        maxValue += ampl;
        ampl *= 0.5;
    }
    noiseVal /= maxValue;
    vec2 startPoint = vec2(0.0, 0.0);
    float expansion = sqrLen(fragPos - startPoint);
    expansion = 1.0 - expansion;
    expansion += time * time * SPEED * 0.0005 - 0.6;
    expansion = min(expansion, MAX_DIST);
    float res = FX3(-signedDist2D(fragPos), noiseVal, expansion, time);
    res = clamp(res, 0.0, 1.0);
    fragColor = vec4(texture(iChannel1, fragCoord / iResolution.xy).rgb * vec3(1.0 - res), 1.0);
}

#include <../common/main_shadertoy.frag>