// --- Migrate Log ---
// 1) 添加必要的 include 并声明 iChannel0
// 2) 移除 FXAA 的 sampler2D 函数参数，直接通过 SG_TEX0 采样全局 iChannel0，以兼容 SkSL
//
// 1) Added the required include and declared iChannel0
// 2) Removed the FXAA sampler2D function parameter and sample global iChannel0 through SG_TEX0 for SkSL compatibility

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
vec4 fxaa(vec2 uv, vec2 texelSz) {
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
  vec3 rgbCC = SG_TEX0(iChannel0, uv).rgb;
  vec3 rgb00 = SG_TEX0(iChannel0, uv+vec2(-0.5,-0.5)*texelSz).rgb;
  vec3 rgb10 = SG_TEX0(iChannel0, uv+vec2(+0.5,-0.5)*texelSz).rgb;
  vec3 rgb01 = SG_TEX0(iChannel0, uv+vec2(-0.5,+0.5)*texelSz).rgb;
  vec3 rgb11 = SG_TEX0(iChannel0, uv+vec2(+0.5,+0.5)*texelSz).rgb;

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
      SG_TEX0(iChannel0, uv - dir * (1.0/6.0))
    + SG_TEX0(iChannel0, uv + dir * (1.0/6.0))
    );

  // Average with outer texels along dir line
  vec4 B = A * 0.5 + 0.25 * (
      SG_TEX0(iChannel0, uv - dir * (0.5))
    + SG_TEX0(iChannel0, uv + dir * (0.5))
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
  
  fragColor = fxaa(q, sqrt(2.0)/RESOLUTION.xy);
}

// 修改 2 / Change 2: 添加必要的 include 指令 / Add required include directive
#include <../common/main_shadertoy.frag>
