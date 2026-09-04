// --- Migrate Log ---
// 添加 common_header 引入并补充缺失的采样器与分辨率数组声明；替换 texelFetch 为兼容的 texture() 采样；初始化输出 alpha（1.0）并在文件末尾添加入口 include
// 将 ivec2 整数取模改为 float mod，并通过 SG_TEX3 使用公共通道分辨率，以兼容 SkSL
//
// Added common_header include and missing sampler + iChannelResolution declarations; replaced texelFetch with compatible texture() sampling; set output alpha to 1.0 and appended main include
// Replaced ivec2 integer remainder with float mod and use the shared channel resolution through SG_TEX3 for SkSL compatibility

#include <../common/common_header.frag>
uniform sampler2D iChannel3;

/*
    -------------------------------------------------------------
    |          💫 Undular Substratum 💫  by chronos            |
    -------------------------------------------------------------
    
    A doodle with a log spiral thingie, some volumetric SDF marching,
    some glow and a dash of colors ^_^ 

    See also:
    previous shader: "Magical Orb" https://www.shadertoy.com/view/33jSWh
    
    Similar aesthetics: Heimdal Rir Over Bivrost 🌌🌈🐎
    https://www.shadertoy.com/view/lXKBzV
    
    -------------------------------------------------------------
    self link:       https://www.shadertoy.com/view/3ccGRr
    -------------------------------------------------------------
*/


const float PI = 3.14159265;

float getT() { return iTime/8.; }

float getScale() { return exp2(fract(getT()))-1.; }

float sdf(vec3 p)
{
    float x = length(p) * (cos(2. * PI * getT())*.5+.5);
    return p.y + cos(-iTime + 10.*x)*1.*exp(-x*x);
}

vec3 cmap(vec3 p)
{
    p += p*getScale();
    float T = getT();
    float angle = atan(p.z, p.x)/(2.*PI);
    return
            cos(
                (   2.*(angle+.5) + 
                    floor( log2(length(p.xz)) - 2.*(angle+.5))
                    +floor(T)
                +vec3(1,2,3)+iTime*.1) 
            )*.5+.5;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (2. * fragCoord - iResolution.xy)/iResolution.y;

    vec3 color = vec3(0);
    float focal = 2.;
    vec3 ro = vec3(0,2.2,4.5);
    
    vec3 rd = normalize(vec3(uv, -focal));
    
    float angle = radians(23.5); 
    float c = cos(angle), s = sin(angle);
    rd.yz *= mat2(c,s,-s,c);
    
    ivec2 _idx = ivec2(mod(vec2(int(iFrame * 331.0)) + floor(fragCoord), vec2(1024.0)));
    vec2 _texUV = (vec2(_idx) + 0.5) / iChannelResolution3;
    float t = 0.1 * SG_TEX3(iChannel3, _texUV).a;
    float op = 1.;
    for(int i = 0; i < 99; i++)
    {
        vec3 p = rd * t + ro;
        float d = abs(sdf(p));
        t += d/10.;
        color += exp(-.05*t) * op * .01/(d+1e-3) * cmap(p);
        op *= mix(1., 1.-exp(-90.*d*d), .2);
    }
    
    color = 1.-exp(-pow(color, vec3(1.35)));
    color *= 1.-dot(uv, uv)*.1;
    color = pow(color, vec3(1./2.2));
    color += (2.0 / 255.0) * texture(iChannel3, _texUV).rgb; // replaced texelFetch with texture()
    color = clamp(color, 0., 1.);
    fragColor = vec4(color, 1.0);
}

#include <../common/main_shadertoy.frag>
