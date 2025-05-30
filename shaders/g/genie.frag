#include <../common/common_header.frag>
uniform sampler2D iChannel0;
#define VTIME 0.3
#define RANGE_TOP 0.2
#define RANGE_BOTTOM 0.1

float xPoint(float x0, float x1, float y) {
    float a = 2. * (x0 - x1);
    float b = 3. * (x1 - x0);
    //float c. = 0.;
    float d = x0;
    // 修改：使用 (1.0 - y) 来反转y方向计算
    return a * pow(1.0 - y, 3.0) + b * pow(1.0 - y, 2.0) + d;
}

vec2 remap(vec2 uv, vec2 inputLow, vec2 inputHigh, vec2 outputLow, vec2 outputHigh){
    vec2 t = (uv - inputLow)/(inputHigh - inputLow);
    vec2 final = mix(outputLow,outputHigh,t);
    return final;
}

float remap2(float uv, float inputLow, float inputHigh, float outputLow, float outputHigh){
    float t = (uv - inputLow)/(inputHigh - inputLow);
    float final = mix(outputLow,outputHigh,t);
    return final;
}
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;
    float t = abs(sin(iTime));
    //fragColor = texture(iChannel0, uv);
    
    //h animation (水平方向的变形动画)
    if (t < VTIME) {
        float hAnimP = (t) / VTIME;
        float top = mix(1.0, RANGE_TOP, hAnimP);
        float bottom = mix(0.0, RANGE_BOTTOM, hAnimP);
        float xTop = xPoint(top, 1., uv.y);
        float xBottom = xPoint(bottom, 0., uv.y);
        float newUvX = remap2(uv.x, xBottom, xTop, 0.0, 1.0);
        if (newUvX > 1. || newUvX < 0.) {
            fragColor = vec4(0.);
        } else {
            fragColor = texture(iChannel0, vec2(newUvX, uv.y));
        }
    } else {
        //v animation (垂直方向的移动动画)
        float xTop = xPoint(RANGE_TOP, 1., uv.y);
        float xBottom = xPoint(RANGE_BOTTOM, 0., uv.y);
        float newUvX = remap2(uv.x, xBottom, xTop, 0.0, 1.0);
        float vAnimP = (t - VTIME) / (1. - VTIME);
        // 修改：从上往下移动，改变混合方向
        float yStart = mix(0., -1., vAnimP);
        float newUvY = uv.y + yStart;
        if (newUvX > 1. || newUvX < 0. || newUvY > 1. || newUvY < 0.) {
            fragColor = vec4(0.);
        } else {
            fragColor = texture(iChannel0, vec2(newUvX, newUvY));
        }
    }
}
#include <../common/main_shadertoy.frag>