// Fork of "Pilot Wave Particles" by wyatt. https://shadertoy.com/view/MfKSRy
// 2024-05-11 11:45:06
#include <common/common_header.frag>
uniform sampler2D iChannel0;
#include <Branches Common.frag>

Main 
        
     Q = vec4(1);
     Q -= 10.*A(U).w*vec4(.5,.8,1,1);
     
}
#include <common/main_shadertoy.frag>
