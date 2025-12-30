// --- Migrate Log ---
// 添加公共 include 并声明 `iChannel0`；将所有 `texture(iChannelN, ...)` 替换为 `SG_TEX0/1/2/3` 以保证 wrap/filter 一致性；
// 把基于 float 的 angle 循环改为 int 索引循环以兼容 SkSL。
//
// Add common include and declare `iChannel0`; replace all `texture(iChannelN, ...)` with `SG_TEX0/1/2/3` to preserve wrap/filter behavior;
// Convert float angle loop to int indexed loop for SkSL compatibility.

#include <../common/common_header.frag>
uniform sampler2D iChannel0;

/*

    Fractured Orb
    -------------

    A mashup of 'Crystal Tetrahedron' https://www.shadertoy.com/view/WsBfWt
    and 'Buckyball Fracture' https://www.shadertoy.com/view/WlKyzW

*/


// http://tuxedolabs.blogspot.com/2018/05/bokeh-depth-of-field-in-single-pass.html

vec2 uPixelSize; //The size of a pixel: vec2(1.0/width, 1.0/height)
float uFar = 1.; // Far plane

const float GOLDEN_ANGLE = 2.39996323;
const float MAX_BLUR_SIZE = 10.;
const float RAD_SCALE = 1.; // Smaller = nicer blur, larger = faster

float getBlurSize(float depth, float focusPoint, float focusScale) {
    float coc = clamp((1.0 / focusPoint - 1.0 / depth)*focusScale, -1.0, 1.0);
    return abs(coc) * MAX_BLUR_SIZE;
}

vec3 depthOfField(vec2 texCoord, float focusPoint, float focusScale) {
    vec4 centerTex = SG_TEX0(iChannel0, texCoord);
    float centerDepth = centerTex.a * uFar;
    float centerSize = getBlurSize(centerDepth, focusPoint, focusScale);
    vec3 color = centerTex.rgb;
    
    #ifdef DISABLE_DOF
    	return color;
    #endif

    float tot = 1.0;

    float radius = RAD_SCALE;
    for (int idx = 0; idx < 10000; idx++) {
        float ang = float(idx) * GOLDEN_ANGLE;
        if (radius >= MAX_BLUR_SIZE) break;

        vec2 tc = texCoord + vec2(cos(ang), sin(ang)) * uPixelSize * radius;
        vec4 sampleTex = SG_TEX0(iChannel0, tc);
        vec3 sampleColor = sampleTex.rgb;
        float sampleDepth = sampleTex.a * uFar;
        float sampleSize = getBlurSize(sampleDepth, focusPoint, focusScale);
        //if (sampleSize < centerSize) break;
        if (sampleDepth > centerDepth) {
            sampleSize = clamp(sampleSize, 0.0, centerSize*2.0);
        }
        float m = smoothstep(radius-0.5, radius+0.5, sampleSize);
        color += mix(color/tot, sampleColor, m);
        tot += 1.0;
        radius += RAD_SCALE/radius;
        
        // modification: exit early when we're in focus
       // if (centerDepth < uFar / 3. && m == 0.) break;
    }
    return color /= tot;
}


// http://filmicworlds.com/blog/filmic-tonemapping-operators/
vec3 tonemap2(vec3 texColor) {
    texColor /= 2.;
   	texColor *= 16.;  // Hardcoded Exposure Adjustment
   	vec3 x = max(vec3(0),texColor-0.004);
   	return (x*(6.2*x+.5))/(x*(6.2*x+1.7)+0.06);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord.xy / iResolution.xy;
    uPixelSize = vec2(.002) / (iResolution.xy / iResolution.y);

    //fragColor = vec4(SG_TEX0(iChannel0, uv).rgb, 1); return;

    vec3 col = depthOfField(uv, .65, 1.);

    col = pow(col, vec3(1.25)) * 2.5;
    col = tonemap2(col);

    fragColor = vec4(col, 1);    
}

#include <../common/main_shadertoy.frag>
