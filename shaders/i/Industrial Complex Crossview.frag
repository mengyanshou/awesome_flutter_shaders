/*

	Industrial Complex
	------------------

	Using standard distance field operations to produce an industrial-looking 
	architectual entity - albeit a pretty abstract one. It'd probably take a while 
	to walk from one end to the other. :)

	The camera swings around a fair bit. I did that intentionally to show more of 
	the scene without distorting the lens and FOV too much.

	Adding detail to a scene is pretty straight forward - in concept anyway. Simply
	integrate more objects. Trying to add detail without frying your GPU is another
	story. Bump mapping the finer details definitely helped, but my slowest computer
	struggled to maintain 45 FPS with this particular scene, which meant a lot of my
	original plans had to be abandoned.

	Most of this was pretty straight forward, but there's always one annoying aspect.
	For me, believe it or not, it was the simple mesh looking floors. With such high
	frequency repetition, Moire effects became a problem. The solution was to abandon
	the distance field approach and fake it with a smooth bump mapped function.

	I try not to put too many conditional compiler options into shader code because
	it can make things confusing to read, but I added in a couple for variety. 
	There's an option to wrap the object around the camera, and an optional "WARM" 
	aesthetic by default.


*/
#include <../common/common_header.frag>

uniform sampler2D iChannel0;
// Maximum ray distance.
#define FAR 50. 

// Wrap the scene itself around the camera path.
//#define OBJECT_CAMERA_WRAP 

// Warm setting. Commenting it out gives it more of a twilight feel, which I prefer, but
// fiery stuff tends to stand out more, so that's the default. :)
#define WARM 

// Comment this out to omit the detailing. Basically, the function-based bump mapping 
// won't be included. The texture-based bump mapping will remain though.
#define SHOW_DETAILS

// 2D rotation. Always handy. Angle vector, courtesy of Fabrice.
mat2 rot(float th) {
    vec2 a = sin(vec2(1.5707963, 0) + th);
    return mat2(a, -a.y, a.x);
}

// Camera path. Arranged to coincide with the frequency of the lattice.
vec3 camPath(float t) {

    //return vec3(4, 0, t); // Straight path.

    // Curvy path. Weaving around the columns.
    float a = sin(t * 3.14159265 / 32. + 1.5707963 * 1.);
    float b = cos(t * 3.14159265 / 32.);

    return vec3(a * 5., b * a, t);
}

float objID; // Structure object ID.
float bObjID; // Bump map detail ID.

// Regular Menger Sponge formula. Very simple, but if you're not sure, look it
// up on Wikipedia, and look up a Void Cube image.
float Menger(vec3 q) {

    objID = 0.;
    bObjID = 0.;

    vec3 p;
	// Scale factor, and distance.
    float s = 16., d = 0., d1;

    // Repeat space.
    p = abs(fract(q / s) * s - s / 2.); // Equivalent to: p = abs(mod(q, s) - s/2.);
    // Repeat Void Cubes. Cubes with a cross taken out.
    d1 = min(max(p.x, p.y), min(max(p.y, p.z), max(p.x, p.z))) - s / 3. + 1.;
    d = max(d, d1);
    s /= 4.; // Divide space (each dimension) by 4.

    p = abs(fract(q / s) * s - s / 2.); // Equivalent to: p = abs(mod(q, s) - s/2.);
    // Repeat Void Cubes. Cubes with a cross taken out.

    d1 = min(max(p.x, p.y), min(max(p.y, p.z), max(p.x, p.z))) - s / 3.;
    d = max(d, d1);
    s /= 3.; // Divide space (each dimension) by 3.

    p = abs(fract(q / s) * s - s / 2.); // Equivalent to: p = abs(mod(q, s) - s/2.);
    // Repeat Void Cubes. Cubes with a cross taken out.
    d1 = min(max(p.x, p.y), min(max(p.y, p.z), max(p.x, p.z))) - s / 3.;
    bObjID = step(d, d1);
    d = max(d, d1);

    return d;
}

