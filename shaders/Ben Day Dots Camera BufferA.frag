#include <common/common_header.frag>
uniform sampler2D iChannel0;
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    float c = cos(angle);
    float s = sin(angle);
    mat2 rotMat = mat2(c,-s,s,c);
    float mult = (1.42*sqrt(dot(iResolution.xy,iResolution.xy)))/min(iResolution.x,iResolution.y);
    fragCoord -= iResolution.xy*0.5;
    fragCoord *= mult;
    fragCoord = hexMat*fragCoord;
    fragCoord = rotMat*fragCoord;
    fragCoord += iResolution.xy*0.5;
    fragColor = texture(iChannel0,fragCoord/iResolution.xy);
}
#include <common/main_shadertoy.frag>