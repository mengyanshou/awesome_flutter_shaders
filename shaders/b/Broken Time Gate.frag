
// Credit to nimitz (stormoid.com) (twitter: @stormoid)
// For the original shader here: https://www.shadertoy.com/view/ldlXRS
// Lisense has to propagate I think... so:
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License

// I am just trying out new things and found this one, I do not understand how the original works so I am making mofications for fun.

#include <../common/common_header.frag>
uniform sampler2D iChannel0;

#define time (iTime)*0.12
#define tau 6.2831853

mat2 makem2(in float theta){float c = cos(theta);float s = sin(theta);return mat2(c,-s,s,c);}
float noise(in vec2 x){ return SG_TEX0(iChannel0, x * 0.01).x; }

float fbm(in vec2 p)
{	
	float z=2.;
	float rz = 0.;
	vec2 bp = p;
	for (float i= 1.;i < 6.;i++)
	{
		rz+= abs((noise(p)-0.5)*2.)/z;
		z = z*2.;
		p = p*2.;
	}
	return rz;
}

float dualfbm(in vec2 p)
{
    //get two rotated fbm calls and displace the domain
	vec2 p2 = p*.7;
	vec2 basis = vec2(fbm(p2-time*1.6),fbm(p2+time*1.7));
	basis = (basis-.5)*.2;
	p += basis;
	
	//coloring
	return fbm(p*makem2(time*0.2));
}

float circ(vec2 p) 
{
	float r = length(p);
	// Protect against r == 0 which would cause log(0) -> -inf
	r = log(sqrt(max(r, 1e-6)));
	return abs(mod(r*4.,tau)-3.14)*3.+.2;

} 

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	//setup system
	vec2 p = fragCoord.xy / iResolution.xy-0.5;
	p.x *= iResolution.x/iResolution.y;
    float len = length(p);
	p*=4.;
    
	
    float rz = dualfbm(p);
    float artifacts_radious_fade = pow(max(1., 6.5*len), 0.2) ;
    rz = artifacts_radious_fade*rz + (1.-artifacts_radious_fade)*dualfbm(p+5.0*sin(time)); // Add flaoting things around portal
    float my_time = time + 0.08*rz;
    
	//rings
	p /= exp(mod((my_time*10. + rz),3.38159)); // offset from PI to make the ripple effect at the start  
	rz *= pow(abs((0.1-circ(p))),.9);
	
	//final color
	// Guard against very small or zero rz which would produce Inf/NaN in feedback or color
	float rz_safe = max(rz, 1e-6);
	vec3 col = 0.4 * vec3(0.2, 0.1, 0.4) / rz_safe;
	col = pow(abs(col), vec3(0.99));
	fragColor = vec4(col, 1.0);
}

#include <../common/main_shadertoy.frag>