// The distance field is a little messier than usual - mainly because it includes more objects, 
// but at it's core, it's just a simple amalgation of repetive objects placed in the scene with 
// repeat space tricks.
//
// In essence, it's a lattice with a floor and railings thrown in, and a bit of space taken out.
// I put it together in a hurry, so could have planned it a bit better. I wanted it to be at least 
// a little readable, so didn't group as much stuff together as I could have. Either way, I'll 
// take a look at it later and tidy things up a bit.
float lattice(vec3 p) {

    // Repeat space.
    vec3 q = abs(mod(p, vec3(32, 16, 32)) - vec3(16, 8, 16));
    vec3 q2 = abs(mod(p - vec3(4, 0, 0), vec3(32, 2, 16)) - vec3(16, 1, 8));

    // Holes. I've called them holes, but they're more like square columns used to negate objects.
    float hole1 = max(q2.x - 7.65, q.z - 8.); // Used to carve a hole beside the railings.
    float hole2 = max(-p.y - .75, q.z - 4.85); // Used to chop the top off of the bridge railings.
    float hole3 = abs(mod(p.z + 16., 32.) - 16.) - 2.85; // Used to form the floor to ceiling partitions.

    // Floor minus hole (repeat square columns) equals bridge. :) 
    float fl = max(p.y + 3.5, -hole1);  

    // The wall panels with rectangular windows.
    float wall = max(q2.x - 8., q2.z - 2.15);
    wall = max(wall, -max(abs(abs(q2.x - 8.) - 4.) - 1.75, abs(q.y - 8.) - .5)); // Wall with window.

    // This is a neat trick to subdivide space up further without the need for another
    // modulo call... in a manner of speaking.
    q2.x = abs(q2.x - 8.);
    float rail = max(q2.x - .15, q2.y - .15);
    float rail2 = max(q2.x - .15 / 6., abs(mod(q2.y + 1. / 6., 1. / 3.) - 1. / 6.) - .15 / 6.);
    rail = min(rail, max(rail2, -p.y - 3.));
    // Optional bottom rail with no gap. Comment out the line above though.
    //rail = min(min(rail, rail2), max(q2.x - .15, abs(p.y + 3.75) - .6));

    // Posts.
    float posts = max(q2.x - .15, abs(mod(q2.z, 2.) - 1.) - .15);

    // Forming the railings. Comment out the 2nd and 3rd lines if you want to see what they're there for.
    rail = min(rail, posts);
    rail = max(rail, -hole2);
    rail = max(rail, -hole3);

    // Subdividing space down again without using the modulo call. For all I know, I've made things
    // slower. :)
    q.xz = abs(q.xz - vec2(8));
    q.x = abs(q.x - 4.);

    // Pylons and round pylons.
    float pylon = min(max(max(q.x, q.y) - 3., -p.y), min(max(q.y, q.z) * .55 + length(q.yz) * .45 - 3.1, max(q.x, q.z)) - 2.);
    float rndPylon = length(vec2(q.xz) * vec2(.7, .4)) - 1.;

    // Breaking space right down to 2x2x2 cubic segments.
    q = abs(mod(q, 2.) - 1.);
    float pylonHole = min(q.x, min(q.y, q.z)); // Used to take cubic chunks out of the pylons.

    //objID = step(pylonHole - .15, pylon);

    // Forming the structure.
    float structure = min(max(pylon, pylonHole) - .15, min(rndPylon, wall)); 

    // Adding the floor and the railings to the structure.
    return min(structure, min(fl, rail));

}

// For all intents and purposes, this is a twisty lattice smoothly bounded by a square 
// tube on the outside. I have a million different shaders based on this concept alone, 
// but I won't bore you with them. Instead, Dila and Aiekick have some pretty good examples 
// on Shadertoy making use of it that are worth looking at.
float map(vec3 p) {

    objID = 0.;

    #ifdef OBJECT_CAMERA_WRAP
    // Wrap the scene around the path. Optional. See the bump mapping function also.    
    p.xy -= camPath(p.z).xy;
    #else   
    p.x += 4.;
    #endif

    float d = lattice(p);

    return d * .95;//*.7;
}

