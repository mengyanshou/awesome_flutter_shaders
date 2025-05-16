float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash(i + vec2(0.0, 0.0));
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float noise(in vec2 x) {
    x = x * 0.01; // 与原始texture采样的缩放比例相匹配

    float result = 0.0;
    float amplitude = 0.5;
    float frequency = 3.0;

    // 几个尺度的噪声叠加
    for(int i = 0; i < 5; i++) {
        result += amplitude * valueNoise(x * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
    }

    return result;
}