// --- Migrate Log ---
// 插入 Flutter/SkSL 公共 include，声明缺失的采样器 iChannel0；
// 保留原始 mainImage 入口和像素坐标归一化逻辑
// --- Migrate Log (EN) ---
// Add Flutter/SkSL common include and declare missing sampler iChannel0;
// Keep original mainImage entry and coordinate normalization.

#include <../common/common_header.frag>

uniform sampler2D iChannel0;

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;
    // Get base image
    vec4 image = texture(iChannel0, uv);
    vec4 color = image; //output color
    float intensity = 5.0; //wave intensity
    float speed = 3.0; //wave speed
    float height = 16.0; //wave height
    color += texture(iChannel0, vec2(uv.x+(1.0/iResolution.x)*sin(iTime*speed + fragCoord.y/height)*intensity, uv.y+(1.0/iResolution.y))); //gets the color of the pixel next to it, offset by its y position and following a sin wave to get a wavy effect
    color.rgb /= 2.0; //makes  the output not so bright 
    // Output to screen
    fragColor = color;
}

#include <../common/main_shadertoy.frag>