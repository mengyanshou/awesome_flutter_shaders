// --- Migrate Log ---
// - 将 mainVR 逻辑移至 mainImage 以兼容非 VR 环境
// - 使用与主着色器相同的动画相机模拟 ro
// - 替换 texelFetch 为 texture
// - 初始化局部变量并添加除零保护
// --- Migrate Log (EN) ---
// - Moved mainVR logic to mainImage for non-VR compatibility
// - Simulated 'ro' using the same animated camera as the main shader
// - Replaced texelFetch with texture
// - Initialized local variables and added division-by-zero protection

#include <../common/common_header.frag>
#include "Portal - iOS AR Common.frag"

uniform sampler2D iChannel0;

float iPlane( in vec3 ro, in vec3 rd, in vec4 pla ) {
    float d = dot( pla.xyz, rd );
    if(abs(d) < 1e-6) return -1.0;
    return (-pla.w - dot(pla.xyz,ro)) / d;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    // In a VR context, 'ro' would come from iCamera (device position).
    // For this port, we simulate it with a fixed animation, same as the main shader.
    float a = .3 * iTime;
    vec3 ro = vec3( 3.9*sin(a), 0.7, 3.2*cos(a) + .5 );
    
    // The logic below is ported from the original mainVR function.
    ro += PORTAL_POS + START_OFFSET;
    
    bool inside = false;
    vec3 oldRo = ro;
    
    if (iFrame > 0) {
        // Read previous state from Buffer A (itself).
        // texelFetch is replaced to be compatible with SkSL.
        // We read from the center of the (0,0) pixel of the previous buffer frame.
    	vec4 t = texture(iChannel0, (vec2(0.5, 0.5)) / iResolution.xy);
        oldRo = t.xyz;
        inside = t.w > .5;
        
        vec3 rd_local = normalize( ro - oldRo );
        float portalDist = 0.0;
        portalDist = iPlane( oldRo, rd_local, vec4(0,0,1,-dot(PORTAL_POS,vec3(0,0,1))));
	    if (portalDist > 0. && portalDist <= length( ro - oldRo) ) {
    	    vec3 p = oldRo + rd_local * portalDist;
        	if(all(lessThan(abs(p.xy-PORTAL_POS.xy),PORTAL_SIZE.xy))) {
                inside = !inside;
            }
        }
    }
    
    fragColor = vec4(ro, inside ? 1. : 0.);
}

#include <../common/main_shadertoy.frag>