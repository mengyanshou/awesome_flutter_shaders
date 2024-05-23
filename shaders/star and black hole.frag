#include <common/common_header.frag>
/*originals  https://www.shadertoy.com/view/MdXSzS and other from glslssandbox.com*/
float ring(vec2 p, float size, vec2 m){
	return 0.01 / abs(length(p - m) - size) ;
}

//円生成
float circle(vec2 p, vec2 m) {
	return 0.1 / length(p - m) - 0.3;
}
#define resolution iResolution.xy
#define time iTime
 float happy_star(vec2 uv, float anim)
{
    uv = abs(uv);
    vec2 pos = min(uv.xy/uv.yx, anim);
    float p = (2.0 - pos.x - pos.y);
    return (2.0+p*(p*p-1.5)) / (uv.x+uv.y);      
}
 
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{

	vec2 uv = (fragCoord.xy / iResolution.xy) - .5;
	float t = iTime * .1 + ((.25 + .05 * sin(iTime * .1))/(length(uv.xy) + 1.07)) * 2.2;
	float si = sin(t);
	float co = cos(t);
	mat2 ma = mat2(co, si, -si, co);
vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);

	 vec2 m2 = (iMouse.xy - .5*iResolution.xy)/iResolution.y;
    vec2 mouse = (iMouse.xy * 2.0 - iResolution.xy)/iResolution.y;
	float x = uv.x+m2.x;
	float y = uv.y+m2.y;
	vec2 m = vec2(x, y);
	//円環のスピード
	float speed = 2.0;
	//定義
	float ti = mod(time, 2.0);
	float l = 0.0;
	//円環を描画するループ
	for(int i = 1; i <= 5; i++){
		float ti = mod(time * speed -float(i), 5.0);
		l += ring(p, ti, m) ;
	}
	//円描画
	l += circle(p, m);
	float v1, v2, v3;
	v1 = v2 = v3 = 0.0;
	float s = 0.0;
	for (int i = 0; i < 90; i++)
	{
		vec3 p = s * vec3(uv, fract(iTime));
		p.xy *= ma;
		p += vec3(.22, .3, s - 1.5 - sin(iTime * .13) * .1)+l;
		for (int i = 0; i < 8; i++)	p = abs(p) / dot(p,p) - 0.659;
		v1 += dot(p,p) * .0015 * (1.8 + sin(length(uv.xy * 13.0) + .5  - iTime * .2));
		v2 += dot(p,p) * .0013 * (1.5 + sin(length(uv.xy * 14.5) + 1.2 - iTime * .3));
		v3 += length(p.xy*10.) * .0003;
		s  += .035;
	}
	float len = length(uv);
	v1 *= smoothstep(.7, .0, len);
	v2 *= smoothstep(.5, .0, len);
	v3 *= smoothstep(.3, .0, len);
	vec3 col = vec3( v3 * (1.5 + sin(iTime * .2) * .4),
					(v1 + v3) * .3,
					 v2) + smoothstep(0.2, .0, len) * .85 + smoothstep(.0, .6, v3) * .3;

	fragColor=vec4(min(pow(abs(col), vec3(1.2)), 1.0), 1.0);
  
   
    fragColor+= vec4(happy_star(uv+m2, 1.) * vec3(0.55,0.5,0.55)*0.1, 1.0);
}


#include <common/main_shadertoy.frag>