// Raymarching.
float trace(vec3 ro, vec3 rd) {

    float t = 0., d;
    for(int i = 0; i < 80; i++) {

        d = map(ro + rd * t);
        if(abs(d) < .001 * (t * .125 + 1.) || t > FAR)
            break;
        t += d;
    }
    return min(t, FAR);
}

// Tri-Planar blending function. Based on an old Nvidia writeup:
// GPU Gems 3 - Ryan Geiss: http://http.developer.nvidia.com/GPUGems3/gpugems3_ch01.html
vec3 tex3D(sampler2D channel, vec3 p, vec3 n) {

    n = max(abs(n) - .2, 0.001);
    n /= dot(n, vec3(1));
    vec3 tx = texture(channel, p.zy).xyz;
    vec3 ty = texture(channel, p.xz).xyz;
    vec3 tz = texture(channel, p.xy).xyz;

    // Textures are stored in sRGB (I think), so you have to convert them to linear space 
    // (squaring is a rough approximation) prior to working with them... or something like that. :)
    // Once the final color value is gamma corrected, you should see correct looking colors.
    return tx * tx * n.x + ty * ty * n.y + tz * tz * n.z;
}

// Texture bump mapping. Four tri-planar lookups, or 12 texture lookups in total.
vec3 doBumpMap(sampler2D tx, in vec3 p, in vec3 n, float bf) {

    const vec2 e = vec2(0.001, 0);

    // Three gradient vectors rolled into a matrix, constructed with offset greyscale texture values.    
    mat3 m = mat3(tex3D(tx, p - e.xyy, n), tex3D(tx, p - e.yxy, n), tex3D(tx, p - e.yyx, n));

    vec3 g = vec3(0.299, 0.587, 0.114) * m; // Converting to greyscale.
    g = (g - dot(tex3D(tx, p, n), vec3(0.299, 0.587, 0.114))) / e.x;
    g -= n * dot(n, g);

    return normalize(n + g * bf); // Bumped normal. "bf" - bump factor.

}

// Smooth tiles. There are better ways, but it works.
float tiles(vec2 p) {

    p = abs(fract(p * 4.) - .5) * 2.;
    float s = max(p.x, p.y);
    return smoothstep(0., .6, s);//smoothstep(0.1, 1., s*2. - .35);//

    /*
    // Fancier grid pattern, but I decided to implement the "less is more" principle. :)
    vec2 q = abs(fract(p*1.) - .5)*2.;
    float s = max(q.x, q.y);
    s = smoothstep(0.5, .85, s);
    
    q = abs(fract(p*4. + .5) - .5)*2.;
    float s2 = max(q.x, q.y);
    s2 = smoothstep(0., 1., s2);
    
    return max(s, s2);
    */

}

// The bump mapping function.
float bumpFunction(in vec3 p) {

    // If wrapping the scene around the the camera path, the bump has to match.
    #ifdef OBJECT_CAMERA_WRAP
    p.xy -= camPath(p.z).xy;
    #endif

    // A reproduction of the lattice at higher frequency. Obviously, you could put
    // anything here. Noise, Voronoi, other geometrical formulas, etc.
    float c;
    if(p.y > -3.49 || p.y < -3.51)
        c = min(abs(Menger(p * 4.)) * 1.6, 1.);
    else { 

        // Another floor pattern. It didn't really work here.
        //c = 1.-(Menger(p*8. + vec3(0, 0., 0))*1.6) + .7;      
        //c = smoothstep(.1, 1., c);

        // Simple grid setup for the floor.
        c = tiles(p.xz + vec2(0));

        bObjID = 0.;
    }

    return c;

}

