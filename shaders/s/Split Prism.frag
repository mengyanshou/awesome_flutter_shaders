// --- Migrate Log ---
// 初始化局部变量以避免未定义行为；移除 texture() 的偏移/bias 第三个参数以兼容 SkSL；添加缺失的 iChannel 采样器声明
// --- Migrate Log (EN) ---
// Initialize local variables to avoid undefined behavior; remove texture(...) bias/lod third arg for SkSL compatibility; declare missing iChannel sampler
#include <../common/common_header.frag>
uniform sampler2D iChannel0;

#define CIRCLE(_size,_dist,_sharpness) pow(clamp(_size*_dist,0.0,1.0),_sharpness)

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / iResolution.xy;	
	//fragColor = vec4(uv,0.5+0.5*sin(iTime),1.0);
	
	vec2 aspect = vec2(iResolution.x / iResolution.y,1.0);
	vec2 aspect_uv = aspect*uv;
	vec2 mouse_uv = aspect * iMouse.xy / iResolution.xy;
	
	float blurAmount = mouse_uv.y*2.0 - 1.0;
	float blurSign = sign(blurAmount);
	mouse_uv.y = 0.35;
	
	float bob = 0.035 * sin(0.1*iTime);
	mouse_uv.x += bob*sin(iTime);
	mouse_uv.y += bob*cos(0.5*iTime);
		
	vec2 delta = mouse_uv - aspect_uv;
	float dist = length(delta);
	vec2 middle = floor(-delta.yx + vec2(1.0));
	
	float blackRing = CIRCLE(4.0, dist, 64.0);
	blackRing += 0.9 - 0.9 * CIRCLE(4.02, dist, 128.0);

	blackRing *= CIRCLE(8.0, dist, 128.0);
	blackRing += 1.0 - CIRCLE(8.03, dist, 128.0);

	blackRing *= CIRCLE(9.0, dist, 128.0);
	blackRing += 1.0 - CIRCLE(9.04, dist, 128.0);

	float frostRing = CIRCLE(18.0, dist, 256.0);
	frostRing *= 1.0 - CIRCLE(8.0, dist, 256.0);

	float ring = 1.0 - CIRCLE(1.2, dist, 8.0);
	blackRing *= ring;
	
	vec2 grid = mod(delta*10.0, 1.0);
	grid = clamp(grid, 0.0, 1.0);
	grid.x = pow(grid.x,30.0);
	grid.y = pow(grid.y,30.0);
	grid.x *= grid.y;
	grid.x = 1.0-grid.x;
	
	vec2 pattern = delta*45.0;
	pattern = mod(pattern,1.0);	
	pattern = clamp(pattern, 0.0, 1.0);
	frostRing *= pattern.x * pattern.y;
	float frostOffset = blurAmount*frostRing;
	
	float splitRing = 1.0 - CIRCLE(18.1, dist, 256.0);
	frostRing += splitRing;
	splitRing *= mix(blurAmount, -blurAmount, middle.x);
	float splitOffset = splitRing;
	
	vec2 shift = -(1.0-ring) * delta;
	vec3 aber = 0.1 * vec3(0.6,0.8,1);
	
	uv.x += splitOffset * 0.01;
	uv += frostOffset*vec2(0.01);
	uv.y = 1.0-uv.y;	
	
	float blurBias = 3.4 * blurSign * blurAmount;
	vec4 blurColor = texture(iChannel0, uv + shift * aber.x);
	blurColor.y = texture(iChannel0, uv + shift * aber.y).y;
	blurColor.z = texture(iChannel0, uv + shift * aber.z).z;

	vec4 sharpColor = texture(iChannel0, uv + shift * aber.x);
	vec4 color = blackRing * mix(blurColor, sharpColor, frostRing) * grid.x;
	fragColor = color;
}
#include <../common/main_shadertoy.frag>