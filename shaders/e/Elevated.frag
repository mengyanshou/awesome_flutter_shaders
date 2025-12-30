// --- Migrate Log ---
// 替换 texture(iChannel0, ...) 为 SG_TEX0，添加 common header 与 main_shadertoy.frag include
//
// Replace texture(iChannel0, ...) with SG_TEX0 and add common header + main_shadertoy.frag

#include <../common/common_header.frag>

// Copyright Inigo Quilez, 2013 - https://iquilezles.org/
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

// on the derivatives based noise: https://iquilezles.org/articles/morenoise
// on the soft shadow technique: https://iquilezles.org/articles/rmshadows
// on the fog calculations: https://iquilezles.org/articles/fog
// on the lighting: https://iquilezles.org/articles/outdoorslighting
// on the raymarching: https://iquilezles.org/articles/terrainmarching

uniform sampler2D iChannel0;

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord/iResolution.xy;
    vec4 data = SG_TEX0(iChannel0, uv );

    vec3 col = vec3(0.0);
    if( data.w < 0.0 )
    {
        col = data.xyz;
    }
    else
    {
        // decompress velocity vector
        float ss = mod(data.w,1024.0)/1023.0;
        float st = floor(data.w/1024.0)/1023.0;

        // motion blur (linear blur across velocity vectors
        vec2 dir = (-1.0 + 2.0*vec2( ss, st ))*0.25;
        col = vec3(0.0);
        for( int i=0; i<32; i++ )
        {
            float h = float(i)/31.0;
            vec2 pos = uv + dir*h;
            col += SG_TEX0(iChannel0, pos ).xyz;
        }
        col /= 32.0;
    }
    
    // vignetting	
	col *= 0.5 + 0.5*pow( 16.0*uv.x*uv.y*(1.0-uv.x)*(1.0-uv.y), 0.1 );

    col = clamp(col,0.0,1.0);
    col = col*0.6 + 0.4*col*col*(3.0-2.0*col) + vec3(0.0,0.0,0.04);
    

    
    fragColor = vec4( col, 1.0 );
}

#include <../common/main_shadertoy.frag>