// Standard function-based bump mapping function with some edging thrown into the mix.
vec3 doBumpMap(in vec3 p, in vec3 n, float bumpfactor, inout float edge) {

    // Resolution independent sample distance... Basically, I want the lines to be about
    // the same pixel with, regardless of resolution... Coding is annoying sometimes. :)
    vec2 e = vec2(2. / iResolution.y, 0);

    float f = bumpFunction(p); // Hit point function sample.

    float fx = bumpFunction(p - e.xyy); // Nearby sample in the X-direction.
    float fy = bumpFunction(p - e.yxy); // Nearby sample in the Y-direction.
    float fz = bumpFunction(p - e.yyx); // Nearby sample in the Y-direction.

    float fx2 = bumpFunction(p + e.xyy); // Sample in the opposite X-direction.
    float fy2 = bumpFunction(p + e.yxy); // Sample in the opposite Y-direction.
    float fz2 = bumpFunction(p + e.yyx);  // Sample in the opposite Z-direction.

    // The gradient vector. Making use of the extra samples to obtain a more locally
    // accurate value. It has a bit of a smoothing effect, which is a bonus.
    vec3 grad = vec3(fx - fx2, fy - fy2, fz - fz2) / (e.x * 2.);  
    //vec3 grad = (vec3(fx, fy, fz ) - f)/e.x;  // Without the extra samples.

    // Using the above samples to obtain an edge value. In essence, you're taking some
    // surrounding samples and determining how much they differ from the hit point
    // sample. It's really no different in concept to 2D edging.
    edge = abs(fx + fy + fz + fx2 + fy2 + fz2 - 6. * f);
    edge = smoothstep(0., 1., edge / e.x);

    // Some kind of gradient correction. I'm getting so old that I've forgotten why you
    // do this. It's a simple reason, and a necessary one. I remember that much. :D
    grad -= n * dot(n, grad);

    return normalize(n + grad * bumpfactor); // Bump the normal with the gradient vector.

}

// The normal function with some edge detection rolled into it. Sometimes, it's possible to get away
// with six taps, but we need a bit of epsilon value variance here, so there's an extra six.
vec3 nr(vec3 p, inout float edge, float t) {

    vec2 e = vec2(2. / iResolution.y, 0); // Larger epsilon for greater sample spread, thus thicker edges.

    // Take some distance function measurements from either side of the hit point on all three axes.
    float d1 = map(p + e.xyy), d2 = map(p - e.xyy);
    float d3 = map(p + e.yxy), d4 = map(p - e.yxy);
    float d5 = map(p + e.yyx), d6 = map(p - e.yyx);
    float d = map(p) * 2.;	// The hit point itself - Doubled to cut down on calculations. See below.

    // Edges - Take a geometry measurement from either side of the hit point. Average them, then see how
    // much the value differs from the hit point itself. Do this for X, Y and Z directions. Here, the sum
    // is used for the overall difference, but there are other ways. Note that it's mainly sharp surface 
    // curves that register a discernible difference.
    edge = abs(d1 + d2 - d) + abs(d3 + d4 - d) + abs(d5 + d6 - d);
    //edge = max(max(abs(d1 + d2 - d), abs(d3 + d4 - d)), abs(d5 + d6 - d)); // Etc.

    // Once you have an edge value, it needs to normalized, and smoothed if possible. How you 
    // do that is up to you. This is what I came up with for now, but I might tweak it later.
    edge = smoothstep(0., 1., sqrt(edge / e.x * 2.));

    // Redoing the calculations for the normal with a more precise epsilon value.
    e = vec2(.005 * min(1. + t, 5.), 0);
    d1 = map(p + e.xyy), d2 = map(p - e.xyy);
    d3 = map(p + e.yxy), d4 = map(p - e.yxy);
    d5 = map(p + e.yyx), d6 = map(p - e.yyx); 

    // Return the normal.
    // Standard, normalized gradient mearsurement.
    return normalize(vec3(d1 - d2, d3 - d4, d5 - d6));
}

