#include <common/common_header.frag>
uniform sampler2D iChannel0;
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    float c = cos(angle);
    float s = sin(angle);
    mat2 rotMat = mat2(c,s,-s,c);
    float mult = min(iResolution.x,iResolution.y)/(1.42*sqrt(dot(iResolution.xy,iResolution.xy)));
    vec2 tmpCoord = fragCoord - iResolution.xy*0.5;
    tmpCoord *= mult;
    tmpCoord = rotMat*tmpCoord;
    tmpCoord = invHexMat*tmpCoord;
    tmpCoord += iResolution.xy*0.5;
    tmpCoord = vec2((ivec2(tmpCoord)>>dotSize)<<dotSize);
    mult = 1./mult;
    rotMat = mat2(c,-s,s,c);
    float maxRad = 0.7 * mult * float(1<<dotSize);
    
    fragColor = vec4(1);
    for(int i = 0; i < 7; i++){
        vec2 pix = tmpCoord + offsets[i]*float(1<<dotSize);
        vec3 color = 1. - texelFetch(iChannel0,ivec2(pix)>>dotSize,dotSize).rgb;
        color = sqrt(color);
        color *= maxRad;
        //color *= color;
        vec2 center = pix + 0.5*float(1<<dotSize);
        center -= iResolution.xy*0.5;
        center *= mult;
        center = hexMat*center;
        center = rotMat*center;
        center += iResolution.xy*0.5;
        vec2 diff = fragCoord - center;
        fragColor.r *= clamp(sqrt(dot(diff,diff))-color.r+1.,0.,1.);
        fragColor.g *= clamp(sqrt(dot(diff,diff))-color.g+1.,0.,1.);
        fragColor.b *= clamp(sqrt(dot(diff,diff))-color.b+1.,0.,1.);
    }
}
#include <common/main_shadertoy.frag>