// --- Migrate Log ---
// 初始化局部变量 uv
// 保护除以 r.x 防止为 0
// 声明 iChannel0 uniform
// 替换 textureLod 为 texture
// --- Migrate Log (EN) ---
// Initialize local variable uv
// Protect against division by r.x = 0
// Declare iChannel0 uniform
// Replace textureLod with texture

#include <../common/common_header.frag>

uniform sampler2D iChannel0;

// Copyright Inigo Quilez, 2014 - https://iquilezles.org/
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

#define HSAMPLES 128
#define MSAMPLES   8

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // some (not amazing) per-pixel random noise
    vec4 ran = fract( vec4(10.5421,22.61129,30.7123,35.36291) *
                      dot(vec2(0.0149451,0.038921),fragCoord)) - 0.5;

    // pixel and time coordinates
	vec2  p = (2.0*(fragCoord+ran.xy)-iResolution.xy)/iResolution.y;
    float t =  iTime + 10.0*iMouse.x/iResolution.x;
    float dof = dot( p, p );

    // supersample (time and space)
    vec3 tot = vec3(0.0);
    for( int j=0; j<MSAMPLES; j++ )
    {
        // animate
        float msa = (float(j)+ran.z)/float(MSAMPLES);
        float tim = t + 0.5*(1.0/24.0)*(float(j)+ran.w)/float(MSAMPLES);
        vec2  off = vec2( 0.2*tim, 0.2*sin(tim*0.2) );

        // depth of field
	    vec2 q = p + dof*0.04*msa*vec2(cos(15.7*msa),sin(15.7*msa));
        // deform into cylinder
        vec2 r = vec2( length(q), 0.5+0.5*atan(q.y,q.x)/3.1415927 );
        r.x = max(r.x, 1e-4); // protect against division by zero

        // render stack of layers (intersect ray with geometry)
        vec3 uv = vec3(0.0);
        for( int i=0; i<HSAMPLES; i++ )
        {
            uv.z = (float(i)+ran.x)/float(HSAMPLES-1);
            uv.xy = off + vec2( 0.2/(r.x*(1.0-0.6*uv.z)), r.y );
            if( texture( iChannel0, uv.xy ).x < uv.z )
                break;
        }

        // shading/coloring
        float dif = clamp( 8.0*(texture(iChannel0, uv.xy).x - texture(iChannel0, uv.xy+vec2(0.02,0.0)).x), 0.0, 1.0 );
        vec3  col = vec3(1.0);
        col *= 1.0-texture( iChannel0, 1.0*uv.xy ).xyz;
        col = mix( col*1.2, 1.5*texture( iChannel0, vec2(uv.x*0.4,0.1*sin(2.0*uv.y*3.1316)) ).yzx, 1.0-0.7*col );
        col = mix( col, vec3(0.2,0.1,0.1), 0.5-0.5*smoothstep( 0.0, 0.3, 0.3-0.8*uv.z + texture( iChannel0, 2.0*uv.xy + uv.z ).x ) );
        col *= 1.0-1.3*uv.z;
        col *= 1.3-0.2*dif;
        col *= exp(-0.35/(0.0001+r.x));

        tot += col;
    }
    tot /= float(MSAMPLES);

    // color correct
    tot.x += 0.05;
    tot = 1.05*pow( tot, vec3(0.6,1.0,1.0) );

    fragColor = vec4( tot, 1.0 );
}

#include <../common/main_shadertoy.frag>
