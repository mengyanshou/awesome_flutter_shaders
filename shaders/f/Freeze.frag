#include <../common/common_header.frag>
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
// Experiment: Frosted Glass II by Shadmar
// Original by Jack Davenport : https://www.shadertoy.com/view/MtsSWs#

#define FROSTYNESS 2.0
#define COLORIZE   1.0
#define COLOR_RGB  0.7,1.0,1.0

float rand(vec2 uv) {
 
    float a = dot(uv, vec2(92., 80.));
    float b = dot(uv, vec2(41., 62.));
    
    float x = sin(a) + cos(b) * 51.;
    return fract(x);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / iResolution.xy;
    vec4 d = texture(iChannel1, uv);
	vec2 rnd = vec2(rand(uv+d.r*.05), rand(uv+d.b*.05));
    
    //vignette
    const vec2 lensRadius 	= vec2(0.65*1.5, 0.05);
    float dist = distance(uv.xy, vec2(0.5,0.5));
    float vigfin = pow(1.-smoothstep(lensRadius.x, lensRadius.y, dist),2.);
   
    rnd *= .025*vigfin+d.rg*FROSTYNESS*vigfin;
    uv += rnd;
    fragColor = mix(texture(iChannel0, uv),vec4(COLOR_RGB,1.0),COLORIZE*vec4(rnd.r));
}
#include <../common/main_shadertoy.frag>