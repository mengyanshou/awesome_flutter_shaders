/*

	Refractive Polyhedron
	---------------------

    Creating an antialiased, glass and metal, refractive polyhedron in realtime. 
    Rendering a two way mirrored polyhedron is a fairly common graphics exercise, 
    and there are a few examples on Shadertoy already. I put a version of this 
    together directly after looking at Quinchilion's really nice "Interstellar 
    Icosahedron" shader. I think it may have been the first one posted on here 
    and is still one of my favorites -- There's a link below for anyone who 
    hasn't seen it.
    
    I started with an icosahedron, but changed it to a dodecahedron after looking 
    at Xjorma's recent "Infinite Dodecahedron" example. I dropped some more 
    intricate truncated polyhedra into the scene, but I felt the reflections 
    looked too busy, so decided to keep things simple. There's a "define" option
    to render an icosahedron also, for anyone interested.
    
    Anyway, since I had absolutely nothing new to add to the reflective polyhedron
    genre, I thought I'd spend some time prettying it up with some post processing
    algorithms. I was going to add some glowing tubes, but ran out of steam. I
    might try that out in cube form at a later date.    
  

    
    Useful examples:

	// Beautiful example. I love the conciseness of the reflective pattern.
    Interstellar icosahedron - Quinchilion 
	https://www.shadertoy.com/view/tlX3WH
    
    // Multiple light reflections off the inner faces of a polyhedron.
    // Rendered with a Belgian theme. :)
    This Is Not A Reflected Pipe 2 - Dr2 
    https://www.shadertoy.com/view/Nsd3RN
    
    // Multiple reflections on a truncated dodecahedron. I like the
    // approach Xjorma took, but I had to use a different one.
    Infinite Dodecahedron - xjorma
    https://www.shadertoy.com/view/DlfXWS
 
*/
#include <../common/common_header.frag>

uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
uniform sampler2D iChannel3;
// Pentagon or icosahedron.
#define PENTAGON

//#define INSIDE_VIEW

// Ray passes: For this example, this is about the minimum I could
// get away with. However, not all passes are used on each pixel, so
// it's not as bad as it looks.
#define PASSES 6

// Far plane, or max ray distance.
#define FAR 20.

// Minimum surface distance. Used in various calculations.
#define DELTA .001

// Standard 2D rotation formula.
mat2 rot2(in float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
}

// IQ's vec2 to float hash.
float hash21(vec2 p) {
    return fract(sin(dot(p, vec2(23.527, 57.683))) * 43758.5453);
}

// Commutative smooth minimum function. Provided by Tomkh, and taken 
// from Alex Evans's (aka Statix) talk: 
// http://media.lolrus.mediamolecule.com/AlexEvans_SIGGRAPH-2015.pdf
// Credited to Dave Smith @media molecule.
float smin(float a, float b, float k) {

    float f = max(0., 1. - abs(b - a) / k);
    return min(a, b) - k * .25 * f * f;
}

// Commutative smooth maximum function. Provided by Tomkh, and taken 
// from Alex Evans's (aka Statix) talk: 
// http://media.lolrus.mediamolecule.com/AlexEvans_SIGGRAPH-2015.pdf
// Credited to Dave Smith @media molecule.
float smax(float a, float b, float k) {

    float f = max(0., 1. - abs(b - a) / k);
    return max(a, b) + k * .25 * f * f;
}

// Tri-Planar blending function. Based on an old Nvidia tutorial by Ryan Geiss.
vec3 tex3D(sampler2D t, in vec3 p, in vec3 n) {

    n = max(abs(n) - .2, .001); // max(abs(n), 0.001), etc.
    //n /= dot(n, vec3(.8)); 
    n /= length(n);

    // Texure samples. One for each plane.
    vec3 tx = texture(t, p.yz).xyz;
    vec3 ty = texture(t, p.zx).xyz;
    vec3 tz = texture(t, p.xy).xyz;

    // Multiply each texture plane by its normal dominance factor.... or however you wish
    // to describe it. For instance, if the normal faces up or down, the "ty" texture sample,
    // represnting the XZ plane, will be used, which makes sense.

    // Textures are stored in sRGB (I think), so you have to convert them to linear space 
    // (squaring is a rough approximation) prior to working with them... or something like that. :)
    // Once the final color value is gamma corrected, you should see correct looking colors.
    return mat3(tx * tx, ty * ty, tz * tz) * n; // Equivalent to: tx*tx*n.x + ty*ty*n.y + tz*tz*n.z;

}

