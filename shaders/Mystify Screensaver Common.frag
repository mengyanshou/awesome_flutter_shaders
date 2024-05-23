#include <common/common_header.frag>

#define PI 3.14159265359

float sinNorm(float x)
{
    return sin(x)*0.5+0.5;
}

float line(in int lineWidth, in vec2 pos, in vec2 point, in vec3 iResolution) {
    float normalizedLineRadius = (float(lineWidth) / iResolution.y) / 2.;
    float edgeWidth = 1. / iResolution.y;
    if(normalizedLineRadius<1./iResolution.x)
        return 0.;
	return smoothstep(pos.y-normalizedLineRadius,pos.y-edgeWidth,point.y-normalizedLineRadius+edgeWidth) * 
        (1.-smoothstep(pos.y+normalizedLineRadius-edgeWidth, pos.y+normalizedLineRadius+edgeWidth, point.y));
}

float smoothVal(in float x, in float max) {
	return clamp(smoothstep(0.0,1.0,x/max)*(1.-smoothstep(0.0,1.0,x/max))*4.,0.,1.);
}

//f(x) = amplitude*sinNormalized(frequency*x-offsetX)+d
float normSinFunct(in float amplitude, in float freq, in float offsetX, in float offsetY, in float x) {
    return amplitude*sinNorm(freq*x-offsetX)+offsetY;
}

float rand(float seed) {
    return fract(sin(dot(vec2(seed, seed / PI) ,vec2(12.9898,78.233))) * 43758.5453);   
}

vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

    