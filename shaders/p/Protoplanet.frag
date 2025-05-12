#include <../common/common_header.frag>
#include <Protoplanet Common.frag>
uniform sampler2D iChannel0;
#define SCALE 0.95

float map(vec3 p) {
    float lat = 90. - acos(p.y / length(p)) * 180. / PI;
    float lon = atan(p.x, p.z) * 180. / PI;
    vec2 uv = vec2(lon / 360., lat / 180.) + 0.5;
    return texture(iChannel0, uv).x;
}

vec3 normal(vec3 p) {
    vec2 e = vec2(1, 0) / 1e3;
    p += 0.01 * vec3(map(p + e.xyy) - map(p - e.xyy), map(p + e.yxy) - map(p - e.yxy), map(p + e.yyx) - map(p - e.yyx)) / (2. * length(e));
    return normalize(p);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 p = (2. * fragCoord.xy - iResolution.xy) / iResolution.y;
    float lat = 15. * sin(0.1 * iTime);
    float lon = 7.5 * iTime + 100.;
    if(iMouse.z > 0.) {
        lat = 90. - 180. * iMouse.y / iResolution.y;
        lon = 180. - 360. * iMouse.x / iResolution.x;
    }
    vec3 camPos = 10. * vec3(sin(lon * PI / 180.) * cos(lat * PI / 180.), sin(lat * PI / 180.), cos(lon * PI / 180.) * cos(lat * PI / 180.));
    vec3 w = normalize(-camPos);
    vec3 u = normalize(cross(w, vec3(0, 1, 0)));
    vec3 v = normalize(cross(u, w));
    mat3 camera = mat3(u, v, w);

    vec3 dir = normalize(camera * vec3(p / SCALE, length(camPos)));
    float dist = iSphere(camPos, dir, vec4(0, 0, 0, 1));
    fragColor = vec4(0);
    if(dist > 0.) {
        vec3 q = camPos + dir * dist;
        float c = map(q);
        vec3 n = normal(q);
        float light = clamp(dot(n, normalize(vec3(-4, 1, 2))), 0., 1.);
        float heat = clamp(2. / pow(iTime, 2.), 0., 1.);
        fragColor = light * mix(vec4(0.58, 0.57, 0.55, 1), vec4(0.15, 0.13, 0.1, 1), smoothstep(0., 3., c));
        fragColor += 5. * c * heat * vec4(1., 0.15, 0.05, 1.);
    }
    fragColor.rgb = mix(fragColor.rgb, vec3(0), smoothstep(SCALE - 4. / iResolution.y, SCALE + 1. / iResolution.y, length(p)));
    fragColor.rgb = pow(fragColor.rgb, vec3(1. / 2.2));
}
#include <../common/main_shadertoy.frag>
