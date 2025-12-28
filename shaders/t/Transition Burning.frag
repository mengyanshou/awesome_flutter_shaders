// --- Migrate Log ---
// 添加 common_header 引入并补充缺失的采样器声明；将输出 alpha 显式设为 1.0 以避免未初始化
// --- Migrate Log (EN) ---
// Added common_header include and declared missing sampler uniforms; set output alpha explicitly to 1.0 to avoid uninitialized value

#include <../common/common_header.frag>
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;

// based on http://glslsandbox.com/e#35642.0

vec3 TextureSource(vec2 uv)
{
    return SG_TEX0(iChannel0, uv).rgb;
}

vec3 TextureTarget(vec2 uv)
{
    return SG_TEX1(iChannel1, uv).rrr;
}


float Hash( vec2 p)
{
	vec3 p2 = vec3(p.xy,1.0);
    return fract(sin(dot(p2,vec3(37.1,61.7, 12.4)))*3758.5453123);
}

float noise(in vec2 p)
{
    vec2 i = floor(p);
	vec2 f = fract(p);
	f *= f * (3.0-2.0*f);

    return mix(mix(Hash(i + vec2(0.,0.)), Hash(i + vec2(1.,0.)),f.x),
		mix(Hash(i + vec2(0.,1.)), Hash(i + vec2(1.,1.)),f.x),
		f.y);
}

float fbm(vec2 p) 
{
	float v = 0.0;
	v += noise(p*1.)*.5;
	v += noise(p*2.)*.25;
	v += noise(p*4.)*.125;
	return v;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = (fragCoord - iResolution.xy*.5)/iResolution.y;
	
	vec3 src = TextureSource(uv);
    
	vec3 tgt = TextureTarget(uv);
	
	vec3 col = src;
	
	uv.x -= 1.5;
	
	float ctime = mod(iTime*.5,2.5);
	
	// burn
	float d = uv.x+uv.y*0.5 + 0.5*fbm(uv*15.1) + ctime*1.3;
	if (d >0.35) col = clamp(col-(d-0.35)*10.,0.0,1.0);
	if (d >0.47) {
		if (d < 0.5 ) col += (d-0.4)*33.0*0.5*(0.0+noise(100.*uv+vec2(-ctime*2.,0.)))*vec3(1.5,0.5,0.0);
		else col += tgt; }
	
	fragColor = vec4(col, 1.0);
} 


#include <../common/main_shadertoy.frag>