// I keep a collection of occlusion routines... OK, that sounded really nerdy. :)
// Anyway, I like this one. I'm assuming it's based on IQ's original.
float cao(in vec3 p, in vec3 n) {

    float sca = 1., occ = 0.;
    for(float i = 0.; i < 5.; i++) {

        float hr = .01 + i * .5 / 4.;
        float dd = map(n * hr + p);
        occ += (hr - dd) * sca;
        sca *= 0.7;
    }
    return clamp(1.0 - occ, 0., 1.);
}

// Cheap shadows are hard. In fact, I'd almost say, shadowing particular scenes with limited 
// iterations is impossible... However, I'd be very grateful if someone could prove me wrong. :)
float softShadow(vec3 ro, vec3 lp, float k) {

    // More would be nicer. More is always nicer, but not really affordable... Not on my slow 
    // test machine, anyway.
    const int maxIterationsShad = 20;

    vec3 rd = (lp - ro); // Unnormalized direction ray.

    float shade = 1.0;
    float dist = 0.05;
    float end = max(length(rd), 0.001);
    //float stepDist = end/float(maxIterationsShad);

    rd /= end;

    // Max shadow iterations - More iterations make nicer shadows, but slow things down. Obviously, the lowest 
    // number to give a decent shadow is the best one to choose. 
    for(int i = 0; i < maxIterationsShad; i++) {

        float h = map(ro + rd * dist);
        //shade = min(shade, k*h/dist);
        shade = min(shade, smoothstep(0.0, 1.0, k * h / dist)); // Subtle difference. Thanks to IQ for this tidbit.
        //dist += min( h, stepDist ); // So many options here: dist += clamp( h, 0.0005, 0.2 ), etc.
        dist += clamp(h, 0.01, 0.2);

        // Early exits from accumulative distance function calls tend to be a good thing.
        if(h < 0.001 || dist > end)
            break;
    }

    // I've added 0.5 to the final shade value, which lightens the shadow a bit. It's a preference thing.
    return min(max(shade, 0.) + 0.2, 1.0);
}

// Blackbody color palette. Handy for all kinds of things.
vec3 blackbodyPalette(float t) {

    // t = tLow + (tHigh - tLow)*t;
    t *= 4000.; // Temperature range. Hardcoded from 0K to 4000K, in this case.    

    // Planckian locus or black body locus approximated in CIE color space.
    float cx = (0.860117757 + 1.54118254e-4 * t + 1.28641212e-7 * t * t) / (1.0 + 8.42420235e-4 * t + 7.08145163e-7 * t * t);
    float cy = (0.317398726 + 4.22806245e-5 * t + 4.20481691e-8 * t * t) / (1.0 - 2.89741816e-5 * t + 1.61456053e-7 * t * t);

    // Converting the chromacity coordinates to XYZ tristimulus color space.
    float d = (2. * cx - 8. * cy + 4.);
    vec3 XYZ = vec3(3. * cx / d, 2. * cy / d, 1. - (3. * cx + 2. * cy) / d);

    // Converting XYZ color space to RGB: http://www.cs.rit.edu/~ncs/color/t_spectr.html
    vec3 RGB = mat3(3.240479, -0.969256, 0.055648, -1.537150, 1.875992, -0.204043, -0.498535, 0.041556, 1.057311) * vec3(1. / XYZ.y * XYZ.x, 1., 1. / XYZ.y * XYZ.z);

    // Apply Stefan–Boltzmann's law to the RGB color
    return max(RGB, 0.) * pow(t * 0.0004, 4.);
}

// Pseudo environment mapping. Simlilar to above, but using tri-planar texturing for a more 
// even spread.
vec3 envMap(vec3 rd, vec3 n) {

    vec3 col = tex3D(iChannel0, rd, n);
    col = smoothstep(.15, .5, col);
    #ifdef WARM
    col *= vec3(1.35, 1, .65);
    #endif
    //col = col*.5 + vec3(1)*pow(min(vec3(1.5, 1, 1)*dot(col, vec3(.299, .587, .114)), 1.), 
            //vec3(1, 3, 10))*.5; // Contrast, coloring. 

    return col;

}

