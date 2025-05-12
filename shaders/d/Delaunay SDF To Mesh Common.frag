const uint PARTICLE_COUNT = 500u;
const float MAX_VEL = 10.0;
const float MOUSE_BRUSH_RADIUS = 96.0;
const float DAMPING = 0.5;

const int MAX_VORONOI_VERTICES = 4; 

#define MAX_VELOCITY (MAX_VEL + MAX_VEL * (iMouse.z > 0.0 ?  0.1 : 0.0))

#define pi 3.14159265359
#define pi2 2.0 * pi

uint hash(inout uint x) {
    x ^= x >> 16;
    x *= 0x7feb352dU;
    x ^= x >> 15;
    x *= 0x846ca68bU;
    x ^= x >> 16;
    
    return x;
}

float randomFloat(inout uint state) {
    return float(hash(state)) / 4294967296.0;
} 

vec2 randomDir(inout uint state) {
    float z = randomFloat(state) * 2.0 - 1.0;
    float a = randomFloat(state) * pi2;
    float r = sqrt(1.0f - z * z);
    float x = r * cos(a);
    float y = r * sin(a);
    return vec2(x, y);
}

#define FLOAT_INF uintBitsToFloat(0x7f800000u)
#define PI 3.14159265

struct Entity {
    vec2 position;
    vec2 oldPosition;
};

// const Entity INVALID_ENTITY = Entity(vec2(-FLOAT_INF), vec2(0));


uint wrap1d(uint flatId) {
    return flatId % PARTICLE_COUNT;
}

vec2 wrap2d(vec2 id, vec2 resolution) {
    return fract(id / resolution) * resolution;
}

uint to1d(vec2 id, vec2 resolution) {
    return uint(id.x + id.y * resolution.x);
}

ivec2 to2d(uint flatId, ivec2 resolution) {
    return ivec2(flatId, flatId / uint(resolution.x)) % resolution;
}

Entity decodeEntity(sampler2D sampler, ivec2 id) {
    vec4 raw = texelFetch(sampler, id, 0);
    Entity entity;
    entity.position = raw.rg;
    entity.oldPosition = raw.ba;
    return entity;
}

Entity decodeEntity(sampler2D sampler, uint flatId) {
    return decodeEntity(sampler, to2d(flatId, textureSize(sampler, 0)));
}

vec4 encodeEntity(Entity entity) {
    return vec4(entity.position, entity.oldPosition);
}

uvec4 fetchClosest(vec2 position, sampler2D voroBuffer) {
    return floatBitsToUint(texelFetch(voroBuffer, ivec2(wrap2d(position, vec2(textureSize(voroBuffer, 0)))), 0));
}

uint murmur3( in uint u )
{
  u ^= ( u >> 16 ); u *= 0x85EBCA6Bu;
  u ^= ( u >> 13 ); u *= 0xC2B2AE35u;
  u ^= ( u >> 16 );

  return u;
}

uint rngSeed = 314159265u;

uint xorshift(in uint value) {
    value ^= value << 13;
    value ^= value >> 17;
    value ^= value << 5;
    return value;
}

float xorshiftFloat(uint state) {
    return float(xorshift(state)) / float(0xffffffffU);
}

uint nextUint() {
    rngSeed = xorshift(rngSeed);
    return rngSeed;
}

float nextFloat() {
    return float(nextUint()) / float(uint(-1));
}


float sdSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p-a, ba = b-a;
    float h = clamp(dot(pa,ba)/dot(ba,ba), 0.0, 1.0);
    return length(pa - ba*h);
}


float sdCross( in vec2 p) {
    vec2 b = vec2(0.625, 0.1);
    float r = 0.1;
    p = abs(p); p = (p.y>p.x) ? p.yx : p.xy;
    vec2  q = p - b;
    float k = max(q.y,q.x);
    vec2  w = (k>0.0) ? q : vec2(b.y-p.x,-k);
    return (sign(k)*length(max(w,0.0)) + r) - 0.15;
}

vec2 gsdCross(vec2 p) {
    const float h = 0.0001;
    return vec2(
        sdCross(vec2(p.x + h, p.y)) - sdCross(vec2(p.x - h, p.y)),
        sdCross(vec2(p.x, p.y + h)) - sdCross(vec2(p.x, p.y - h))
    ) / (2.0 * h);
}