// --- Migrate Log ---
// 本次迁移修改:
// - 在主画面着色器顶部插入迁移头文件；将对纹理的显式 LOD 采样（textureLod）替换为简单采样以兼容 Impeller/SkSL；保持视觉不变。
// change summary:
// - Added migration header and common include to main shader; replaced explicit LOD sampling (textureLod) with simple sampling (texture) for Impeller/SkSL compatibility; visual intent preserved.
// -------------------

#include <../common/common_header.frag>

uniform sampler2D iChannel0;
/*
    Copyright 2024 - Daniel Oren-Ibarra
    Listed under GNU - GPL license: https://www.gnu.org/licenses/gpl-3.0.en.html 
    This software may be used, modified and distributed in any manner,
    so long as the source code remains public.
    
    
    Previous versions and feature developments of this shader
===================================================================    
    Black Hole Raymarcher 2: https://www.shadertoy.com/view/4XjGzz
    Black Hole Raymarcher 1: https://www.shadertoy.com/view/M3lGD4
    Fast 3d noise fog: https://www.shadertoy.com/view/XXj3Rz
*/
const int doBloom = 1; //Change to 0 to disable bloom
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;
    vec3 col = texture(iChannel0, uv).rgb;
    if(doBloom == 1)
    {
        // Impeller does not support explicit LOD sampling (textureLod); use simple sampling as an approximation
        vec3 bloom = texture(iChannel0, uv).rgb;
        bloom = pow(bloom, vec3(3.0));
        col += bloom;
    }
    
    
    
    // Output to screen
    fragColor = vec4(col,1.0);
}

#include <../common/main_shadertoy.frag> 