// IQ's signed box formula.
float sBoxS(in vec2 p, in vec2 b, in float sf) {

  //return length(max(abs(p) - b + sf, 0.)) - sf;
    p = abs(p) - b + sf;
    return length(max(p, 0.)) + min(max(p.x, p.y), 0.) - sf;
}

/*
// IQ's signed box formula.
float sBoxS(in vec3 p, in vec3 b, in float sf){

  //return length(max(abs(p) - b + sf, 0.)) - sf;
  p = abs(p) - b + sf;
  return length(max(p, 0.)) + min(max(max(p.x, p.y), p.z), 0.) - sf;
}
*/

///////////
// The following have come from DjinnKahn's "Icosahedron Weave" example, here:
// https://www.shadertoy.com/view/Xty3Dy
//
// Vertices: vec3(0, A, B), vec3(B, 0, A), vec3(-B, 0, A).
// Face center: (vec3(0, A, B) + vec3(0, 0, A)*2.)/3..
// Edges: (vec3(0, A, B) + vec3(B, 0, A))/2.,  etc.

const float PHI = (1. + sqrt(5.)) / 2.; // 1.618
const float A = PHI / sqrt(1. + PHI * PHI); // .85064
const float B = 1. / sqrt(1. + PHI * PHI); // .5257
const float J = (PHI - 1.) / 2.; // .309016994375
const float K = PHI / 2.; // J + .5
const mat3 R0 = mat3(.5, -K, J, K, J, -.5, J, .5, K);
const mat3 R1 = mat3(K, J, -.5, J, .5, K, .5, -K, J);
const mat3 R2 = mat3(-J, -.5, K, .5, -K, -J, K, J, .5);

// I wanted all vertices hardcoded. Everything's been projected to the
// surface of a sphere.
#ifdef PENTAGON
const float size = .5 / .85;
#else
const float size = .5;
#endif

const vec3 v0 = (vec3(0, A, B)) * size; // Already normalized.
const vec3 v1 = (vec3(B, 0, A)) * size;
const vec3 v2 = (vec3(-B, 0, A)) * size;
const vec3 e0 = (mix(v0, v1, .5));
const vec3 e1 = (mix(v1, v2, .5));
const vec3 e2 = (mix(v2, v0, .5));
//const vec3 mid = normalize(vec3(0, A, B + A*2.))/3.; // (v0 + v1 + v2)/3.*size.
const vec3 ctr = (v0 + v1 + v2) / 3.;//mix(e0, v2, .5);//
const mat3 R3 = mat3(-.5, sqrt(.75), 0, K, .467086179481, .356822089773, -J, -.178411044887, .934172358963);
// A handy matrix that rotates icosahedral vertices into the dual dodecahedron postions. 
const mat3 R4 = mat3(.587785252292, -K, 0, -.425325404176, -J, .850650808352, .688190960236, .5, .525731112119);
const vec3 O3 = vec3(B, B / sqrt(3.), sqrt(1. - 4. / 3. * B * B));
const vec3 O4 = vec3(A / 3. / tan(3.14159 / 5.), A / 3., .63147573033330584);

// The original function -- sans polarity information -- is neat and concise.
vec3 opIcosahedron(vec3 p) {

    p = R0 * abs(p);
    p = R1 * abs(p);
    p = R2 * abs(p);
    return abs(p);
} 

