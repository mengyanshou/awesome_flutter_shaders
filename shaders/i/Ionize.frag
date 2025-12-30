// --- Migrate Log ---
// 本次迁移修改:
// 重写 mainImage 参数为 fragColor 和 fragCoord，初始化局部变量，改为 int 循环，移累加到循环体
// change summary:
// Rewrite mainImage parameters to fragColor and fragCoord, initialize local variables, change to int loop, move accumulation to loop body
// -------------------

#include <../common/common_header.frag>

/*
    "Ionize" by @XorDev
     
     https://x.com/XorDev/status/1921224922166104360
*/
void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    //Time for waves and coloring
    float t = 0.0;
    //Raymarch iterator
    int step = 0;
    //Raymarch depth
    float z = 0.0;
    //Raymarch step distance
    float d = 0.0;
    //Signed distance for coloring
    float s = 0.0;
    
    t = iTime;
    
    //Clear fragcolor and raymarch loop 100 times
    fragColor = vec4(0.0);
    for (; step < 100; step++)
    {
        //Raymarch sample point
        vec3 p = z * normalize(vec3(fragCoord + fragCoord, 0.0) - iResolution.xyy),
        //Vector for undistorted coordinates
        v = vec3(0.0);
        //Shift camera back 9 units
        p.z += 9.0;
        //Save coordinates
        v = p;
        //Apply turbulence waves
        //https://mini.gmshaders.com/p/turbulence
        for (d = 1.0; d < 9.0; d += d)
            p += 0.5 * sin(p.yzx * d + t) / d;
        //Distance to gyroid
        z += d = 0.2 * (0.01 + abs(s = dot(cos(p), sin(p / 0.7).yzx))
        //Spherical boundary
        - min(d = 6.0 - length(v), -d * 0.1));
        //Coloring and glow attenuation
        fragColor += (cos(s / 0.1 + z + t + vec4(2.0, 4.0, 5.0, 0.0)) + 1.2) / d / z;
    }
    //Tanh tonemapping
    //https://www.shadertoy.com/view/ms3BD7
    fragColor = tanh(fragColor / 2000.0);
}

#include <../common/main_shadertoy.frag>