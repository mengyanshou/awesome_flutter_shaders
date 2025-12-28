// --- Migrate Log ---
// 初始化变更：
// - 在文件顶部添加  common header include
// - 声明缺失的 sampler2D (`iChannel0`, `iChannel1`)
// - 将部分 loop 计数器从 `float` 改为 `int`，并把需要的类型转换显式化
// - 初始化并避免未定义行为（例如移除在 for 头部使用的算术）
// English change summary:
// - Added common header include, declared samplers,
// - Converted some float loop counters to int and made explicit casts,
// - Initialized variables to avoid undefined behavior.

#include <../common/common_header.frag>

#include <Pistons with Motion Blur Common.frag>

uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform float iTimeDelta;

// 1/9/2021:
// - Moved & expanded the MSAA pattern into the temporal
//   sampling code so the image is always AA'd when using
//   more than one sample. This is basically free since
//   we're taking the samples anyway. Thanks for the    
//   suggestion, rory618!
// - Added bluenoise for temporal jitter. It looks quite
//   a bit better than the whitenoise for this purpose
//   and tends to fill in the shapes at very low samples,
//   even 1spp looks alright in motion. Not a fan of how
//   the noise breaks up the otherwise smooth look but
//   maybe this could still be improved.

const int temporalSamples = 16;
const bool useTemporalJitter = false; // Adds noise, but eliminates banding.
const int maximumBounces = 2;

// "Part" being one piston/cam assembly.
float partDistance(vec3 point, float initialAngle, float worldTime) {
    point = vec3(point.x, abs(point.z) - 0.1, point.y);
    vec3 flattenedPoint = vec3(point.x, 0.0, point.z);
    
    float smoothing = 0.02;
    
    float radiusA = 0.3;
    float radiusB = 0.15;
    float size = 0.38;
    float camAngle = getCamAngle(initialAngle, worldTime);
    vec3 rotatedPoint = erot(flattenedPoint, vec3(0.0, 1.0, 0.0), camAngle);
    float dist = roundConeDistance(rotatedPoint, radiusA, radiusB, size);
    
    const float height = 0.1;
    float halfHeight = height / 2.0;
    float container = boxDistance(point, vec3(0.0, halfHeight, 0.0), vec3(2.0, halfHeight, 2.0));
    dist = opSmoothIntersection(dist, container, smoothing);
    
    vec3 postPoint = point - vec3(0.0, 0.15, 0.0);
    float post = smoothCylinderDistance(postPoint, 0.1, 0.093, smoothing);
    dist = opSmoothUnion(dist, post, 0.01);
    
    vec3 camAttachment = erot(vec3(0.0, 0.0, 0.38), vec3(0.0, -1.0, 0.0), camAngle);

    vec3 jointPoint = point - camAttachment;
    float joint = smoothCylinderDistance(jointPoint, 0.075, 0.093, smoothing);
    dist = opSmoothUnion(dist, joint, 0.005);
    
    float rodX = 0.5;
    float rodLength = 1.0;
    
    vec3 rodEnd = vec3(0.0, 0.0, rodLength + camAttachment.z - 0.1);
    vec3 rodPoint = vec3(point.x, 0.0, point.z);
    float rod = segmentDistance(rodPoint, camAttachment, rodEnd) - 0.1;
    float rodContainer = boxDistance(point, vec3(0.0, -height, 0.0), vec3(2.0, halfHeight, 2.0));
    vec3 rodBasePoint = point - camAttachment - vec3(0.0, -height, 0.0);
    float rodBase = smoothCylinderDistance(rodBasePoint, halfHeight, 0.2, smoothing);
    float rodComposite = opSmoothUnion(
        opSmoothIntersection(rod, rodContainer, smoothing),
        rodBase,
        0.075
    );
    dist = min(dist, rodComposite);
    
    vec3 headPoint = vec3(point.x, point.z - camAttachment.z - rodLength, point.y + 0.1);
    float head = smoothCylinderDistance(headPoint, 0.25, 0.25, smoothing);
    
    vec3 skirtPoint = point - vec3(0.0, 0.0, camAttachment.z + 0.65);
    float skirtCut = cylinderDistance(skirtPoint, 0.25, 0.2);

    vec3 wristPoint = point - vec3(0.0, 0.15, camAttachment.z + 0.95);
    float wristCut = cylinderDistance(wristPoint, 0.1, 0.05);
    
    float headCuts = min(skirtCut, wristCut);
    float headComposite = opSmoothSubtraction(headCuts, head, 0.01);
    dist = min(dist, headComposite);
    
    return dist;
}

