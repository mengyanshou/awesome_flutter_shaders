//Move Fluid

#include <common/common_header.frag>
#include <Fire Fire Common.frag>
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
const float flow1 = 0.5;
const float flow2 = 0.75;
const float speed = 0.02;
const float gravity = -0.15;

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    float ratio = iResolution.x / iResolution.y;
    vec2 uv = fragCoord / iResolution.xy;

    vec4 source = texture(iChannel0, uv);
 
    vec2 force = texture(iChannel1, uv).xy;
    force = DecodeForce(force);
    force.y -= gravity;
    
    vec2 s = vec2(speed);
    s.x /= ratio;
    force *= s;
    
    source.z = smoothstep(flow1, flow2, source.z);
    
    vec2 movedForce = texture(iChannel1, uv - force).xy;
    movedForce = mix(movedForce, source.xy, source.z);
    
    fragColor = vec4(movedForce.x, movedForce.y, 0.0, 1.0);
}
#include <common/main_shadertoy.frag>