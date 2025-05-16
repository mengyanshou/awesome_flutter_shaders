float noise(in vec2 x) {
    x = x * 0.01; // 与原始texture采样的缩放比例相匹配

    vec2 p = floor(x * 256.0);
    vec2 f = fract(x * 256.0);

    p = p * 0.00390625; // 1.0/256.0

    // 哈希函数模拟随机性
    float n = p.x + p.y * 57.0;
    n = fract(sin(n) * 43758.5453);

    // 简单平滑
    f = f * f * (3.0 - 2.0 * f);
    n = mix(n, fract(sin(n + 1.0) * 43758.5453), f.x);
    n = mix(n, fract(sin(n + 57.0) * 43758.5453), f.y);

    return n;
}