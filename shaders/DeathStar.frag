// The MIT License
// Copyright © 2022 Inigo Quilez
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// Exact distance to a sphere cut by another sphere. Note
// that doing the boolean subtration of a sphere from another
// sphere using max() won't produce a correct Euclidean distance
// than cab be used for rounding. This shape is basically a
// revolution operator (https://www.shadertoy.com/view/4lyfzw)
// applied to a moon (https://www.shadertoy.com/view/WtdBRS)

// List of other 3D SDFs: https://www.shadertoy.com/playlist/43cXRl
//
// and https://iquilezles.org/articles/distfunctions

#include <common/common_header.frag>
// ra = sphere's radius
// rb = small sphere's radius
// d  = distance between the two spheres
float sdDeathStar( in vec3 p2, in float ra, float rb, in float d )
{
    vec2 p = vec2( p2.x, length(p2.yz) );

    float a = (ra*ra - rb*rb + d*d)/(2.0*d);
    float b = sqrt(max(ra*ra-a*a,0.0));
    if( p.x*b-p.y*a > d*max(b-p.y,0.0) )
    {
        return length(p-vec2(a,b));
    }
    else
    {
        return max( (length(p          )-ra),
                   -(length(p-vec2(d,0))-rb));
    }
}

float map( in vec3 pos )
{
    float ra = 0.5;
    float rb = 0.35+0.20*cos(iTime*1.1+4.0);
    float di = 0.50+0.15*cos(iTime*1.7);
    return sdDeathStar(pos, ra, rb, di );
}

// https://iquilezles.org/articles/rmshadows
float calcSoftshadow( in vec3 ro, in vec3 rd, float tmin, float tmax, const float k )
{
	float res = 1.0;
    float t = tmin;
    for( int i=0; i<64; i++ )
    {
		float h = map( ro + rd*t );
        res = min( res, k*h/t );
        t += clamp( h, 0.003, 0.10 );
        if( res<0.002 || t>tmax ) break;
    }
    return clamp( res, 0.0, 1.0 );
}

// https://iquilezles.org/articles/normalsSDF
vec3 calcNormal( in vec3 pos )
{
    vec2 e = vec2(1.0,-1.0)*0.5773;
    const float eps = 0.0005;
    return normalize( e.xyy*map( pos + e.xyy*eps ) + 
					  e.yyx*map( pos + e.yyx*eps ) + 
					  e.yxy*map( pos + e.yxy*eps ) + 
					  e.xxx*map( pos + e.xxx*eps ) );
}
    
#if HW_PERFORMANCE==0
#define AA 1
#else
#define AA 3
#endif

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
     // camera movement	
	float an = 1.0*sin(0.38*iTime+3.0);
	vec3 ro = vec3( 1.0*cos(an), -0.1, 1.0*sin(an) );
    vec3 ta = vec3( 0.0, 0.0, 0.0 );
    // camera matrix
    vec3 ww = normalize( ta - ro );
    vec3 uu = normalize( cross(ww,vec3(0.0,1.0,0.0) ) );
    vec3 vv = normalize( cross(uu,ww));
    
    
    vec3 tot = vec3(0.0);
    
    #if AA>1
    for( int m=0; m<AA; m++ )
    for( int n=0; n<AA; n++ )
    {
        // pixel coordinates
        vec2 o = vec2(float(m),float(n)) / float(AA) - 0.5;
        vec2 p = (2.0*(fragCoord+o)-iResolution.xy)/iResolution.y;
        #else    
        vec2 p = (2.0*fragCoord-iResolution.xy)/iResolution.y;
        #endif

	    // create view ray
        vec3 rd = normalize( p.x*uu + p.y*vv + 1.5*ww );

        // raymarch
        const float tmax = 5.0;
        float t = 0.0;
        for( int i=0; i<256; i++ )
        {
            vec3 pos = ro + t*rd;
            float h = map(pos);
            if( h<0.0001 || t>tmax ) break;
            t += h;
        }
        
    
        // shading/lighting	
        vec3 col = vec3(0.0);
        if( t<tmax )
        {
            vec3 pos = ro + t*rd;
            vec3 nor = calcNormal(pos);
            vec3 lig = vec3(0.57703);
            float dif = clamp( dot(nor,lig), 0.0, 1.0 );
            if( dif>0.001 ) dif *= calcSoftshadow( pos+nor*0.001, lig, 0.001, 1.0, 32.0 );
            float amb = 0.5 + 0.5*dot(nor,vec3(0.0,1.0,0.0));
            col = vec3(0.2,0.3,0.4)*amb + vec3(0.8,0.7,0.5)*dif;
        }

        // gamma        
        col = sqrt( col );
	    tot += col;
    #if AA>1
    }
    tot /= float(AA*AA);
    #endif

	fragColor = vec4( tot, 1.0 );
}
#include <common/main_shadertoy.frag>