// Compact, self-contained version of IQ's 3D value noise function.
float n3D(vec3 p) {

    const vec3 s = vec3(7, 157, 113);
    vec3 ip = floor(p);
    p -= ip;
    vec4 h = vec4(0., s.yz, s.y + s.z) + dot(ip, s);
    p = p * p * (3. - 2. * p); //p *= p*p*(p*(p * 6. - 15.) + 10.);
    h = mix(fract(sin(h) * 43758.5453), fract(sin(h + s.x) * 43758.5453), p.x);
    h.xy = mix(h.xz, h.yw, p.y);
    return mix(h.x, h.y, p.z); // Range: [0, 1].
}

// Layered noise.
float fBm(vec3 p) {
    return n3D(p) * .57 + n3D(p * 2.) * .28 + n3D(p * 4.) * .15;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    float shift = 0.0;
    if(fragCoord.x >= iResolution.x / 2.0) {
        fragCoord.x -= iResolution.x / 2.0;
        shift = 0.5;
    }

    // Screen coordinates.
    vec2 u = (fragCoord - vec2(iResolution.x / 2.0, iResolution.y) * 0.5) / iResolution.y;

	// Camera Setup.
    float speed = 3.;
    vec3 ro = camPath(iTime * speed); // Camera position, doubling as the ray origin.
    vec3 lk = camPath(iTime * speed + .5);  // "Look At" position.

    vec3 lp = camPath(iTime * speed + 5.5); // Light position, somewhere near the moving camera.
    // Moving the light in the opposite X-direction to the camera path. No science is involved. I
    // just preferred the lighting a better from this perpective.
    lp.x = -lp.x;
    // Moving the light along the Z-axis only, if your prefer.
	//vec3 lp = vec3(0, 0, iTime*speed) + vec3(4, .5, 3.5);   

    #ifdef OBJECT_CAMERA_WRAP
    lp.x += 8.;
    #endif

    // Using the above to produce the unit ray-direction vector.
    float FOV = 3.14159 / 3.; ///3. FOV - Field of view.
    vec3 fwd = normalize(lk - ro);
    vec3 rgt = normalize(vec3(fwd.z, 0., -fwd.x));
    vec3 up = cross(fwd, rgt);

    // Unit direction ray.
    //vec3 rd = normalize(fwd + FOV*(u.x*rgt + u.y*up));

    vec3 rd = fwd + FOV * (u.x * rgt + u.y * up);
    ro += cross(rd, up) * shift;

    // Mild lens distortion to fit more of the scene in, and to mix things up a little.
    rd = normalize(vec3(rd.xy, (rd.z - length(rd.xy) * .3) * .7));

    // Swiveling the camera from left to right when turning corners.
    float swivel = camPath(lk.z).x;
    rd.xy = rot(swivel / 24.) * rd.xy;
    rd.xz = rot(swivel / 8.) * rd.xz;

    // Raymarch.
    float t = trace(ro, rd);
    float svObjID = objID;

    // Surface hit point.
    vec3 sp = ro + rd * t;

    // Normal with edge component.
    float edge;
    vec3 sn = nr(sp, edge, t);

    // Shadows and ambient self shadowing.
    float sh = softShadow(sp, lp, 16.); // Soft shadows.
    float ao = cao(sp, sn); // Ambient occlusion.

    // Light direction vector setup and light to surface distance.
    vec3 ld = lp - sp;
    float lDist = max(length(ld), .0001);
    ld /= lDist;

    // Attenuation.
    float atten = 1. / (1. + lDist * .125 + lDist * lDist * .025);

    // Heavy function-based bump mapping with bumped edges.
    float edge2 = 0.;
    #ifdef SHOW_DETAILS
    sn = doBumpMap(sp, sn, .15 / (1. + t / FAR), edge2);
    #endif

    // Warping the texture cordinates by the camera path just slightly to break up the
    // texture repetion a bit, especially on the floor.
    vec3 tsp = sp;
    tsp.xy += camPath(tsp.z).xy * .35;

    // Texture-based bump mapping.
    const float tSize = 1. / 5.;
    sn = doBumpMap(iChannel0, tsp * tSize, sn, .01 / (1. + t / FAR));

    // Diffuse, specular and Fresnel.
    float dif = max(dot(ld, sn), 0.);
    float spe = pow(max(dot(reflect(rd, sn), ld), 0.), 8.);
    float fre = pow(clamp(dot(rd, sn) + 1., 0., 1.), 4.);
    dif = pow(dif, 4.) * 0.66 + pow(dif, 8.) * 0.34; // Ramping up the diffuse to make it shinier.

    // Texturing the object -- Adding some rotation to break up the repetitiveness a bit.
    vec3 tspR = tsp;
    tspR.xz = rot(3.14159 / 2.5) * tspR.xz / 1.5;
    vec3 tx = tex3D(iChannel0, tspR * tSize, sn);
    tx = smoothstep(0.0, .5, tx) * 1.5; // Giving it a bit more brightness and contrast.
    #ifdef WARM
    tx *= vec3(1.35, 1, .65);
    #endif

    #ifdef SHOW_DETAILS
    if(bObjID > .5 && bObjID < 1.5)
        tx *= vec3(1.3, .65, .35);//vec3(1.5, .85, .25);
    #endif

    // Lazy way to identify the mesh floor area. It saves an object identification in the
    // distance function.
    if(sp.y < -3.49 && sp.y > -3.51) {

        //dif = (sqrt(dif));
        #ifdef SHOW_DETAILS
        tx *= tiles(sp.xz);
        #endif
        tx *= vec3(1.3, 1, .7);
    }

    // Applying the normal-based and bump mapped edges.
    tx *= (1. - edge * .7) * (1. - edge2 * .7);

    // Combining the terms above to produce the final color.
    vec3 fc = tx * (dif * 1.5 + .2);
    #ifdef WARM
    fc += tx * vec3(1, .7, .4) * fre * 4. + vec3(1.35, 1, .65) * vec3(1, .7, .3) * spe * 3.;
    #else
    fc += tx * vec3(.5, .7, 1) * fre * 4. + vec3(1, .7, .3) * spe * 3.;
    #endif

    // Adding in some reflective looking color. It's completely fake, but subtle enough so
    // that you don't notice.
    vec3 env = envMap(tsp * tSize + reflect(rd, sn), sn);//svSn*.75 + sn*.25
    fc += env * .5;

    // Shading.
    fc *= atten * sh * ao;

    // Extra processing. A little too heavy going for my liking.
    //fc = fc*.5 + vec3(1)*pow(max(fc, 0.), vec3(1, 1.5, 2.5))*.5; // Contrast, coloring.

    // Mixing in some fiery background haze, otherwise known as a lazy, two dollar, noise effect. :)
    #ifdef WARM
    float noise = (fBm(sp - iTime * 2.) * .08 + .94) * (rd.y * .25 + .75);
    vec3 bg = blackbodyPalette(noise);
    #else
    float noise = (fBm(sp - iTime * 2.) * .15 + .9) * (rd.y * .5 + .5);
    vec3 bg = mix(vec3(.3, .4, .7), vec3(.7, .9, 1), noise);
    #endif
    fc = mix(bg, fc, 1. - smoothstep(0., 1., t * t / FAR / FAR)); //1./(1. + t*t*.003)

    // Approximate gamma correction.
    fragColor = vec4(sqrt(clamp(fc, 0., 1.)), 1.0);
}
#include <../common/main_shadertoy.frag>
