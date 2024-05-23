/* 2D SDF functions from https://iquilezles.org/articles/distfunctions2d/ */
#include <common/common_header.frag>

float sdCircle( vec2 p, float r )
{
    return length(p) - r;
}

float sdStar5(in vec2 p, in float r, in float rf)
{
    const vec2 k1 = vec2(0.809016994375, -0.587785252292);
    const vec2 k2 = vec2(-k1.x,k1.y);
    p.x = abs(p.x);
    p -= 2.0*max(dot(k1,p),0.0)*k1;
    p -= 2.0*max(dot(k2,p),0.0)*k2;
    p.x = abs(p.x);
    p.y -= r;
    vec2 ba = rf*vec2(-k1.y,k1.x) - vec2(0,1);
    float h = clamp( dot(p,ba)/dot(ba,ba), 0.0, r );
    return length(p-ba*h) * sign(p.y*ba.x-p.x*ba.y);
}

float sdBox( in vec2 p, in vec2 b )
{
    vec2 d = abs(p)-b;
    return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y;
    
    float starTime = .27 - sin(4.71 + iTime * 5.) * .1;
    vec2 mouse = iMouse.z > 0. ? (iMouse.xy-.5*iResolution.xy)/iResolution.y : vec2(sin(iTime) * starTime, cos(iTime) * starTime);
    
    float logo = sdStar5(uv, .34, .38);
    
    float visibleLogo = smoothstep(1.5/iResolution.y, 0., logo);
    float blurredLogo = smoothstep(60./iResolution.y, 0., logo);
    float blurredCursor = smoothstep(80./iResolution.y, 0., sdCircle(uv - mouse, .06));

    float gooey = smoothstep(15./iResolution.y, 0., 1. - blurredCursor + blurredLogo - .4);
    vec3 col = vec3(gooey + visibleLogo);
    
    // Debug 
    // col = vec3(blurredCursor - blurredLogo, blurredLogo, visibleLogo);
    
    fragColor = vec4(col,1.0);
}
#include <common/main_shadertoy.frag>
