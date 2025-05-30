#include <../common/common_header.frag>
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
/*
Wythoff reflective polyhedra, code adapted from

    https://www.shadertoy.com/view/tlX3WH

I basically rewrote the polyhera construction and raytracing part there,
and kept the rendering part untouched.

The code should look simpler now?

To play with:

1. Change pqr and truncation_type to see other polyhedron.
2. use 'INSIDE_VIEW' to view from the inside.
3. use 'DUAL' to view the dual polyhera.
   pqr=(2, 3, 4) and truncation_type=(0, 0, 1) will give the
   rhombic dodecahedron that tiles the whole inner space.
*/
#define PI                3.141592654
#define L2(x)             dot(x, x)
#define EDGE_THICKNESS    0.05
#define MAX_TRACE_STEPS   128
#define MAX_RAY_BOUNCES   12
#define EPSILON           1e-4
#define FAR               20.
#define min3(x, y, z)     (min(x, min(y, z)))
#define max3(x, y, z)     (max(x, max(y, z)))

//#define INSIDE_VIEW

//#define DUAL

const vec3 pqr = vec3(2, 3, 3);   // (2, 3, 4), (2, 3, 5)
vec3 truncation_type = vec3(0, 1, 0);

const float size = 1.35;  // polyhera size

mat3 M;  // normals of reflection mirrors
mat3 T;  // three vertices of the fundamental triangle  
vec3 v0; // initial vertex

mat3 rotateX(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat3(vec3(1, 0, 0), vec3(0, c, -s), vec3(0, s, c));
}

mat3 rotateY(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat3(vec3(c, 0, s), vec3(0, 1, 0), vec3(-s, 0, c));
}

void init() {
    vec3 c = cos(PI / pqr);
    float sp = sin(PI / pqr.x);
    vec3 m1 = vec3(1, 0, 0);
    vec3 m2 = vec3(-c.x, sp, 0);
    float x3 = -c.z;
    float y3 = -(c.y + c.x * c.z) / sp;
    float z3 = sqrt(1.0 - x3 * x3 - y3 * y3);
    vec3 m3 = vec3(x3, y3, z3);
    M = mat3(m1, m2, m3);
    T[0] = normalize(cross(m2, m3));
    T[1] = normalize(cross(m3, m1));
    T[2] = normalize(cross(m1, m2));
    truncation_type.x = 0.5 * sin(iTime * 1.5) + 0.5;
    truncation_type.y = 0.5 * sin(iTime * 0.8) + 0.5;
    truncation_type.z = 0.5 * sin(iTime * 0.3) + 0.5;
    v0 = normalize(truncation_type * inverse(M)) * size;
#ifdef DUAL
    #define proj(p, n)  (length(p - dot(p, n) * n))
    float scale = min3(proj(v0, m1), proj(v0, m2), proj(v0, m3));
    v0 /= scale;
#endif
}

vec3 fold(vec3 p) {
    for(int i = 0; i < 5; i++) for(int j = 0; j < 3; j++) {
            p -= 2. * min(dot(p, M[j]), 0.) * M[j];
        }
    return p;
}

float dSegment(vec3 p, vec3 a, vec3 b) {
    vec3 pa = p - a;
    vec3 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    float d = length(pa - ba * h);
    return d;
}

vec3 distEdges(vec3 p) {
    p = fold(p);
#ifdef DUAL
    vec3 ed = vec3(1e5);
    vec3 a = T[0] / dot(T[0], v0) * size;
    vec3 b = T[1] / dot(T[1], v0) * size;
    vec3 c = T[2] / dot(T[2], v0) * size;
    if(bool(truncation_type.x))
        ed.x = dSegment(p, b, c);
    if(bool(truncation_type.y))
        ed.y = dSegment(p, c, a);
    if(bool(truncation_type.z))
        ed.z = dSegment(p, a, b);
    return ed;
#else
    p -= v0;
    vec3 ed;
    for(int i = 0; i < 3; i++) {
        ed[i] = L2(p - min(0., dot(p, M[i])) * M[i]);
    }
    return sqrt(ed);
#endif
}

float map(vec3 p) {
    p = fold(p);
#ifdef DUAL
    return dot(p, v0) - size;
#else
    p -= v0;
    return max(dot(p, T[0]), max(dot(p, T[1]), dot(p, T[2])));
#endif
}

float trace(vec3 pos, vec3 rd, bool outside) {
    float t = 0.0;
    float sgn = outside ? 1.0 : -1.0;
    for(int i = 0; i < MAX_TRACE_STEPS; i++) {
        float d = map(pos + t * rd);
        if(abs(d) < EPSILON)
            return t;
        if(t > FAR)
            break;
        t += sgn * d * 0.9;
    }
    return FAR;
}

