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
#include <../common/common_header.frag>
uniform sampler2D iChannel0;
const int doBloom = 1; //Change to 0 to disable bloom
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord / iResolution.xy;
    vec3 col = texture(iChannel0, uv).rgb;
    if(doBloom == 1) {
        // 用texture替换textureLod，使用高斯模糊来近似mipmap效果
        float lod = 2.0;
        float offset = 0.005 * lod;
        vec3 bloom = vec3(0.0);
        
        // 9点采样实现简单模糊
        bloom += texture(iChannel0, uv).rgb * 0.25;
        bloom += texture(iChannel0, uv + vec2(offset, 0.0)).rgb * 0.125;
        bloom += texture(iChannel0, uv + vec2(-offset, 0.0)).rgb * 0.125;
        bloom += texture(iChannel0, uv + vec2(0.0, offset)).rgb * 0.125;
        bloom += texture(iChannel0, uv + vec2(0.0, -offset)).rgb * 0.125;
        bloom += texture(iChannel0, uv + vec2(offset, offset)).rgb * 0.0625;
        bloom += texture(iChannel0, uv + vec2(-offset, offset)).rgb * 0.0625;
        bloom += texture(iChannel0, uv + vec2(offset, -offset)).rgb * 0.0625;
        bloom += texture(iChannel0, uv + vec2(-offset, -offset)).rgb * 0.0625;
        
        bloom = pow(bloom, vec3(3.0));
        col += bloom;
    }

    // Output to screen
    fragColor = vec4(col, 1.0);
}
#include <../common/main_shadertoy.frag>