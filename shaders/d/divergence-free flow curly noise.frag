// --- Migrate Log ---
// 添加 Flutter 兼容性 includes，无其他修改
// Added Flutter compatibility includes, no other changes

#include <../common/common_header.frag>

// https://www.shadertoy.com/view/t3lSDr divergence-free flow curly noise, 2025 by jt
// based on https://www.shadertoy.com/view/t3lXRM a 3d particle flow visualization
// 3d extention of https://www.shadertoy.com/view/WXsSz4 particle flow
// rendering https://www.shadertoy.com/view/lXGGR3 raymarch voxels with color
// curl from https://www.shadertoy.com/view/W3lXDr learning about vector field curl

// Experimenting with random incompressible flow:
// Take 3d Perlin noise vector field and apply curl operator
// (apparently curl of any vector-field is divergence-free).

// https://en.wikipedia.org/wiki/Curl_(mathematics)
// https://en.wikipedia.org/wiki/Vector_field
// https://en.wikipedia.org/wiki/Solenoidal_vector_field

// https://en.wikipedia.org/wiki/Vector_calculus_identities#Divergence_of_curl_is_zero
// https://en.wikipedia.org/wiki/Vector_calculus_identities#Curl_of_gradient_is_zero

// https://en.wikipedia.org/wiki/Curl_(mathematics)

// TODO: Find a cleaner vector perlin noise implementation
//      (currently hacked scalar noise to get vector noise).

// tags: fluid, flow, field, vector, particle, incompressible, divergencefree, solenoidal, transverse

// The MIT License
// Copyright (c) 2025 Jakob Thomsen
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// For correct ambient occlusion sample 2x2x2 voxels (slow!)
//#define HIGH_QUALITY

// choose whether to visualize the field or it's curl
#define SHOW_CURL

#ifdef SHOW_CURL
#define display curl /* divergence-free */
#else
#define display field /* unconstrained */
#endif


// increase for more particles
#define BOUNDS 10

#define EPSILON 0.001
#define DIST_MAX (float(BOUNDS)*5.0)
#define ITER_MAX uint(BOUNDS*10)

#define pi 3.1415926
#define tau (pi+pi)

mat3 yaw_pitch_roll(float yaw, float pitch, float roll)
{
    mat3 R = mat3(vec3(cos(yaw), sin(yaw), 0.0), vec3(-sin(yaw), cos(yaw), 0.0), vec3(0.0, 0.0, 1.0));
    mat3 S = mat3(vec3(1.0, 0.0, 0.0), vec3(0.0, cos(pitch), sin(pitch)), vec3(0.0, -sin(pitch), cos(pitch)));
    mat3 T = mat3(vec3(cos(roll), 0.0, sin(roll)), vec3(0.0, 1.0, 0.0), vec3(-sin(roll), 0.0, cos(roll)));

    return R * S * T;
}

vec3 hash33(vec3 p3) // https://www.shadertoy.com/view/4djSRW Hash without Sine by Dave_Hoskins
{
    p3 = fract(p3 * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yxz+33.33);
    return fract((p3.xxy + p3.yxx)*p3.zyx);
}

vec4 hash43(vec3 p) // https://www.shadertoy.com/view/4djSRW Hash without Sine by Dave_Hoskins
{
    vec4 p4 = fract(vec4(p.xyzx)  * vec4(.1031, .1030, .0973, .1099));
    p4 += dot(p4, p4.wzxy+33.33);
    return fract((p4.xxyz+p4.yzzw)*p4.zywx);
}

vec3 grad(int o, ivec3 v) // XXX TODO: replace by better 3d vector noise XXX
{
    vec3 p = vec3(v)*123.456;
    return
    (
        o == 0
        ?
        hash43(p).wxy
        :
        o == 1
        ?
        hash43(p).zwy
        :
        hash43(p).zxw
    )
    *
    2.0
    -
    1.0;
}

