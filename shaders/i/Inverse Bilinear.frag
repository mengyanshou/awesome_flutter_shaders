// --- Migrate Log ---
// 添加必要的 include 指令以兼容 Flutter/Skia
// 声明使用的 iChannel0 纹理
// Add required include directives for Flutter/Skia compatibility
// Declared iChannel0 texture usage

#include <../common/common_header.frag>

uniform sampler2D iChannel0;

// The MIT License
// Copyright © 2014 Inigo Quilez
// https://www.youtube.com/c/InigoQuilez
// https://iquilezles.org/
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


// Inverse bilinear interpolation: given four points defining a quadrilateral, compute the uv
// coordinates of any point in the plane that would give result to that point as a bilinear 
// interpolation of the four points.
//
// The problem can be solved through a quadratic equation. More information in this article:
//
// https://iquilezles.org/articles/ibilinear



// given a point p and a quad defined by four points {a,b,c,d}, return the bilinear
// coordinates of p in the quad. Will not be in the range [0..1]^2 if the point is
// outside the quad.
float cross2d( in vec2 a, in vec2 b ) { return a.x*b.y - a.y*b.x; }
vec2 invBilinear( in vec2 p, in vec2 a, in vec2 b, in vec2 c, in vec2 d )
{
    vec2 res = vec2(-1.0);

    vec2 e = b-a;
    vec2 f = d-a;
    vec2 g = a-b+c-d;
    vec2 h = p-a;
        
    float k2 = cross2d( g, f );
    float k1 = cross2d( e, f ) + cross2d( h, g );
    float k0 = cross2d( h, e );
    
    // if edges are parallel, this is a linear equation
    if( abs(k2)<0.001 )
    {
        res = vec2( (h.x*k1+f.x*k0)/(e.x*k1-g.x*k0), -k0/k1 );
    }
    // otherwise, it's a quadratic
	else
    {
        float w = k1*k1 - 4.0*k0*k2;
        if( w<0.0 ) return vec2(-1.0);
        w = sqrt( w );

        float ik2 = 0.5/k2;
        float v = (-k1 - w)*ik2;
        float u = (h.x - f.x*v)/(e.x + g.x*v);
        
        if( u<0.0 || u>1.0 || v<0.0 || v>1.0 )
        {
           v = (-k1 + w)*ik2;
           u = (h.x - f.x*v)/(e.x + g.x*v);
        }
        res = vec2( u, v );
    }
    
    return res;
}

// distance to a line segment
float sdSegment( in vec2 p, in vec2 a, in vec2 b )
{
    p -= a; b -= a;
	return length( p-b*clamp(dot(p,b)/dot(b,b),0.0,1.0) );
}

// simple hash
vec3 hash3( float n ) { return fract(sin(vec3(n,n+3.0,n+7.0))*321.513); }

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 p = (2.0*fragCoord-iResolution.xy)/iResolution.y;
    
    // background
    vec3 col = vec3( 0.35 + 0.1*p.y );

    // move points
    vec2 a = cos( 1.11*iTime + vec2(0.1,4.0) );
    vec2 b = cos( 1.13*iTime + vec2(1.0,3.0) );
    vec2 c = cos( 1.17*iTime + vec2(2.0,2.0) );
    vec2 d = cos( 1.15*iTime + vec2(3.0,1.0) );

    // d = c+a-b; // enable this to test parallelograms
    
    // area of the quad
    vec2 uv = invBilinear( p, a, b, c, d );
    
    // inside of quad if uv in [0..1]^2
    if( max( abs(uv.x-0.5), abs(uv.y-0.5))<0.5 )
    {
        col = texture( iChannel0, uv ).xyz;
    }
    
    // quad borders
    float h = 2.0/iResolution.y;
    col = mix( col, vec3(1.0,0.7,0.2), 1.0-smoothstep(h,2.0*h,sdSegment(p,a,b)));
    col = mix( col, vec3(1.0,0.7,0.2), 1.0-smoothstep(h,2.0*h,sdSegment(p,b,c)));
    col = mix( col, vec3(1.0,0.7,0.2), 1.0-smoothstep(h,2.0*h,sdSegment(p,c,d)));
    col = mix( col, vec3(1.0,0.7,0.2), 1.0-smoothstep(h,2.0*h,sdSegment(p,d,a)));
 
    // dither
    col += (1.0/255.0)*hash3(p.x+1920.0*p.y);

	fragColor = vec4( col, 1.0 );
}

#include <../common/main_shadertoy.frag>