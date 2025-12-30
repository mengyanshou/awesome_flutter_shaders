
// --- Migrate Log ---
// 插入 common_header 并声明 iChannel0/iChannel1 sampler；保持 texture() 不变以做最小改动。
// --- Migrate Log (EN) ---
// Insert common_header and declare iChannel0/iChannel1 samplers; keep texture() unchanged for minimal edits.

#include <../common/common_header.frag>
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;

// https://gl-transitions.com/editor/crosswarp

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
  vec2 p = fragCoord/iResolution.xy;
  float x = mod(iTime,2.); // change this to alter the speed
   
  x=smoothstep(.0,1.0,(x*2.0+p.x-1.0));
  fragColor= mix(texture(iChannel0,(p-.5)*(1.-x)+.5), texture(iChannel1,(p-.5)*x+.5), x);  
}

#include <../common/main_shadertoy.frag>