float noise(int o, vec3 p)
{
    ivec3 i = ivec3(floor(p));
    vec3  f = fract(p);

    vec3 u = smoothstep(0.0, 1.0, f);
    //vec3 u = f*f*(3.0-2.0*f); // feel free to replace by a quintic smoothstep instead
    //vec3 u = f*f*f*(f*(f*6.0-15.0)+10.0); // https://iquilezles.org/articles/gradientnoise/

    return // 3d version of https://www.shadertoy.com/view/XdXGW8 Perlin noise by inigo quilez - iq/2013
        mix
        (
            mix
            (
                mix
                (
                    dot(grad(o, i+ivec3(0,0,0)), f-vec3(0,0,0)),
                    dot(grad(o, i+ivec3(1,0,0)), f-vec3(1,0,0)),
                    u.x
                ),
                mix
                (
                    dot(grad(o, i+ivec3(0,1,0)), f-vec3(0,1,0)),
                    dot(grad(o, i+ivec3(1,1,0)), f-vec3(1,1,0)),
                    u.x
                ),
                u.y
            ),
            mix
            (
                mix
                (
                    dot(grad(o, i+ivec3(0,0,1)), f-vec3(0,0,1)),
                    dot(grad(o, i+ivec3(1,0,1)), f-vec3(1,0,1)),
                    u.x
                ),
                mix
                (
                    dot(grad(o, i+ivec3(0,1,1)), f-vec3(0,1,1)),
                    dot(grad(o, i+ivec3(1,1,1)), f-vec3(1,1,1)),
                    u.x
                ),
                u.y
            ),
            u.z
        );
}

vec3 noise(vec3 p)
{
    return vec3(noise(0,p),noise(1,p),noise(2,p));
}

vec3 field(vec3 p)
{
    float s = 0.1;
    return noise(p*s)/s;
}

vec3 curl(vec3 p) // https://www.shadertoy.com/view/W3lXDr learning about vector field curl
{
    float eps = 0.001;
    vec3 dx = vec3(eps, 0, 0);
    vec3 dy = vec3(0, eps, 0);
    vec3 dz = vec3(0, 0, eps);

    vec3 dfdx = (field(p + dx) - field(p - dx)) / (2.0 * eps);
    vec3 dfdy = (field(p + dy) - field(p - dy)) / (2.0 * eps);
    vec3 dfdz = (field(p + dz) - field(p - dz)) / (2.0 * eps);

    return
        vec3
        (
            dfdy.z - dfdz.y,
            dfdz.x - dfdx.z,
            dfdx.y - dfdy.x
        );
}

float sphere(vec3 p, float r)
{
    return length(p) - r;
}

vec4 particles(float m, vec3 p)
{
    vec3 q = fract(p);
    p = floor(p);
    vec3 d = display(p);
    vec3 f = fract(d*iTime+hash33(p));
    float r = min(min(1.0-abs(f.x*2.0-1.0),1.0-abs(f.y*2.0-1.0)),1.0-abs(f.z*2.0-1.0));
    r = 0.5-0.5*cos(r*pi); // linear to smooth curve
    vec3 c = vec3(d*0.5+0.5);
    return vec4(c, sphere(q-f,r*m));
}

float frame(vec3 p, vec3 b, float e) // https://iquilezles.org/articles/distfunctions/
{
       p = abs(p  )-b;
  vec3 q = abs(p+e)-e;
  return min(min(
      length(max(vec3(p.x,q.y,q.z),0.0))+min(max(p.x,max(q.y,q.z)),0.0),
      length(max(vec3(q.x,p.y,q.z),0.0))+min(max(q.x,max(p.y,q.z)),0.0)),
      length(max(vec3(q.x,q.y,p.z),0.0))+min(max(q.x,max(q.y,p.z)),0.0));
}

struct result
{
    vec3 color;
    float dist;
};

result combine(result a, result b)
{
    if(a.dist < b.dist) return a;
    return b;
}

