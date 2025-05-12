/*originals on glslsandox*/
#include <../common/common_header.frag>
float de(vec3 p) {
  vec3 q = vec3(p.x, 0.3 * sin(10.0 * (1.0 + p.x) + iTime), 0.3 * cos(p.x));

  float d1 = length(vec2(length(p.xz) - 0.5, p.y)) - 0.05;
  float d2 = length(vec2(length(p.xy) - 0.5, p.z)) - 0.05;
  float d3 = length(vec2(length(p.yz) - 0.5, p.x)) - 0.05;
  return min(min(d1, d2), d3);
}
#define EPS  0.001
float tr(in vec3 p, in vec3 dir, out vec3 target) {
  float td = 0.0;
  for(int i = 0; i < 50; i++) {
    float d = de(p);
    td += d;
    p += d * dir;
    if(d < EPS) {
      target = p;
      return td;
    }
  }
  return td;
}
vec4 mul4(vec4 a, vec4 b) {
  return vec4(cross(a.xyz, b.xyz) + a.w * b.xyz + b.w * a.xyz, a.w * b.w - dot(a.xyz, b.xyz));
}
vec3 rot(vec3 p, vec3 dir, float ang) {
  float cosha = cos(ang * 0.5), sinha = sin(ang * 0.5);

  vec4 rot = vec4(sinha * dir, cosha);
  vec4 q = mul4(rot, vec4(p, 0.0));
  rot.zyx = -rot.xzy;
  q = mul4(q, rot);
  return q.xyz;
}
vec3 roty(float a, vec3 p) {
  mat2 m = mat2(cos(a), -sin(a), sin(a), cos(a));
  vec2 xz = m * p.xz;
  return vec3(xz.x, p.y, xz.y);
}
vec3 rotdir = normalize(vec3(1.0, 1.0, 1.0)), light = normalize(vec3(-1.0, 1.0, 4.0)), eye = vec3(0.0, 0.0, 8.0);
#define resolution iResolution.xy
#define time iTime
vec3 rotdir2 = normalize(vec3(1.0, 0.0, 1.0)), light2 = normalize(vec3(-1.0, 1.0, 4.0)), eye2 = vec3(0.0, 0.0, 8.0);
vec2 rotate(vec2 p, float a) {
  return vec2(p.x * cos(a) - p.y * sin(a), p.x * sin(a) + p.y * cos(a));
}

// 1D random numbers
float rand(float n) {
  return fract(sin(n));
}

// 2D random numbers
vec2 rand2(in vec2 p) {
  return fract(vec2(sin(p.x * 1.32 + p.y * 54.077), cos(p.x * 91.32 + p.y * 9.077)));
}

// 1D noise
float noise1(float p) {
  float fl = floor(p);
  float fc = fract(p);
  return mix(rand(fl), rand(fl + 31.0), fc);
}

// voronoi distance noise, based on iq's articles
float voronoi(in vec2 x) {
  vec2 p = floor(x);
  vec2 f = fract(x);

  vec2 res = vec2(8.0);
  for(int j = -1; j <= 1; j++) {
    for(int i = -1; i <= 2; i++) {
      vec2 b = vec2(i, j);
      vec2 r = vec2(b) - f + rand2(p + b);

// chebyshev distance, one of many ways to do this
      float d = max(abs(r.x), abs(r.y));

      if(d < res.x) {
        res.y = res.x;
        res.x = d;
      } else if(d < res.y) {
        res.y = d;
      }
    }
  }
  return res.y - res.x;
}
#define flicker (noise1(time * 2.0) * 0.9 + 0.5)

mat2 rotate(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}
#define PI 3.14159265359

