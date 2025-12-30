
// --- Migrate Log ---
// 在文件顶端加入 common include 并声明缺失的采样器 `iChannel0`；将对纹理的采样改为使用 `SG_TEX0/SG_TEXELFETCH0`，并把基于 float 的循环改为 int 索引以兼容 SkSL/Impeller。
// Add top-level common include and declare missing sampler `iChannel0`; switch texture sampling to SG_TEX0/SG_TEXELFETCH0 and convert float loops to int indexed loops for SkSL/Impeller compatibility.

#include <../common/common_header.frag>
uniform sampler2D iChannel0;

//#define WOBBLE

//#define DARK_MODE


#if HW_PERFORMANCE==1
    const float MAX_DISPERSE = 5.;
    const float MAX_BOUNCE = 10.;
#else
    const float MAX_DISPERSE = 3.;
    const float MAX_BOUNCE = 4.;
#endif


#define PI 3.14159265359
#define PHI 1.618033988749895


// HG_SDF
// https://www.shadertoy.com/view/Xs3GRB

#define PI 3.14159265359
#define TAU 6.28318530718

#define saturate(x) clamp(x, 0., 1.)

void pR(inout vec2 p, float a) {
    p = cos(a)*p + sin(a)*vec2(p.y, -p.x);
}

float smax(float a, float b, float r) {
    vec2 u = max(vec2(r + a,r + b), vec2(0));
    return min(-r, max (a, b)) + length(u);
}

float vmax(vec2 v) {
	return max(v.x, v.y);
}

float vmax(vec3 v) {
	return max(max(v.x, v.y), v.z);
}

float fBox(vec2 p, vec2 b) {
	vec2 d = abs(p) - b;
	return length(max(d, vec2(0))) + vmax(min(d, vec2(0)));
}

float fBox(vec3 p, vec3 b) {
	vec3 d = abs(p) - b;
	return length(max(d, vec3(0))) + vmax(min(d, vec3(0)));
}

// Rotate on axis
// blackle https://suricrasia.online/demoscene/functions/
vec3 erot(vec3 p, vec3 ax, float ro) {
  return mix(dot(ax,p)*ax, p, cos(ro))+sin(ro)*cross(ax,p);
}

float range(float vmin, float vmax, float value) {
  return clamp((value - vmin) / (vmax - vmin), 0., 1.);
}

mat3 rotX(float a) {
	return mat3(1, 0, 0, 0, cos(a), -sin(a), 0, sin(a), cos(a));
}

mat3 rotY(float a) {
	return mat3(cos(a), 0, sin(a), 0, 1, 0, -sin(a), 0, cos(a));
}

mat3 rotZ(float a) {
	return mat3(cos(a), -sin(a), 0, sin(a), cos(a), 0, 0, 0, 1);
}

// Spectrum palette
// IQ https://www.shadertoy.com/view/ll2GD3

vec3 pal( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ) {
    return a + b*cos( 6.28318*(c*t+d) );
}

vec3 spectrum(float n) {
    return pal( n, vec3(0.5,0.5,0.5),vec3(0.5,0.5,0.5),vec3(1.0,1.0,1.0),vec3(0.0,0.33,0.67) );
}

// https://iquilezles.org/articles/functions
float expImpulse( float x, float k )
{
    float h = k*x;
    return h*exp(1.0-h);
}


//========================================================
// Modelling
//========================================================

float boolSign(float v) {
    return max(0., sign(v)) * 2. - 1.;
}

vec3 boolSign(vec3 v) {
    return max(vec3(0), sign(v)) * 2. - 1.;
}

// Closest icosahedron vertex
#if 0
vec3 icosahedronVertex(vec3 p) {
    vec3 ap, v, v2, v3;
    ap = abs(p);
    v = vec3(PHI, 1, 0);
    v2 = v.yzx;
    v3 = v2.yzx;
    if (distance(ap, v2) < distance(ap, v)) v = v2;
    if (distance(ap, v3) < distance(ap, v)) v = v3;
    return normalize(v) * boolSign(p);
}
#else
// with removed roots from iq
vec3 icosahedronVertex(vec3 p) {
    vec3 ap = abs(p);
    vec3                           v = vec3(PHI,1,0);
    if (ap.x+ap.z*PHI > dot(ap,v)) v = vec3(1,0,PHI);
    if (ap.z+ap.y*PHI > dot(ap,v)) v = vec3(0,PHI,1);
    return v*0.52573111*boolSign(p);
}
#endif