result map(ivec3 v, vec3 l) // unit grid: voxel = float(position), local = fract(position)
{
    result res = result(vec3(0), DIST_MAX); // signal to skip this voxel
    //if(v.z > -2 && v.z < 2 && ((v.x^v.y)&4)!=0)
    //if(v.z > -2 && v.z < 2)
    ivec3 bounds = ivec3(BOUNDS);
    //ivec3 bounds = ivec3(BOUNDS,BOUNDS,1);
    //if(all(lessThan(abs(v),bounds)) && abs(v.z) < 2)
    if(all(lessThan(abs(v),bounds)))
    {
        //res = combine(res, result(vec3(1), frame(l-0.5,vec3(0.5),0.01))); // debug grid

        vec4 p = particles(0.2, vec3(v)+l);
        res = combine(res, result(p.xyz,p.w));

        res = combine(res, result(vec3(1), frame(l+vec3(v)-0.5,vec3(bounds)-0.5,0.1))); // debug grid
    }

    return res;
}

#ifdef HIGH_QUALITY
result map(vec3 p) // for correct ambient occlusion sample 2x2x2 voxels (slow!)
{
    // I think kastorp originally suggested to sample only 2x2x2 instead of 3x3x3, thanks!
    result d = result(vec3(0), DIST_MAX);
    ivec3 s = ivec3(step(0.5, fract(p)));
    ivec3 o;
    for(o.z = s.z-1; o.z < s.z+1; o.z++)
        for(o.y = s.y-1; o.y < s.y+1; o.y++)
            for(o.x = s.x-1; o.x < s.x+1; o.x++)
            {
                result r = map(ivec3(floor(p))+o, fract(p)-vec3(o));
                if(r.dist < d.dist)
                    d = r;
            }
    return d;
}
#else
result map(vec3 p)
{
    return map(ivec3(floor(p)), fract(p));
}
#endif
// https://iquilezles.org/articles/normalsSDF tetrahedron normals
vec3 normal(vec3 p)
{
    const float h = EPSILON;
    const vec2 k = vec2(1,-1);
    return normalize(k.xyy*map(p + k.xyy*h).dist +
                     k.yyx*map(p + k.yyx*h).dist +
                     k.yxy*map(p + k.yxy*h).dist +
                     k.xxx*map(p + k.xxx*h).dist);
}

// NOTE: Apparently sign fails on some systems! Thanks to spalmer for debugging this!
vec3 sgn(vec3 v) // WORKAROUND FOR COMPILER ERROR on some systems
{
    return step(vec3(0), v) * 2.0 - 1.0;
}

result trace(vec3 ro, vec3 rd, float t0, float t1, bool pass) // ray-march sdf handling discontinuities between voxels  (jt)
{
    result h;
    uint i;
    float t;
    for(t = t0, i = 0u; t < t1 && i < ITER_MAX; i++) // finite loop originally suggested by pyBlob to avoid stalling if ray parallel to surface just above EPSILON
    {
        vec3 p = ro + rd * t;
        h = map(p);
        if(h.dist < EPSILON)
            return result(h.color, t);

        // NOTE: An extra step per voxel, use if sdf discontinuous between voxels
        //       Could make this conditional by prefixing sth. like if(voxel_changed) // suggested by spalmer, see variant below
        // constrain step to voxels (voxel-snap ray-march plugin by jt, thanks to Shane for the idea!)
        {
            // NOTE: assuming unit grid
            // sgn(rd)*0.5 are the walls in ray direction, fract(p) - 0.5 is center of voxel
            vec3 sd = (sgn(rd)*0.5 - (fract(p) - 0.5))/rd; // distances to voxel sides / walls
            vec3 n = step(sd.xyz, min(sd.yzx, sd.zxy)); // component true if corresponding wall is nearest (at most one component true) NOTE: originally I used lessThanEqual, min from fb39ca4/kzy then switched to step, min by iq
            float skip = dot(sd, vec3(n)) + EPSILON; // distance to next voxel: sum up all components, weighted by the nearest flag (assuming only one component is true this selects the nearest component)
            h.dist = min(h.dist, skip); // constrain step to at most next block to handle sdf discontinuities between voxels
        }

        t += h.dist;
    }

    return result(h.color, pass ? t1 : t); // pass/stop on running out of iterations
}

