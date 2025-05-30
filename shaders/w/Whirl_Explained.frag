#include <../common/common_header.frag>
/*
    "Whirl" by @XorDev

    The deconstructed version of my Whirl shader:
    x.com/XorDev/status/1913305183179727250
*/
//Color wave frequency
#define COL_FREQ 1.0
//Red, green and blue have wave frequencies
#define RGB_SHIFT vec3(0, 1, 2)
//Opaqueness (lower = more density)
#define OPACITY 0.1

//Camera perspective (ratio from tan(fov_y/2) )
#define PERSPECTIVE 1.0
//Raymarch steps (higher = slower)
#define STEPS 100.0

//Z scroll speed
#define Z_SPEED 1.0
//Twist rate (radians per z unit)
#define TWIST 0.1

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    //Centered, ratio-corrected screen uvs [-1, 1]
    vec2 res = iResolution.xy;
    vec2 uv = (2.0 * fragCoord - res) / res.y;
    //Ray direction for raymarching
    vec3 dir = normalize(vec3(uv, -PERSPECTIVE));
    
    //Output color
    vec3 col = vec3(0.0);
    
    //Raymarch depth
    float z = 0.0;
    //Distance field step size
    float d = 0.0;
    
    //Raymarching loop
    for (float i = 0.0; i < STEPS; i++)
    {
        //Compute raymarch sample point
        vec3 p = z * dir;
        p.z -= Z_SPEED * iTime;
        //Twist rotation
        float angle = p.z * TWIST;
        p.xy *= mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
        //Distorted cubes
        vec3 v = cos(p + sin(p.yzx / 0.3));
        //Add cube SDF with translucency
        z += d = length(max(v, v.zxy * OPACITY)) / 6.0;
        //Set coloring with glow attenuation
        col += (cos(COL_FREQ * p.z + RGB_SHIFT) + 1.0) / d;
    }
    
    //Exponential tonemapping
    //https://www.shadertoy.com/view/ddVfzd
    col = 1.0 - exp(-col / STEPS / 5e1);
    fragColor = vec4(col, 1.0);
}

#include <../common/main_shadertoy.frag>