// Thanks to Blackle Mori for their video on domain repetition.
float sceneDistance(vec3 point, float worldTime) {
    float center = (floor(point.z * 1.8) + 0.5) / 1.8;
    float neighborCenter = center + ((point.z < center) ? -1.0 : 1.0);

    float me = partDistance(point - vec3(0.0, 0.0, center), 3.14159 * floor(center), worldTime);
    float neighbor = boxDistance(point, vec3(0.0, 0.6, neighborCenter), vec3(0.6, 1.2, 0.70));
    float partComposite = min(me, neighbor);
    
    float container = boxDistance(point, vec3(0.0, 0.6, 0.56), vec3(1.0, 1.4, 1.1));
    return opSmoothIntersection(partComposite, container, 0.02);
}

#define ZERO int(min(iFrame, 0.0))

vec3 sceneNormal(vec3 point, float worldTime) {
  #if 0
    float epsilon = 0.0001;
    vec3 xOffset = vec3(epsilon, 0.0, 0.0);
    vec3 yOffset = vec3(0.0, epsilon, 0.0);
    vec3 zOffset = vec3(0.0, 0.0, epsilon);
    
    vec3 direction = vec3(
        sceneDistance(point + xOffset, worldTime) - sceneDistance(point - xOffset, worldTime),
        sceneDistance(point + yOffset, worldTime) - sceneDistance(point - yOffset, worldTime),
        sceneDistance(point + zOffset, worldTime) - sceneDistance(point - zOffset, worldTime)
    );
    
    return normalize(direction);
  #else
    // Snagged from iq's "Raymarching - Primitives" shader,
    // which in turn says this is inspired by tdhooper and klems.
    vec3 n = vec3(0.0);
    for(int i = ZERO; i < 4; i += 1) {
        vec3 e = 0.5773 * (2.0 * vec3((((i + 3) >> 1) & 1), ((i >> 1) & 1), (i & 1)) - 1.0);
        n += e * sceneDistance(point + 0.0005 * e, worldTime);
    }

    return normalize(n);
  #endif
}

vec3 cameraRay(vec2 uv, vec3 position, vec3 lookAt, float zoom) {
    vec3 forward = normalize(lookAt - position);
    vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
    vec3 up = cross(forward, right);
    vec3 lensPlane = forward * zoom;
    vec3 lensPoint = lensPlane + uv.x * right + uv.y * up;
    vec3 direction = normalize(lensPoint);
    return direction;
}

vec2 equirectangularMap(vec3 d) {
    float x = atan(d.y, d.x);
    float y = acos(clamp(d.z, -1.0, 1.0));
    return vec2(x / (2.0 * 3.14159265) + 0.5, y / 3.14159265);
}

vec3 skyColor(vec3 direction) {
    vec2 uv = equirectangularMap(direction);
    return texture(iChannel0, uv).xyz;
}

struct TraceResult {
    bool hit;
    vec3 point;
    vec3 incoming;
};

TraceResult sceneTrace(vec3 origin, vec3 direction, float worldTime) {
  bool hit = false;
  vec3 testPoint;

  float time = 0.0;
  float tfar = 6.0;
  vec2 bounds = boxIntersect(origin - vec3(0.0, 0.45, 0.55), direction, vec3(0.6, 1.2, 1.15));
  if (bounds.x < bounds.y && bounds.y > 0.0) {
      time = max(time, bounds.x);
      tfar = min(tfar, bounds.y);

      for (int i = 0; i < 128; i += 1) {
          testPoint = origin + direction * time;
          float dist = sceneDistance(testPoint, worldTime);
          if (dist < 0.0001) {
              hit = true;
              break;
          }

          time += dist;
          if(time > tfar) { break; }
      }
  }

  return TraceResult(hit, testPoint, direction);
}

float sceneOcclusion(vec3 point, vec3 normal, float worldTime) {
    float dist = 0.04;
    float occlusion = 1.0;
    for (int index = 0; index < 3; index += 1) {
        occlusion = min(occlusion, sceneDistance(point + dist * normal, worldTime) / dist);
        dist *= 0.8;
    }

    return max(occlusion, 0.05);
}

mat2 rotate(float a) {
    float y = sin(a);
    float x = cos(a);
    return mat2(x, -y, y, x);
}

