
#include <../common/common_header.frag>
#include <Fire Fire Common.frag>
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
const vec3 color1 = vec3(0.0, 0.05, 0.2);
const vec3 color2 = vec3(0.1, 0.0, 0.1);
const vec3 color3 = vec3(0.5, 0.15, 0.25);
const vec3 color4 = vec3(2.0, 1.25, 0.7);
const vec3 color5 = vec3(2.0, 2.0, 2.0);

const vec3 glowColor1 = vec3(1.5, 0.5, 0.0);
const vec3 glowColor2 = vec3(1.5, 1.5, 0.5);

const vec3 lightColor = vec3(1.0, 1.5, 0.75);
const vec3 lightDirection = normalize(vec3(0.0, -1.0, 0.0));

const float a = 0.125;
const float b = 0.35;
const float c = 0.5;

vec3 gradient(float value) {
    vec4 start = vec4(0.0, a, b, c);
    vec4 end = vec4(a, b, c, 1.0);
    vec4 mixValue = smoothstep(start, end, vec4(value));

    vec3 color = mix(color1, color2, mixValue.x);
    color = mix(color, color3, mixValue.y);
    color = mix(color, color4, mixValue.z);
    color = mix(color, color5, mixValue.w);

    return color;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;

    vec4 source = texture(iChannel0, uv);

    vec2 force = texture(iChannel1, uv).xy;
    force = DecodeForce(force);

    float value = length(force);

    float glow = source.w + source.z * 0.75;
    glow /= 2.0;

    vec3 color = gradient(value);
    color += mix(glowColor1, glowColor2, glow) * glow;

    vec3 normal = vec3(force.x, force.y, 1.0) * 0.5;
    normal = normalize(normal);

    float NdotL = smoothstep(-0.5, 0.5, dot(normal, lightDirection));
    color += color * NdotL * lightColor;

    fragColor = vec4(color, 1.0);
}
#include <../common/main_shadertoy.frag>