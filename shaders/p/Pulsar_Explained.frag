#include <../common/common_header.frag>
// https://www.shadertoy.com/view/wXfXWS

/*
    "Pulsar" by @XorDev
    
    Pulsar explained
    https://x.com/XorDev/status/1914327398058778815
*/
//Color changing speed (radians per second)
#define COL_SPEED 1.0
//Color wave frequency
#define COL_FREQ 3.0
//Red, green and blue have wave frequencies
#define RGB_SHIFT vec3(0, 1, 2)

//Camera position offset
#define Z 0.1
//Camera perspective (ratio from tan(fov_y/2) )
#define PERSPECTIVE 1.0
//Raymarch steps (higher = slower)
#define STEPS 80.0

//Cube shape (higher = sharper edges)
#define CUBE 0.8
//Distortion speed
#define DIS_VEL vec3(1.0)


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
    float l = 0.0;
    
    //Raymarching loop
    for (float i = 0.0; i < STEPS; i++)
    {
        //Compute sample position
        vec3 p = z * dir;
        //Offset camera z
        p.z += Z;
        //Use inverse coordinates
        l = dot(p, p);
        p /= l;
        //Sample cube distance field
        z += d = sqrt(l) / 80.0 * length(cos(p + cos(p / 0.27 + DIS_VEL * iTime)) + CUBE);
        //Apply color waves and glow attenuation
        col += (cos(log(l) * COL_FREQ - COL_SPEED * iTime + RGB_SHIFT) + 1.0) / d;
    }
    
    //Exponential tonemapping
    //https://www.shadertoy.com/view/ddVfzd
    col = 1.0 - exp(-col / STEPS / 25e2);
    fragColor = vec4(col, 1.0);
}

#include <../common/main_shadertoy.frag>