vec4 wallColor(vec3 dir, vec3 nor, vec3 eds) {
    float d = min3(eds.x, eds.y, eds.z);

    // Texturing of walls
    vec3 albedo = texture(iChannel1, vec2(eds.xy * 2.0)).rgb;
    albedo = pow(albedo, vec3(2.2)) * 0.5;

    // Simple diffuse lighting
    float lighting = 0.2 + max(dot(nor, vec3(0.8, 0.5, 0.0)), 0.0);

    if(dot(dir, nor) < 0.0) {
        // Outer walls, just add a black line to hide seams
        float f = clamp(d * 1000.0 - 3.0, 0.0, 1.0);
        albedo = mix(vec3(0.01), albedo, f);
        return vec4(albedo * lighting, f);
    } else {
        // Inner walls, add fancy lights
        float m = max3(eds.x, eds.y, eds.z);
        vec2 a = fract(vec2(d, m) * 40.6) - 0.5;
        float b = 1.0 - sqrt(dot(a, a));
        b = 0.2 / (dot(a, a) + 0.2);

        float lightShape = 1.0 - clamp(d * 100.0 - 2.0, 0.0, 1.0);
        lightShape *= b;

        vec3 emissive = vec3(3.5, 1.8, 1.0);
        return vec4(mix(albedo * lighting, emissive, lightShape), 0.0);
    }
    return vec4(1.0);
}

mat3 camera_matrix(vec3 eye, vec3 lookat, vec3 up) {
    vec3 forward = normalize(lookat - eye);
    vec3 right = normalize(cross(forward, up));
    up = normalize(cross(right, forward));
    return mat3(right, up, -forward);
}

vec3 get_normal(in vec3 pos) {
    vec3 eps = vec3(0.001, 0.0, 0.0);
    return normalize(vec3(map(pos + eps.xyy) - map(pos - eps.xyy), map(pos + eps.yxy) - map(pos - eps.yxy), map(pos + eps.yyx) - map(pos - eps.yyx)));
}

vec3 background(vec3 dir) {
    // 将 3D 方向向量转换为球面映射坐标
    vec2 uv = vec2(
        0.5 + atan(dir.z, dir.x) / (2.0 * PI),
        0.5 + asin(dir.y) / PI
    );
    vec3 col = texture(iChannel0, uv).rgb;
    col = pow(col, vec3(2.2));
    float origLuma = dot(col, vec3(0.2126, 0.7152, 0.0722)) * 0.7;
    return 2.5 * col / (1.0 - origLuma);
}

vec3 drawRay(vec3 pos, vec3 rd) {
    vec3 color = vec3(0.0);
#ifndef INSIDE_VIEW
    float t = trace(pos, rd, true);
    if(t == FAR) {
        return background(rd);
    }
    pos = pos + t * rd;
    vec3 nor = get_normal(pos);
    vec3 reflDir = reflect(rd, nor);
    vec3 bgColor = pow(background(reflDir), vec3(1.0));
    float fresnel = 0.04 + 0.96 * pow(1.0 - max(dot(rd, -nor), 0.0), 5.0);
    color += bgColor * fresnel;
    vec3 eds = distEdges(pos);
    float d = min3(eds.x, eds.y, eds.z);
    if(d < EDGE_THICKNESS) {
        vec4 wc = wallColor(rd, nor, eds);
        return color * wc.a + wc.rgb;
    }
#endif
    vec3 transmittance = vec3(1.0);
    for(int i = 0; i < MAX_RAY_BOUNCES; i++) {
        float t = trace(pos, rd, false);
        pos = pos + t * rd;
        vec3 eds = distEdges(pos);
        vec3 nor = get_normal(pos);
        float d = min3(eds.x, eds.y, eds.z);
        if(d < EDGE_THICKNESS) {
            return color + transmittance * wallColor(rd, nor, eds).rgb;
        }
        rd = reflect(rd, nor);
        pos += rd * 0.005;
        transmittance *= vec3(0.4, 0.7, 0.7);
    }

    return color;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    init();
    vec2 uv = (fragCoord.xy - iResolution.xy * 0.5) / iResolution.y;
    vec2 mouseUV = vec2(0.0, 0.0);  // 采样坐标点
    vec4 state = texture(iChannel2, mouseUV);
    vec2 move = state.xy * .01; // vec2(.65, 0);

#ifdef INSIDE_VIEW
    float radius = 0.1;
#else
    float radius = 2.0;
#endif
    vec3 eye = radius * vec3(cos(move.x) * cos(move.y), sin(move.y), sin(move.x) * cos(move.y));

    vec3 lookat = vec3(0);
    vec3 up = vec3(0, 1, 0);
    vec3 forward = normalize(lookat - eye);
    vec3 right = normalize(cross(forward, up));
    up = normalize(cross(right, forward));
    vec3 ray = normalize(uv.x * right + uv.y * up + forward * 1.0);
    vec3 color = drawRay(eye, ray);
    color = color / (color * 0.5 + 0.5);
    color = pow(color, vec3(1.0 / 2.2));

    fragColor = vec4(color, 1.0);
}

#include <../common/main_shadertoy.frag>