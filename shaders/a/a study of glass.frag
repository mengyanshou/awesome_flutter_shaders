// --- Migrate Log ---
// 本次迁移修改：
// - 添加 include，确保 Flutter/SkSL 编译环境可识别统一 uniforms
// - 在文件底部追加 `#include <../common/main_shadertoy.frag>` 以统一入口包装
// - 未改动作者原始算法，仅修复兼容性声明
// change summary:
// - included `common_header.frag` for uniform compatibility with Flutter/SkSL.
// - Appended `#include <../common/main_shadertoy.frag>` at file end to unify the runtime entry.
// - Did not alter the original rendering logic; only performed minimal compatibility fixes and annotations.
// --- Migrate Log End ---
#include <../common/common_header.frag>

// Created by mrange/2018
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
// 
// Messing around with refractions. I am quite new to shader programming
//  and raymarching so while I think the code might not be very good I also think that
//  what makes ShaderToy.com so good is that programmers are sharing what they do, 
//  big and small. I too want to share in the hope it might help someone on my level.
// 
// Inpiration and code from shaders:
//  https://www.shadertoy.com/view/4ds3zn (iq, inspirations and various functions)
//  https://www.shadertoy.com/view/XljGDz (otaviogood, "skybox")
//  https://www.shadertoy.com/view/Xl2GDW (purton, inspiration for reflection)
// Music: Levi Patel - As she passes (Soundcloud)
// Blogs:
//  Raymarching explained: http://9bitscience.blogspot.com/2013/07/raymarching-distance-fields_14.html
//  Distance Estimators: iquilezles.org/articles/distfunctions
//  Cool primitives: http://mercury.sexy/hg_sdf/

#define TOLERANCE       0.000001
#define MAX_RAY_LENGTH  16.0
#define MAX_BOUNCES     8
#define MAX_RAY_MARCHES 90

#define PI              3.141592654
#define TAU             (2.0*PI)

#define DEG2RAD         (PI/180.0)

#define PERIODTIME      25.0
#define FADETIME        4.0

#define TIMEINPERIOD    (mod(iTime, PERIODTIME))
#define PERIOD          (mod(floor(iTime / PERIODTIME), 9.0))
//#define PERIOD          8

#define AA              0

float sgn(float x)
{
  return (x<0.0)?-1.0:1.0;
}

float smin(float a, float b, float k)
{
  float res = exp( -k*a ) + exp( -k*b );
  return -log( res )/k;
}

float pReflect(inout vec3 p, vec3 planeNormal, float offset)
{
  float t = dot(p, planeNormal)+offset;
  if (t < 0.0)
  {
    p = p - (2.0*t)*planeNormal;
  }
  return sgn(t);
}

void pR(inout vec2 p, float a)
{
  p = cos(a)*p + sin(a)*vec2(p.y, -p.x);
}

float maxComp(in vec3 p)
{
  return max(p.x,max(p.y,p.z));
}

float lengthN(in vec3 v, in float n)
{
  v = abs(v);
  v = pow(v, vec3(n));
  return pow(v.x + v.y + v.z, 1.0/n);
}

float sdRoundCube(in vec3 p, float r)
{
  return lengthN(p, 8.0) - r;
}

vec3 pMod3(inout vec3 p, vec3 size)
{
  vec3 c = floor((p + size*0.5)/size);
  p = mod(p + size*0.5, size) - size*0.5;
  return c;
}

float sdBox(vec3 p, vec3 b)
{
  vec3  di = abs(p) - b;
  float mc = maxComp(di);
  return min(mc,length(max(di,0.0)));
}

float sdSphere(vec3 p, float r)
{
  return length(p) - r;
}

float impulse1(in vec3 p, out vec3 col, out float ref, out float trans, out vec3 absorb)
{
  col    = vec3(0.3);
  ref    = 0.2;
  trans  = 0.9;
  absorb = 0.5*vec3(1.0, 2.0, 3.0);

  float s  = sdSphere(p, 0.6);
  float is = sdSphere(p, 0.8);
  float rc = sdRoundCube(p, 1.0);

  float d = rc;
  d = max(d, -is);
  d = min(d, s);
  if (d == s)
  {
    absorb = 1.0*vec3(1.0, -1.0, -2.0);
  }
  return d;
}