/*
// IQ's 3D line segment formula. Simpler and cheaper, but doesn't orient carved cross-sections.
float sdCapsule(vec3 p, vec3 a, vec3 b){

    vec3 pa = p - a, ba = b - a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    pa = abs(pa - ba*h);
    return length(pa);
}
*/

// A cheap orthonormal basis vector function - Taken from Nimitz's "Cheap Orthonormal Basis" example, then 
// modified slightly.
//
//Cheap orthonormal basis by nimitz
//http://orbit.dtu.dk/fedora/objects/orbit:113874/datastreams/file_75b66578-222e-4c7d-abdf-f7e255100209/content
//via: http://psgraphics.blogspot.pt/2014/11/making-orthonormal-basis-from-unit.html
mat3 basis(in vec3 n) {

    float a = 1. / (1. + n.z);
    float b = -n.x * n.y * a;
    return mat3(1. - n.x * n.x * a, b, n.x, b, 1. - n.y * n.y * a, n.y, -n.x, -n.y, n.z);

}

// A line segment formula that orients via an orthanormal basis. It'd be faster to use
// IQ's 3D line segment formula, but this one allows for more interesting cross sections,
// like hexagons and so forth.
float sdCapsule(vec3 p, vec3 a, vec3 b, float r, float lf) { // Length factor on the end.

    b -= a;
    float l = length(b);

    p = basis(normalize(b)) * (p - a - b * .5);
    //p.x = abs(p.x - .015);

    #ifdef PENTAGON
    const float n = 12.; //12.
    float zr = abs(mod(p.z - l * lf, 1. / n) - .5 / n);
    float riv = length(vec2(p.y, zr)) - .008;
    #else
    const float n = 12.; //12.
    float zr = abs(mod(p.z - l * lf - .5 / n, 1. / n) - .5 / n);
    float riv = length(vec2(p.x, zr)) - .008;
    #endif

    p = abs(p);

    //float ln = max(length(p.xy) - r, p.z - l*lf);
    //float ln = max((p.x + p.y)*.7071 - r, p.z - l*lf);
    //float ln = max(max(p.x, p.y) - r, p.z - l*lf);
    float ln = max(max(max(p.x, p.y), (p.y + p.x) * .7071) - r, p.z - l * lf);
    //float ln = max(max(p.y*.866025 + p.x*.5, p.x) - r, p.z - l*lf);
    //float ln = max(max(p.x*.866025 + p.y*.5, p.y) - r, p.z - l*lf);

    return max(ln, -riv);
    //return min(ln, max(riv, p.y - r - .01));
}

////////////////

// Vector container for the object IDs. We make a note of the individual
// identifying number inside the main distance function, then sort them
// outside of it, which tends to be faster.
vec4 vObjID; 

// Object rotation.
vec3 objRot(vec3 p) {

    // Mouse movement.
    if(iMouse.z > 1.) {
        p.yz *= rot2(-(iMouse.y - iResolution.y * .5) / iResolution.y * 3.1459);
        p.xz *= rot2(-(iMouse.x - iResolution.x * .5) / iResolution.x * 3.1459);
    } 

    //float it = floor(iTime/8.);
    //float t = abs(fract(iTime/16.) - .5)*2.;
    //float mv = smoothstep(.35, .65, t)*3.14159;
    //if(mod(it, 2.)<.5) mv = -mv;
    p.xy = rot2(3.14159 / 10.) * p.xy;
    p.xz = rot2(iTime / 8.) * p.xz;  //iTime/4. 
    return p;

}

