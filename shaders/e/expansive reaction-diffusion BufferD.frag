// --- Migrate Log ---
// 1) 添加 common_header 和 main_shadertoy includes
// 2) 为适配 linear filter：全屏写默认值，避免未写入像素导致采样到未定义值
//
// 1) Add common_header and main_shadertoy includes
// 2) For linear filter stability: write a default value for all pixels to avoid undefined sampling

#include <../common/common_header.frag>

// not used (yet), but hooray for 8 channel feedback

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / iResolution.xy;
    vec2 pixelSize = 1. / iResolution.xy;
    float eighth = 1./8.;

    // Always write a defined value so linear sampling is stable.
    fragColor = vec4(0.0);
    if(uv.x > 7.*eighth && uv.x < 8.*eighth && uv.y > 2.*eighth && uv.y < 3.*eighth)
    {
        fragColor = vec4(iMouse.xy / iResolution.xy, iMouse.zw / iResolution.xy);
    }
}

#include <../common/main_shadertoy.frag>