// Closest dodecahedron vertex
#if 0
vec3 dodecahedronVertex(vec3 p) {
    vec3 ap, v, v2, v3, v4;
    ap = abs(p);
    v = vec3(PHI);
	v2 = vec3(0, 1, PHI + 1.);
	v3 = v2.yzx;
    v4 = v3.yzx;
    if (distance(ap, v2) < distance(ap, v)) v = v2;
    if (distance(ap, v3) < distance(ap, v)) v = v3;
    if (distance(ap, v4) < distance(ap, v)) v = v4;
    return normalize(v) * boolSign(p);
}
#else
// with removed roots from iq
vec3 dodecahedronVertex(vec3 p) {
    vec3 ap = abs(p);
    vec3 v = vec3(PHI);
    vec3 v2 = vec3(0, 1, PHI + 1.);
    vec3 v3 = v2.yzx;
    vec3 v4 = v2.zxy;
    if (dot(ap,v2) > dot(ap,v)) v = v2;
    if (dot(ap,v3) > dot(ap,v)) v = v3;
    if (dot(ap,v4) > dot(ap,v)) v = v4;
    return v*0.35682209*boolSign(p);
}
#endif


float OUTER = .35;
float INNER = .24;

float object(vec3 p) {
    float d = length(p) - OUTER;
    d = max(d, -d - (OUTER - INNER));
    return d;
}

float animT;
float time;

vec2 map(vec3 p) {

    float scale = 2.5;
    p /= scale;

    float outerBound = length(p) - OUTER;

    #ifdef WOBBLE
        float bound = outerBound - .05;
        bound *= scale;
        if (bound > .002) {
            return vec2(bound, 0.);
        }
    #endif

    #ifdef WOBBLE
        float spin = time * (PI*2.) * (1./5.);
        mat3 trs = rotX(atan(1./PHI)) * rotY(-spin);
        p = trs * p;
    #else
        float spin = time * (PI/2.) - .15;
        pR(p.xz, spin);
    #endif



    // Buckyball faces
    // ---------------

    // Four closest vertices of a spherical pentakis dodecahedron
    // or, four closest faces of a buckyball
    
    vec3 va = icosahedronVertex(p);
    vec3 vb = dodecahedronVertex(p);

    // Second closest dodecahedron vertex
    float side = boolSign(dot(p, cross(va, vb)));
    float r = PI * 2. / 5. * side;
    vec3 vc = erot(vb, va, r);

    // Third closest dodecahedron vertex
    vec3 vd = erot(vb, va, -r);
    
    
    
    float d = 1e12;
    vec3 pp = p;
    
    // Render the nearest four fragments to get
    // a clean distance estimation

    for (int i = 0; i < 4; i++) {

        // Offset space
        #ifdef WOBBLE
            vec3 dir = normalize(vec3(1,1,0));
            dir = dir * transpose(trs);
            float sp = 2.;
            float t = mod((time - dot(va, dir) / (.5 * sp)), 1.);
            float anim = sin(t * PI * 1. * sp) * .5 + .5;
            anim = mix(.0, .05, anim);
            p -= va * anim;
        #else
            float t = mod(time * 2./3. + .25 - dot(va.xy, vec2(1,-1)) / 30., 1.);
            float t2 = clamp(t * 5. - 1.7, 0., 1.);
            float explode = 1. - pow(1. - t2, 10.); // expand
            explode *= 1. - pow(t2, 5.); // contract
            explode += (smoothstep(.32, .34, t) - smoothstep(.34, .5, t)) * .05;
            explode *= 1.4;
            t2 = max(t - .53, 0.) * 1.2;
            float wobble = sin(expImpulse(t2, 20.) * 2.2 + pow(3. * t2, 1.5) * 2. * PI * 2. - PI) * smoothstep(.4, .0, t2) * .2;
            float anim = wobble + explode;
            p -= va * anim / 2.8;
        #endif       

        // Build boundary edge of face
        float edgeA = dot(p, normalize(vb - va));
        float edgeB = dot(p, normalize(vc - va));
        float edgeC = dot(p, normalize(vd - va));
        float edge = max(max(edgeA, edgeB), edgeC);
        #ifndef WOBBLE
            edge -= .005;
        #endif
        
        // Intersect with object
        d = min(d, smax(object(p), edge, .002));
        
        // Reset space for next iteration
        p = pp;
        
        // Cycle faces for next iteration
        vec3 va2 = va;
        va = vb;
        vb = vc;
        vc = vd;
        vd = va2;
    }
    
    #ifndef WOBBLE
        // Slow down ray as we approach non-exploded object
        float bound = outerBound - .002;
        if (bound * scale > .002) {
            d = min(d, bound);
        }
    #endif
    
    return vec2(d * scale, 1.);
}


