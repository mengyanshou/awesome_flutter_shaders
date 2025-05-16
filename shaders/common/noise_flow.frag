float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float basicNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(mix(random(i + vec2(0.0, 0.0)), random(i + vec2(1.0, 0.0)), u.x), mix(random(i + vec2(0.0, 1.0)), random(i + vec2(1.0, 1.0)), u.x), u.y);
}

float noise(in vec2 x) {
    x = x * 0.01; // 与原始texture采样的缩放比例相匹配

    const float TURBULENCE = 0.1;
    float noise1 = basicNoise(x);
    float noise2 = basicNoise(x * 2.0); 

    // 使用第二个噪声扭曲第一个噪声
    vec2 distortedCoord = x + TURBULENCE * vec2(noise2, noise2);
    float finalNoise = basicNoise(distortedCoord);

    return finalNoise;
}