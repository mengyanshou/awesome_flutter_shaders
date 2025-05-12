//Update Fluid

#include <../common/common_header.frag>
#include <Fire Fire Common.frag>
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
const int Xiterations = 2;
const int Yiterations = 2;

const float sampleDistance1 = 0.006;
const float sampleDistance2 = 0.0001;

const float forceDamping = 0.01;

const vec3 noiseSpeed1 = vec3(0.0, 0.1, 0.2);
const float noiseSize1 = 2.7;
const vec3 noiseSpeed2 = vec3(0.0, -0.1, -0.2);
const float noiseSize2 = 0.8;

const float turbulenceAmount = 2.0;

vec4 GetNoise(vec2 uv, float ratio) {
    vec3 noiseCoord1;
    noiseCoord1.xy = uv;
    noiseCoord1.x *= ratio;
    noiseCoord1 += iTime * noiseSpeed1;
    noiseCoord1 *= noiseSize1;

    vec3 noiseCoord2;
    noiseCoord2.xy = uv;
    noiseCoord2.x *= ratio;
    noiseCoord2 += iTime * noiseSpeed2;
    noiseCoord2 *= noiseSize2;

    vec4 noise1 = texture(iChannel2, noiseCoord1);
    vec4 noise2 = texture(iChannel2, noiseCoord2);

    vec4 noise = (noise1 + noise2) / 2.0;

    return noise;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    float ratio = iResolution.x / iResolution.y;
    vec2 uv = fragCoord / iResolution.xy;

    vec4 source = texture(iChannel0, uv);

    vec2 currentForce = DecodeForce(texture(iChannel1, uv).xy);
    float currentForceMagnitude = length(currentForce);

    vec3 sampleDistance;
    sampleDistance.xy = vec2(mix(sampleDistance1, sampleDistance2, smoothstep(-0.25, 0.65, currentForceMagnitude)));
    sampleDistance.z = 0.0;

    vec2 totalForce = vec2(0.0);
    float iterations = 0.0;

    for(int x = -Xiterations; x <= Xiterations; x++) {
        for(int y = -Yiterations; y <= Yiterations; y++) {
            vec3 dir = vec3(float(x), float(y), 0.0);
            vec4 sampledValue = texture(iChannel1, uv + dir.xy * sampleDistance.xy);

            vec2 force = DecodeForce(sampledValue.xy);
            float forceValue = length(force);
            totalForce += force * forceValue;
            iterations += forceValue;
        }
    }

    totalForce /= iterations;
    totalForce -= totalForce * forceDamping;

    float turbulence = GetNoise(uv, ratio).z - 0.5;
    turbulence *= mix(0.0, turbulenceAmount, smoothstep(0.0, 1.0, currentForceMagnitude));

    totalForce *= rot(turbulence);
    totalForce = EncodeForce(totalForce);

    fragColor = vec4(totalForce.x, totalForce.y, 0.0, 1.0);
}
#include <../common/main_shadertoy.frag>