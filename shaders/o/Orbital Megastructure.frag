/*--------------------------------------------------------------------------------------
License CC0 - http://creativecommons.org/publicdomain/zero/1.0/
To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to this software to the public domain worldwide. This software is distributed without any warranty.
----------------------------------------------------------------------------------------
^ This means do ANYTHING YOU WANT with this code. Because we are programmers, not lawyers.
-Otavio Good
*/

// Set to 0 for no anti-aliasing (faster).
// Otherwise, set it to the size of the box filter, like 2 for 2x2, 3 for 3x3, 4 for 4x4.
#define ANTI_ALIAS_SIZE 0

// Space station rotation rate
#define ROT_SPEED -0.05
// I approximated this one based on watching videos from the ISS.
#define EARTH_ROT_SPEED 0.002
const float earthRad = 6371.0; // 6371 km
// Low earth orbit - approximate ISS altitude in km. ISS isn't constant altitude, so...
const vec3 earthPos = normalize(vec3(-6500,-6400,-3400)) * (earthRad + 408.0);

// ---- noise functions ----
float v31(vec3 a)
{
    return a.x + a.y * 37.0 + a.z * 521.0;
}
float v21(vec2 a)
{
    return a.x + a.y * 37.0;
}
float Hash11(float a)
{
    return fract(sin(a)*10403.9);
}
float Hash21(vec2 uv)
{
    float f = uv.x + uv.y * 37.0;
    return fract(sin(f)*104003.9);
} 
vec2 Hash22(vec2 uv)
{
    float f = uv.x + uv.y * 37.0;
    return fract(cos(f)*vec2(10003.579, 37049.7));
}
vec2 Hash12(float f)
{
    return fract(cos(f)*vec2(10003.579, 37049.7));
}
float Hash1d(float u)
{
    return fract(sin(u)*143.9);	// scale this down to kill the jitters
}
float Hash2d(vec2 uv)
{
    float f = uv.x + uv.y * 37.0;
    return fract(sin(f)*104003.9);
}
float Hash3d(vec3 uv)
{
    float f = uv.x + uv.y * 37.0 + uv.z * 521.0;
    return fract(sin(f)*110003.9);
}
float mixP(float f0, float f1, float a)
{
    return mix(f0, f1, a*a*(3.0-2.0*a));
}
const vec2 zeroOne = vec2(0.0, 1.0);
float noise2d(vec2 uv)
{
    vec2 fr = fract(uv.xy);
    vec2 fl = floor(uv.xy);
    float h00 = Hash2d(fl);
    float h10 = Hash2d(fl + zeroOne.yx);
    float h01 = Hash2d(fl + zeroOne);
    float h11 = Hash2d(fl + zeroOne.yy);
    return mixP(mixP(h00, h10, fr.x), mixP(h01, h11, fr.x), fr.y);
}
float noise(vec3 uv)
{
    vec3 fr = fract(uv.xyz);
    vec3 fl = floor(uv.xyz);
    float h000 = Hash3d(fl);
    float h100 = Hash3d(fl + zeroOne.yxx);
    float h010 = Hash3d(fl + zeroOne.xyx);
    float h110 = Hash3d(fl + zeroOne.yyx);
    float h001 = Hash3d(fl + zeroOne.xxy);
    float h101 = Hash3d(fl + zeroOne.yxy);
    float h011 = Hash3d(fl + zeroOne.xyy);
    float h111 = Hash3d(fl + zeroOne.yyy);
    return mixP(
        mixP(mixP(h000, h100, fr.x),
             mixP(h010, h110, fr.x), fr.y),
        mixP(mixP(h001, h101, fr.x),
             mixP(h011, h111, fr.x), fr.y)
        , fr.z);
}
// -------------------------


// This function basically is a procedural environment map that makes the sun
vec3 GetSunColorSmall(vec3 rayDir, vec3 sunDir, vec3 sunCol)
{
	vec3 localRay = normalize(rayDir);
	float dist = 1.0 - (dot(localRay, sunDir) * 0.5 + 0.5);
	float sunIntensity = 0.05 / dist;
    //sunIntensity += exp(-dist*150.0)*7000.0;
	sunIntensity = min(sunIntensity, 40000.0);
	return sunCol * sunIntensity*0.01;
}

vec4 tex3d(vec3 pos, vec3 normal)
{
	// loook up texture, blended across xyz axis based on normal.
	vec4 texX = texture(iChannel2, pos.yz*4.0);
	vec4 texY = texture(iChannel2, pos.xz*4.0);
	vec4 texZ = texture(iChannel2, pos.xy*4.0);
	//vec4 texX = cubicTex(pos.yz);
	//vec4 texY = cubicTex(pos.xz);
	//vec4 texZ = cubicTex(pos.xy);
	vec4 tex = mix(texX, texZ, abs(normal.z*normal.z));
	tex = mix(tex, texY, abs(normal.y*normal.y));//.zxyw;
	return tex*tex;
}
struct RayHit
{
    vec3 normMin, normMax;
    float tMin, tMax;
    vec3 hitMin, hitMax;
};
const float bignum = 256.0*256.0*256.0;
RayHit NewRayHit()
{
    RayHit rh;
    rh.tMin = bignum;
    rh.tMax = bignum;
    rh.hitMin = vec3(0.0);
    rh.hitMax = vec3(0.0);
    rh.normMin = vec3(0.0);
    rh.normMax = vec3(0.0);
    return rh;
}
// note: There are faster ways to intersect a sphere.
RayHit SphereIntersect2(vec3 pos, vec3 dirVecPLZNormalizeMeFirst, vec3 spherePos, float rad)
{
    RayHit rh = NewRayHit();
    vec3 delta = spherePos - pos;
    float projdist = dot(delta, dirVecPLZNormalizeMeFirst);
    vec3 proj = dirVecPLZNormalizeMeFirst * projdist;
    vec3 bv = proj - delta;
    float b = length(bv);
    if (b > rad) {
        //rh.tMin = bignum;
        //rh.tMax = bignum;
        return rh;
    }
    float x = sqrt(rad*rad - b*b);
    rh.tMin = projdist - x;
    if (rh.tMin < 0.0) {
        rh.tMin = bignum;
        return rh;
    }
    rh.tMax = projdist + x;
    rh.hitMin = pos + dirVecPLZNormalizeMeFirst * rh.tMin;
    rh.hitMax = pos + dirVecPLZNormalizeMeFirst * rh.tMax;
    rh.normMin = normalize(rh.hitMin - spherePos);
    rh.normMax = normalize(spherePos - rh.hitMax);
    return rh;
}

