// --- Migrate Log ---
// 迁移日期: 2025-12-19
// - 该文件为公共库文件，仅添加迁移说明以记录变更；故不在此处包含 common_header.frag（避免循环包含）。
// - 若本文件中存在全局数组或位运算（例如使用 uint 位移/掩码），请手动替换为兼容的 getter/算术实现。
// --- Migrate Log (EN) ---
// Migration date: 2025-12-19
// - This is a shared/common shader file. Only a migration note was added here; do NOT include common_header.frag to avoid include cycles.
// - If global arrays or bitwise operations exist here, consider replacing them with getter/arithmetic implementations for target GLSL compatibility.

#define saturate(a) clamp(a, 0.0, 1.0)
const float PI=3.14159265;

// Makes compile times much faster.
// Forces for loops to not unroll because compiler thinks the zero is not a constant.
#define ZERO_TRICK max(0, -iFrame)

vec2 Rotate(vec2 v, float rad)
{
  float cos = cos(rad);
  float sin = sin(rad);
  return vec2(cos * v.x - sin * v.y, sin * v.x + cos * v.y);
}
vec3 RotateX(vec3 v, float rad)
{
  float cos = cos(rad);
  float sin = sin(rad);
  return vec3(v.x, cos * v.y + sin * v.z, -sin * v.y + cos * v.z);
}
vec3 RotateY(vec3 v, float rad)
{
  float cos = cos(rad);
  float sin = sin(rad);
  return vec3(cos * v.x - sin * v.z, v.y, sin * v.x + cos * v.z);
}
vec3 RotateZ(vec3 v, float rad)
{
  float cos = cos(rad);
  float sin = sin(rad);
  return vec3(cos * v.x + sin * v.y, -sin * v.x + cos * v.y, v.z);
}
// Find 2 perpendicular vectors to the input vector.
mat3 MakeBasis(vec3 normal) {
	mat3 result;
    result[0] = normal;
    if (abs(normal.y) > 0.5) {
        result[1] = normalize(cross(normal, vec3(1.0, 0.0, 0.0)));
    } else {
        result[1] = normalize(cross(normal, vec3(0.0, 1.0, 0.0)));
    }
    result[2] = normalize(cross(normal, result[1]));
    return result;
}


// ---- Random functions use one 32 bit state var to change things up ----
// This is the single state variable for the random number generator.
uint randomState = 4056649889u;
// 0xffffff is biggest 2^n-1 that 32 bit float does exactly.
// Check with Math.fround(0xffffff) in javascript.
const float invMax24Bit = 1.0 / float(0xffffff);

// This is the main hash function that should produce a non-repeating
// pseudo-random sequence for 2^31 iterations.
uint SmallHashA(in uint seed) {
    return (seed ^ 1057926937u) * 3812423987u ^
            ((seed*seed) * 4000000007u);
}
// This is an extra hash function to clean things up a little.
uint SmallHashB(in uint seed) {
    return (seed ^ 2156034509u) * 3699529241u;
}

// Hash the random state to get a random float ranged [0..1]
float RandFloat() {
    randomState = SmallHashA(randomState);
    // Add these 2 lines for extra randomness. And change last line to tempState.
    //uint tempState = (randomState << 13) | (randomState >> 19);
    //tempState = SmallHashB(tempState);
    return float((randomState>>8) & 0xffffffu) * invMax24Bit;
}
// Hash the random state to get 2 random floats ranged [0..1]
// Reduced precision to 16 bits per component.
vec2 RandVec2() {
    randomState = SmallHashA(randomState);
    uint tempState = (randomState << 13) | (randomState >> 19);
    tempState = SmallHashB(tempState);
    return vec2(tempState & 0xffffu,
                (tempState >> 16) & 0xffffu) / float(0xffff);
}
// Hash the random state to get 3 random floats ranged [0..1]
// Reduced precision to 10 bits per component.
vec3 RandVec3() {
    randomState = SmallHashA(randomState);
    uint tempState = (randomState << 13) | (randomState >> 19);
    tempState = SmallHashB(tempState);
    return vec3((tempState >> 2) & 0x3ffu,
                (tempState >> 12) & 0x3ffu,
                (tempState >> 22) & 0x3ffu) / float(0x3ffu);
}

// Returns a random float from [0..1]
float HashFloat(uint seed) {
    seed = SmallHashA(seed);
    return float((seed >> 8) & 0xffffffu) * invMax24Bit;
}
// Reduced precision to 16 bits per component.
vec2 HashVec2(uint seed) {
    seed = SmallHashA(seed);
    seed = (seed << 13) | (seed >> 19);
    seed = SmallHashB(seed);
    return vec2(seed & 0xffffu,
                (seed >> 16) & 0xffffu) / float(0xffff);
}
// Reduced precision to 10 bits per component.
vec3 HashVec3(uint seed) {
    seed = SmallHashA(seed);
    seed = (seed << 13) | (seed >> 19);
    seed = SmallHashB(seed);
    return vec3((seed >> 2) & 0x3ffu,
                (seed >> 12) & 0x3ffu,
                (seed >> 22) & 0x3ffu) / float(0x3ffu);
}
// Reduced precision to ** 6 ** bits per component.
vec4 HashVec4(uint seed) {
    seed = SmallHashA(seed);
    seed = (seed << 13) | (seed >> 19);
    seed = SmallHashB(seed);
    return vec4((seed >> 8) & 0x3fu,
                (seed >> 14) & 0x3fu,
                (seed >> 20) & 0x3fu,
                (seed >> 26) & 0x3fu) / float(0x3fu);
}
float HashFloatI2(ivec2 seed2) {
    return HashFloat(uint(seed2.x ^ (seed2.y * 65537)));
}
vec2 HashVec2I2(ivec2 seed2) {
    return HashVec2(uint(seed2.x ^ (seed2.y * 65537)));
}
vec3 HashVec3I2(ivec2 seed2) {
    return HashVec3(uint(seed2.x ^ (seed2.y * 65537)));
}
vec4 HashVec4I2(ivec2 seed2) {
    return HashVec4(uint(seed2.x ^ (seed2.y * 65537)));
}

