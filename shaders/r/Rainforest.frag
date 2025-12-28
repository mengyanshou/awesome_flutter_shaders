// --- Migrate Log ---
// 声明纹理采样器 iChannel0
// 添加 Flutter/SkSL 兼容性 include
// --- Migrate Log (EN) ---
// Declare texture sampler iChannel0
// Add Flutter/SkSL compatibility includes

#include <../common/common_header.frag>

uniform sampler2D iChannel0;

// Copyright Inigo Quilez, 2016 - https://iquilezles.org/
// I am the sole copyright owner of this Work. You cannot
// host, display, distribute or share this Work neither as
// is or altered, in any form including physical and
// digital. You cannot use this Work in any commercial or
// non-commercial product, website or project. You cannot
// sell this Work and you cannot mint an NFTs of it. You
// cannot use this Work to train AI models. I share this
// Work for educational purposes, you can link to it as
// an URL, proper attribution and unmodified screenshot,
// as part of your educational material. If these
// conditions are too restrictive please contact me.

// A rainforest landscape.
//
// Tutorial on Youtube : https://www.youtube.com/watch?v=BFld4EBO2RE
// Tutorial on Bilibili: https://www.bilibili.com/video/BV1Da4y1q78H
//
// Buy a metal or paper print: https://www.redbubble.com/shop/ap/39843511
//
// Normals are analytical (true derivatives) for the terrain and for the
// clouds, including the noise, the fbm and the smoothsteps.
//
// Lighting and art composed for this shot/camera. The trees are really
// ellipsoids with noise, but they kind of do the job in distance and low
// image resolutions Also I used some basic reprojection technique to 
// smooth out the render.
//
// See here for more info: 
//  https://iquilezles.org/articles/fbm
//  https://iquilezles.org/articles/morenoise


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 p = fragCoord/iResolution.xy;

    vec3 col = texture( iChannel0, p ).xyz;
  //vec3 col = texelFetch( iChannel0, ivec2(fragCoord-0.5), 0 ).xyz;

    col *= 0.5 + 0.5*pow( 16.0*p.x*p.y*(1.0-p.x)*(1.0-p.y), 0.05 );
         
    fragColor = vec4( col, 1.0 );
}

#include <../common/main_shadertoy.frag>
