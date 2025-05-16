// filepath: /Users/lori/Desktop/nightmare-space/awesome_flutter_shaders/shaders/b/Perlin_Noise.frag
vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(in vec2 x) {
    x = x * 0.01; // 与原始texture采样的缩放比例相匹配

    vec2 i = floor(x);
    vec2 f = fract(x);

    // 平滑插值
    vec2 u = f * f * (3.0 - 2.0 * f);

    // 四个角的梯度向量
    return mix(mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)), dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x), mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y) * 0.5 + 0.5; // 从[-1,1]转换为[0,1]范围
}