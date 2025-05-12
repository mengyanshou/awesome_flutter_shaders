/*originals https://glslsandbox.com/e#78150.0 https://www.shadertoy.com/view/lslyRn https://www.shadertoy.com/view/MdXSzS and other*/
#include <../common/common_header.frag>

#define iterations 17
#define formuparam 0.53

#define volsteps 20
#define stepsize 0.1

#define zoom   0.800
#define tile   0.850
#define speed  0.000 

#define brightness 0.0015
#define darkmatter 0.300
#define distfading 0.730
#define saturation 0.850

#define time iTime

const float PI = 3.1415925358;

float safety_sin(in float x) {
    return sin(mod(x, PI));
}

float rand(vec2 p) {
    return fract(safety_sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453 + time * .35);
}

float noise(vec2 x) {
    vec2 i = floor(x);
    vec2 f = fract(x);
    vec4 h;
	// Smooth Interpolation
    f = f * f * (f * -2.0 + 3.0);
	// Four corners in 2D of a tile
    h.x = rand(i + vec2(0., 0.));
    h.y = rand(i + vec2(1., 0.));
    h.z = rand(i + vec2(0., 1.));
    h.w = rand(i + vec2(1., 1.));
	// Mix 4 coorners porcentages
    return mix(mix(h.x, h.y, f.x), mix(h.z, h.w, f.x), f.y);
}

float star_burst(vec2 p) {
    float k0 = 2.0;
    float k1 = 1.0;
    float k2 = 0.5;
    float k3 = 12.0;
    float k4 = 12.0;
    float k5 = 2.0;
    float k6 = 5.2;
    float k7 = 4.0;
    float k8 = 6.2;

    float l = length(p);
    float l2 = pow(l * k1, k2);
    float n0 = noise(vec2(atan(p.y, p.x) * k0, l2) * k3);
    float n1 = noise(vec2(atan(-p.y, -p.x) * k0, l2) * k3);
    float n = pow(max(n0, n1), k4) * pow(clamp(1.0 - l * k5, 0.0, 1.0), k6);
    n += pow(clamp(1.0 - (l * k7 - 0.1), 0.0, 1.0), k8);
    return n;
}

uniform vec2 resolution;

#define iterations2 0
#define formuparam2 0.79

#define volsteps2 9
#define stepsize2 0.190

#define zoom2 1.900
#define tile2 .50

#define speed2  0.0
#define cloudSpeed 0.0
#define twinkle 0.00

#define brightness2 0.003
#define darkmatter2 8.700
#define distfading2 0.760
#define saturation2 0.850

#define transverseSpeed 0.0 //zoom*2.0
#define cloud 0.09 

float triangle(float x, float a) {
    float output2 = 2.0 * abs(2.0 * ((x / a) - floor((x / a) + 0.5))) - 1.0;
    return output2;
}

float field(in vec3 p) {
    float cloudTime = time * cloudSpeed;
    float strength = 7. + .03 * log(1.e-6 + fract(sin(cloudTime) * 4373.11));
    float accum = 0.;
    float prev = 0.;
    float tw = 0.;

    for(int i = 0; i < 9; ++i) {
        float mag = dot(p, p);
        p = abs(p) / mag + vec3(-.5, -.8 + 0.1 * sin(cloudTime * 0.7 + 2.0), -1.1 + 0.3 * cos(cloudTime * 0.3));
        float w = exp(-float(i) / 7.);
        accum += w * exp(-strength * pow(abs(mag - prev), 2.3));
        tw += w;
        prev = mag;
    }
    return max(0., 5. * accum / tw - .7);
}

