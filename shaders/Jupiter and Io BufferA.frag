#include <common/common_header.frag>
#include <Jupiter and Io Common.frag>
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    bool firstFrame = iFrame == 0;

    float oldTextureSeed = texture(iChannel1, vec2(0.0, 0.0)).w;
    float newTextureSeed = SeedFromResolution(iResolution);
    bool resolutionChange = oldTextureSeed != newTextureSeed;

    float shorterSide = min(iResolution.x, iResolution.y);
    float aspectRatio = iResolution.x / iResolution.y;
    vec2 uv = fract(fragCoord / shorterSide - vec2(0.5, 0.5));

    float sourceNoise = texture(iChannel0, uv + vec2(-0.03, 0.0) * iTime, -1000.0).x;
    float sourceMask = clamp(((sourceNoise - 0.5) * 10.0) + 0.5, 0.0, 1.0);

    vec2 dotsUV = QuakeLavaUV(uv, 0.01, 4.0, 37.699, iTime);
    float dotsA = pow(texture(iChannel0, dotsUV * 3.0 + iTime * vec2(-0.1, -0.1), -1000.0).x, 5.5);
    float dotsB = pow(texture(iChannel0, -dotsUV * 5.0 + iTime * vec2(0.1, 0.1), -1000.0).x, 5.5);
    float dots = max(dotsA, dotsB);

    vec2 turbulenceUVA = QuakeLavaUV(uv, 0.005, 2.0, 37.699, iTime);
    float turbulenceNoiseA = simplexNoise(turbulenceUVA * 6.0 + vec2(iTime * 1.0, 0.0));
    vec2 turbulenceA = vec2(dFdy(turbulenceNoiseA), -dFdx(turbulenceNoiseA));

    vec2 turbulenceUVB = QuakeLavaUV(uv, 0.002, 4.0, 157.079, iTime);
    float turbulenceNoiseB = texture(iChannel0, turbulenceUVB + iTime * vec2(-0.05, 0.0), -1000.0).x;
    vec2 turbulenceB = vec2(dFdy(turbulenceNoiseB), -dFdx(turbulenceNoiseB));

    vec3 jupiterA = sampleJupiterASmoothstepFilter(uv * 1.0);
    vec3 jupiterB = sampleJupiterBSmoothstepFilter(uv * 1.0);

    vec2 combinedVelocity = turbulenceA * 0.015 + turbulenceB * 0.004 + vec2(sin(uv.y * 40.0) + 1.5, 0.0) * 0.0006;

    vec3 sourceColor = mix(jupiterA, jupiterB, sourceMask);

    if(firstFrame || resolutionChange) {
        fragColor = vec4(sourceColor, newTextureSeed);
    } else {
        float minDimension = min(iResolution.x, iResolution.y);
        float maxDimension = max(iResolution.x, iResolution.y);
        float maxAspectRatio = maxDimension / minDimension;
        vec2 aspectFactor = iResolution.x > iResolution.y ? vec2(maxAspectRatio, 1.0) : vec2(1.0, maxAspectRatio);
        vec2 previousUV = fract(fragCoord / iResolution.xy * aspectFactor) / aspectFactor;

        vec3 previousFrame = texture(iChannel1, previousUV + combinedVelocity).xyz;
        vec3 previousMixedWithSource = mix(previousFrame, sourceColor, dots * 0.04);

        fragColor = vec4(previousMixedWithSource, newTextureSeed);
    }
    //fragColor = vec4(vec3(turbulenceNoiseB),1.0);

}
#include <common/main_shadertoy.frag>