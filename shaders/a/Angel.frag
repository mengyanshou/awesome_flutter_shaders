// --- Migrate Log ---
// 初始化局部变量（t/z/d/O）以避免未定义行为，并将外层迭代器改为 int；
// 把 for 头中的累加移入循环体（提高可读性与兼容性）。
// 不需要 filter 适配（没有 texture 采样）。
// --- Migrate Log (EN) ---
// Initialize local variables (t/z/d/O) to avoid undefined behavior, use an int for the outer iterator,
// and move accumulation from the for-head into the loop body for better compatibility. No filter change needed.

#include <../common/common_header.frag>

/*
    "Angel" by @XorDev
    
    An experiment based on my "3D Fire":
    https://www.shadertoy.com/view/3XXSWS
*/
void mainImage(out vec4 O, vec2 I)
{
    //Time for animation
    float t = iTime;
    // Raymarch iterator count (use int for stable looping)
    int iterCount = 100;
    //Raymarch depth
    float z = 0.0;
    //Raymarch step size
    float d = 0.0;
    //Initialize output accumulator
    O = vec4(0.0);
    //Raymarch loop (100 iterations)
    for (int i = 0; i < iterCount; i++) {
        //Raymarch sample position
        vec3 p = z * normalize(vec3(I + I, 0.0) - iResolution.xyy);
        //Shift camera back
        p.z += 6.0;
        //Twist shape
        p.xz *= mat2(cos(p.y * 0.5 + vec4(0.0, 33.0, 11.0, 0.0)));
        //Distortion (turbulence) loop
        for (float dd = 1.0; dd < 9.0; dd /= 0.8) {
            //Add distortion waves
            p += cos((p.yzx - t * vec3(3.0, 1.0, 0.0)) * dd) / dd;
        }
        //Compute distorted distance field of cylinder
        d = (.1 + abs(length(p.xz) - 0.5)) / 20.0;
        z += d;
        //Sample coloring and glow attenuation (accumulate inside loop)
        O += (sin(z + vec4(2.0, 3.0, 4.0, 0.0)) + 1.1) / d;
    }

    //Tanh tonemapping
    //https://www.shadertoy.com/view/ms3BD7
    O = tanh(O / 4e3);
}

#include <../common/main_shadertoy.frag> 