void mainVR(out vec4 fragColor, in vec2 fragCoord, in vec3 ro, in vec3 rd) {
	//get coords and direction
    vec3 dir = rd;
    vec3 from = ro;

	//volumetric rendering
    float s = 0.1, fade = 1.;
    vec3 v = vec3(0.);
    for(int r = 0; r < volsteps; r++) {
        vec3 p = from + s * dir * .5;
        p = abs(vec3(tile) - mod(p, vec3(tile * 2.))); // tiling fold
        float pa, a = pa = 0.;
        for(int i = 0; i < iterations; i++) {
            p = abs(p) / dot(p, p) - formuparam;
            p.xy *= mat2(cos(iTime * 0.05), sin(iTime * 0.05), -sin(iTime * 0.05), cos(iTime * 0.05));// the magic formula// the magic formula
            a += abs(length(p) - pa); // absolute sum of average change
            pa = length(p);
        }
        float dm = max(0., darkmatter - a * a * .001); //dark matter
        a *= a * a; // add contrast
        if(r > 6)
            fade *= 1.2 - dm; // dark matter, don't render near
		//v+=vec3(dm,dm*.5,0.);
        v += fade;
        v += vec3(s, s * s, s * s * s * s) * a * brightness * fade; // coloring based on distance
        fade *= distfading; // distance fading
        s += stepsize;
    }
    v = mix(vec3(length(v)), v, saturation); //color adjust
    fragColor = vec4(v * .01, 1.);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
	//get coords and direction
    vec2 uv = fragCoord.xy / iResolution.xy - .5;

    uv.y *= iResolution.y / iResolution.x;
    vec3 dir = vec3(uv * zoom, 1.);
    float time = iTime * speed + .25;
    float t = iTime * .1 + ((.25 + .05 * sin(iTime * .1)) / (length(dir.xy) + .57)) * 5.5;
    float si = sin(t);
    float co = cos(t);
    mat2 ma = mat2(co, si, -si, co);
    dir.xy *= ma;
    vec2 p = fragCoord / min(iResolution.x, iResolution.y);

    p -= 0.5;
    p.x -= 0.35;
    p *= 0.5;

    float r = star_burst(p * 1.1);
    float g = star_burst(p);
    float b = star_burst(p * 0.9);

    vec2 uv2 = gl_FragCoord.xy / resolution.xy - 0.5;
    uv2.y *= resolution.y / resolution.x;
    vec2 uvs = uv2;

    float time2 = time;

    float speed3 = -speed2 * cos(time2 * 0.02 + 3.1415926 / 4.0);          
    //speed = 0.0;  
    float formuparam3 = formuparam2;

        //get coords and direction  
    vec2 uv3 = uvs;             
    //mouse rotation
    float a_xz = 0.9;
    float a_yz = -2.6;
    float a_xy = 0.9;// + time*0.04;    

    mat2 rot_xz = mat2(cos(a_xz), sin(a_xz), -sin(a_xz), cos(a_xz));
    mat2 rot_yz = mat2(cos(a_yz), sin(a_yz), -sin(a_yz), cos(a_yz));
    mat2 rot_xy = mat2(cos(a_xy), sin(a_xy), -sin(a_xy), cos(a_xy));

    float v2 = 1.0;
    vec3 dir3 = vec3(uv * zoom, 1.);
    vec3 from = vec3(0.0, 0.0, 0.0);

    from.x += 10.0 * cos(0.004 * time);
    from.y += 10.0 * sin(0.004 * time);
    from.z += 0.003 * time;

    vec3 forward = vec3(0., 0., 1.0 - twinkle);

    dir.xy *= rot_xy;
    dir.xz *= rot_xz;
    dir.yz *= rot_yz;

    forward.xy *= rot_xy;
    forward.xz *= rot_xz;
    forward.yz *= rot_yz;

    from.xy *= rot_xy;
    from.xz *= rot_xz;
    from.yz *= rot_yz;

    //zoom
    float zooom = (time2) * speed;

    from += forward * zooom * 1.0;

    float sampleShift = mod(zooom, stepsize);

    float zoffset = -sampleShift;
    sampleShift /= stepsize; // make from 0 to 1

    //volumetric rendering
    float s = 0.74;
    float s3 = s + stepsize / 2.0;
    vec3 v = vec3(0.);
    float t3 = 0.0;

    vec3 backCol2 = vec3(0.);
    for(int r = 0; r < volsteps; r++) {
        vec3 p2 = from + (s + zoffset) * dir;// + vec3(0.,0.,zoffset);
        vec3 p3 = from + (s3 + zoffset) * dir;// + vec3(0.,0.,zoffset);
        p3.xy *= mat2(cos(iTime * 1.02), sin(iTime * 1.02), -sin(iTime * 1.02), cos(iTime * 1.02));// the magic formula
        p2 = abs(vec3(tile) - mod(p2, vec3(tile * 2.))); // tiling fold
        p3 = abs(vec3(tile) - mod(p3, vec3(tile * 2.))); // tiling fold      
        #ifdef cloud
        t3 = field(p3);
        #endif

        float pa, a = pa = 0.;
        for(int i = 0; i < iterations; i++) {
            p2 = abs(p2) / dot(p2, p2) - formuparam;

            p2.xy *= mat2(cos(iTime * 1.02), sin(iTime * 1.02), -sin(iTime * 1.02), cos(iTime * 1.02));// the magic formula
            //p=abs(p)/max(dot(p,p),0.005)-formuparam; // another interesting way to reduce noise
            float D = abs(length(p2) - pa); // absolute sum of average change
            a += i > 7 ? min(12., D) : D;
            pa = length(p2);
        }

        //float dm=max(0.,darkmatter-a*a*.001); //dark matter
        a *= a * a; // add contrast
        //if (r>3) fade*=1.-dm; // dark matter, don't render near
        // brightens stuff up a bit
        float s1 = s + zoffset;
        // need closed form expression for this, now that we shift samples
        float fade = pow(distfading, max(0., float(r) - sampleShift));      
        //t3 += fade;       
        v += fade;
            //backCol2 -= fade;

        // fade out samples as they approach the camera
        if(r == 0)
            fade *= (1. - (sampleShift));
        // fade in samples as they approach from the distance
        if(r == volsteps - 1)
            fade *= sampleShift;
        v += vec3(s1, s1 * s1, s1 * s1 * s1 * s1) * a * brightness * fade; // coloring based on distance

        backCol2 += mix(.14, 02.1, v2) * vec3(1.8 * t3 * t3 * t3, 1.4 * t3 * t3, t3) * fade;

        s += stepsize;
        s3 += stepsize;
    }//фор

    v = mix(vec3(length(v)), v, saturation); //color adjust 

    vec4 forCol2 = vec4(v * .01, 1.);  
    #ifdef cloud
    backCol2 *= cloud;
    #endif  
    backCol2.b *= 1.28;
    backCol2.r *= 0.05;

    backCol2.b = 0.5 * mix(backCol2.g, backCol2.b, 0.8);
    backCol2.g = 0.0;
//  backCol2.bg = mix(backCol2.gb, backCol2.bg, 0.5*(cos(time*0.01) + 1.0));    

    vec3 col = pow(vec3(r, g, b), vec3(1.0 / 2.2));

    vec3 from3 = vec3(1., .5, 0.5) * col;

    mainVR(fragColor, fragCoord, from, dir);
    fragColor += vec4(col, 1.0);
    fragColor *= forCol2 + vec4(backCol2, 1.0);
}
#include <../common/main_shadertoy.frag>
