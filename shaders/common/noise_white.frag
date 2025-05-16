float random(vec2 st) {
    // 更稳定的随机分布
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(in vec2 x) {
    // 确保坐标按照0.01的比例缩放，与原来完全一致
    vec2 uv = x * 0.01;

    // 取整和小数部分，用于双线性插值
    vec2 i = floor(uv * 256.0);
    vec2 f = fract(uv * 256.0);

    // 防止超出纹理边界，模拟纹理重复
    i = mod(i, 256.0);

    // 获取四个角的随机值
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // 使用平滑插值函数，模拟线性纹理过滤
    vec2 u = smoothstep(0.0, 1.0, f);

    // 在四个角之间进行双线性插值，模拟纹理采样的插值
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}