float impulse2(in vec3 p, out vec3 col, out float ref, out float trans, out vec3 absorb)
{
  col    = vec3(0.3);
  ref    = 0.2;
  trans  = 0.9;
  absorb = 0.5*vec3(1.0, 2.0, 3.0);

  float s1 = sdBox(p, vec3(1.0));
  float s3 = sdSphere(p, 0.4);
  pMod3(p, vec3(1.0));
  float s2 = sdSphere(p, 0.48);
  float s = max(s1, -s2);
  s = min(s, s3);
  if (s == s3)
  {
    absorb = 1.0*vec3(1.0, -1.0, -2.0);
  }

  return s;
}

float mandelbulb(in vec3 p)
{
  vec3 w = p;
  float m = dot(w,w);

  float dz = 1.0;

  dz = 8.0*pow(sqrt(m),7.0)*dz + 1.0;

  float r = length(w);
  float b = 8.0*acos(w.y/r);
  float a = 8.0*atan(w.x, w.z);
  vec3 v  = vec3(sin(b)*sin(a), cos(b), sin(b)*cos(a));
  w = p + pow(r,8.0)*v;

  m = dot(w,w);

  return 0.25*log(m)*sqrt(m)/dz;
}


float impulse3(in vec3 p, out vec3 col, out float ref, out float trans, out vec3 absorb)
{
  col    = vec3(0.3);
  ref    = 0.2;
  trans  = 0.9;
  absorb = 0.5*vec3(1.0, 2.0, 3.0);

  float rc = sdRoundCube(p, 1.0);
  float s  = 0.9;
  float mb = mandelbulb(p/s)*s;
  float s1 = sdSphere(p, 0.4);
  float d = rc;
  d = max(d, -mb);
  d = min(d, s1);
  if (d == s1)
  {
    absorb = 1.0*vec3(1.0, -1.0, -2.0);
  }
  return d;
}

float bubbles(in vec3 p)
{
  vec3 pp = p - vec3(0.1) - vec3(0.0, iTime*0.15 + 10.0, 0.0);
  pReflect(pp, normalize(vec3(1.0, 0.5, 0.2)), 0.3);
  pReflect(pp, normalize(vec3(0.2, 0.5, 1.0)), 0.2);
  pMod3(pp, vec3(0.5, 0.3, 0.4));

  vec3 ppp = p - vec3(0.2) - vec3(0.0, iTime*0.05 + 10.0, 0.0);
  pReflect(ppp, normalize(vec3(0.7, 0.5, 0.4)), 0.3);
  pReflect(ppp, normalize(vec3(0.5, 0.4, 0.7)), 0.1);
  pMod3(ppp, vec3(0.7, 0.6, 0.4));

  float ss = sdSphere(pp, 0.05);
  float sss = sdSphere(ppp, 0.1);

  return smin(ss, sss, 20.0);
}

float impulse4(in vec3 p, out vec3 col, out float ref, out float trans, out vec3 absorb)
{
  col    = vec3(0.3);
  ref    = 0.2;
  trans  = 0.9;
  absorb = 0.5*vec3(1.0, 2.0, 3.0);

  float sb = sdRoundCube(p, 1.0);
  float s = 2.5;
  float bs = bubbles(p/s)*s;

  return max(sb, -bs);
}

float impulse5(in vec3 p, out vec3 col, out float ref, out float trans, out vec3 absorb)
{
  col    = vec3(0.3);
  ref    = 0.2;
  trans  = 0.9;
  absorb = 0.5*vec3(1.0, 2.0, 3.0);

  float sb = sdRoundCube(p, 1.0);
  float t  = TIMEINPERIOD;
  float s  = 2.5 / (1.0 + 4.0*t/PERIODTIME);
  float bs = bubbles(p/s)*s;

  return max(sb, -bs);
}


float distanceField(in vec3 p, out vec3 col, out float ref, out float trans, out vec3 absorb)
{
  int period = int(PERIOD);
  float i = 10000000.0;
  if (period == 0)      i = impulse1(p, col, ref, trans, absorb);
  else if (period == 1) i = impulse2(p, col, ref, trans, absorb);
  else if (period == 2) i = impulse4(p, col, ref, trans, absorb);
  else if (period == 3) i = impulse3(p, col, ref, trans, absorb);
  else if (period == 4) i = impulse2(p, col, ref, trans, absorb);
  else if (period == 5) i = impulse3(p, col, ref, trans, absorb);
  else if (period == 6) i = impulse2(p, col, ref, trans, absorb);
  else if (period == 7) i = impulse5(p, col, ref, trans, absorb);
  else if (period == 8) i = impulse1(p, col, ref, trans, absorb);

  float rc = sdRoundCube(p - vec3(0.0, -5.05, 0.0), 4.0);

  float d = min(rc, i);
  if (d == rc)
  {
    col    = vec3(1.0);
    ref    = 0.2;
    trans  = 0.0;
  }
  return d;
}

