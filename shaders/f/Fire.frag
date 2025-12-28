#include <../common/common_header.frag>

/*
    "3D Fire" by @XorDev
    
    I really wanted to see if my turbulence effect worked in 3D.
    I wrote a few 2D variants, but this is my new favorite.
    Read about the technique here:
    https://mini.gmshaders.com/p/turbulence


    See my other 2D examples here:
    https://www.shadertoy.com/view/wffXDr
    https://www.shadertoy.com/view/WXX3RH
    https://www.shadertoy.com/view/tf2SWc
    
    Thanks!
*/
void mainImage(out vec4 O, vec2 I)
{
    //Time for animation
    float t = iTime;
    //Raymarched depth
    float z = 0.0;
    //Raymarch step size and "Turbulence" frequency
    //https://www.shadertoy.com/view/WclSWn
    float d = 0.0;

    O = vec4(0.0);
    //Raymarching loop with 50 iterations
    for (int step = 0; step < 50; step++)
    {
        //Compute raymarch sample point (Android: uv-based camera for stability)
        vec2 uv = (I - 0.5 * iResolution.xy) / iResolution.y;
        vec3 rd = normalize(vec3(2.0 * uv, -1.0));
        vec3 p = z * rd;
        //Shift back and animate
        p.z += 5. + cos(t);
        //Twist and rotate
        p.xz *= mat2(cos(p.y * .5 + vec4(0, 33, 11, 0))) 
        //Expand upward
        / max(p.y * .1 + 1., .1);
        //Turbulence loop (increase frequency)
        for (d = 2.; d < 15.; d /= .6)
            //Add a turbulence wave
            p += cos((p.yzx - vec3(t/.1, t, d) ) * d ) / d;
        //Sample approximate distance to hollow cone
        z += d = .01 + abs(length(p.xz) + p.y * .3 - .5) / 7.;
        //Add color and glow attenuation
        O += (sin(z / 3. + vec4(7, 2, 3, 0)) + 1.1) / d;
    }
    //Tanh tonemapping
    //https://www.shadertoy.com/view/ms3BD7
    O = tanh(O / 1e3);
}

#include <../common/main_shadertoy.frag>