// This function renders the earth.
vec3 GetEnvMapSpace(vec3 camPos, vec3 rayDir, vec3 sunDir, vec3 sunCol, float sunShadow)
{
    vec3 finalColor;
    vec3 atmosphereColor = vec3(70.0, 150.0, 240.0)/400.0;
    //float hit = SphereIntersect(camPos, normalize(rayVec), earthPos, earthRad);
    RayHit rh = SphereIntersect2(camPos, normalize(rayDir), earthPos, earthRad);
    RayHit rh2 = SphereIntersect2(camPos, normalize(rayDir), earthPos, earthRad + 77.0);
    if (rh.tMin < rh.tMax)
    {
        vec3 intersection = rh.hitMin;// camPos + rayVec * hit;
        vec3 normal = rh.normMin;// normalize(intersection - earthPos);
        vec3 rotNormal = RotateX(normal, iTime*EARTH_ROT_SPEED+0.05); // This is the "right way" if I'm using 3d textures.
//        vec3 rotNormal = (normal + iTime*EARTH_ROT_SPEED).yzz; // This is the hacky 2d texture way.

        //finalColor = texture(iChannel2, vec2(normal.z, normal.y)).xyz;
        vec3 surface = vec3(0.01, 0.03, 0.081);
        vec3 landTex = texture(iChannel2, rotNormal.xy * 0.25 + vec2(0.0, sin(rotNormal.z*2.0)*.25)).xyz;
        vec3 land = landTex*vec3(0.19,0.22,0.16)*0.4;
        vec3 landDry = landTex.yzx*vec3(0.31,0.26,0.22)*0.33;
        land = mix(land, landDry, saturate(pow(landTex.y+.4,20.0)));
        float landMask = landTex.y*1.3;
        landMask += texture(iChannel2, rotNormal.yz * vec2(0.25,0.333)).y*1.3;
        landMask = saturate(pow(landMask-0.1, 60.0));
        surface=mix(surface,land,landMask);

        //float clouds = texture(iChannel2, normal.xz*4.0*0.75).y * texture(iChannel2, -normal.xz*3.75*4.0).z*4.5;
        //surface += clouds*clouds*0.125;
//        surface += tex3d(normal * 0.75 /*+ vec3(0, sin(normal.x), 0)*/, normal).yyy * tex3d(-normal.xyz * 3.75, normal).zzz*4.5;
        float clouds = tex3d(rotNormal * 0.5, rotNormal).y *
                   tex3d((-rotNormal.xyz    + vec3(sin(rotNormal.y*15.0)*.02)    ) * 3.75, rotNormal).z *
                   4.5;
        surface += clouds;

//        surface += tex3d(rotNormal * 0.5, rotNormal).yyy *
//                   tex3d((-rotNormal.xyz    + vec3(sin(rotNormal.y*15.0)*.02)    ) * 3.75, rotNormal).zzz *
//                   4.5;
//        surface += texture(iChannel2, Rotate(rotNormal.xz,1.0) * 2.5).yyy *
  //                 texture(iChannel2, (rotNormal.zx     + vec2(0.0, sin(rotNormal.z*60.0)*.005)     ) * vec2(13.75,11.0)).zzz *
    //               (0.2+texture(iChannel2, rotNormal.yz * vec2(37.75,39.0)).xxx*0.8) *
      //             1.5;
        //surface = texture(iChannel2, (rotNormal.zx     + vec2(0.0, sin(rotNormal.z*80.0)*0.005)     )).xyz*0.5;
        float d = dot(normal, normalize(camPos - intersection));

        float atmosphere = 1.0 - d;
        atmosphere = pow(atmosphere, 3.0);
        atmosphere = atmosphere * 0.9 + 0.1;
        surface = mix(surface, atmosphereColor, atmosphere);
        finalColor = surface;
        //finalColor = vec3(1.0) * d;
        //finalColor = normal * 0.5 + 0.5;
    }
    else
    {
        // Our ray trace hit nothing, so draw sky.
        finalColor = GetSunColorSmall(rayDir, sunDir, sunCol) * sunShadow;
    }
    if ((rh2.tMin < rh2.tMax)) {
        vec3 a = rh2.hitMin;
        vec3 b = rh2.hitMax;
        if (rh.tMin < rh.tMax) {
            b = rh.hitMin;
        }
        //finalColor = mix(fogColor, finalColor, exp(-t*0.02));
        finalColor += pow(saturate(0.044 * atmosphereColor * exp(distance(a,b)*0.0018)), vec3(2.0));
    }
    return finalColor;
}
vec3 GetEnvMapSpaceGlossy(vec3 camPos, vec3 rayDir, vec3 sunDir, vec3 sunCol, float sunShadow)
{
    vec3 finalColor;
    vec3 atmosphereColor = vec3(70.0, 130.0, 240.0)/355.0;

    float dSun = max(0.0, dot(rayDir, sunDir));
    dSun = pow(dSun,7.0);
    float dEarth = dot(rayDir, normalize(earthPos)) * 0.5 + 0.5;
    dEarth = pow(dEarth,3.0)*0.6;
    
    //d1 = pow(d1,7.0)*2.0;
    finalColor = sunCol * dSun * sunShadow + atmosphereColor * dEarth;
    return finalColor;
}



// min function that supports materials in the y component
vec2 matmin(vec2 a, vec2 b)
{
    if (a.x < b.x) return a;
    else return b;
}
vec2 matmax(vec2 a, vec2 b)
{
    if (a.x > b.x) return a;
    else return b;
}
void matmin(inout float distA, inout uint matA, float distB, uint matB) {
    if (distA > distB) {
        distA = distB;
        matA = matB;
    }
}
void matmax(inout float distA, inout uint matA, float distB, uint matB) {
    if (distA < distB) {
        distA = distB;
        matA = matB;
    }
}

// ---- shapes defined by distance fields ----
// See this site for a reference to more distance functions...
// https://iquilezles.org/articles/distfunctions

// signed box distance field
float sdBox(vec3 p, vec3 radius)
{
  vec3 dist = abs(p) - radius;
  return min(max(dist.x, max(dist.y, dist.z)), 0.0) + length(max(dist, 0.0));
}

// capped cylinder distance field
float cylCap(vec3 p, float r, float lenRad)
{
    float a = length(p.xy) - r;
    a = max(a, abs(p.z) - lenRad);
    return a;
}
float sdHexPrism( vec3 p, vec2 h )
{
  const vec3 k = vec3(-0.8660254, 0.5, 0.57735);
  p = abs(p);
  p.xy -= 2.0*min(dot(k.xy, p.xy), 0.0)*k.xy;
  vec2 d = vec2(
       length(p.xy-vec2(clamp(p.x,-k.z*h.x,k.z*h.x), h.x))*sign(p.y-h.x),
       p.z-h.y );
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}

float sdCone( vec3 p, vec2 c, float h )
{
  float q = length(p.xz);
  return max(dot(c.xy,vec2(q,p.y)),-h-p.y);
}

// k should be negative. -4.0 works nicely.
// smooth blending function
float smin(float a, float b, float k)
{
	return log2(exp2(k*a)+exp2(k*b))/k;
}

#define Repeat(a, len) (mod(a, len) - 0.5 * len)
vec3 RepeatX(vec3 a, float len) {
    return vec3(mod(a.x, len) - 0.5 * len, a.yz);
}
vec2 RepeatX(vec2 a, float len) {
    return vec2(mod(a.x, len) - 0.5 * len, a.y);
}
vec3 RepeatY(vec3 a, float len) {
    return vec3(a.x, mod(a.y, len) - 0.5 * len, a.z);
}
vec2 RepeatY(vec2 a, float len) {
    return vec2(a.x, mod(a.y, len) - 0.5 * len);
}
vec3 RepeatZ(vec3 a, float len) {
    return vec3(a.xy, mod(a.z, len) - 0.5 * len);
}

vec3 FlipX(vec3 a, float rad) {
    return vec3(abs(a.x) - rad, a.yz);
}
vec3 FlipY(vec3 a, float rad) {
    return vec3(a.x, abs(a.y) - rad, a.z);
}
vec3 FlipZ(vec3 a, float rad) {
    return vec3(a.xy, abs(a.z) - rad);
}
vec2 FlipX(vec2 a, float rad) {
    return vec2(abs(a.x) - rad, a.y);
}
vec2 FlipY(vec2 a, float rad) {
    return vec2(a.x, abs(a.y) - rad);
}
float Flip(float a, float rad) {
    return abs(a) - rad;
}

vec3 Symmetric4X(vec3 p, float rad) {
    return vec3(p.x, max(abs(p.yz), abs(p.zy)) - rad);
}
vec3 Symmetric4Y(vec3 p, float rad) {
    return vec3(max(abs(p.x), abs(p.z)) - rad, p.y, max(abs(p.z), abs(p.x)) - rad);
}
vec3 Symmetric4Z(vec3 p, float rad) {
    return vec3(max(abs(p.xy), abs(p.yx)) - rad, p.z);
}

vec3 cylTransform(vec3 p) {
    vec3 result = p;
    result.x = 26.0*(atan(p.z, p.x)/ PI);
    result.z = length(p.xz);
    return result;
}

