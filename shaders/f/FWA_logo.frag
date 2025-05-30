#include <../common/common_header.frag>
float opSmoothUnion(float d1, float d2, float k) {
    float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
    return mix(d2, d1, h) - k * h * (1.0 - h);
}

float hash13(vec3 p3) {
    p3 = fract(p3 * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

vec3 opRep(in vec3 p, in vec3 c, out vec3 idx) {
    p = (p + 0.5 * c) / c;
    vec3 floorP = floor(p);
    vec3 fractP = fract(p);
    idx = floorP;
    return fractP * c - 0.5 * c;
}
float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
    vec3 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h) - r;
}

float sdEllipsoid(vec3 p, vec3 r) {
    float k0 = length(p / r);
    float k1 = length(p / (r * r));
    return k0 * (k0 - 1.0) / k1;
}

vec2 map(vec3 p) {
    vec3 idx;
    p = opRep(p, vec3(6.0, 3.0, 5.0), idx);

    vec2 res = vec2(0.0, 0.0);
    float thickness = 0.275;
    float fwaD = 100.0;

    float r = hash13(idx * 100.0 + floor(iTime * 2.14));

    if(r > 0.2 + step(dot(idx, idx), 0.5)) {
        return vec2(0.75, 0.0);
    }

    fwaD = min(fwaD, sdCapsule(p, vec3(-2.1975012, 0, 0.0), vec3(-1.1325011999999999, 0, 0.0), thickness));
    fwaD = min(fwaD, sdCapsule(p, vec3(-1.7825011499999996, -0.44249114999999994, 0.0), vec3(-1.7825011499999996, 0.42000885000000004, 0.0), thickness));
    fwaD = min(fwaD, sdCapsule(p, vec3(-0.9700012499999998, 0.42000885000000004, 0.0), vec3(-1.7825011499999996, 0.42000885000000004, 0.0), thickness));
    fwaD = min(fwaD, sdCapsule(p, vec3(-0.5375011499999998, -0.44249114999999994, 0.0), vec3(-0.9700012499999998, 0.42000885000000004, 0.0), thickness));
    fwaD = min(fwaD, sdCapsule(p, vec3(-0.10000124999999968, 0.42000885000000004, 0.0), vec3(-0.5375011499999998, -0.44249114999999994, 0.0), thickness));
    fwaD = min(fwaD, sdCapsule(p, vec3(0.3274987500000003, -0.44249114999999994, 0.0), vec3(-0.10000124999999968, 0.42000885000000004, 0.0), thickness));
    fwaD = min(fwaD, sdCapsule(p, vec3(0.7749988500000001, 0.42000885000000004, 0.0), vec3(0.3274987500000003, -0.44249114999999994, 0.0), thickness));
    fwaD = min(fwaD, sdCapsule(p, vec3(1.7774988, 0.42000885000000004, 0.0), vec3(0.7749988500000001, 0.42000885000000004, 0.0), thickness));
    fwaD = min(fwaD, sdCapsule(p, vec3(1.7774988, -0.41249115, 0.0), vec3(1.7774988, 0.42000885000000004, 0.0), thickness));
    fwaD = min(fwaD, sdCapsule(p, vec3(0.9424987500000003, -0.41249115, 0.0), vec3(1.7774988, -0.41249115, 0.0), thickness));
    fwaD = min(fwaD, sdCapsule(p, vec3(0.9424741500000001, -0.012491100000000017, 0.0), vec3(0.9424987500000003, -0.41249115, 0.0), thickness));
    fwaD = min(fwaD, sdCapsule(p, vec3(2.2149741000000005, -0.015, 0.0), vec3(0.9424741500000001, -0.012491100000000017, 0.0), thickness));

    res.x = fwaD;
    res.y = step(0.24, p.z);

    return res;
}

vec3 calcNormal(in vec3 p) {
    const float h = 1e-5; // or some other value
    const vec2 k = vec2(1, -1);
    return normalize(k.xyy * map(p + k.xyy * h).x +
        k.yyx * map(p + k.yyx * h).x +
        k.yxy * map(p + k.yxy * h).x +
        k.xxx * map(p + k.xxx * h).x);
}

vec2 rotate(vec2 v, float a) {
    float s = sin(a);
    float c = cos(a);
    mat2 m = mat2(c, s, -s, c);
    return m * v;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;

    // screen size is 6m x 6m

    float t = iTime * 0.2;
    vec3 off0 = fract(vec3(t * 2.516 - 0.642, -t * 0.541 - 0.624, t * 0.532 - 0.74)) - 0.5;
    vec3 off1 = fract(vec3(-t * 0.512 - 0.3412, t * 2.537 - 0.92, -t * 0.5327 - 0.24)) - 0.5;
    vec3 off2 = fract(vec3(t * 0.47 - 0.835, t * 0.537 - 0.753, -t * 0.47 - 0.845)) - 0.5;
    vec3 off3 = fract(vec3(t * 0.324 - 0.23, -t * 0.537 - 0.324, t * 2.5327 - 0.56)) - 0.5;

    vec3 rayOri = vec3(0.0, 0.0, 3.0) + off0 * off2 * vec3(12.0, 12.0, 6.0);
    vec3 target = vec3(rotate((uv - 0.5) * vec2(iResolution.x / iResolution.y, 1.0), dot(off0, off1) * 3.0) * 6.0, 0.0) + off1 * off3 * vec3(12.0, 12.0, 6.0);
    vec3 rayDir = normalize(target - rayOri);

    float depth = 0.0;
    vec3 p;
    vec2 res;

    for(int i = 0; i < 64; i++) {
        p = rayOri + rayDir * depth;
        res = map(p);
        depth += res.x;
        if(res.x < 1e-5) {
            break;
        }
    }

    depth = min(50.0, depth);
    vec3 n = calcNormal(p);
    float b = max(0.0, dot(n, vec3(0.577)));
    vec3 col = mix(vec3(0.5), vec3(1.0), b) * 1.75;
    col *= exp((-depth + 0.5) * 0.15);
    col *= max(smoothstep(0.1, 0.5, res.x) + 0.075 * b, res.y);

    // maximum thickness is 2m in alpha channel
    fragColor = vec4(col, 1.0 - (depth - 1.0) / 20.0);
}

/** SHADERDATA
{
	"title": "FWA logo",
	"description": "Trace the FWA logo with capsule sdf.",
	"model": "person"
}
*/

#include <../common/main_shadertoy.frag>