vec3 sceneColor(vec2 uv, float worldTime) {
    // Thanks to BigWIngs for their mouse input stuff.
    vec2 mouse = iMouse.x > 20.0 && iMouse.y > 20.0
        ? iMouse.xy / iResolution.xy
        : vec2(0.40, 0.50);

    vec3 initialOrigin = vec3(0.0, 3.0, -3.0);
    initialOrigin.yz *= rotate(-mouse.y * 3.14 + 1.0);
    initialOrigin.xz *= rotate(-mouse.x * 6.2831);

    vec3 initialDirection = cameraRay(uv, initialOrigin, vec3(0.0, 0.55, 0.6), 1.45);
    
    vec3 origin = initialOrigin;
    vec3 direction = initialDirection;
    
    vec3 color = vec3(1.0);
    bool completedAllBounces = true;
    for (int b = 0; b < maximumBounces; b++) {
        TraceResult res = sceneTrace(origin, direction, worldTime);
        
        if (!res.hit) {
            color = color * skyColor(res.incoming) * 2.0;
            completedAllBounces = false;
            break;
        }
        
        vec3 normal = sceneNormal(res.point, worldTime);
        
        // Apply AO to our first hit.
        if (b == 0) {
            color = color * sceneOcclusion(res.point, normal, worldTime);
        }

        color = color * 0.5;
        
        direction = reflect(direction, normal);
        origin = res.point + direction * 0.001;
    }
    
    if (completedAllBounces) {
        return color * skyColor(direction);
    }

    return color;
}

vec2 coordToUv(vec2 coord) {
    return (coord - (iResolution.xy * 0.5)) / iResolution.y;
}

float hash31(vec3 seed) {
    vec3 temp = fract(seed * vec3(235.219, 392.452, 149.976));
    temp += dot(temp, temp + 23.12);
    return fract(temp.x * temp.y * temp.z);
}

const float goldenRatioConjugate = 0.61803398875;

// From demofox's Blue Noise Fog shader.
// Not 100% sure I'm applying this correctly,
// but does look a bit better than whitenoise
// I think :)
vec3 bluenoise(vec2 coord) {
    return texture(iChannel1, coord / 1024.0).xyz;
}

const float a = (3.0 / 8.0);
const float b = (1.0 / 8.0);

const vec2 msaaOffsets[] = vec2[](
    vec2(0.5625, 0.5625),
    vec2(0.4375, 0.3125),
    vec2(0.3125, 0.6250),
    vec2(0.7500, 0.4375),
    vec2(0.1875, 0.3750),
    vec2(0.6250, 0.8125),
    vec2(0.8125, 0.6875),
    vec2(0.6875, 0.1875),
    vec2(0.3750, 0.8750),
    vec2(0.5000, 0.0625),
    vec2(0.2500, 0.1250),
    vec2(0.1250, 0.2500),
    vec2(0.0000, 0.5000),
    vec2(0.9375, 0.2500),
    vec2(0.8750, 0.9375),
    vec2(0.0625, 0.0000)
);

// Doing a brute force trace of the scene at different times
// within the frame and mixing them together.
vec3 temporalSample(vec2 coord, float worldTime) {
    // Using iTimeDelta here for a natural looking motion blur.
    // Looks particularly nice at 144hz w/ 16 samples (:
    float shutterTime = iTimeDelta;
    int sampleCount = temporalSamples;
    float slice = shutterTime / float(sampleCount);
    vec3 jitter = bluenoise(coord);
    
    vec3 color = vec3(0.0);
    for (int sampleIndex = 0; sampleIndex < sampleCount; sampleIndex++) {
        float jitterTime = (float(sampleIndex) + 1.0) + float(iFrame + 1);
        vec3 adjustedJitter = fract(jitter + jitterTime * goldenRatioConjugate);

        float t = float(sampleIndex) / float(sampleCount);
        float sampleTime = useTemporalJitter
            ? (worldTime - shutterTime) + adjustedJitter.z * shutterTime
            : (worldTime - shutterTime * t);

        vec2 offset = msaaOffsets[sampleIndex % 16];

        vec2 uv = coordToUv(coord + offset);
        color += sceneColor(uv, sampleTime);
    }

    return color / float(sampleCount);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec3 color = temporalSample(fragCoord, iTime);
    vec3 toneMapped = hejl(color, 1.0);
    vec3 gammaCorrected = pow(toneMapped, vec3(1.0 / 2.2));
    fragColor = vec4(gammaCorrected, 1.0);
}

#include <../common/main_shadertoy.frag>