#include <common/common_header.frag>
#include <Liquid Toy Common.frag>
// Liquid toy by Leon Denise 2022-05-18
// Playing with shading with a fake fluid heightmap

uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
const float speed = .01;
const float scale = .1;
const float falloff = 3.;
const float fade = .4;
const float strength = 1.;
const float range = 5.;

// fractal brownian motion (layers of multi scale noise)
vec3 fbm(vec3 p)
{
    vec3 result = vec3(0);
    float amplitude = 0.5;
    for (float index = 0.; index < 3.; ++index)
    {
        result += texture(iChannel0, p/amplitude).xyz * amplitude;
        amplitude /= falloff;
    }
    return result;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{

    // coordinates
    vec2 uv = (fragCoord.xy - iResolution.xy / 2.)/iResolution.y;
    vec2 aspect = vec2(iResolution.x/iResolution.y, 1);
    
    // noise
    vec3 spice = fbm(vec3(uv*scale,iTime*speed));
    
    // draw circle at mouse or in motion
    float t = iTime*2.;
    vec2 mouse = (iMouse.xy - iResolution.xy / 2.)/iResolution.y;
    if (iMouse.z > .5) uv -= mouse;
    else uv -= vec2(cos(t),sin(t))*.3;
    float paint = trace(length(uv),.1);
    
    // expansion
    vec2 offset = vec2(0);
    uv = fragCoord.xy / iResolution.xy;
    vec4 data = texture(iChannel1, uv);
    vec3 unit = vec3(range/472./aspect,0);
    vec3 normal = normalize(vec3(
        TEX1(uv - unit.xz)-TEX1(uv + unit.xz),
        TEX1(uv - unit.zy)-TEX1(uv + unit.zy),
        data.x*data.x)+.001);
    offset -= normal.xy;
    
    // turbulence
    spice.x *= 6.28*2.;
    spice.x += iTime;
    offset += vec2(cos(spice.x),sin(spice.x));
    
    uv += strength * offset / aspect / 472.;
    
    // sample buffer
    vec4 frame = texture(iChannel1, uv);
    
    // temporal fading buffer
    paint = max(paint, frame.x - iTimeDelta * fade);
    
    // print result
    fragColor = vec4(clamp(paint, 0., 1.));
}
#include <common/main_shadertoy.frag>