// The scene. All of it is pretty standard. To be honest, this was a 
// little rushed, but the field doesn't have a lot going on, so tightening 
// it up wasn't as important as it sometimes is.
float map(vec3 p) {

    // Back wall
    float wall = -p.z + 1.; // Thick wall: abs(p.z - .2) - .21;
    // Peturb that back wal to bounce the light off a little more.
    wall -= dot(sin(p * 3. - cos(p.yzx * 6. + vec3(iTime / 4., .5, iTime / 2.))), vec3(.025));  

    // 3D object position.
    vec3 bq = objRot(p);

    // Local object cell coordinates.
    vec3 objP = opIcosahedron(bq);

    // Render a pentagon or and icosahedron. Thanks to DjinnKahn's original
    // setup, there is very little calculation necessary at this point.
    // For a multiple bounce scenario, this is a good thing. :)

    #ifdef PENTAGON

    // Lines -- Rendered from an icosahedron perspective, so from the
    // face centers to the mid-edge points.
    float line = sdCapsule(objP, (ctr), e0 * PHI * PHI / 3., .02, .55); 
    // The solid pentagon, which will be turned into a thin outer shell
    // for the glass. I.e. obj = abs(obj) - w.
    vec3 pentP = R4 * objP - O4 * size;
    float face = length(vec3(max(pentP.x, 0.), max(pentP.y, 0.), pentP.z));

    #else

    // Lines.
    float line = sdCapsule(objP, v0, v1, .02, .55); 
    // The solid icosahedron, which will be turned into a thin outer shell
    // for the glass. I.e. obj = abs(obj) - w.
    vec3 icosP = R3 * objP - O3 * size;
    float face = length(vec3(max(icosP.x, 0.), max(icosP.y, 0.), icosP.z));
    line = smax(line, length(p) - size - .02, .01); // Round off the points.

    #endif

    // Debug: Take out the metal tubing.
    //line = 1e5;

    // Turning the solid object into a thin outer shell.
    float glass = max(abs(face) - .002, -line);

    // The lines will be made of metal.
    float mtl = line; 

    // Storing the object ID.
    vObjID = vec4(wall, glass, mtl, 1e5);

    // Returning the closest object.
    return min(min(wall, glass), mtl);

}

float trace(vec3 ro, vec3 rd, float distanceFactor) {

    float tmin = 0.;
    float tmax = FAR;

    // IQ's bounding plane addition, to help give some extra performance.
    //
    // If ray starts above bounding plane, skip all the empty space.
    // If ray starts below bounding plane, never march beyond it.
    const float boundZ = -.6;
    float h = (boundZ - ro.z) / rd.z;
    if(h > 0.) {

        if(ro.z < boundZ)
            tmin = max(tmin, h);
        else
            tmax = min(h, FAR);
    }

    float t = tmin;
    for(int i = 0; i < 72; i++) {

        float d = map(ro + rd * t) * distanceFactor;
        if(abs(d) < DELTA)
            return t;
        if(t > tmax)
            break;
        t += d * .9;
    }

    return FAR;
}

// Cheap shadows are hard. In fact, I'd almost say, shadowing particular scenes with limited 
// iterations is impossible... However, I'd be very grateful if someone could prove me wrong. :)
float softShadow(vec3 ro, vec3 lp, vec3 n, float k) {

    // More would be nicer. More is always nicer, but not really affordable... Not on my slow 
    // test machine, anyway.
    const int iter = 24;

    ro += n * .0015; // Bumping the shadow off the hit point.

    vec3 rd = lp - ro; // Unnormalized direction ray.

    float shade = 1.;
    float t = 0.;
    float end = max(length(rd), 0.0001);
    //float stepDist = end/float(maxIterationsShad);
    rd /= end;

    //rd = normalize(rd + (hash33R(ro + n) - .5)*.03);

    // Max shadow iterations - More iterations make nicer shadows, but slow things down. Obviously, 
    // the lowest number to give a decent shadow is the best one to choose. 
    for(int i = 0; i < iter; i++) {

        float d = map(ro + rd * t);
        shade = min(shade, k * d / t);
        //shade = min(shade, smoothstep(0., 1., k*h/dist)); // Thanks to IQ for this tidbit.
        // So many options here, and none are perfect: dist += min(h, .2), 
        // dist += clamp(h, .01, stepDist), etc.
        t += clamp(d, .01, .25); 

        // Early exits from accumulative distance function calls tend to be a good thing.
        //if (d<0. || t>end) break; 
        // Bounding plane optimization, specific to this example. Thanks to IQ. 
        if(d < 0. || t > end || (ro.z + rd.z * t) < -.6)
            break;
    }

    // Sometimes, I'll add a constant to the final shade value, which lightens the shadow a bit --
    // It's a preference thing. Really dark shadows look too brutal to me. Sometimes, I'll add 
    // AO also just for kicks. :)
    return max(shade, 0.);
}