vec3 pal2(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {
  return a + b * cos(4.28318 * (c * t + d));
}

vec3 spectrum(float n) {
  return pal2(n, vec3(0.5, 0.5, 0.5), vec3(0.5, 0.5, 0.5), vec3(1.0, 1.0, 1.0), vec3(0.0, 0.33, 0.67));
}
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (2. * gl_FragCoord.xy - resolution) / resolution.y;
  vec2 uv3 = (2. * gl_FragCoord.xy - resolution) / resolution.y;
  vec3 col3;
  vec3 target2;
  vec3 p2 = vec3(uv3, 1.0);

  p2 = rot(-p2, rotdir2, -time);
  eye2 = rot(-eye2, rotdir2, -time);
  vec3 dir2 = normalize(p2 - eye2);
  float d2 = tr(p2, dir2, target2);
  float d0a = de(target2);
  float dxa = de(vec3(target2.x + EPS, target2.y, target2.z)) - d0a;
  float dya = de(vec3(target2.x, target2.y + EPS, target2.z)) - d0a;
  vec3 col = vec3(0.);
  if(d2 < 2.0) {
    vec3 norm2 = normalize(vec3(dxa, dya, EPS));

    light2 = rot(light2, rotdir2, time);
    light2 = reflect(-light, norm2);
    float l2 = dot(light2, norm2);
    l2 += pow(l2, 80.0);
    col3 = vec3(l2);
  }

  vec3 color = vec3(0.);
  vec3 rd = vec3(uv, -1.);

  float s = .5;
  for(int i = 0; i < 8; i++) {
    rd = abs(rd) / dot(rd, rd); // kali iteration!! Thanks Kali
    rd -= s;

    s *= .8;
    float b = .005;
    color.gb += .014 / max(abs(rd.x * .8), abs(rd.y * .8));
    color.rb += .015 / max(abs(rd.y * 0.6), abs(rd.z * 0.6));
    color.rg += .01 / max(abs(rd.x), abs(rd.z));
/*color.gb += smoothstep(.5 + b, .5, max(abs(uv.x), abs(uv.y))) *
smoothstep(.45, .45 + b, max(abs(uv.x), abs(uv.y)));*/
  }
  color *= 0.4;

  vec2 uv2 = gl_FragCoord.xy / resolution.xy;
  uv2 = (uv - 0.5) * 2.0;
  vec2 suv = uv2;
  uv2.x *= resolution.x / resolution.y;
  vec3 col2;
  vec3 target, p = vec3(uv, 1.0);
  p = rot(p, rotdir, time);
  eye = rot(eye, rotdir, time);
  vec3 dir = normalize(p - eye);
  float d = tr(p, dir, target), d0 = de(target), dx = de(vec3(target.x + EPS, target.y, target.z)) - d0, dy = de(vec3(target.x, target.y + EPS, target.z)) - d0;
  vec3 col4 = vec3(0.);
  if(d < 3.0) {
    vec3 norm = normalize(vec3(dx, dy, EPS));

    light = rot(light, rotdir, time);
    light = reflect(-light, norm);
    float l = dot(light, norm);
    l += pow(l, 80.0);
    col = vec3(l);
  }

  float v = 0.0;

//uv += time * 0.01;
  uv.x += sin(time) * 0.1;

// add some noise octaves
  float a = 0.6, f = 1.0;

  for(int i = 0; i < 5; i++) // 4 octaves also look nice, its getting a bit slow though
  {
    float v1 = voronoi(uv * f + 1.0);
    float v2 = 0.0;

// make the moving electrons-effect for higher octaves
    if(i > 0) {
// of course everything based on voronoi
      v2 = voronoi(uv * f * 1.5 + 5.0 + time);

      float va = 0.0, vb = 0.0;
      va = 1.0 - smoothstep(0.0, 0.1, v1);
      vb = 1.0 - smoothstep(0.0, 0.08, v2);
      v += a * pow(va * (0.5 + vb), 2.0);
    }

// make sharp edges
    v1 = 1.0 - smoothstep(0.0, 0.3, v1);

// noise is used as intensity map
    v2 = a * (noise1(v1 * 5.5 + 0.1));

    if(i == 0)
      v += v2 * flicker;
    else
      v += v2;

    f *= 3.0;
    a *= 0.7;
  }

  v *= exp(-0.6 * length(suv)) * 0.8;

  vec3 cexp = vec3(1.0, 1., 1.0);
  cexp *= 1.3;
  col4 = vec3(pow(v, cexp.x), pow(v, cexp.y), pow(v, cexp.z)) * 2.0;

  col3 *= col4 * 2. * vec3(0.4, 0.3, 1.);
  col *= col4 * 2. * vec3(0.0, 1.3, 0.);

  uv.x *= iResolution.x / iResolution.y;
  uv.xy *= mat2(cos(iTime), sin(iTime), -sin(iTime), cos(iTime));
    // Parameters for the Venus flower
  float earthRadius = 0.4 + cos(iTime);
  float venusRadius = 0.28 + sin(iTime);
  float earthPeriod = 1.0;
  float venusPeriod = 0.615;  // Approximate ratio of Venus' orbital period to Earth's
  float d3;
    // Visualization parameters
  float lineIntensity = 0.00005;  // Reduced from 0.0003
  float lineWidth = 10.0;  // Adjust for thicker or thinner lines
  float fadeSpeed = 50.0;  // Speed of pattern build-up

  vec3 col5 = vec3(0.0);

    // Calculate the number of steps based on current time
  float maxSteps = 1000.0;
  float steps = min(iTime * fadeSpeed, maxSteps);

    // Draw the path
  for(float i = 0.0; i < steps; i += 2.5) {
    float t = i / maxSteps * 10.0 * PI;  // 8 cycles for a complete flower

    vec2 earthPos = vec2(earthRadius * cos(2.0 * PI * t / earthPeriod), earthRadius * tan(2.0 * PI * t / earthPeriod));

    vec2 venusPos = vec2(venusRadius * tan(2.0 * PI * t / venusPeriod), venusRadius * sin(2.0 * PI * t / venusPeriod));

    vec2 p = venusPos + earthPos;

    d3 = length(uv - p);

    col5 += lineIntensity / (d3 * d3 + 0.000021) * lineWidth; // Adjusted accumulation

  }
  col5 *= spectrum(d3 * 1. - .6);
    // Tone mapping to prevent oversaturation
  col5 = 1.0 - exp(-col5 * 0.7);

  fragColor = vec4(col3 + col + color * col5 * 0.5, 0.);
}

#include <../common/main_shadertoy.frag>