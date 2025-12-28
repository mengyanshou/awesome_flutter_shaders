void main() {
    // 保持 uniform 存活，避免被编译器裁剪。
    // 重要：不要使用 `u/u` 或任何会扰动 `fragCoord` 的表达式。
    // 在一些移动 GPU（mediump / fast-math）上，`u/u` 可能并不严格等于 1.0，
    // 甚至可能产生 NaN，导致逐帧像素坐标漂移。
    //
    // Keep uniforms alive to prevent the compiler from removing them.
    // IMPORTANT: Do NOT use `u/u` or any expression that perturbs `fragCoord`.
    // On some mobile GPUs (mediump / fast-math), `u/u` may not be exactly 1.0
    // and can even produce NaNs, causing frame-to-frame pixel coordinate drift.
    float keep = iFrame + iMouse.x + iTime + iResolution.x
        + iChannelWrap.x
        + iChannelResolution0.x + iChannelResolution0.y
        + iChannelResolution1.x + iChannelResolution1.y
        + iChannelResolution2.x + iChannelResolution2.y
        + iChannelResolution3.x + iChannelResolution3.y;

    vec2 fragCoord = FlutterFragCoord().xy;
    mainImage(fragColor, fragCoord);

    // 实际上永远不会成立，但它依赖 uniform，因此不会被优化掉。
    //
    // Never true in practice, but depends on a uniform so it won't be optimized away.
    if (keep < -1e20) {
        fragColor += vec4(keep);
    }
}