// I keep a collection of occlusion routines... OK, that sounded really nerdy. :)
// Anyway, I like this one. I'm assuming it's based on IQ's original.
float calcAO(in vec3 p, in vec3 n) {

    float sca = 2., occ = 0.;
    for(int i = 0; i < 5; i++) {

        float hr = float(i + 1) * .15 / 5.;
        float d = map(p + n * hr);
        occ += (hr - d) * sca;
        sca *= .7;

        // Deliberately redundant line that may or may not stop the 
        // compiler from unrolling.
        //if(sca>1e5) break;
    }

    return clamp(1. - occ, 0., 1.);
}

// Normal function. It's not as fast as the tetrahedral calculation, but more symmetrical.
vec3 getNormal(in vec3 p) {

    //const vec2 e = vec2(.001, 0);
    //return normalize(vec3(map(p + e.xyy) - map(p - e.xyy), map(p + e.yxy) - map(p - e.yxy),	
    //                      map(p + e.yyx) - map(p - e.yyx)));

    // This mess is an attempt to speed up compiler time by contriving a break... It's 
    // based on a suggestion by IQ. I think it works, but I really couldn't say for sure.
    float sgn = 1.;
    vec3 e = vec3(.001, 0, 0), mp = e.zzz; // Spalmer's clever zeroing.
    for(int i = min(iFrame, 0); i < 6; i++) {
        mp.x += map(p + sgn * e) * sgn;
        sgn = -sgn;
        if((i & 1) == 1) {
            mp = mp.yzx;
            e = e.zxy;
        }
    }

    return normalize(mp);
}

/* 
// Texture bump mapping. Four tri-planar lookups, or 12 texture lookups in total. I tried to
// make it as concise as possible. Whether that translates to speed, or not, I couldn't say.
vec3 texBump( sampler2D tx, in vec3 p, in vec3 n, float bf){
   
    const vec2 e = vec2(.001, 0);
    
    // Three gradient vectors rolled into a matrix, constructed with offset greyscale texture values.    
    mat3 m = mat3(tex3D(tx, p - e.xyy, n), tex3D(tx, p - e.yxy, n), tex3D(tx, p - e.yyx, n));
    
    vec3 g = vec3(.299, .587, .114)*m; // Converting to greyscale.
    g = (g - dot(tex3D(tx,  p , n), vec3(.299, .587, .114)))/e.x; 
    
    // Adjusting the tangent vector so that it's perpendicular to the normal -- Thanks to
    // EvilRyu for reminding me why we perform this step. It's been a while, but I vaguely
    // recall that it's some kind of orthogonal space fix using the Gram-Schmidt process. 
    // However, all you need to know is that it works. :)
    g -= n*dot(n, g);
                      
    return normalize( n + g*bf ); // Bumped normal. "bf" - bump factor.
	
}
*/

// Random hash setup.
vec2 seed = vec2(.13, .27);

