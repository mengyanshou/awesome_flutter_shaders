#include <../common/common_header.frag>
#include <Hex Glitch Common.frag>
uniform sampler2D iChannel0;
void mainImage(out vec4 fragColor, in vec2 xy) {
    if(xy.x > iResolution.x / float(kScreenDownsample) || xy.y > iResolution.y / float(kScreenDownsample)) {
        return;
    }

    // if(kApplyBloom)
    // {    
    //     fragColor.xyz = Bloom(xy, iResolution, ivec2(1, 0), iChannel0); 
    //     fragColor.w = 1.;
    // }
}

#include <../common/main_shadertoy.frag>