vec3 saturate(in vec3 a)   { return clamp(a, 0.0, 1.0); }
vec2 saturate(in vec2 a)   { return clamp(a, 0.0, 1.0); }
float saturate(in float a) { return clamp(a, 0.0, 1.0); }

const vec3 lightPos1 = 100.0*vec3(-0.3, 0.0, 1.0);
const vec3 lightPos2 = 100.0*vec3(-0.5, -0.1, -1.2);

const vec3 lightCol1 = vec3(8.0/8.0,7.0/8.0,6.0/8.0);
const vec3 lightCol2 = vec3(8.0/8.0,6.0/8.0,7.0/8.0);

vec3 getSkyColor(vec3 rayDir)
{
  vec3 lightDir1 = normalize(lightPos1);
  vec3 lightDir2 = normalize(lightPos2);

  float ld1      = max(dot(lightDir1, rayDir), 0.0);
  float ld2      = max(dot(lightDir2, rayDir), 0.0);
  vec3 final     = vec3(0.125);

  if ((rayDir.y > abs(rayDir.x)*1.0) && (rayDir.y > abs(rayDir.z*0.25))) final = vec3(2.0)*rayDir.y;
  float roundBox = length(max(abs(rayDir.xz/max(0.0,rayDir.y))-vec2(0.9, 4.0),0.0))-0.1;
  final += vec3(0.8)* pow(saturate(1.0 - roundBox*0.5), 6.0);

  final += pow(lightCol1, vec3(2.0, 1.5, 1.5)) * pow(ld1, 8.0);
  final += lightCol1 * pow(ld1, 200.0);
  final += pow(lightCol2, vec3(2.0, 1.5, 1.5)) * pow(ld2, 8.0);
  final += lightCol2 * pow(ld2, 200.0);
  return final;
}

vec3 normal(in vec3 pos)
{
  vec3  eps = vec3(.0001,0.0,0.0);
  vec3 col;
  float ref;
  float trans;
  vec3 nor;
  vec3 absorb;
  nor.x = distanceField(pos+eps.xyy, col, ref, trans, absorb) - distanceField(pos-eps.xyy, col, ref, trans, absorb);
  nor.y = distanceField(pos+eps.yxy, col, ref, trans, absorb) - distanceField(pos-eps.yxy, col, ref, trans, absorb);
  nor.z = distanceField(pos+eps.yyx, col, ref, trans, absorb) - distanceField(pos-eps.yyx, col, ref, trans, absorb);
  return normalize(nor);
}

float rayMarch(in float dmod, in vec3 ro, inout vec3 rd, float mint, float minstep, out int rep, out vec3 col, out float ref, out float trans, out vec3 absorb)
{
  float t = mint;
  for (int i = 0; i < MAX_RAY_MARCHES; i++)
  {
    float distance_ = distanceField(ro + rd*t, col, ref, trans, absorb);
    float distance = dmod*distance_;
    if (distance < TOLERANCE*t || t > MAX_RAY_LENGTH) break;
    t += max(distance, minstep);
    rep = i;
  }
  return t;
}

float softShadow(in vec3 pos, in vec3 ld, in float ll, float mint, float k)
{
  const float minShadow = 0.25;
  float res = 1.0;
  float t = mint;
  vec3 col;
  float ref;
  float trans;
  vec3 absorb;
  for (int i=0; i<24; i++)
  {
    float distance = distanceField(pos + ld*t, col, ref, trans, absorb);
    res = min(res, k*distance/t);
    if (ll <= t) break;
    if(res <= minShadow) break;
    t += max(mint*0.2, distance);
  }
  return clamp(res,minShadow,1.0);
}

vec3 postProcess(in vec3 col, in vec2 q)
{
  col=pow(clamp(col,0.0,1.0),vec3(0.75));
  col=col*0.6+0.4*col*col*(3.0-2.0*col);  // contrast
  col=mix(col, vec3(dot(col, vec3(0.33))), -0.4);  // satuation
  col*=0.5+0.5*pow(19.0*q.x*q.y*(1.0-q.x)*(1.0-q.y),0.7);  // vigneting
  return col;
}

