// --- Migration Log ---
// 将 FXAA 抗锯齿着色器迁移到 Flutter/Skia SkSL 环境
// Migration: FXAA anti-aliasing shader to Flutter/Skia SkSL
//
// 关键修改 Key Changes:
// 1. 添加必要的 include 指令 / Add required include directives
// 2. 声明 iChannel0 采样器 / Declare iChannel0 sampler uniform
// 保留原始 FXAA 算法 / Keep original FXAA algorithm

// CC0: Inside the mandelbulb II
//  Received some "complaints" about the old mandelbulb suffering from 
//  alias effects. So thought I make a quick try to apply the FXAA
//  thing I learnt from XorDev. It did improve it but not perfect still.

// When experimenting with this shader I realized this entire shader is 
// basically just a lucky bug (apart from the aliasing)

#include <../common/common_header.frag>

// 修改 1 / Change 1: 声明纹理采样器 / Declare texture sampler uniform
uniform sampler2D iChannel0;

#define RESOLUTION      iResolution

// License: Unknowon, author: XorDev, found: https://github.com/XorDev/GM_FXAA
vec4 fxaa(sampler2D tex, vec2 uv, vec2 texelSz) {
  // See this blog
  // https://mini.gmshaders.com/p/gm-shaders-mini-fxaa

  // Maximum texel span
  const float span_max    = 8.0;
  // These are more technnical and probably don't need changing:
  // Minimum "dir" reciprocal
  const float reduce_min  = (1.0/128.0);
  // Luma multiplier for "dir" reciprocal
  const float reduce_mul  = (1.0/32.0);

  const vec3  luma        = vec3(0.299, 0.587, 0.114);

  // Sample center and 4 corners
  vec3 rgbCC = texture(tex, uv).rgb;
  vec3 rgb00 = texture(tex, uv+vec2(-0.5,-0.5)*texelSz).rgb;
  vec3 rgb10 = texture(tex, uv+vec2(+0.5,-0.5)*texelSz).rgb;
  vec3 rgb01 = texture(tex, uv+vec2(-0.5,+0.5)*texelSz).rgb;
  vec3 rgb11 = texture(tex, uv+vec2(+0.5,+0.5)*texelSz).rgb;

  //Get luma from the 5 samples
  float lumaCC = dot(rgbCC, luma);
  float luma00 = dot(rgb00, luma);
  float luma10 = dot(rgb10, luma);
  float luma01 = dot(rgb01, luma);
  float luma11 = dot(rgb11, luma);

  // Compute gradient from luma values
  vec2 dir = vec2((luma01 + luma11) - (luma00 + luma10), (luma00 + luma01) - (luma10 + luma11));

  // Diminish dir length based on total luma
  float dirReduce = max((luma00 + luma10 + luma01 + luma11) * reduce_mul, reduce_min);

  // Divide dir by the distance to nearest edge plus dirReduce
  float rcpDir = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);

  // Multiply by reciprocal and limit to pixel span
  dir = clamp(dir * rcpDir, -span_max, span_max) * texelSz.xy;

  // Average middle texels along dir line
  vec4 A = 0.5 * (
      texture(tex, uv - dir * (1.0/6.0))
    + texture(tex, uv + dir * (1.0/6.0))
    );

  // Average with outer texels along dir line
  vec4 B = A * 0.5 + 0.25 * (
      texture(tex, uv - dir * (0.5))
    + texture(tex, uv + dir * (0.5))
    );


  // Get lowest and highest luma values
  float lumaMin = min(lumaCC, min(min(luma00, luma10), min(luma01, luma11)));
  float lumaMax = max(lumaCC, max(max(luma00, luma10), max(luma01, luma11)));

  // Get average luma
  float lumaB = dot(B.rgb, luma);

  //If the average is outside the luma range, using the middle average
  return ((lumaB < lumaMin) || (lumaB > lumaMax)) ? A : B;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
  vec2 q = fragCoord/RESOLUTION.xy;
  
  fragColor = fxaa(iChannel0, q, sqrt(2.0)/RESOLUTION.xy);
}

// 修改 2 / Change 2: 添加必要的 include 指令 / Add required include directive
#include <../common/main_shadertoy.frag>