// NOTE: Don't forget to add +normal*EPSILON to the starting position
//       to avoid artifacts caused by getting stuck in the surface
//       due to starting at distance < EPSILON from the surface.
//       (normal could be calculated here but that would most likely be redundant)
//       Thanks to spalmer for pointing that out.
float shadow(vec3 ro, vec3 rd, float t0, float t1)
{
    return trace(ro, rd, t0, t1, true/*pass*/).dist < t1 ? 0.0 : 1.0;
}
#ifdef HIGH_QUALITY
// https://iquilezles.org/articles/rmshadows
float softshadow(vec3 ro, in vec3 rd, float t0, float t1, float k)
{
    float res = 1.0;
    float ph = 1e20;
    uint i;
    float t;
    for(t = t0, i = 0u; t < t1 && i < ITER_MAX; i++)
    {
        float h = map(ro + rd*t).dist;
        if( h < EPSILON )
            return 0.0;
        float y = h*h/(2.0*ph);
        float d = sqrt(h*h-y*y);
        res = min( res, k*d/max(0.0,t-y) );
        ph = h;
        t += h;
    }
    return res;
}
#endif
// https://www.shadertoy.com/view/Xds3zN raymarching primitives
float calcAO( in vec3 pos, in vec3 nor )
{
    float occ = 0.0;
    float sca = 1.0;
    for( int i=0; i<5; i++ )
    {
        float h = 0.01 + 0.12*float(i)/4.0;
        float d = map( pos + h*nor ).dist;
        occ += (h-d)*sca;
        sca *= 0.95;
        if( occ>0.35 ) break;
    }
    return clamp( 1.0 - 3.0*occ, 0.0, 1.0 ) ;
}

void mainImage(out vec4 fragColor, vec2 I)
{
    bool demo = all(lessThan(iMouse.xy, vec2(10.0)));
    vec2 R = iResolution.xy;
    I = (2.0 * I - R) / R.y; // concise scaling thanks to Fabrice
    float yaw = 2.0 * pi * float(iMouse.x) / float(R.x);
    float pitch = pi - pi / 2.0 * float(iMouse.y) / float(R.y);
    yaw = !demo ? yaw : 2.0 * pi * fract(iTime * 0.01);
    pitch = !demo ? pitch : pi/5.0 + pi/2.0;

    vec3 ro = vec3(0.0, 0.0,-float(BOUNDS)*2.5);
    vec3 rd = normalize(vec3(I.xy, 2.0));

    mat3 M = yaw_pitch_roll(yaw, pitch, 0.0);
    ro = M * ro;
    rd = M * rd;

    //vec3 sky_color = mix(vec3(0,0.5,0.5),vec3(0,0,1),abs(-rd.z));
    vec3 sky_color = vec3(0);
    vec3 color = vec3(1);
    result r = trace(ro, rd, 0.0, DIST_MAX, false/*stop*/);
    if(r.dist < DIST_MAX)
    {
        color *= r.color;
        vec3 dst = ro + rd * r.dist;
        vec3 n = normal(dst);

        //color *= (n * 0.5 + 0.5);

        vec3 lightdir = normalize(vec3(1.0, 1.0, 1.0));
        vec3 ambient = vec3(0.4);
        float brightness = max(dot(lightdir, n), 0.0);
        if(brightness > 0.0)
            brightness *= shadow(ro + rd * r.dist + n * 0.01, lightdir, 0.0, DIST_MAX);
            //brightness *= softshadow(ro + rd * r.dist + n * 0.01, lightdir, 0.0, DIST_MAX, 20.0); // requires HIGH_QUALITY
        color *= (ambient * calcAO(dst, n) + brightness);

        if(brightness > 0.0)
        {
            float specular = pow(max(0.0, dot(n, normalize(-rd + lightdir))), 250.0);
            color += specular;
        }

        //vec3 fog_color = vec3(0.2);
        vec3 fog_color = sky_color;
        color = mix(fog_color, vec3(color), exp(-pow(r.dist/float(BOUNDS)/2.0, 2.0))); // fog
    }
    else
    {
        color *= sky_color;
    }

    color = tanh(color); // roll-off overly bright colors
    fragColor = vec4(color, 1);
    fragColor = sqrt(fragColor); // approximate gamma
}

#include <../common/main_shadertoy.frag>
