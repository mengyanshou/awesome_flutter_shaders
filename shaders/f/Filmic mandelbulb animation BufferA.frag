#include <../common/common_header.frag>
#include <Filmic mandelbulb animation Common.frag>
uniform sampler2D iChannel0;
#define Epsilon .003
#define RenderDistance 2.75
#define Steps 75
#define ShadowSteps 5
#define AoSteps 15
#define AoStrength .1
#define GiSkipSteps 7
#define GiStrength .3

vec3 CamPos;
vec3 CamDir;
float CamFocalLength;

float Power;
float PhiShift;
float ThetaShift;

float distanceEstimation(vec3 pos) {
    if(length(pos) > 1.5)
        return length(pos) - 1.2;
    vec3 z = pos;
    float dr = 1.0, r = 0.0, theta, phi;
    for(int i = 0; i < 15; i++) {
        r = length(z);
        if(r > 1.5)
            break;
        dr = pow(r, Power - 1.0) * Power * dr + 1.0;
        theta = acos(z.z / r) * Power + ThetaShift;
        phi = atan(z.y, z.x) * Power + PhiShift;
        float sinTheta = sin(theta);
        z = pow(r, Power) * vec3(sinTheta * cos(phi), sinTheta * sin(phi), cos(theta)) + pos;
    }
    return 0.5 * log(r) * r / dr;
}

vec3 normalEstimation(vec3 pos) {
    float dist = distanceEstimation(pos);
    vec3 xDir = vec3(dist, 0, 0);
    vec3 yDir = vec3(0, dist, 0);
    vec3 zDir = vec3(0, 0, dist);
    return normalize(vec3(distanceEstimation(pos + xDir), distanceEstimation(pos + yDir), distanceEstimation(pos + zDir)) - vec3(dist));
}

bool trace(inout vec3 pos, in vec3 dir, out vec3 n) {
    for(int i = 0; i < Steps; i++) {
        float dist = distanceEstimation(pos);
        if(dist < Epsilon) {
            n = normalEstimation(pos);
            for(int i = 0; i < 2; i++) {
                dist = 2.0 * Epsilon - distanceEstimation(pos);
                pos += n * dist;
            }
            return true;
        }
        pos += dir * dist;
        if(length(pos - CamPos) > RenderDistance)
            break;
    }
    return false;
}

vec3 nee(vec3 pos, vec3 n, vec3 lDir, vec3 lColor, float lRadius) {
    vec3 pos0 = pos;
    float minAngle = Pi;
    float dnrd = dot(n, -lDir);
    if(dnrd < 0.0)
        return vec3(0);
    for(int i = 0; i < ShadowSteps; i++) {
        float dist = distanceEstimation(pos);
        if(dist < Epsilon)
            return vec3(0.0);
        pos -= lDir * dist * 10.0; //goes 10 times faster since we don't need details
        if(length(pos - CamPos) > RenderDistance)
            break;
        minAngle = min(asin(dist / length(pos - pos0)), minAngle);
    }
    return lColor * dnrd * min(minAngle / lRadius, 1.0);
}

vec3 directLight(vec3 pos, vec3 n) {
    vec3 totLights = vec3(0.0);
    //yellow light
    totLights += nee(pos, n, normalize(vec3(-.5, -1, -1)), vec3(.7, .5, .3) * 6.0, .1);
    //purple light
	//totLights += nee(pos, n, normalize(vec3(.5, 1, -1)), vec3(.7, .3, .5) * 4.0, .1);
    return totLights * 1.0;
}

vec3 rotateZ(vec3 v, float phi) {
    return vec3(cos(phi) * v.x - sin(phi) * v.y, cos(phi) * v.y + sin(phi) * v.x, v.z);
}

vec3 background(vec3 dir) {
    dir = rotateZ(dir, iTime / 2.0);
    vec3 col = texture(iChannel0, dir.xzy).rgb;
    return col * col + col;
}

vec3 ambientLight(vec3 pos) {
    vec3 oldPos = pos;
    vec3 n, ambientColor = vec3(0.0), gi = vec3(0.0);
    for(int i = 0; i < AoSteps; i++) {
        n = normalEstimation(pos);
        pos += distanceEstimation(pos) * n;
        ambientColor += background(n);
        if(i != 0 && mod(float(i), float(GiSkipSteps)) == 0.0)
            gi += directLight(pos, n);
    }
    ambientColor /= float(AoSteps);
    gi /= ceil(float(AoSteps) / float(GiSkipSteps) - 1.0);
    float expectedDist = distanceEstimation(oldPos) * pow(2.0, float(AoSteps));
    float ao = pow(length(pos - oldPos) / expectedDist, AoStrength);
    return max(ao * ambientColor, vec3(0.0)) + GiStrength * gi;
}

vec4 colorAndDepth(vec3 pos, vec3 dir) {
    vec3 n;
    if(!trace(pos, dir, n))
        return vec4(background(dir), RenderDistance);
    return vec4(directLight(pos, n) + ambientLight(pos), length(CamPos - pos));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {

    if(fragCoord.y / iResolution.y < Margins || fragCoord.y / iResolution.y > 1.0 - Margins) {
        fragColor = vec4(vec3(0), FocalDistance);
        return;
    }

    CamPos = vec3(2, 0, 1.0);
    CamDir = normalize(vec3(-2, -.3, -1));
    CamFocalLength = 1.0;

    Power = 3.0 + 5.0 * abs(sin(iTime / 4.0));
    ThetaShift = iTime * 2.0;
    PhiShift = iTime * 2.0;

    vec2 screenPos = (fragCoord - iResolution.xy / 2.0) / iResolution.y;
    vec3 camX = normalize(vec3(-CamDir.y, CamDir.x, 0.0));
    vec3 camY = cross(camX, CamDir);
    vec3 centerSensor = CamPos - CamDir * CamFocalLength;
    vec3 posOnSensor = centerSensor + camX * screenPos.x + camY * screenPos.y;
    vec3 dir = normalize(CamPos - posOnSensor);

    vec4 colorAndDepth = colorAndDepth(CamPos, dir);

    fragColor = vec4(max(colorAndDepth.rgb, vec3(0.0)), max(min(colorAndDepth.a, RenderDistance), 0.0));
}

#include <../common/main_shadertoy.frag>