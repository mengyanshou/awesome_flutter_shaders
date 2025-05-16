vec2 hash22(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
}

float noise(in vec2 x) {
    x = x * 0.01; // 与原始texture采样的缩放比例相匹配
    x = x * 10.0; // 调整缩放以匹配视觉效果

    vec2 i = floor(x);
    vec2 f = fract(x);

    float minDist = 1.0;

    // 检查周围的单元格
    for(int y = -1; y <= 1; y++) {
        for(int x = -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 point = hash22(i + neighbor);
            point = 0.5 + 0.5 * sin(iTime + 6.2831 * point); // 添加动态变化
            vec2 diff = neighbor + point - f;
            float dist = length(diff);
            minDist = min(minDist, dist);
        }
    }

    return minDist;
}