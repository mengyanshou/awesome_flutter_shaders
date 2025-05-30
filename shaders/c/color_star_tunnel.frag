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
#define TWIST 2.1
float happy_star(vec2 uv, float anim)
{
    uv = abs(uv);
    vec2 pos = min(uv.xy/uv.yx, anim);
    float p = (2.0 - pos.x - pos.y);
    return (2.0+p*(p*p-1.5)) / (uv.x+uv.y);      
}
 
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
      vec3 r = vec3(uv, 1.0);
    vec4 o = vec4(0.0);
    float t = -iTime;
    vec3 p;

    for (float i = 0.0, z = 0.0, d; i < 100.0; i++) {
        // Ray direction, modulated by time and camera
        p = z * normalize(vec3(uv, 0.5));
       

        // Rotating plane using a cos matrix
        vec4 angle = vec4(0.0, 33.0, 11.0, 0.0);
        vec4 a = z * 2.0 - t * 0.1 + angle;
        p.xy *= mat2(cos(a.x), sin(a.x), sin(a.x), cos(a.x));

        // Distance estimator
        z += d = length(cos(p + cos(p.yzx + p.x  * 0.2)).xy) / 6.0;

        // Color accumulation using sin palette
        o += (sin(p.x - t + vec4(0.0, 2.0, 3.0, 0.0)) + 1.0) / d;
    }

    o = tanh(o / 1000.0);
    //Raymarching loop
    for (float i = 0.0; i < STEPS; i++)
    {
        //Compute raymarch sample point
        vec3 p = z * dir*o.xyz;
     p.z-=iTime;
        //Twist rotation
        float angle = -p.z * TWIST;
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
     uv *= 2.0 * ( cos(-iTime * 2.0) -2.5); // scale
    float anim = sin(iTime * 12.0) * 0.1 + 1.0;  // anim between 0.9 - 1.1 
    fragColor+= vec4(happy_star(uv, anim) * vec3(0.5,0.5,0.5)*0.5, 1.0);
}
#include <../common/main_shadertoy.frag>