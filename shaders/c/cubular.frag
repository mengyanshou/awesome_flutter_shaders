// --- Migrate Log ---
// 添加 Flutter 兼容性 include 文件
// Added Flutter compatibility includes
#include <../common/common_header.frag>

#define L length(F)
void mainImage(out vec4 O, vec2 F)
{
    F -=.5*iResolution.xy;
    //vec2 s = sin(.4*iTime+L*.001+vec2(0,1));
    float t =.4*iTime+L*.001;
    F*=mat2(cos(t), sin(t), -sin(t), cos(t))*.01;
    //F = vec2(F.x*s.y-F.y*s.x,dot(F,s))*.01;
    O = vec4(.5,0,.9,0)+fract(L+(L*.03*cos(6.*atan(F.y,F.x)))-iTime*.4)*.1;
}

#include <../common/main_shadertoy.frag>