float repsDouble(float a)
{
    return abs(a * 2.0 - 1.0);
}
vec2 repsDouble(vec2 a)
{
    return abs(a * 2.0 - 1.0);
}
vec2 mapSpiral(vec2 uv)
{
    float len = length(uv);
    float at = atan(uv.x, uv.y);
    at = at / PI;
    float dist = (fract(log(len)+at*0.5)-0.5) * 2.0;
    //dist += sin(at*32.0)*0.05;
    // at is [-1..1]
    // dist is [-1..1]
    at = repsDouble(at);
    at = repsDouble(at);
    return vec2(dist, at);
}

float length8( vec3 p ) { p=p*p; p=p*p; p=p*p; return pow(p.x+p.y+p.z,1.0/8.0); }
float length8( vec2 p ) { p=p*p; p=p*p; p=p*p; return pow(p.x+p.y,1.0/8.0); }
float lengthM( vec3 p ) {
    float temp = abs(p.x) + abs(p.y) + abs(p.z);
    temp *= 0.5773;
    return temp;
}
float sdTorus( vec3 p, vec2 t )
{
  vec2 q = vec2(length8(p.xz)-t.x,p.y);
  return length(q)-t.y;
}
float sdTorusHard( vec3 p, vec2 t )
{
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length8(q)-t.y;
}