vec2 hash22() {

    seed += vec2(.723, 643);
    seed = fract(seed);
    return fract(sin(vec2(dot(seed.xy, vec2(12.989, 78.233)), dot(seed.xy, vec2(41.898, 57.263)))) * vec2(43758.5453, 23421.6361));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {

    float resT = 1e8;

    float iRes = iResolution.y;

    // Screen coordinates.
    seed += fract(iTime) * 113.87;
	//vec2 uv = (fragCoord - iResolution.xy*.5)/iResolution.y;
    vec2 uv = (fragCoord - iResolution.xy * .5 + (hash22() - .5) / 4.) / iRes;

    // "Look At" position.
    vec3 lk = vec3(0); 

    // Ray origin.
    #ifdef INSIDE_VIEW
    vec3 ro = lk + vec3(cos(iTime / 4.) * .05, .1, .1);
    #else
    vec3 ro = lk + vec3(cos(iTime / 4.) * .1, 0, -1.25);
    #endif

    // Light positioning.
    vec3 lp = lk + vec3(-.25, .75, -.6); 

    // Using the above to produce the unit ray-direction vector.
    float FOV = 1.; // FOV - Field of view.
    vec3 fwd = normalize(lk - ro);
    vec3 rgt = normalize(vec3(fwd.z, 0., -fwd.x)); 
    // "right" and "forward" are perpendicular, due to the dot product being zero. Therefore, I'm 
    // assuming no normalization is necessary? The only reason I ask is that lots of people do 
    // normalize, so perhaps I'm overlooking something?
    vec3 up = cross(fwd, rgt);

    mat3 mCam = mat3(rgt, up, fwd);

    // Unit direction ray.
    //vec3 rd = normalize(uv.x*rgt + uv.y*up + fwd/FOV);
    vec3 rd = mCam * normalize(vec3(uv, 1. / FOV));

    // Camera position. Initially set to the ray origin.
    vec3 cam = ro;
    // Surface postion. Also initially set to the ray origin.
    vec3 sp = ro; 

    // Global shadow variable and a reflection power variable. The reflection
    // power also applies to refracted objects.
    float gSh = 1.;
    float objRef = 1.;

    vec3 col = vec3(0);

    // The refraction ratio for the glass. Normally, you'd have
    // different ones for different objects, but we only need one for this example.
    float refractionRatio = 1. / 1.5;
    float distanceFactor = 1.;

    float alpha = 1.;

    // Intersection and coloring for each ray and subsequent bounces.
    for(int j = 0; j < PASSES; j++) {

        // Layer or pass color. Each pass color gets blended in with
        // the overall result.
        vec3 colL = vec3(0);

        // Raymarch to the scene.
        float t = trace(sp, rd, distanceFactor);

        // Objtain the ID of the closest object: With more objects, you'd use a looping
        // mechanism, but I'd imagine this hideous expression is a little faster.
        float svObjID = (vObjID.x < vObjID.y && vObjID.x < vObjID.z && vObjID.x < vObjID.w) ? 0. : vObjID.y < vObjID.z && vObjID.y < vObjID.w ? 1. : vObjID.z < vObjID.w ? 2. : 3.;

        // Advance the ray to the surface. This becomes the new ray origin for the
        // next pass.
        sp += rd * t;

        // If the ray hits a surface, light it up. By the way, it's customary to put 
        // all of the following inside a single function, but I'm keeping things simple.
        // Blocks within loops used to kill GPU performance, but it doesn't seem to
        // effect the new generation systems.

        if(t < FAR) {

            if(j == 0) {
                resT = t;
            }

            // Surface normal. Refractions, and therefore ray traversal inside
            // of object surfaces are now possible, to the direction of the
            // normal matters... This is yet one of many things that I forget
            // when I haven't done this for a while. :)
            vec3 sn = getNormal(sp) * distanceFactor; // For refractions.

            // Texture size factor.
            float sz0 = 2.;
            /*
            // Integrating bump mapping -- Not used here. It's possible
            // to bump map on a pass by pass basis to save cycles.
            vec3 smSn = sn;
            sn = texBump(iChannel1, sp*sz0, sn, .007);///(1. + t/FAR)
            //vec3 reflection = reflect(rd, normalize(mix(smSn, sn, .35)));
            */

            vec3 reflection = reflect(rd, sn);
            vec3 refraction = refract(rd, sn, refractionRatio);

            vec3 ld = lp - sp; // Point light direction.
            float lDist = length(ld); // Surface to light distance.
            ld /= max(lDist, .0001); // Normalizing.

            // Shadows and ambient self shadowing.
            //
            // Shadows are expensive. It'd be nice to include shadows on each bounce,
            // but it's still not really viable, so we just perform them on the 
            // first pass... Years from now, I'm hoping it won't be an issue.
            float sh = 1.;
            #if 0
            // Shadows on each bounce.
            sh = softShadow(sp, lp, sn, 12.);
            gSh = min(sh + .5, 1.); // Adding brightness to the shadow.
            #else
            // Shadows on just two bounces.
            if(j < 2) {
                sh = softShadow(sp, lp, sn, 12.);
                gSh = min(gSh, min(sh + .53, 1.));
            }
            #endif

            float ao = calcAO(sp, sn); // Ambient occlusion.

            float att = 1. / (1. + lDist * lDist * .025); // Attenuation.

            float dif = max(dot(ld, sn), 0.); // Diffuse lighting.
            float spe = pow(max(dot(reflection, ld), 0.), 16.);
            float speR = pow(max(dot(normalize(ld - rd), sn), 0.), 16.);
            //float fre = clamp(1. - abs(dot(rd, sn))*.7, 0., 1.); // Fresnel reflection term.

            // Fresnel.
            float Schlick = pow(1. - clamp(dot(rd, normalize(rd + ld)), 0., 1.), 5.);
            float freS = mix(.25, 1., Schlick);  //F0 = .2 - Glass... or close enough.

            // Object color.
            vec3 oCol;

            vec3 txP = objRot(sp);
            vec3 txN = objRot(sn);

            if(svObjID == 0.) { // Back wall.

                // Texturing. 
                //vec3 tx = tex3D(iChannel2, sp/2., sn);
                vec3 tx = texture(iChannel2, sp.xy / 3. + vec2(1, .5) * iTime / 72.).xyz;
                tx *= tx;

                // Background. 
                // It's roughly incorporattes Edwardbraed's simple background here:
                // https://www.shadertoy.com/view/NslXz4
                uv.y = abs(uv.y + .125) - .5;
                float grad = pow(1.0 - length(uv * vec2(iResolution.y / iResolution.x, 1)), 4.);
                oCol = mix(vec3(.7, .5, 1), vec3(.5, .7, 1), uv.y + .5);
                oCol *= grad * .95 + .05;
                oCol *= tx * 2.;

                // The wall has no reflection of refraction, so setting the
                // reflective or transmission power to zero will cause the
                // loop to terminate early, which saves a lot of work.
                objRef = 0.;

                spe *= freS;

                // Reflection only override. This ensures that no refraction
                // will occur... It's hacky, but it works. :)
                refraction *= 0.;
            } else if(svObjID == 1.) {  // Glass box.

                // Coloring the glass tubes. Note that we keep the object
                // color dark, in order to look transparent.
                vec3 tx = tex3D(iChannel1, txP, txN);

                // Color.
                oCol = mix(vec3(.7, .5, 1), vec3(.5, .7, 1), uv.y + .5);
                oCol *= tx * .1;

                // Faking more reflectivity in the glass.
                objRef = 1.125;
                spe = pow(spe, 4.);

                #ifdef INSIDE_VIEW
                oCol *= vec3(.8, .6, 1); // Adding a bit more glass color for the inside view.
                refraction *= 0.; // Turn off refraction inside the object.
                #else
                // Reflection only override.
                if((j > 0 && distanceFactor > 0.)) {
                    refraction *= 0.;
                }
                #endif

            } else { // Metallic stuff.            

                // Joins, tracks and animated metal objects.
                vec3 tx = tex3D(iChannel1, txP, txN);
                tx = smoothstep(.0, .5, tx);
                if(svObjID == 3.)
                    oCol = tx * vec3(1, .7, .5);
                else
                    oCol = tx * vec3(.5) * vec3(1, .95, .9);

                objRef = .25; // Only a bit of reflectance.

                // Ramping up the diffuse on the metal joins.
                dif = pow(dif, 4.) * 2.; 

                // Reflection only override. This ensures that no refraction
                // will occur... It's hacky, but it works. :)
                refraction *= 0.;

            }

            // Cheap specular reflections.
            vec3 rTx = texture(iChannel3, reflection).xyz;
            rTx *= rTx;
            if(svObjID == 0.)
                rTx *= .25;
            oCol += (oCol * .75 + .25) * speR * rTx * 3.;//*vec3(.85, .7, 1); //*speR

            // Simple coloring for this particular ray pass.
            colL = oCol * (dif + .2 + vec3(1, .7, .4) * spe * 6.);

            // Shading.
            colL *= gSh * ao * att;

            // Used for refraction (Beer's Law, kind of), but not used here.
            //if(distanceFactor<0.)  colL *= exp(-colL*t*5.);

            // Set the unit direction ray to the new reflected or refracted direction, and 
            // bump the ray off of the hit point by a fraction of the normal distance. 
            // Anyone who's been doing this for a while knows that you need to do this to 
            // stop self intersection with the current launch surface from occurring... It 
            // used to bring me unstuck all the time. I'd spend hours trying to figure out 
            // why my reflections weren't working. :)

            // You see this in most refraction\reflection examples. If refraction is possible
            // refract, reverse the distance factor (inside to outside and vice versa) and 
            // bump the ray off the surface. If you can't refract (internal reflection, a 
            // non-refractive surface, etc), then reflect in the usual manner. If the surface
            // neither reflects nor refracts, the object reflectance factor will cause the
            // loop to terminate... I could check for that here, but I want to keep the 
            // decision making simple.
            //
            if(dot(refraction, refraction) < DELTA) {
                rd = reflection;
                // The ray is just behind the surface, so it has to be bumped back to avoid collisions.
                sp += sn * DELTA * 2.;
            } else {

                rd = refraction;
                distanceFactor = -distanceFactor;
                refractionRatio = 1. / refractionRatio;
                sp -= sn * DELTA * 2.;//1.1;
            }

        }

        // Fog: Redundant here, since the ray doesn't go far, but necessary for other setups.
        float td = length(sp - cam);
        vec3 fogCol = vec3(0);
        colL = mix(colL, fogCol, smoothstep(0., .95, td / FAR));

        // This is a more subtle way to blend layers. 
        //col = mix(col, colL, 1./float(1 + j)*alpha);
        // Additive blend. Makes more sense for this example.
        col += colL * alpha;///float(PASSES);

        // If the hit object's reflective factor is zero, or the ray has reached
        // the far horizon, break. Breaking saves cycles, so it's important to 
        // terminate the loop early when you can.
        if(objRef < .001 || t >= FAR)
            break;

        // Object based breaking. Also possible, but I prefer the above.
        //if(svObjID == 0.)break; 

        // Decrease the alpha factor (ray power of sorts) by the hit object's reflective factor.
        alpha *= objRef;

    }

    #ifdef INSIDE_VIEW
    // Vignette.
    // Using IQ's box formula to produce a more configurable border overlay.
    // Equivalent to: float bord = sBox(uv, vec2(iResolution.x/iResolution.y, 1)/2.);
    vec2 d = abs(uv) - vec2(iResolution.x / iResolution.y, 1) / 2. + .15;
    float bord = min(max(d.x, d.y), 0.) + length(max(d, 0.)) - .3;
    col = mix(col, vec3(0), (1. - smoothstep(0., .05, abs(bord) - .15)) * .7);
    #endif

    fragColor.w = resT;

    // Mix the previous frames in with no camera reprojection.
    // It's OK, but full temporal blur will be experienced.
    vec4 preCol = texelFetch(iChannel0, ivec2(fragCoord), 0);
    float blend = (iFrame < 2) ? 1. : 1. / 4.;
    fragColor = mix(preCol, vec4(clamp(col, 0., 1.), 1), blend);

    // No reprojection or temporal blur, for comparisson.
    //fragColor = vec4(max(col, 0.), 1);

}
#include <../common/main_shadertoy.frag>
