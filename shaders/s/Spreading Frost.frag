// --- Migrate Log ---
// 添加 common_header 引入并声明缺失的 iChannel 采样器；只做兼容性修复，未改算法
// --- Migrate Log (EN) ---
// Added common_header and declared missing iChannel samplers; compatibility fixes only (no algorithmic changes)
#include <../common/common_header.frag>
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;

// Spreading Frost by dos
// Inspired by https://www.shadertoy.com/view/MsySzy by shadmar

#define FROSTYNESS 0.5
//#define RANDNERF 2.5

float rand(vec2 uv) {
    #ifdef RANDNERF
    uv = floor(uv*pow(10.0, RANDNERF))/pow(10.0, RANDNERF);
    #endif
    
    float a = dot(uv, vec2(92., 80.));
    float b = dot(uv, vec2(41., 62.));
    
    float x = sin(a) + cos(b) * 51.;
    return fract(x);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord.xy / iResolution.xy;
    float progress = fract(iTime / 4.0);

    vec4 frost = texture(iChannel1, uv);
    float icespread = texture(iChannel2, uv).r;

    vec2 rnd = vec2(rand(uv+frost.r*0.05), rand(uv+frost.b*0.05));
            
    float size = mix(progress, sqrt(progress), 0.5);   
    size = size * 1.12 + 0.0000001; // just so 0.0 and 1.0 are fully (un)frozen and i'm lazy
    
    vec2 lens = vec2(size, pow(size, 4.0) / 2.0);
    float dist = distance(uv.xy, vec2(0.5, 0.5)); // the center of the froziness
    float vignette = pow(1.0-smoothstep(lens.x, lens.y, dist), 2.0);
   
    rnd *= frost.rg*vignette*FROSTYNESS;
    
    rnd *= 1.0 - floor(vignette); // optimization - brings rnd to 0.0 if it won't contribute to the image
    
    vec4 regular = texture(iChannel0, uv);
    vec4 frozen = texture(iChannel0, uv + rnd);
    frozen *= vec4(0.9, 0.9, 1.1, 1.0);
        
    fragColor = mix(frozen, regular, smoothstep(icespread, 1.0, pow(vignette, 2.0)));
}

#include <../common/main_shadertoy.frag>