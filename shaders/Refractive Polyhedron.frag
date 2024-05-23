/*

	Refractive Polyhedron
	---------------------
    
    See Buffer A.    

*/
#include <common/common_header.frag>

uniform sampler2D iChannel0;
// IQ's vec2 to float hash.
float hash21(vec2 p) {
    return fract(sin(dot(p, vec2(117.619, 57.623))) * 43758.5453);
} 

// Just a very basic depth of field routine -- I find a lot of it is
// common sense. Basically, you store the scene distance from the camera 
// in the fourth channel, then use it to determine how blurry you want
// your image to be at that particular distance.
//
// For instance, in this case, I want pixels that are 2.25 units away from 
// the camera to be in focus (not blurred) and for things to get more 
// blurry as you move away from that point -- aptly named the focal point 
// for non camera people. :)
//
// I based this on old code of mine, but adopted things that I found in 
// IQ and Nesvi7's examples, which you can find here:
//
// Ladybug - IQ
// https://www.shadertoy.com/view/4tByz3
//
// Cube surface II - Nesvi7
// https://www.shadertoy.com/view/Mty3DV
//
vec3 DpthFld(sampler2D iCh, vec2 uv) {

    // Focal point and circle of confusion.
    const float focD = 1.25, coc = 1.65;
    // Linear distance from either side of the focal point.
    float l = abs(texture(iCh, uv).w - focD - coc) - coc;
    // Using it to calculate the DOF.
    float dof = clamp(l / coc, 0., 2.); 

    // Combine samples. Samples with a larger DOF value are taken further 
    // away from the original point, and as such appear blurrier.
    vec3 acc = vec3(0);

    for(int i = 0; i < 25; i++) {
        // Accumulate samples.
        acc += texture(iCh, uv + (vec2(i / 5, i % 5) - 2.) / vec2(800, 450) * dof).xyz;
        //acc.x *= dof/2.;
    }

    // Return the new variably blurred value.
    return acc /= 25.;
    // Visual debug representation of DOF value.
    //return vec3(length(dof)*450./2.5);
}

/*
// Very basic bloom function.
vec4 bloomBlur(sampler2D iCh, vec2 p){
    
    vec4 c = vec4(0);

    const int n = 2;
    for(int j = -n; j<=n; j++){
        for(int i = -n; i<=n; i++){
            c +=  texture(iCh, p + vec2(i, j)/iResolution.xy*2., 1.);
        }
    }
    
    return c/float((n*2 + 1)*(n*2 + 1));
   
}
*/

// This is not a great bokeh function example, but it'll do. It's an amalgamation
// of old blur and DOF functions with a couple of borrowed lines from Dave Hoskins's 
// much nicer Fibonacci based "Bokeh disc" function, which you can find here:
// https://www.shadertoy.com/view/4d2Xzw
//
// This function is only really suitable for this example. If you're interested in 
// bokeh, Dave's function above and some of Shadertoy user, Hornet's, are probably
// the one's you should be looking at. Xor has some cool simple ones on here that I'm
// yet to dig into, but they might worth a look also.
vec3 bokeh(sampler2D iCh, vec2 uv, float radius) {

    vec3 tot = vec3(0), sum = vec3(0);

     // Focal point and circle of confusion.
    const float focD = 1.25, coc = 1.;
    // Linear distance from either side of the focal point.
    float l = abs(texture(iCh, uv).w - focD - coc) - coc;
    // Using it to calculate the DOF.
    float r = (dot(uv - .5, uv - .5)) * 8. + .125;//(clamp(l/coc, 0., 2.))*8.;//;

    const int n = 4;
    for(int j = -n; j <= n; j++) {
        for(int i = -n; i <= n; i++) {

            //r = mix(dof*dof*2. + .5, 0., step(0., shape(vec2(i, j)) - float(n)));

            // If we're not inside the circle, continue.
            //if(length(vec2(i, j))>float(n)) continue; 

            //vec2 offs = vec2(hash21(vec2(i, j)), hash21(vec2(i, j) + .1)) + .5;
            // Random offset contained within a disk or radius n.
            vec2 rnd2 = vec2(hash21(vec2(i, j)), hash21(vec2(i, j) + .1) * 6.2831);
            vec2 offs = float(n) * rnd2.x * vec2(cos(rnd2.y), sin(rnd2.y));

            //vec2 rnd = texture(iChannel1, uv + vec2(i, j)/iResolution.xy).xy - .5; 
            //vec3 c = texture(iCh, uv + (vec2(i, j))/vec2(800, 450)*r, r*.7).xyz; 
            vec3 c = texture(iCh, uv + offs / vec2(800, 450) * r, r * iResolution.y / 450. * .7).xyz;
            vec3 bokeh = pow(c, vec3(6));
            tot += c * sqrt(c) * bokeh * 2.;
            sum += bokeh;
        }
    }

    return tot / sum;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {

    // Coordinates.
    vec2 uv = fragCoord / iResolution.xy;

    // Just the unprocessed texture on it's own.
    vec3 col = texture(iChannel0, uv).xyz;

    // Cheap 25 tap depth of field function.
    //vec3 col = DpthFld(iChannel0, uv);

    // Worst bokeh algorithm ever -- Definitely needs work. :)
    vec3 bokCol = bokeh(iChannel0, uv, 1.).xyz;
    col = mix(col, bokCol, .75);

    // Bloom. Too much here.
    //vec3 bloom = bloomBlur(iChannel0, uv).xyz;
    //vec3 bloomLight = vec3(1, .9, .7);
    //col += pow(bloom, 2./bloomLight)*2.;

    fragColor = vec4(pow(max(col, 0.), vec3(1. / 2.2)), 1);
}
#include <common/main_shadertoy.frag>