float sdRoundBox( vec3 p, vec3 b, float r )
{
  vec3 q = abs(p) - b;
  return lengthM(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
}

float Truss(vec3 p, float bigRad, float smallRad, float rungRad, float size) {
    // Bounding box for faster marching when far away
    float bound = sdBox(p, vec3(size, size, rungRad) + bigRad);
    if (bound > size*0.5) return bound;

    float d = length(FlipY(FlipX(p.xy, size), size)) - bigRad;
    // 4-way symmetric
    vec3 rep4 = vec3( max(abs(p.xy), abs(p.yx)) - size, Repeat(p.z, size*2.0));
    float d2 = length(rep4.xz) - smallRad;
    d = min(d, d2);

    vec3 rot = RotateX(p, PI*0.25);
    rot = FlipX(rot, size);
    rot.z += 1.414*0.5*size;
    rot = RepeatZ(rot, 1.414*size);
    d2 = length(rot.xz) - smallRad;
    d2 = max(d2, Flip(p.y, size));
    d = min(d, d2);

    rot = RotateY(p, PI*0.25);
    rot = FlipY(rot, size);
    rot.z += 1.414*0.5*size;
    rot = RepeatZ(rot, 1.414*size);
    d2 = length(rot.yz) - smallRad;
    d2 = max(d2, Flip(p.x, size));
    d = min(d, d2);
    d = max(d, Flip(p.z, rungRad));
    return d;
}

// Low numbers are assumed to be in the cylinder inner or outer transform.
const uint matFloor = 1u;
const uint matWall = 2u;
const uint matPipe = 3u;
const uint matChrome = 4u;
const uint matGlossyRough = 5u;
const uint matSideWindows = 6u;
const uint matYellow = 7u;
const uint matBoring = 8u;
const uint matDome = 9u;

// High numbers should be in world space transform.
const uint matSolarPanel = 100u;
const uint matSpoke = 101u;

const uint matRGB = 202u;

uint SetMatRGB(uint r, uint g, uint b) {
    return matRGB | (r << 24) | (g << 16) | (b << 8);
}
bool IsMatRGB(uint m) {
    return (m & 0xffu) == matRGB;
}
vec3 GetMatRGB(uint m) {
    return vec3(float((m >> 24) & 0xffu), float((m >> 16) & 0xffu), float((m >> 8) & 0xffu));
}
// A collection of nice colors for the long landing bay looking things on the ring.
// Is this slowing my framerate?
const uint niceColors[4] = uint[](
    matRGB | (76u << 24) | (67u << 16) | (8u << 8),
    matRGB | (76u << 24) | (10u << 16) | (4u << 8),
    matRGB | (50u << 24) | (96u << 16) | (86u << 8),
    matRGB | (10u << 24) | (7u << 16) | (3u << 8)
);

void Dish(vec3 p, out float dist, out uint mat) {
    //dist = length(p + vec3(0.125,0,0)) - 0.3;
    //if (dist > 0.1) return;
    float d = sdTorusHard(FlipY(p, 0.03), vec2(0.1, 0.01));
    dist = d;
    mat = matGlossyRough;
    d = length(p + vec3(0.32,0,0)) - 0.22;
    d = max(d, -(length(p + vec3(0.43,0,0)) - 0.25));
    d = max(d, -p.x-0.25);
    float d2 = length(p.yz) - 0.15;
    d = max(d, d2)*0.7; // This multiplier is a total hack because the distance field is breaking down.
    matmin(dist, mat, d, SetMatRGB(90u,90u,90u));

    vec3 pr = RotateZ(p + vec3(0.37, 0, 0), PI * 0.25);
    d = length(pr.xz) - 0.01;
    d = max(d, Flip(pr.y+0.107, 0.11));
    matmin(dist, mat, d, SetMatRGB(128u,128u,128u));
    d2 = cylCap(p.yzx + vec3(0,0,0.38), .035, .005);
    matmin(dist, mat, d2, matGlossyRough);
}

// How much space between voxel borders and geometry for voxel ray march optimization
float voxelPad = 0.005;
// p should be in [0..1] range on xz plane
// pint is an integer pair saying which city block you are on
void CityBlock(vec3 p, ivec2 pint, out float dist, out uint mat)
{
    // Get random numbers for this block by hashing the city block variable
    vec4 rand;
    rand = HashVec4I2(pint);
    vec4 rand2 = HashVec4I2(ivec2(rand.zw*8192.0)+pint*127);
    vec4 rand3 = HashVec4I2(pint + 8192);
    vec4 randBig = HashVec4I2((ivec2(pint.x >> 1, pint.y >> 3)) + 1024);
    vec4 randBigger = HashVec4I2((pint >> 2) + 2048);

    float downtown = saturate(40.0 / length(vec2(pint.x,(    (pint.y+50)%100-50    )*8)));
    //vec2 distAndMat;
    if (randBigger.w < 0.97) {
        if (randBig.w > 0.15) {
            // Radius of the building
            float baseRad;// = 0.02 + (rand.x) * 0.1;
            //baseRad = floor(baseRad * 20.0+0.5)/20.0;	// try to snap this for window texture
            baseRad=0.48 * max(0.1,1.0-rand.x);

            // make position relative to the middle of the block
            vec3 baseCenter = p - vec3(0.5 + (0.5-baseRad)*(rand.y*2.0-1.0)*0.7, 0.0, 0.5 + (0.5-baseRad)*(rand.z*2.0-1.0)*0.7);
            float height = rand.w*0.5 + 0.1; // height of first building block
            // Make the city skyline higher in the middle of the city.
            //downtown = texture(iChannel2,vec2(pint)*0.01).x;
            height *= downtown*1.8;
            //height += 0.25;	// minimum building height
            //height *= rand.x*1.93;// baseRad-0.15;
            //height += sin(iTime + pint.x);	// animate the building heights if you're feeling silly
            height = floor(height*20.0)*0.05;	// height is in floor units - each floor is 0.05 high.
            float d = sdBox(baseCenter, vec3(baseRad, height, baseRad)-0.02) - 0.02; // large building piece
            //d /= max(1.0, height*2.0);

            // floor
            d = min(d, p.y);

            //if (length(pint.xy) > 8.0) return vec2(d, mat);	// Hack to LOD in the distance

            // height of second building section
            float height2 = rand.y * 0.3;
            height2 = floor(height2*20.0)*0.05;	// floor units
            rand2 = floor(rand2*20.0)*0.05;	// floor units
            // side pieces of building
            d = min(d, sdBox(baseCenter - vec3(0.0, height, 0.0), vec3(baseRad, height2 - rand2.y, baseRad*0.4)-0.02)-0.02);
            d = min(d, sdBox(baseCenter - vec3(0.0, height, 0.0), vec3(baseRad*0.4, height2 - rand2.x, baseRad)-0.02)-0.02);
            // second building section
            if (rand2.y > 0.5)
            {
                d = min(d, sdBox(baseCenter - vec3(0.0, height, 0.0), vec3(baseRad*0.8*(rand2.y+.1), height2, baseRad*0.8*(rand2.z+.1))));
                // subtract off piece from top so it looks like there's a wall around the roof.
                //float topWidth = baseRad;
                //if (height2 > 0.0) topWidth = baseRad * 0.8;
                //d = max(d, -sdBox(baseCenter - vec3(0.0, height+height2, 0.0), vec3(topWidth-0.5*rand.w, 0.01, topWidth-0.5*rand.x)));
            }
            else
            {
                // Pointy top section of building
                if (rand2.z > 0.5) d = min(d, sdHexPrism((baseCenter - vec3(0.0, height, 0.0)).xzy, vec2(baseRad*0.7, height2))-0.05);
            }
            // mini elevator shaft boxes on top of building
            //d = min(d, sdBox(baseCenter - vec3((rand.x-0.5)*baseRad, height+height2, (rand.y-0.5)*baseRad),
            //                 vec3(baseRad*0.3*rand.z, 0.01*rand2.y, baseRad*0.3*rand2.x+0.025)));
            // mirror another box (and scale it) so we get 2 boxes for the price of 1.
            //vec3 boxPos = baseCenter - vec3((rand2.x-0.5)*baseRad, height+height2, (rand2.y-0.5)*baseRad);
            //float big = sign(boxPos.x);
            //boxPos.x = abs(boxPos.x)-0.02 - baseRad*0.3*rand.w;
            //d = min(d, sdBox(boxPos, vec3(baseRad*0.4*rand.w, 0.02*rand.y, baseRad*0.5*rand.x + big*0.025)));

            //if (rand2.x > 0.75) {
                //float tor = sdTorus(
                //    (baseCenter - vec3(0.0, height+height2 + 0.05 - baseRad, baseRad * (rand2.z*2.0-1.0))).xzy,
                //                    vec2(0.9 * baseRad, 0.01));
                //d = min(d, tor);
            //}

            //d = max(d, p.y);  // flatten the city for debugging cars

            // Need to make a material variable.
            dist = d, mat = matFloor;//rand2.x);
            vec3 litf = rand2.xxx*.8+.2;
            litf += randBig.x*.25-.15;
            litf -= randBigger.x*.2-0.05;
            //litf.x += rand2.y*0.5-0.25;
            //litf.y += rand2.z*0.5-0.25;
            litf.z -= rand2.w*0.05-0.025;
            litf += vec3(0.0, 0.025, 0.04);
//            litf -= texture(iChannel2,vec2(pint)*0.01).x;
            litf= max(vec3(0.05), litf);
            uvec3 lit = uvec3(saturate(litf)*140.0);
            mat = SetMatRGB(lit.x,lit.y,lit.z);
            if (p.y < 0.01) mat = matFloor;
            if (rand2.w < 0.25) {
                float dtemp = sdRoundBox((baseCenter - vec3(0.0, height, 0.0)).xzy, vec3(baseRad,baseRad,baseRad)*rand.xyz*0.5, baseRad*0.45*rand.w );
                matmin(dist, mat, dtemp, matBoring);
            }

        } else {
            // Long and big segment
            p.xz += vec2(pint.x&0x1,(pint.y&0x7)-3);
            dist = p.y, mat = matFloor;
            vec3 baseCenter = p - vec3(1.0, 0.0, 1.0);
            float d = length(baseCenter.xz) - 0.75 + sin(baseCenter.y*164.0)*0.002;
            d = max(d, abs(baseCenter.y)-0.25);
            float d2 = length(baseCenter +vec3(0.0, 0.6, 0.0)) - 0.995;// + sin(baseCenter.z*128.0)*0.005;
            d2 = max(d2, length(baseCenter.xz) - 0.75);
            //d = min(d, d2);
            d = sdBox(abs(baseCenter)-vec3(.5,0,0), vec3(0.3, 0.1, 3.3))-.1;
            //matmin(dist, mat, d2, matGlossyRough);
            //matmin(dist, mat, d, matGlossyRough);
            matmax(dist, mat, -d, SetMatRGB(50u,51u,53u));
            d = sdBox((baseCenter)-vec3(.5,0,(randBig.z-.5)*4.), vec3(0.5*randBig.x, 0.74, 2.0*randBig.y));
            matmax(dist, mat, -d, niceColors[int(randBig.x*3.99)]);
            d = sdBox((baseCenter)-vec3(-.5,0,(randBig.w-.5)*4.), vec3(0.5*randBig.y, 0.74, 2.0*randBig.x));
            matmax(dist, mat, -d, niceColors[int(randBig.y*3.99)]);
        }
    } else {
        // big dome
        p.xz += vec2(pint&0x3);
        dist = p.y, mat = matFloor;
        vec3 baseCenter = p - vec3(2.0, 0.5*randBigger.y, 2.0);
        //float d = length(baseCenter.xz) - 1.75*randBigger.z;
        float waveRoof = min(0.015, abs(   (sin(p.x*4.0)+sin(p.z*16.0))   *0.015));
        //d = sdHexPrism((baseCenter - vec3(0, waveRoof -.1, 0.0)).xzy, vec2(1.75-randBigger.z*1.2, .2))-.1;
        //d = max(d, abs(baseCenter.y)-0.25);
        float d2 = sdRoundBox(baseCenter*vec3(1,1.-waveRoof,1) + vec3(0,0.75,0), vec3(1.1-randBigger.w*0.2), 0.65-randBigger.x*0.3);
        float d = sdRoundBox(RotateY(baseCenter,.785)*vec3(1,1.-waveRoof,1) + vec3(0,0.75,0), vec3(1.1-randBigger.w*0.2), 0.65-randBigger.x*0.3);
        d = min(d,d2);
        d*=1.25; // Distance field on these shapes is a little bad, so sun shadows are getting messed up. nudge it.
        uint m =matDome;// SetMatRGB(65u,72u,78u);
        if (p.y < 0.2) m = SetMatRGB(60u,112u,120u);
        matmin(dist, mat, d, m);
    }
    // Pipes everywhere!
    vec3 rep = p - vec3(0.0, 0.1, 0.5);
    rep.x = Repeat(rep.x, 0.5);
    float d = length(rep.xy) - 0.0625 * rand2.x;
    //d = max(d, abs(rep.z) - 0.5);
    if (rand.z > 0.7) matmin(dist, mat, d, matPipe);

    // Vertical pipes too. So sci-fi!
    rep = p - vec3(0.0, 0.13 * rand.z, 0.5);
    rep.z = Repeat(rep.z, 0.5);
    d = length(rep.yz) - 0.025;
    //d = max(d, abs(rep.z) - 0.5);
    if (randBigger.y > 0.6) {
        matmin(dist, mat, d, matWall);
        rep = p - vec3(0.0, 0.5 * rand2.z, 0.5);
        rep.x = Repeat(rep.x, 1.0);
        d = length(rep.xy) - 0.05;
        if (randBig.y > 0.5) {
            uint m = matPipe;
            if (randBig.x > 0.95) m =matYellow;// SetMatRGB(100u,52u,40u);
            matmin(dist, mat, d, m);
        }
    }

    //return distAndMat;
}

// This is the distance function that defines all the scene's geometry.
// The input is a position in space.
// The output is the distance to the nearest surface and a material index.
void DistanceToObject(vec3 p, out float dist, out uint mat)
{
/*    mat = matFloor;
    dist = length(p+ vec3(4.0,2.0,2.0 + sin((p.y + iTime)*8.0)*0.04)) - 4.0;
    float dist2 = length(p) - 1.0;
    dist = min(dist, dist2);
    
    return;*/
    p = RotateY(p,ROT_SPEED*iTime);

    float density = 8.0;
    vec3 cyl = cylTransform(p);
    cyl.x *= density;

    dist = -100000000.0;
    mat = 0u;
    //distAndMat.x = length(p.z) - 4.0;

    const float scale = 1.0;
    float scaleDen = scale / density;
    cyl = cyl.yzx/scaleDen;
    cyl.z *=scaleDen;
    cyl.y = cyl.y - 8.0*density;
    vec3 cylBasic = cyl;
    cyl.y = abs(cyl.y) - 1.0; // make it a ring instead of solid cylinder
    vec3 rep = cyl.xyz;
    rep.xz = fract(cyl.xz); // [0..1] for representing the position in the city block
    float dTemp;
    uint mTemp;
    CityBlock(rep, ivec2(floor(cyl.xz)), dTemp, mTemp);
    dTemp *= scaleDen;
    matmax(dist, mat, dTemp, mTemp);

    // Side windows
    matmax(dist, mat, abs(p.y) - 1.0, matSideWindows);
    
    float ringRad = 0.05;
    // Edge rings
    float d = length(abs(cyl.xy) + vec2(-8.0, 0)) - ringRad;
    d *= scaleDen;
    matmin(dist, mat, d, matYellow);
    d = length(vec2(abs(cyl.x), cyl.y) + vec2(-8.0, 1)) - ringRad;
    d *= scaleDen;
    matmin(dist, mat, d, matSpoke);

    // Edge ring cross-beams
    vec3 prot = FlipX(RotateX(cyl, PI*0.25), 0.0);
    float prep = Repeat(prot.y, 1.414);

    d = length(vec2(prot.x, prep) + vec2(-8.0, 0 )) - ringRad;
	prep = Repeat(prot.z, 1.414);
    float d2 = length(vec2(prot.x, prep) + vec2(-8.0, 0)) - ringRad;
    d = min(d, d2) * scaleDen;
    d = max(d, abs(length(p) - 8.0625) - 0.125);
    matmin(dist, mat, d, matSpoke);

    // Edge ring cross-beam joints
/*    prep = Repeat(cyl.z, 2.);
    d = length(vec3(cyl.xy - vec2(8.0,0), prep)) - ringRad * 1.75;
    d *= scaleDen;
    matmin(dist, mat, d, matGlossyRough);*/

    // Hub Edge rings
    d = length(RepeatX(cylBasic.xy + vec2(-7.25, 59.2), 0.4)) - 0.05;
    d = max(d, abs(p.y) - 0.91);
    d *= scaleDen;
    matmin(dist, mat, d, matPipe);

    d  = sdBox(FlipZ(p + vec3(0,-.57,0.0), 0.58), vec3(0.25, 0.29, 0.03)) - 0.008;
    d2 = sdBox(FlipX(p + vec3(0,-.57,0.0), 0.58), vec3(0.03, 0.29, 0.25)) - 0.008;
    matmin(dist, mat, min(d, d2), matFloor);

    //vec3 sym = Symmetric4Y(p.xyz + vec3(0,-0.78,0), 0.4);
    //d = Truss((sym.xyz) - vec3(0.25,0.18,0.24), 0.005, 0.0025, 0.175, 0.025);
    //matmin(dist, mat, d, matPipe);
    d = Truss(abs(p.xyz + vec3(0,-0.78,0)) - vec3(0.25,0.08,0.4), 0.005, 0.0025, 0.175, 0.025);
    matmin(dist, mat, d, matPipe);
    d = Truss(abs(p.zyx + vec3(0,-0.78,0)) - vec3(0.25,0.08,0.4), 0.005, 0.0025, 0.175, 0.025);
    matmin(dist, mat, d, matPipe);

    // Main Spokes
    float ridge = clamp(abs(fract(p.z*4.0)-0.5), 0.05, 0.1)*0.125;
    float spoke = cylCap(abs(p.xyz) - vec3(0.25,0,0), 0.125, 8.0*scale) + ridge;
    matmin(dist, mat, spoke, ridge > .01249 ? matSpoke : matGlossyRough);
    ridge = clamp(abs(fract(p.x*4.0)-0.5), 0.05, 0.1)*0.125;
    spoke = cylCap(abs(p.zyx) - vec3(0.25,0,0), 0.125, 8.0*scale) + ridge;
    matmin(dist, mat, spoke, ridge > .01249 ? matSpoke : matGlossyRough);

    // Hub
    ridge = clamp(abs(fract(p.y*1.44+0.5)-0.5), 0.25, 0.3)*0.75;
    d = length(p.xz) - saturate(1.09-abs(p.y*0.2)) + ridge;
    //d = min(d, sbox(abs(p) - vec3(1.0/1.414, 1.0/1.414, 0.0), vec3(0.1, 0.1, len)));
    d = max(d, abs(p.y) - 0.9);
    float dsub = length(p.xz) - 0.6;
    dsub = max(dsub, abs(abs(p.y-1.0) - 0.0) - 0.6);
    d = max(d, -dsub);
    matmin(dist, mat, d, matFloor);

    // Garage area in hub
    d  = sdBox(FlipZ(p + vec3(0,-.5,0.0), 0.59), vec3(0.25, 0.1, 0.05)) - 0.001;
    d2 = sdBox(FlipX(p + vec3(0,-.5,0.0), 0.59), vec3(0.05, 0.1, 0.25)) - 0.001;
    matmax(dist, mat, -min(d, d2), matPipe);

    // Bay doors - looks bad.
    /*d = length(abs(p.xz) - vec2(0.8)) - 0.5;
    d2 = sdBox(p + vec3(0,-0.9,0), vec3(.8, .01, .8));
    d = max(d, d2);
    matmin(dist, mat, d, matFloor);*/

    // Rocket - looks bad.
    /*vec3 rocketPos = p + vec3(0,-0.75,0.35);
    d = cylCap(rocketPos, 0.046, 0.12);
    d2 = sdCone(rocketPos.yzx, vec2(.08, 0.02), .2 );
    d = min(d,d2);
    d2 = sdCone(rocketPos.yzx + vec3(0,-.22,0), vec2(.1, 0.04), .1 );
    d = min(d,d2);
    matmin(dist, mat, d, matBoring);*/
    


    // Wires
    const float len = 8.0 * scale;
    float wireThick = 0.001;
    prot = RotateY(p, PI*0.3333);
    float wire = length(prot - vec3(0,0,clamp(prot.z, -len, len))) - wireThick;
    float wire2 = length(prot - vec3(clamp(prot.x, -len, len),0,0)) - wireThick;
    //distAndMat = matmin(distAndMat, vec2(min(wire, wire2), matPipe));

    prot = RotateY(p, PI*0.6666);
    wire = length(prot - vec3(0,0,clamp(prot.z, -len, len))) - wireThick;
    wire2 = length(prot - vec3(clamp(prot.x, -len, len),0,0)) - wireThick;
    //distAndMat = matmin(distAndMat, vec2(min(wire, wire2), matPipe));

    // Wires
    //float wireThick = 0.01;
    prot = RotateY(p, PI*0.25);
    prep = Repeat(prot.x, 0.25*0.707);
/*    wire = length(vec2(prep, abs(prot.y))) - wireThick;
    wire = max(wire, length(p.xz)-len);

    wire2 = max(prep, max(0.25-p.z, max(0.25-p.x, wire)));
    matmin(dist, mat, wire2, matPipe);
    wire = max(prep, max(0.25+p.z, max(0.25+p.x, wire)));
    matmin(dist, mat, wire, matPipe);

    prep = Repeat(prot.z, 0.25*0.707);
    wire = length(vec2(prep, abs(prot.y))) - wireThick;
    wire = max(wire, length(p.xz)-len);

    wire2 = max(prep, max(0.25+p.z, max(0.25-p.x, wire)));
    matmin(dist, mat, wire2, matPipe);
    wire = max(prep, max(0.25-p.z, max(0.25+p.x, wire)));
    matmin(dist, mat, wire, matPipe);*/

    // Ladder-struts in spokes
    prep = Repeat(p.x, 0.25);
    d = length(vec2(prep, abs(p.y) - 0.0))-0.015;
    d = max(d, length(p.xz)-len);
    d = max(d, abs(p.z) - 0.25);
    matmin(dist, mat, d, matSpoke);

    prep = Repeat(p.z, 0.25);
    d = length(vec2(prep, abs(p.y) - 0.0))-0.015;
    d = max(d, length(p.xz)-len);
    d = max(d, abs(p.x) - 0.25);
    matmin(dist, mat, d, matSpoke);

    // 45 degree struts
    prep = Repeat(prot.z+0.09, 0.25*0.707);
    d = length(vec2(prep, abs(prot.y) - 0.0))-0.015;
    d = max(d, length(p.xz)-len);
    d = max(d, abs(p.x) - 0.25);
    matmin(dist, mat, d, matSpoke);

    prep = Repeat(prot.x+0.09, 0.25*0.707);
    d = length(vec2(prep, abs(prot.y) - 0.0))-0.015;
    d = max(d, length(p.xz)-len);
    d = max(d, abs(p.z) - 0.25);
    matmin(dist, mat, d, matSpoke);

    // Solar array
/*    prot = RotateY(p + vec3(-8.0,0.0,0.0), PI*0.25);
	prep = Repeat(prot.z, 0.5*0.707);
    prot = RotateX(vec3(prot.xy, prep), 0.5);
    //prot = vec3(prot.x, prot.y, prep);
    vec3 cr = normalize(cross(sunDir, vec3(1,0,0)));
    cr = normalize(cross(cr, sunDir));
    //prot = vec3(prot.x, sunDir.y * prot.y - cr.z * prot.z, cr.x * prot.y + sunDir.z * prot.z);
	d = sdBox(prot, vec3(4.0, 0.001, 0.095));
    d = max(d, length(p.xz)-len);
    d = max(d, 0.5-p.x);
    d = max(d, 0.5+p.z);
    matmin(dist, mat, d, matSolarPanel);*/

    p = RotateY(p,-ROT_SPEED*iTime);

    // Communications tower / truss
    d = Truss(p.xzy + vec3(0,0,4), 0.015, 0.0075, 3.535, 0.05);
    matmin(dist, mat, d, matGlossyRough);

    // Dishes
    float tempD;
    uint tempM;
    Dish(RepeatY(RotateY(p, sin(floor(p.y/.666+.5)*1.73+iTime*0.1)) + vec3(0,4.9,0), 0.666), tempD, tempM);
    tempD = max(tempD, Flip(p.y+4.9, 2.666));
    matmin(dist, mat, tempD, tempM);

    //float d = length(p) - 2.0;
    //matmin(dist, mat, d, 0u);// distAndMat, vec2(d, matGlossyRough));
    //d = length(p-3.0) - 2.0;
    //distAndMat = matmin(distAndMat, vec2(d, matChrome));

/*    d = cylCap(p.zxy - vec3(0.0, 0.0, 2.0), 0.05, 2.0);
    matmin(dist, mat, d, SetMatRGB(0u, 255u, 0u));
    d = cylCap(p.yzx - vec3(0.0, 0.0, 2.0), 0.05, 2.0);
    matmin(dist, mat, d, SetMatRGB(255u, 0u, 0u));
    d = cylCap(p.xyz - vec3(0.0, 0.0, 2.0), 0.05, 2.0);
    matmin(dist, mat, d, SetMatRGB(0u, 0u, 255u));*/

    //return distAndMat;
}

// dirVec MUST BE NORMALIZED FIRST!!!!
float SphereIntersect(vec3 pos, vec3 dirVecPLZNormalizeMeFirst, vec3 spherePos, float rad)
{
    vec3 radialVec = pos - spherePos;
    float b = dot(radialVec, dirVecPLZNormalizeMeFirst);
    float c = dot(radialVec, radialVec) - rad * rad;
    float h = b * b - c;
    if (h < 0.0) return -1.0;
    return -b - sqrt(h);
}

vec4 texPanelsDense(vec2 uv, out vec3 normal) {

    vec3 texNormal = vec3(0);
    vec4 texColor = vec4(0);
    float mask = 0.0;
    for (int i = ZERO_TRICK; i < 9; i++) {
        vec3 tempN;
        vec4 tempC = texPanels(uv/float(i+1)+37.5*float(1-i), tempN);
        texColor = mix(tempC, texColor, mask);
        texNormal = mix(tempN, texNormal, mask);
        mask = saturate((texColor.a-0.05)*200.0);
    }

    normal = texNormal;
    return texColor;
}


// Input is UV coordinate of pixel to render.
// Output is RGB color.
vec3 RayTrace(in vec2 fragCoord )
{
	// -------------------------------- animate ---------------------------------------
    const vec3 sunCol = vec3(2.58, 2.38, 2.10)*0.8;
	const vec3 sunDir = normalize(vec3(0.93, 1.0, 1.0));
    const vec3 skyCol = vec3(0.3,0.45,0.8)*0.5;
    const float exposure = 1.7;

	vec3 camPos, camUp, camLookat;
	// ------------------- Set up the camera rays for ray marching --------------------
    // Map uv to [-1.0..1.0]
	vec2 uv = fragCoord.xy/iResolution.xy * 2.0 - 1.0;
    uv /= 3.0;  // zoom in

    // Camera up vector.
	camUp=vec3(0,1,0);

	// Camera lookat.
	camLookat=vec3(0,-1.75,0);

    // debugging camera
    float mx=-iMouse.x/iResolution.x*PI*2.0;// + localTime * 0.05;
	float my=iMouse.y/iResolution.y*3.14 + PI/2.0;// + sin(localTime * 0.3)*0.8+0.1;//*PI/2.01;
	camPos = vec3(cos(my)*cos(mx),sin(my),cos(my)*sin(mx))*13.0;  // 13
    if ((dot(iMouse.xy, vec2(1.0)) <= 64.0)) {
        camPos = vec3(10.0, 6.6, -8.0)*1.0;
        int whichCam = int(iTime*0.095) % 3;
        float remainder = fract(iTime * 0.095);
        if (whichCam == 0) {
            camPos = vec3(10.0, 6.6, -8.)*(1.4 - remainder*.2);
            camLookat=vec3(0,-1.75,0);
            camUp=vec3(0,1,0.5);
        }
        else if (whichCam == 1) {
            camPos = vec3(1.0, 4. + remainder*2., -1.)*6.;
            camLookat=vec3(0,-1.75,0);
            camUp=vec3(1,1,-0.5);
        }
        else if (whichCam == 2) {
/*            camPos = vec3(-4.0, 6.6, 7.)*2.;
            camLookat=vec3(0,-2.5,0);
            camUp=vec3(1,1,-0.5);
            uv *= 0.5;*/
            camPos = vec3(-4.0-remainder*2., 6.6+remainder*6., 7.+remainder*6.)*2.;
            camLookat=vec3(0,-2.5,0);
            camUp=vec3(1,1,-0.5);
            uv *= 0.5+remainder*0.5;
        }
    }

    
	// Camera setup for ray tracing / marching
	vec3 camVec=normalize(camLookat - camPos);
	vec3 sideNorm=normalize(cross(camUp, camVec));
	vec3 upNorm=cross(camVec, sideNorm);
	vec3 worldFacing=(camPos + camVec);
	vec3 worldPix = worldFacing + uv.x * sideNorm * (iResolution.x/iResolution.y) + uv.y * upNorm;
	vec3 rayVec = normalize(worldPix - camPos);

	// ----------------------------- Ray march the scene ------------------------------
    float dist;
    uint mat;
    //vec2 distAndMat;
	float t = 0.05;// + Hash2d(uv)*0.1;	// random dither-fade things close to the camera
	const float maxDepth = 45.0; // farthest distance rays will travel
	vec3 pos = vec3(0.0);
    const float smallVal = 0.000625;
    // intersect with sphere first as optimization so we don't ray march more than is needed.
    float hit = SphereIntersect(camPos, rayVec, vec3(0.0), 8.5);
    if (hit >= 0.0)
    {
        t = hit;
        // ray marching time
        for (int i = ZERO_TRICK; i < 250; i++)	// This is the count of the max times the ray actually marches.
        {
            // Step along the ray.
            pos = (camPos + rayVec * t);
            float walkA, walkB;
            //vec2 distAndMatA, distAndMatB;
            {
                // This is _the_ function that defines the "distance field".
                // It's really what makes the scene geometry. The idea is that the
                // distance field returns the distance to the closest object, and then
                // we know we are safe to "march" along the ray by that much distance
                // without hitting anything. We repeat this until we get really close
                // and then break because we have effectively hit the object.
                DistanceToObject(pos, dist, mat);



    /*    vec3 pRot = RotateY(pos,ROT_SPEED*iTime);

        float density = 8.0;
        vec3 cyl = cylTransform(pRot);
        cyl.x *= density; // cyl.x is the angle around the space station. cyl.z is the length from the center.

        const float scale = 1.0;
        float scaleDen = scale / density;
        cyl = cyl.yzx/scaleDen;
        cyl.z *=scaleDen;
        cyl.y = cyl.y - 8.0*density;
        vec3 cylBasic = cyl;
        cyl.y = abs(cyl.y) - 1.0; // make it a ring instead of solid cylinder

        cyl.z = cyl.y;*/


                // 2d voxel walk through the city blocks.
                // The distance function is not continuous at city block boundaries,
                // so we have to pause our ray march at each voxel boundary.
                walkA = dist;
                /*float dx = -fract(pos.x);
                if (rayVec.x > 0.0) dx = fract(-pos.x);
                float dz = -fract(pos.z);
                if (rayVec.z > 0.0) dz = fract(-pos.z);
                float nearestVoxel = min(fract(dx/rayVec.x), fract(dz/rayVec.z))+voxelPad;
                nearestVoxel = max(voxelPad, nearestVoxel);// hack that assumes streets and sidewalks are this wide.
                //nearestVoxel = max(nearestVoxel, t * 0.02); // hack to stop voxel walking in the distance.
                walkA = min(walkA, nearestVoxel);*/
            }
            dist = walkA;
            float walk = walkA;
            // move down the ray a safe amount
            t += walk;
            // If we are very close to the object, let's call it a hit and exit this loop.
            if ((t > maxDepth) || (abs(dist) < smallVal)) break;
        }
    }
    else
    {
        t = maxDepth + 1.0;
        dist = 1000000.0;
    }

    // Ray trace a ground plane to infinity
    float alpha = -camPos.y / rayVec.y;
/*    if ((t > maxDepth) && (rayVec.y < -0.0))
    {
        pos.xz = camPos.xz + rayVec.xz * alpha;
        pos.y = -0.0;
        t = alpha;
        distAndMat.y = 0.0;
        distAndMat.x = 0.0;
    }*/
	// --------------------------------------------------------------------------------
	// Now that we have done our ray marching, let's put some color on this geometry.
	vec3 finalColor = vec3(0.0);

	// If a ray actually hit the object, let's light it.
    if ((t <= maxDepth) || (t == alpha))
	{
      	//vec2 distAndMat = vec2(0.0);  // Distance and material
        // calculate the normal from the distance field. The distance field is a volume, so if you
        // sample the current point and neighboring points, you can use the difference to get
        // the normal.
        vec3 smallVec = vec3(smallVal, 0, 0);
        //vec3 normalU = vec3(dist - DistanceToObject(pos - smallVec.xyy).x,
        //                   dist - DistanceToObject(pos - smallVec.yxy).x,
        //                   dist - DistanceToObject(pos - smallVec.yyx).x);
        vec3 normalU = vec3(0.0);
        for( int i=ZERO_TRICK; i<4; i++ )
        {
            vec3 e = 0.5773*(2.0*vec3((((i+3)>>1)&1),((i>>1)&1),(i&1))-1.0);
            /*if (i==0) {
                distAndMat = DistanceToObject(pos+0.0005*e);
                normalU += e*distAndMat.x;
            } else {*/
            float tempDist;
            uint tempMat;
            DistanceToObject(pos+0.0005*e, tempDist, tempMat);
                normalU += e*tempDist;
            //}
        }
        vec3 normal = normalize(normalU);


        // calculate ambient occlusion.
        float ff = 0.0125;
        float aa = 80.0;
        float ambient = 1.0;
        for( int i=ZERO_TRICK; i<6; i++ )
        {
            float tempDist;
            uint tempMat;
            DistanceToObject(pos + normal * ff, tempDist, tempMat);
            ambient *= saturate(tempDist*aa);
            ff *= 2.0;
            aa /= 2.0;
        }
        ambient = max(0.025, pow(ambient, 0.5));	// tone down ambient with a pow and min clamp it.
        ambient = saturate(ambient);

        // calculate the reflection vector for highlights
        //vec3 ref = reflect(rayVec, normal);

        // Trace a ray toward the sun for sun shadows
        float sunShadow = 1.0;
        float iter = 0.01;
        vec3 nudgePos = pos + normal*0.002;	// don't start tracing too close or inside the object
		for (int i = ZERO_TRICK; i < 40; i++)
        {
            vec3 shadowPos = nudgePos + sunDir * iter;
            float tempDist;
            uint tempMat;
            DistanceToObject(shadowPos, tempDist, tempMat);
	        sunShadow *= saturate(tempDist*200.0);	// Shadow hardness
            if (tempDist <= 0.0) break;

            float walk = tempDist;
            float dx = -fract(shadowPos.x);
            if (sunDir.x > 0.0) dx = fract(-shadowPos.x);
            float dz = -fract(shadowPos.z);
            if (sunDir.z > 0.0) dz = fract(-shadowPos.z);
            float nearestVoxel = min(fract(dx/sunDir.x), fract(dz/sunDir.z))+smallVal;
            nearestVoxel = max(0.2, nearestVoxel);// hack that assumes streets and sidewalks are this wide.
            walk = min(walk, nearestVoxel);

            iter += max(0.005, walk);
            if (iter > 4.5) break;
        }
        sunShadow = saturate(sunShadow);

        float specular = 0.0;
        vec3 texColor = vec3(0.5, 0.5, 0.5);
        vec3 rustColor = vec3(0.5, 0.45, 0.4);
        /*if ((distAndMat.y >= matFloor) && (distAndMat.y < matFloor + 1.0)) {
            texColor = mix(texColor, rustColor, distAndMat.y);
//            texColor *= (distAndMat.y*0.75+0.25);
        }*/
        vec3 pRot = RotateY(pos,ROT_SPEED*iTime);
        if (mat == matWall) {
            texColor = vec3(0.5, 0.6, 0.7);
        }
        else if (mat == matPipe) {
            texColor = vec3(0.15, 0.12, 0.1)*0.5;
        }
        else if (mat == matChrome) {
            texColor = vec3(0.01, 0.01, 0.01);
            specular = 1.0;
        }
        else if (mat == matGlossyRough) {
            texColor = vec3(0.5);
            specular = 0.99;
        }
        else if (mat == matYellow) {
            texColor = vec3(0.6, 0.42, 0.05)*.755;
            specular = 0.1;
        } else if (mat == matSideWindows) {
            vec3 cyl = cylTransform(pRot);
            float grid = max(abs(fract(cyl.x*16.)*2.-1.), abs(fract(cyl.z*32.)*2.-1.));
            grid = saturate(grid*5.-4.5);
            texColor = vec3(0.5,0.7,1.0)*grid;
	        specular = .2;
            /*vec3 spNorm;
            vec4 rgbspec = texSolarPanels(cyl.xz*16.0, spNorm);
            vec3 cyl = cylTransform(pRot);
            vec3 spNorm;
            vec4 rgbspec = texSolarPanels(cyl.xz*16.0, spNorm);
            texColor = rgbspec.rgb;
	        specular = rgbspec.w;*/
        } else if (mat == matFloor) {

            vec3 cyl = cylTransform(pRot);
            vec3 spNorm;
            if (length(pRot) > 7.0) cyl.xy *= vec2(16.0,4.0);
            vec4 rgbspec = texPanelsDense(cyl.xy*8.0 * vec2(0.2, 1.2), spNorm);
//            texColor = normal.xyz*0.5+0.5;// vec3(0.0) + rgbspec.aaa*4.0;
            texColor = vec3(0.0,0.02,0.05);
            if (length(pRot) > 7.0) texColor += rgbspec.aaa*7.0-0.39;
            else texColor = max(vec3(0.33),texColor + rgbspec.aaa*4.0);
            texColor *= vec3(0.96, 0.98, .97);
	        specular = rgbspec.w * 0.1;
            if (abs(normal.y) > 0.9) texColor = vec3(0.4);
            //texColor = vec3(0.0,1.0,0.0);
        } else if (mat == matDome) {
            vec3 cyl = cylTransform(pRot);
            texColor *= vec3(0.91, 0.97, 0.998)*.8;
            float windows = saturate(abs(fract(cyl.z*64.0)-0.5)*16.0-4.0);
            //windows = max(windows, saturate(abs(fract(cyl.x*24.0)-0.5)*16.0-4.0));
            //if (abs(normal.y) > 0.15) texColor = mix(texColor, vec3(0.6, 0.7, 0.9)*0.4, windows);
            //if (abs(cyl.z) < 8.25) {
            //if (length(normal.yz) < .7) {
                specular = windows*0.2;
                texColor *= windows*.35+.65;
            //}
        } else if (IsMatRGB(mat)) {
            texColor = GetMatRGB(mat)*(1.0/255.0);
        }

        float n = 0.0;
        float doubler = 1.0;
        for (int i = ZERO_TRICK; i < 4; i++) {
            n += noise(pRot * 8.0 * doubler) / doubler;
            doubler *= 2.0;
            //n += noise(pos*16.0)*0.5;
            //n += noise(pos*32.0)*0.25;
            //n += noise(pos*64.0)*0.125;
        }
        texColor *= (n*0.25+0.75);

        if (mat == matSpoke) {
            texColor = vec3(1.0)*0.6;
        }

        if (mat == matSolarPanel) {
            vec3 spNorm;
            vec4 rgbspec = texSolarPanels(Rotate(pRot.xz*64.0, PI*0.25), spNorm);// vec3(0.3, 0.4, 0.5)*0.35;
            texColor = rgbspec.rgb;
	        specular = rgbspec.w;
        }
        vec3 texNorm;
		//vec4 rgbspec = texSolarPanels(pos.yz*16.0, texNorm);
        //specular = rgbspec.w;
        //if (distAndMat.y >= 100.0) {
            // world space transform...
        	//normal = normalize(normal+ texNorm);
            //texColor = fract(vec3(pos.xz, 0.0));
        //}

        // ------ Calculate lighting color ------
        // Start with sun color, standard lighting equation, and shadow
        vec3 lightColor = sunCol * saturate(dot(sunDir, normal)) * sunShadow;
        // weighted average the near ambient occlusion with the far for just the right look
        float ambientAvg = ambient;// (ambient*3.0 + ambientS) * 0.25;
        // Add sky color with ambient acclusion
        lightColor += (skyCol * saturate(dot(normal, normalize(earthPos)) *0.5+0.5))*pow(ambientAvg, 0.25);

        vec3 ref = reflect(rayVec, normalize(normal));
        //vec3 envTemp = texture(iChannel0, ref).xyz;
        //vec3 env = saturate(envTemp * envTemp * envTemp * envTemp);// GetEnvMap(ref, sunDir);
        vec3 env;
        if (mat == matGlossyRough) {
            env = GetEnvMapSpaceGlossy(pRot, ref, sunDir, sunCol, sunShadow);
        } else {
            env = GetEnvMapSpace(pRot, ref, sunDir, sunCol, sunShadow);
        }

        // Make windows-looking lights even though that would be the
        // floor and the roof for the people inside. It still looks cool. :D
        if (mat == matFloor) {
            float n2 = saturate((n-0.5)*1.);
            float windows = 1.0-saturate(abs(fract(pRot.y*16.)-.5)*14.-.9);
            if (texColor.x < 0.0001) {
                texColor = vec3(0.4);
                texColor *= windows;
                lightColor += vec3(.99,.8,.35)*2.*n2;
            }
            //texColor = vec3(n2);
            //texColor = vec3(windows);
        }

        // finally, apply the light to the texture.
        finalColor = texColor * lightColor;
        finalColor = mix(finalColor, env, specular);
        // I'm a terrible person for doing this on a space scene, but...
        // Let's fake some fog just to make it look bigger. :/
        finalColor = mix(finalColor, vec3(.07,.13,.2), .08);

        // visualize length of gradient of distance field to check distance field correctness
        //finalColor = vec3(0.25) * (length(normalU) / smallVec.x);
	}
    else
    {
        finalColor = GetEnvMapSpace(camPos, rayVec, sunDir, sunCol, 1.0);
    }

    // vignette?
    finalColor *= vec3(1.1) * saturate(1.1 - length(uv/1.2));
    finalColor *= exposure;

	// output the final color without gamma correction - will do gamma later.
	return vec3(clamp(finalColor, 0.0, 1.0));
}

const float kKeyLeft  = 37.5 / 256.0;
const float kKeyUp    = 38.5 / 256.0;
const float kKeyRight = 39.5 / 256.0;
const float kKeyDown  = 40.5 / 256.0;
const float kKeySpace = 32.5 / 256.0;

float SampleKey(float key)
{
	return step(0.5, texture(iChannel1, vec2(key, 0.25)).x);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    SetRandomSeed(fragCoord.xy, iResolution.xy, iFrame);
    // Do a multi-pass render if anti-aliasing is on
    vec3 finalColor = vec3(0.0);
#if ANTI_ALIAS_SIZE > 1
    for (int y = ZERO_TRICK; y < ANTI_ALIAS_SIZE; y++)
    {
        for (int x = ZERO_TRICK; x < ANTI_ALIAS_SIZE; x++)
        {
            finalColor += RayTrace(fragCoord+vec2(x, y)/float(ANTI_ALIAS_SIZE));
        }
    }
    finalColor /= float(ANTI_ALIAS_SIZE*ANTI_ALIAS_SIZE);
#else
    finalColor = RayTrace(fragCoord);
#endif

	vec2 R = iResolution.xy;
    vec2 uv = ( 2.*fragCoord - R ) / R.y;          // [-1,1] vertically
    uv *= 18.0;
    //uv  += iMouse.xy * 0.1;
    //uv.x += iTime * 1.1;
    vec3 texNormal;
    vec4 texColor = texPanelsDense(uv, texNormal);
    vec3 tempLightDir = normalize( vec3((iMouse.xy-fragCoord)*0.003, 1.0) );
    float lightDot = dot(tempLightDir, normalize(texNormal.xyz));
    //finalColor = texColor.rgb * max(0.0,lightDot)*0.8 + vec3(0.01, 0.2, 0.4)*0.2;
    //finalColor += vec3(1.0) * pow(max(0.0,lightDot), 104.0) * texColor.a;
    //if (iMouse.z > 0.0) finalColor = texNormal * 0.5 + 0.5;
    //if (SampleKey(kKeySpace) > 0.5) finalColor = vec3(1) * texColor.w;
    fragColor = vec4(sqrt(saturate(finalColor)),1.0);
}