//========================================================
// Lighting
//========================================================

vec3 BGCOL = vec3(.9,.83,1);

float intersectPlane(vec3 rOrigin, vec3 rayDir, vec3 origin, vec3 normal, vec3 up, out vec2 uv) {
    float d = dot(normal, (origin - rOrigin)) / dot(rayDir, normal);
  	vec3 point = rOrigin + d * rayDir;
	vec3 tangent = cross(normal, up);
	vec3 bitangent = cross(normal, tangent);
    point -= origin;
    uv = vec2(dot(tangent, point), dot(bitangent, point));
    return max(sign(d), 0.);
}

mat3 envOrientation;

vec3 light(vec3 origin, vec3 rayDir) {
    origin = -origin;
    rayDir = -rayDir;

    origin *= envOrientation;
    rayDir *= envOrientation;

    vec2 uv;
    vec3 pos = vec3(-6);
    float hit = intersectPlane(origin, rayDir, pos, normalize(pos), normalize(vec3(-1,1,0)), uv);
    float l = smoothstep(.75, .0, fBox(uv, vec2(.5,2)) - 1.);
    l *= smoothstep(6., 0., length(uv));
	return vec3(l) * hit;
}

vec3 env(vec3 origin, vec3 rayDir) {    
    origin = -(vec4(origin, 1)).xyz;
    rayDir = -(vec4(rayDir, 0)).xyz;

    origin *= envOrientation;
    rayDir *= envOrientation;

    float l = smoothstep(.0, 1.7, dot(rayDir, vec3(.5,-.3,1))) * .4;
   	return vec3(l) * BGCOL;
}



//========================================================
// Marching
//========================================================

#define ZERO int(min(iFrame, 0.0))

// https://iquilezles.org/articles/normalsSDF
vec3 normal( in vec3 pos )
{
    vec3 n = vec3(0.0);
    for( int i=ZERO; i<4; i++ )
    {
        // SkSL-safe replacement for bit shifts / bit-and on `i`
        float b0 = mod(floor(float(i + 3) / 2.0), 2.0);
        float b1 = mod(floor(float(i) / 2.0), 2.0);
        float b2 = mod(float(i), 2.0);
        vec3 e = 0.5773*(2.0*vec3(b0, b1, b2) - 1.0);
        n += e*map(pos+0.001*e).x;
    }
    return normalize(n);
}

struct Hit {
    vec2 res;
    vec3 p;
    float len;
    float steps;
};

Hit march(vec3 origin, vec3 rayDir, float invert, float maxDist, float understep) {
    vec3 p;
    float len = 0.;
    float dist = 0.;
    vec2 res = vec2(0.);
    vec2 candidate = vec2(0.);
    float steps = 0.;

    for (int i = 0; i < 300; i++) {
        len += dist * understep;
        p = origin + len * rayDir;
        candidate = map(p);
        dist = candidate.x * invert;
        steps += 1.0;
        res = candidate;
        if (dist < 0.001) {
            break;
        }
        if (len >= maxDist) {
            len = maxDist;
            res.y = 0.0;
            break;
        }
    }   

    return Hit(res, p, len, steps);
}

mat3 sphericalMatrix(vec2 tp) {
    float theta = tp.x;
    float phi = tp.y;
    float cx = cos(theta);
    float cy = cos(phi);
    float sx = sin(theta);
    float sy = sin(phi);
    return mat3(
        cy, -sy * -sx, -sy * cx,
        0, cx, sx,
        sy, cy * -sx, cy * cx
    );
}

