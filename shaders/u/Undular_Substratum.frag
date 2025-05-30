// https://www.shadertoy.com/view/3ccGRr
#include <../common/common_header.frag>
/*
    -------------------------------------------------------------
    |          💫 Undular_Substratum 💫  by chronos            |
    -------------------------------------------------------------
    
    A doodle with a log spiral thingie, some volumetric SDF marching,
    some glow and a dash of colors ^_^ 

    See also:
    previous shader: "Magical Orb" https://www.shadertoy.com/view/33jSWh
    
    Similar aesthetics: Heimdal Rir Over Bivrost 🌌🌈🐎
    https://www.shadertoy.com/view/lXKBzV
    
    -------------------------------------------------------------
    self link:       https://www.shadertoy.com/view/3ccGRr
    -------------------------------------------------------------
*/

const float PI = 3.14159265;

float getT() {
    return iTime / 8.;
}

float getScale() {
    return exp2(fract(getT())) - 1.;
}

float sdf(vec3 p) {
    float x = length(p) * (cos(2. * PI * getT()) * .5 + .5);
    return p.y + cos(-iTime + 10. * x) * 1. * exp(-x * x);
}

// 添加伪随机数生成函数
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec3 cmap(vec3 p) {
    p += p * getScale();
    float T = getT();
    float angle = atan(p.z, p.x) / (2. * PI);
    return cos((2. * (angle + .5) +
        floor(log2(length(p.xz)) - 2. * (angle + .5)) + floor(T) + vec3(1, 2, 3) + iTime * .1)) * .5 + .5;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (2. * fragCoord - iResolution.xy) / iResolution.y;

    vec3 color = vec3(0);
    float focal = 2.;
    vec3 ro = vec3(0, 2.2, 4.5);

    vec3 rd = normalize(vec3(uv, -focal));

    float angle = radians(23.5);
    float c = cos(angle), s = sin(angle);
    rd.yz *= mat2(c, s, -s, c);

    // 使用伪随机数替代纹理采样
    float t = .1 * random(fragCoord + vec2(iTime));
    float op = 1.;
    for(int i = 0; i < 99; i++) {
        vec3 p = rd * t + ro;
        float d = abs(sdf(p));
        t += d / 10.;
        color += exp(-.05 * t) * op * .01 / (d + 1e-3) * cmap(p);
        op *= mix(1., 1. - exp(-90. * d * d), .2);
    }

    color = 1. - exp(-pow(color, vec3(1.35)));
    color *= 1. - dot(uv, uv) * .1;
    color = pow(color, vec3(1. / 2.2));

    // 使用伪随机数替代纹理采样
    color += (2. / 255.) * vec3(random(fragCoord * 0.01 + iTime), random(fragCoord * 0.02 + iTime), random(fragCoord * 0.03 + iTime));
    color = clamp(color, 0., 1.);
    fragColor = vec4(color, 1);
}

#include <../common/main_shadertoy.frag>