// --- Migrate Log ---
// 添加 Flutter 兼容性 include 文件，修复变量初始化和 for 循环结构
// Added Flutter compatibility includes, fixed variable initialization and for loop structure
/*
    "Ghosts" by @XorDev
    
    More fun with Turbulence in 3D. Also see
    
    3D Fire:
    https://www.shadertoy.com/view/3XXSWS
    Ether:
    https://www.shadertoy.com/view/t3XXWj
    Angel:
    https://www.shadertoy.com/view/3XXSDB

    
    Tweet version:
    https://x.com/XorDev/status/1915763936957264357
*/

#include <../common/common_header.frag>

void mainImage(out vec4 O, vec2 I)
{
    //Time for animation
    float t = iTime;
    //Raymarch depth
    float z = 0.0;
    //Raymarch step size and "Turbulence" frequency
    float d = 1.0;
    //Clear frag color
    O = vec4(0.0);
    //Raymarch loop
    for (int i = 0; i < 100; i++)
    {
        //Raymarch sample point
        vec3 p = z * normalize(vec3(I+I,0) - iResolution.xyy);
        //Twist with depth
        p.xy *= mat2(cos((z + t) * .1 + vec4(0, 33, 11, 0)));
        //Scroll forward
        p.z -= 5. * t;
        
        //Turbulence loop
        //https://www.shadertoy.com/view/WclSWn
        d = 1.0;
        for (int j = 0; j < 8; j++)
        {
            p += cos(p.yzx * d + t) / d;
            d /= 0.7;
        }
        
        //Distance to irregular gyroid
        //https://www.shadertoy.com/view/XcBBRz
        d = .02 + abs(2. - dot(cos(p), sin(p.yzx * .6))) / 8.;
        z += d;
        //Add color and glow falloff
        O += vec4(z / 7., 2, 3, 1) / d;
    }
    //Tanh tonemapping
    //https://www.shadertoy.com/view/ms3BD7
    O = tanh(O * O / 1e7);
}

#include <../common/main_shadertoy.frag>