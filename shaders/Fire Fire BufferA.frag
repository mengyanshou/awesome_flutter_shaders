// Init Fluid
#include <common/common_header.frag>
#include <Fire Fire Common.frag>
uniform sampler2D iChannel2;
const vec3 noiseSpeed1 = vec3(-0.05, 0.0, 0.2);
const float noiseSize1 = 3.3;
const vec3 noiseSpeed2 = vec3(0.05, 0.0, -0.2);
const float noiseSize2 = 0.8;
const float circleForceAmount = 15.0;
const vec2 randomForceAmount = vec2(0.5, 0.75);
const vec2 upForce = vec2(0.0, 0.8);
const vec2 moveSpeed = vec2(1.0, 2.0);

vec4 GetNoise(vec2 uv, float ratio)
{
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

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    float ratio = iResolution.x / iResolution.y;
    vec2 uv = fragCoord / iResolution.xy;

    vec2 circleCoord = uv;
    vec2 mousePos = vec2(0.0);
    vec2 circleVelocity = vec2(0.0);

    if (iMouse.z > 0.5)
    {
        circleCoord -= iMouse.xy / iResolution.xy;
    }
    else
    {
        circleCoord -= 0.5;
        circleCoord.xy += sin(iTime * moveSpeed) * vec2(0.35, 0.25);
    }

    circleCoord.x *= ratio;

    float circle = length(circleCoord);
    float bottom = uv.y;

    vec4 masksIN = vec4(0.08, 0.35, 0.05, 0.2);
    vec4 masksOUT = vec4(0.06, 0.0, 0.0, 0.0);
    vec4 masksValue = vec4(circle, circle, bottom, bottom);
    vec4 masks = smoothstep(masksIN, masksOUT, masksValue);

    vec2 mask = masks.xy + masks.zw;

    vec4 noise = GetNoise(uv, ratio);

    vec2 force = circleCoord * noise.xy * circleForceAmount * masks.x;
    force += (noise.xy - 0.5) * (masks.x * randomForceAmount.x + masks.z * randomForceAmount.y);
    force.y += (0.25 + 0.75 * noise.z) * (masks.x * upForce.x + masks.z * upForce.y);
    force = EncodeForce(force);

    fragColor = vec4(force.x, force.y, mask.x, mask.y);
}
#include <common/main_shadertoy.frag>