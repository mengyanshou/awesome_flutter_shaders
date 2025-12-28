// --- Migrate Log ---
// 添加必要的 include 指令以兼容 Flutter/Skia
// 替换 iDate.w 为 iTime，适配 Flutter Shadertoy 兼容层
// 移除多余的右大括号
// Add required include directives for Flutter/Skia compatibility
// Replaced iDate.w with iTime for Flutter Shadertoy compatibility layer
// Removed extraneous closing brace

#include <../common/common_header.frag>

// Created by inigo quilez - iq/2013
//   https://www.youtube.com/c/InigoQuilez
//   https://iquilezles.org/
// I share this piece (art and code) here in Shadertoy and through its Public API, only for educational purposes. 
// You cannot use, sell, share or host this piece or modifications of it as part of your own commercial or non-commercial product, website or project.
// You can share a link to it or an unmodified screenshot of it provided you attribute "by Inigo Quilez, @iquilezles and iquilezles.org". 
// If you are a teacher, lecturer, educator or similar and these conditions are too restrictive for your needs, please contact me and we'll work it out.


// See also:
//
// Input - Keyboard    : https://www.shadertoy.com/view/lsXGzf
// Input - Microphone  : https://www.shadertoy.com/view/llSGDh
// Input - Mouse       : https://www.shadertoy.com/view/Mss3zH
// Input - Sound       : https://www.shadertoy.com/view/Xds3Rr
// Input - SoundCloud  : https://www.shadertoy.com/view/MsdGzn
// Input - Time        : https://www.shadertoy.com/view/lsXGz8
// Input - TimeDelta   : https://www.shadertoy.com/view/lsKGWV
// Inout - 3D Texture  : https://www.shadertoy.com/view/4llcR4


float sdLine( in vec2 p, in vec2 a, in vec2 b )
{
	vec2 pa = p-a, ba = b-a;
	float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
	return length( pa - ba*h );
}

vec3 line( in vec3 buf, in vec2 a, in vec2 b, in vec2 p, in vec2 w, in vec4 col )
{
   float f = sdLine( p, a, b );
   float g = fwidth(f)*w.y;
   return mix( buf, col.xyz, col.w*(1.0-smoothstep(w.x-g, w.x+g, f)) );
}

vec3 hash3( float n ) { return fract(sin(vec3(n,n+1.0,n+2.0))*43758.5453123); }

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    const float kTau = 6.283185;
    
    // get time (convert iTime to seconds since start)
    float timeInSeconds = iTime;
    float mils = fract(timeInSeconds);
	float secs = mod( floor(timeInSeconds),        60.0 );
	float mins = mod( floor(timeInSeconds/60.0),   60.0 );
	float hors = mod( floor(timeInSeconds/3600.0), 24.0 );
    
    secs += smoothstep(0.9,1.0,mils);

	vec2 uv = (2.0*fragCoord.xy-iResolution.xy)/min(iResolution.y,iResolution.x);

	float r = length( uv );
	float a = atan( uv.y, uv.x )+3.1415926;
    
	// background color
	vec3 col = vec3(1.0);

    // inner watch body	
    {
    float d = r-0.94;
    if( d>0.0 ) col *= 1.0 - 0.5/(1.0+32.0*d);
	col = mix( col, vec3(0.9), 1.0-smoothstep(0.0,0.01,d) );
    }

    // 5 minute marks	
	float f = abs(2.0*fract(0.5+a*60.0/kTau)-1.0);
	float g = 1.0-smoothstep( 0.0, 0.1, abs(2.0*fract(0.5+a*12.0/kTau)-1.0) );
	float w = fwidth(f);
	f = 1.0 - smoothstep( 0.1*g+0.05-w, 0.1*g+0.05+w, f );
	f *= smoothstep( 0.85, 0.86, r+0.05*g ) - smoothstep( 0.94, 0.95, r );
	col = mix( col, vec3(0.0), f );

	// seconds hand
	vec2 dir;
	dir = vec2( sin(kTau*secs/60.0), cos(kTau*secs/60.0) );
    col = line( col, -dir*0.15, dir*0.7, uv+0.03, vec2(0.005,8.0), vec4(0.0,0.0,0.0,0.2) );
    col = line( col, -dir*0.15, dir*0.7, uv,      vec2(0.005,1.0), vec4(0.6,0.0,0.0,1.0) );

	// minutes hand
	dir = vec2( sin(kTau*mins/60.0), cos(kTau*mins/60.0) );
    col = line( col, -dir*0.15, dir*0.7, uv+0.03, vec2(0.015,8.0), vec4(0.0,0.0,0.0,0.2) );
    col = line( col, -dir*0.15, dir*0.7, uv,      vec2(0.015,1.0), vec4(0.0,0.0,0.0,1.0) );

    // hours hand
	dir = vec2( sin(kTau*hors/12.0), cos(kTau*hors/12.0) );
    col = line( col, -dir*0.15, dir*0.4, uv+0.03, vec2(0.015,8.0), vec4(0.0,0.0,0.0,0.2) );
    col = line( col, -dir*0.15, dir*0.4, uv,      vec2(0.015,1.0), vec4(0.0,0.0,0.0,1.0) );

    // center mini circle
    {
    float d = r-0.035;
    if( d>0.0 ) col *= 1.0 - 0.5/(1.0+64.0*d);
	col = mix( col, vec3(0.9), 1.0-smoothstep(0.035,0.038,r) );
	col = mix( col, vec3(0.0), 1.0-smoothstep(0.00,0.007,abs(r-0.038)) );
    }

    // dithering    
    col += (1.0/255.0)*hash3(uv.x+13.0*uv.y);

	fragColor = vec4( col,1.0 );
}

#include <../common/main_shadertoy.frag>