mat3 calcLookAtMatrix(vec3 ro, vec3 ta, vec3 up) {
    vec3 ww = normalize(ta - ro);
    vec3 uu = normalize(cross(ww,up));
    vec3 vv = normalize(cross(uu,ww));
    return mat3(uu, vv, ww);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    float duration = 10./3.;
    #ifdef WOBBLE
        duration = 2.;
    #endif
    time = mod(iTime / duration, 1.);
    
    #ifndef DARK_MODE
        envOrientation = sphericalMatrix(((vec2(81.5, 119) / vec2(187)) * 2. - 1.) * 2.);
    #else
        envOrientation = sphericalMatrix((vec2(0.7299465240641712,0.3048128342245989) * 2. - 1.) * 2.);
    #endif

    vec2 uv = (2. * fragCoord - iResolution.xy) / iResolution.y;

    Hit hit = Hit(vec2(0.0), vec3(0.0), 0.0, 0.0);
    Hit firstHit = Hit(vec2(0.0), vec3(0.0), 0.0, 0.0);
    vec2 res = vec2(0.0);
    vec3 p = vec3(0.0), rayDir = vec3(0.0), origin = vec3(0.0), sam = vec3(0.0), ref = vec3(0.0), raf = vec3(0.0), nor = vec3(0.0), camOrigin = vec3(0.0), camDir = vec3(0.0);
    float invert = 0.0, ior = 0.0, offset = 0.0, extinctionDist = 0.0, maxDist = 0.0, firstLen = 0.0, wavelength = 0.0;
    int bounceCount = 0;
    
    vec3 col = vec3(0);
    float focal = 3.8;
    bool refracted;

    vec3 bgCol = BGCOL * .22;

    invert = 1.;
    maxDist = 15.; 
    
	camOrigin = vec3(0,0,9.5);
   	camDir = normalize(vec3(uv * .168, -1.));


    firstHit = march(camOrigin, camDir, invert, maxDist, .8);
    firstLen = firstHit.len;

    float steps = 0.;
    
    for (int disperse_i = 0; disperse_i < int(MAX_DISPERSE); disperse_i++) {
        float disperse = float(disperse_i);
        invert = 1.;
        sam = vec3(0);

        origin = camOrigin;
        rayDir = camDir;

        extinctionDist = 0.;
        wavelength = float(disperse_i) / MAX_DISPERSE;
        float randv = SG_TEX0(iChannel0, (fragCoord + floor(iTime * 60.0) * 10.0) / SG_CHANNEL_SIZE0).r;
        wavelength += (randv * 2.0 - 1.0) * (.5 / MAX_DISPERSE);

        bounceCount = 0;

        for (int bounce_i = 0; bounce_i < int(MAX_BOUNCE); bounce_i++) {

            if (bounce_i == 0) {
                hit = firstHit;
            } else {
                hit = march(origin, rayDir, invert, maxDist / 2.0, 1.0);
            }
            
            steps += hit.steps;
            
            res = hit.res;
            p = hit.p;
            
            if (invert < 0.0) {
                extinctionDist += hit.len;
            }

            // hit background
            if ( res.y == 0.0) {
                break;
            }

            vec3 nor = normal(p) * invert;            
            ref = reflect(rayDir, nor);
            
            // shade
            sam += light(p, ref) * 0.5;
            sam += pow(max(1.0 - abs(dot(rayDir, nor)), 0.0), 5.0) * 0.1;
            sam *= vec3(0.85,0.85,0.98);

            // refract
            float ior_local = mix(1.2, 1.8, wavelength);
            ior_local = invert < 0.0 ? ior_local : 1.0 / ior_local;
            raf = refract(rayDir, nor, ior_local);
            bool tif = raf == vec3(0.0); // total internal reflection
            rayDir = tif ? ref : raf;
            offset = 0.01 / abs(dot(rayDir, nor));
            origin = p + offset * rayDir;
            //invert = tif ? invert : invert * -1.;
            invert *= -1.0; // not correct but gives more interesting results

            bounceCount = bounce_i;
        }

        #ifndef DARK_MODE
            sam += (bounceCount == 0) ? bgCol : env(p, rayDir);
        #endif

        if (bounceCount == 0) {
            // didn't bounce, so don't bother calculating dispersion
            col += sam * MAX_DISPERSE / 2.;
            break;
        } else {
            vec3 extinction = vec3(.5,.5,.5) * .0;
            extinction = 1.0 / (1.0 + (extinction * extinctionDist));	
            col += sam * extinction * spectrum(-wavelength + 0.25);
        }
	}
    
    // debug
 	//fragColor = vec4(spectrum(steps / 2000.), 1); return;
    //fragColor = vec4(vec3(bounceCount / MAX_BOUNCE), 1); return;
    //fragColor = vec4(vec3(firstHit.steps / 100.), 1); return;

    col /= MAX_DISPERSE;
        
    fragColor = vec4(col, range(4., 12., firstLen));
}

#include <../common/main_shadertoy.frag>