vec3 render(in vec3 ro, in vec3 rd)
{
  vec3 lightPos = 1.5*vec3(1.5, 3.0, 1.0);

  vec3 final  = vec3(0.0);

  vec3 ragg   = vec3(1.0);

  float tdist = 0.0;

  int period = int(PERIOD);

  float refraction = 0.9;

  if (period == 4) refraction = 1.2;
  if (period == 5) refraction = 0.75;
  if (period == 6) refraction = -0.8;

  bool inside = false;

  float mint    = 0.01;
  float minstep = 0.001;

  for (int i = 0; i < MAX_BOUNCES; ++i)
  {
    if (maxComp(ragg) <  0.01) break;
    float dmod  = inside ? -1.0 : 1.0;
    vec3 absorb ;
    vec3 col    ;
    float ref   ;
    float trans ;
    int rep     ;
    float t     = rayMarch(dmod, ro, rd, mint, minstep, rep, col, ref, trans, absorb);
    tdist       += t;

    vec3 pos    = ro + t*rd;

    vec3 nor = vec3(0.0, 1.0, 0.0);

    if (t < MAX_RAY_LENGTH)
    {
      // Ray intersected object
      nor = normal(pos);
    }
    else
    {
      // Ray intersected sky
      final += ragg*getSkyColor(rd);
      break;
    }

    float fresnel = pow(1.0 - abs(dot(nor, rd)), 2.0);

    ref = mix(ref, 1.0, fresnel);
    trans = mix(trans, 0.0, fresnel);

    float mref = refraction;

    if (inside)
    {
      nor = -nor;
      mref = 1.0/refraction;
    }

    vec3 refl = reflect(rd, nor);
    vec3 refr = refract(rd, nor, mref);

    vec3 lv   = lightPos - pos;
    vec3  ld  = normalize(lv);
    float ll  = length(lv);
    // TODO: Rework shadow to "work" with transparent objects
    float sha = 1.0;
    if (!inside)
    {
      sha = softShadow(pos, ld, ll, 0.01, 64.0);
    }

    float dif = max(dot(nor,ld),0.0);
    float occ = 1.0 - float(rep)/float(MAX_RAY_MARCHES);
    float l   = dif*sha*occ;


    vec3 lr   = vec3(0.0);

    float lin = mix(0.2, 1.0, l);

    vec3 sky  = getSkyColor(refl);
    vec3 mcol = mix(lin*col + lr, sky, ref);

    vec3 beer = vec3(1.0);

    if (inside)
    {
      beer = exp(-absorb*t);
    }
    final      += (1.0 - trans)*ragg*beer*mcol;
    ragg       *= trans*beer;

    ro        = pos;

    if (refr == vec3(0.0))
    {
        rd = refl;
    }
    else
    {
      rd = refr;
      inside = !inside;
    }

    /* TODO: Fix visual artifacts on borders
    if (fresnel >)
    {
      //final += vec3(1.0);
      mint = 0.1;
      minstep = 0.01;
    }
    else
    {
      minstep = 0.001;
    }
    */
  }


  return final;
}

vec3 getSample(in vec2 p)
{
  float time   = TIMEINPERIOD;
  int period   = int(PERIOD);

  vec3 ro  = vec3(3.0, 0.1, 0.0);
  if (period == 5) ro = 1.5*vec3(1.0, 1.5, 0.0);
  if (period == 8) ro += 3.0*vec3(smoothstep(FADETIME, PERIODTIME, time));

  vec3 la  = vec3(0.0);

  pR(ro.xz, iTime/PERIODTIME);

  vec3 ww = normalize(la - ro);
  vec3 uu = normalize(cross(vec3(0.0,1.0,0.0), ww ));
  vec3 vv = normalize(cross(ww,uu));
  vec3 rd = normalize( p.x*uu + p.y*vv + 2.0*ww );

  vec3 col = render(ro, rd);

  return col;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
  float time = TIMEINPERIOD;
  vec2 q=fragCoord.xy/iResolution.xy;
  vec2 p = -1.0 + 2.0*q;
  p.x *= iResolution.x/iResolution.y;

#if AA == 0
  vec3 col = getSample(p);
#elif AA == 1
  vec3 col  = vec3(0.0);
  vec2 unit = 1.0/iResolution.xy;
  for(int y = 0; y < 2; ++y)
  {
    for(int x = 0; x < 2; ++x)
    {
      col += getSample(p - 0.5*unit + unit*vec2(x, y));
    }
  }

  col /= 4.0;
#endif

  float whiteIn  = 1.0 - smoothstep(0.0, FADETIME, time);
  float whiteOut = smoothstep(PERIODTIME - FADETIME, PERIODTIME, time);

  if (iTime > PERIODTIME*9.0) whiteOut = 1.0;

  fragColor = vec4(mix(postProcess(col, q), vec3(1.0), whiteOut + whiteIn), 1.0);
}

#include <../common/main_shadertoy.frag>