void SetRandomSeed(in vec2 fragCoord, in vec2 iResolution,
                  in int iFrame) {
    uint primex = max(uint(iResolution.x), 5003u);  // This prime is far from any 2^x
    randomState = uint(fragCoord.x);
    randomState += uint(fragCoord.y) * primex;
    randomState += uint(iFrame) * primex * uint(iResolution.y);
    // This shouldn't really be an if condition.
    // This should be true for any application that's not debugging things.
    //if (hashedSeed) {
        RandFloat();
    //}
}

// ---- Procedural textures ----

vec3 mingrad(vec3 a, vec3 b) {
    if (a.x < b.x) return a;
    else return b;
}

vec3 dCircle(vec2 uv, float rad) {
    vec2 grad = normalize(uv);
    return vec3(length(uv) - rad, grad);
}

vec3 dBox(vec2 uv, vec2 rad) {
    vec2 grad = (abs(uv.x*rad.y) > abs(uv.y*rad.x)) ? vec2(1, 0) : vec2(0, 1);
    grad *= sign(uv);

    vec2 dist = abs(uv) - rad;
    float d = min(max(dist.x, dist.y), 0.0) + length(max(dist, 0.0));
    return vec3(d, grad);

    //return vec3(length(uv) - rad, grad);
}

vec4 texPanels(vec2 uv, out vec3 normal) {
    vec4 hash = HashVec4I2(ivec2(floor(uv+.0)));
    vec4 hash2 = HashVec4I2(ivec2(hash*8192.0));
    vec4 hash3 = HashVec4I2(ivec2(hash2*8192.0));
    ivec2 fl = ivec2(floor(uv));
    vec2 centered = fract(uv) - 0.5;
    vec2 radOut = 0.35*hash2.xy + 0.1;
    radOut *= float((fl.x&1) ^ (fl.y&1)) *0.25+0.75;  // Checkerboard scale it so it looks less repetitive
    if (hash.z > 0.99) radOut.x = radOut.y;
    float radThick = 1.0 / 32.0;
    // Jitter it as much as possible without going out of radius.
    vec2 jitterPos = centered + (hash.xy*2.0-1.0)*(0.5-radOut);
    vec3 dc;
    if (hash.z > 0.99) dc = dCircle(jitterPos, radOut.x - radThick);
    else dc = dBox(jitterPos, vec2(radOut - radThick));
    float d = saturate(dc.x/radThick);
    if ((d <= 0.0) || (d >= 1.0)) dc.yz = vec2(0.0);

    normal = normalize(vec3(dc.yz, 1.0));
    return vec4(vec3(1, 1, 1)-d*0.1, 0.1-d*0.05);// vec3(hash3.rgb*(1.0-d));
}

#define ANTIALIASING_SAMPLES 1
vec4 texSolarPanels(vec2 uv, out vec3 normal) {
    vec4 hash = HashVec4I2(ivec2(floor(uv+vec2(0.5,.25))));
    ivec2 fl = ivec2(floor(uv));
    vec2 centered = fract(uv) - 0.5;
    float radThick = 1.0 / 64.0;
    vec3 dc = dBox(centered, vec2(0.02,0.55) - radThick);
    dc.x = saturate(dc.x/radThick);
    radThick *= 0.5;
    vec3 dc2 = dBox(centered - vec2(0, 0.25), vec2(0.55,0.0125) - radThick);
    dc2.x = saturate(dc2.x/radThick);
    vec3 dc3 = dBox(centered + vec2(0, 0.25), vec2(0.55,0.0125) - radThick);
    dc3.x = saturate(dc3.x/radThick);
    dc2 = mingrad(dc3, dc2);
    dc = mingrad(dc, dc2);
    float d = dc.x;
    if ((d <= 0.0) || (d >= 1.0)) dc.yz = vec2(0.0);

    normal = normalize(vec3(dc.yz + vec2(abs(sin((uv.x + 0.5)*PI)*0.1), 0.0), 1.0));
    float pad = (d < 1.0) ? 1.0 : 0.0;
    vec4 padCol = mix(vec4(1,1,1,0.25)*0.5, vec4(0.7, 0.5, 0.1, 0.5)*0.25, hash.x);
    //float maxDelta = max(dFdy(uv.x), dFdy(uv.y));
    //return vec4(vec3(1.0)* maxDelta, 0.0);
#if ANTIALIASING_SAMPLES == 1
    return mix(vec4(.01, .015, .1, 0.8), vec4(0.7, 0.5, 0.1, 0.5)*0.5, 0.1);
#endif

    return mix(vec4(.01, .015, .1, 0.8), padCol, pad);
}

vec4 texHex(vec2 uv, out vec3 normal) {
    vec4 hash = HashVec4I2(ivec2(floor(uv+.0)));
    ivec2 fl = ivec2(floor(uv));
    vec2 centered = fract(uv) - 0.5;
    
    float repx = abs(fract(uv.x)-0.5)*2.0;
    float repy = abs(fract(uv.y)-0.5)*2.0;

    normal = normalize(vec3(0,0,1.0));
    return vec4(vec3(repx, repy, 1),0.0);
}

