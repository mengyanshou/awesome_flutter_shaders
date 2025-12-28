// --- Migrate Log ---
// 添加 Flutter 兼容性 include 文件
// Added Flutter compatibility includes
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

#include <../common/common_header.frag>

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = (2.0*fragCoord-iResolution.xy) / iResolution.y;

    // background	 
	vec3 color = vec3(0.8 + 0.2*uv.y);

    // bubbles	
	for( int i=0; i<40; i++ )
	{
        // bubble seeds
		float pha =      sin(float(i)*546.13+1.0)*0.5 + 0.5;
		float siz = pow( sin(float(i)*651.74+5.0)*0.5 + 0.5, 4.0 );
		float pox =      sin(float(i)*321.55+4.1) * iResolution.x / iResolution.y;

        // bubble size, position and color
		float rad = 0.1 + 0.5*siz;
		vec2  pos = vec2( pox, -1.0-rad + (2.0+2.0*rad)*mod(pha+0.1*iTime*(0.2+0.8*siz),1.0));
		float dis = length( uv - pos );
		vec3  col = mix( vec3(0.94,0.3,0.0), vec3(0.1,0.4,0.8), 0.5+0.5*sin(float(i)*1.2+1.9));
		//    col+= 8.0*smoothstep( rad*0.95, rad, dis );
		
        // render
		float f = length(uv-pos)/rad;
		f = sqrt(clamp(1.0-f*f,0.0,1.0));
		color -= col.zyx *(1.0-smoothstep( rad*0.95, rad, dis )) * f;
	}

    // vigneting	
	color *= sqrt(1.5-0.5*length(uv));

	fragColor = vec4(color,1.0);
}

#include <../common/main_shadertoy.frag>