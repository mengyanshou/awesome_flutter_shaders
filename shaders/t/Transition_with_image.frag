#include <../common/common_header.frag>
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
#define S(v) smoothstep(0.,1.5*fwidth(v), v )
    
// Mirror every side
vec2 mirror(vec2 v) {
    // The progress is added to vector making it 0 to 2
    // Se we mod by 2
  vec2 m = mod(v, 2.0);
    // Not sure about this one
  return mix(m, 2.0 - m, step(1.0, m));
}
float cubicInOut(float t) {
  return t < 0.5
    ? 4.0 * t * t * t
    : 0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0;
}

bool keyToggle(int ascii) 
{
	return (texture(iChannel0,vec2((.5+float(ascii))/256.,0.75)).x > 0.);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;

    // Time varying pixel color
    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));
    float progress = iMouse.x/iResolution.x;
    progress = cubicInOut(smoothstep(0.1,0.9,sin(iTime * 2.) * 0.5 + 0.5));
    float mask = texture(iChannel0, uv).r;
    
    float stepMask = S(mask - progress);
    vec4 img2 = texture(iChannel2, mirror(vec2(uv.x + progress * mask,uv.y)));
    vec4 img1 = texture(iChannel1, mirror(vec2(uv.x - (1. - progress) * mask,uv.y)));

    // Output to screen
    fragColor = mix(img1,img2,stepMask);
}
#include <../common/main_shadertoy.frag>