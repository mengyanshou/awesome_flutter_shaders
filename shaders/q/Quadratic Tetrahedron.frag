// The MIT License
// Copyright © 2024 Nate Morrical
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// More point containment queries here: https://www.shadertoy.com/playlist/fXdfzX
#include <../common/common_header.frag>
#if HW_PERFORMANCE==0
#define NEWTON_ITERATIONS 2
#define NUM_STEPS 8
#else
#define NEWTON_ITERATIONS 2
#define NUM_STEPS 32    
#endif

#define CONVERGED_ERROR 1e-3
#define DIVERGED_ERROR 1e6

#define EXPOSURE 2.0

uniform sampler2D iChannel0;
// This function interpolates a "cannonical" quadratic tetrahedron, where:
//  - v0 is at (r,s,t) = (0,0,0)   
//  - v1 is at (r,s,t) = (1,0,0)  
//  - v2 is at (r,s,t) = (0,1,0)   
//  - v3 is at (r,s,t) = (0,0,1) 
//  - v4 is at (r,s,t) = (.5,.0,.0)  -> midpoint between 0 and 1
//  - v5 is at (r,s,t) = (.5,.5,.0)  -> midpoint between 1 and 2
//  - v6 is at (r,s,t) = (.0,.5,.5)  -> midpoint between 0 and 2
//  - v7 is at (r,s,t) = (.0,.0,.5)  -> midpoint between 0 and 3
//  - v8 is at (r,s,t) = (.5,.0,.5)  -> midpoint between 1 and 3
//  - v9 is at (r,s,t) = (.0,.5,.5)  -> midpoint between 2 and 3
// The returned values are the evaluated "shape functions" for each node, 
// which sum to 1. Think of these as generalized barycentrics, but that 
// account for the higher order interpolation due to the quadratic edges.
void quadraticTetrahedronInterpolationFunctions(
    vec3 rst,
    out float w0,
    out float w1,
    out float w2,
    out float w3,
    out float w4,
    out float w5,
    out float w6,
    out float w7,
    out float w8,
    out float w9
) {
    float r = rst.x;
    float s = rst.y;
    float t = rst.z;

    float u = 1.0 - r - s - t;
    w0 = u * (2.0 * u - 1.0);
    w1 = r * (2.0 * r - 1.0);
    w2 = s * (2.0 * s - 1.0);
    w3 = t * (2.0 * t - 1.0);

    w4 = 4.0 * u * r;
    w5 = 4.0 * r * s;
    w6 = 4.0 * s * u;
    w7 = 4.0 * u * t;
    w8 = 4.0 * r * t;
    w9 = 4.0 * s * t;
}

// Computes a jacobian relating the output "shape functions" at each vertex of the quadratic tetrahedron 
// with respect to the input coordinates "p.r", "p.s", and "p.t" in the cannonical quadratic tetrahedron space.
void quadraticTetrahedonInterpolationDerivs(
    vec3 rst,
    out vec3 dw0,
    out vec3 dw1,
    out vec3 dw2,
    out vec3 dw3,
    out vec3 dw4,
    out vec3 dw5,
    out vec3 dw6,
    out vec3 dw7,
    out vec3 dw8,
    out vec3 dw9
) {
    float r = rst.x;
    float s = rst.y;
    float t = rst.z;

    // r-derivatives: dW0/dr to dW9/dr
    dw0[0] = 4.0 * (r + s + t) - 3.0;
    dw1[0] = 4.0 * r - 1.0;
    dw2[0] = 0.0;
    dw3[0] = 0.0;
    dw4[0] = 4.0 - 8.0 * r - 4.0 * s - 4.0 * t;
    dw5[0] = 4.0 * s;
    dw6[0] = -4.0 * s;
    dw7[0] = -4.0 * t;
    dw8[0] = 4.0 * t;
    dw9[0] = 0.0;

    // s-derivatives: dW0/ds to dW9/ds
    dw0[1] = 4.0 * (r + s + t) - 3.0;
    dw1[1] = 0.0;
    dw2[1] = 4.0 * s - 1.0;
    dw3[1] = 0.0;
    dw4[1] = -4.0 * r;
    dw5[1] = 4.0 * r;
    dw6[1] = 4.0 - 4.0 * r - 8.0 * s - 4.0 * t;
    dw7[1] = -4.0 * t;
    dw8[1] = 0.0;
    dw9[1] = 4.0 * t;

    // t-derivatives: dW0/dt to dW9/dt
    dw0[2] = 4.0 * (r + s + t) - 3.0;
    dw1[2] = 0.0;
    dw2[2] = 0.0;
    dw3[2] = 4.0 * t - 1.0;
    dw4[2] = -4.0 * r;
    dw5[2] = 0.0;
    dw6[2] = -4.0 * s;
    dw7[2] = 4.0 - 4.0 * r - 4.0 * s - 8.0 * t;
    dw8[2] = 4.0 * r;
    dw9[2] = 4.0 * s;
}

// Function which interpolates the vertices of a quadratic tetrahedron.
// Returns true if the point is inside the element, and false otherwise.
// Shape function weights are returned in the "w" components of the corresponding vertices.
bool interpolateQuadraticTetrahedron(
    vec3 P,
    inout vec4 V0,
    inout vec4 V1,
    inout vec4 V2,
    inout vec4 V3,
    inout vec4 V4,
    inout vec4 V5,
    inout vec4 V6,
    inout vec4 V7,
    inout vec4 V8,
    inout vec4 V9
) {

    // Initialize our canonical coordinates to be in the center of the element
    // We'll iteratively refine these with Newton's method to match the given "P"
    vec3 pc_curr = vec3(0.25, 0.25, 0.25);
    vec3 pc = vec3(0.25, 0.25, 0.25);

    // Iteration for Newton's method
    bool converged = false;
    for(int iteration = 0; iteration < NEWTON_ITERATIONS; iteration++) {
        // Compute the currently optimized position in the canonical element
        float sf0, sf1, sf2, sf3, sf4, sf5, sf6, sf7, sf8, sf9;
        quadraticTetrahedronInterpolationFunctions(pc, sf0, sf1, sf2, sf3, sf4, sf5, sf6, sf7, sf8, sf9);
        vec3 fcol = V0.xyz * sf0 + V1.xyz * sf1 + V2.xyz * sf2 + V3.xyz * sf3 + V4.xyz * sf4 + V5.xyz * sf5 + V6.xyz * sf6 + V7.xyz * sf7 + V8.xyz * sf8 + V9.xyz * sf9;
        fcol -= P; // Making P be the origin

        // Now compute Jacobian, which transforms change in pc to change in shape functions
        vec3 dV0, dV1, dV2, dV3, dV4, dV5, dV6, dV7, dV8, dV9;
        quadraticTetrahedonInterpolationDerivs(pc, dV0, dV1, dV2, dV3, dV4, dV5, dV6, dV7, dV8, dV9);

        // Now get derivatives in world space
        vec3 rcol = V0.xyz * dV0.x + V1.xyz * dV1.x + V2.xyz * dV2.x + V3.xyz * dV3.x + V4.xyz * dV4.x + V5.xyz * dV5.x + V6.xyz * dV6.x + V7.xyz * dV7.x + V8.xyz * dV8.x + V9.xyz * dV9.x;
        vec3 scol = V0.xyz * dV0.y + V1.xyz * dV1.y + V2.xyz * dV2.y + V3.xyz * dV3.y + V4.xyz * dV4.y + V5.xyz * dV5.y + V6.xyz * dV6.y + V7.xyz * dV7.y + V8.xyz * dV8.y + V9.xyz * dV9.y;
        vec3 tcol = V0.xyz * dV0.z + V1.xyz * dV1.z + V2.xyz * dV2.z + V3.xyz * dV3.z + V4.xyz * dV4.z + V5.xyz * dV5.z + V6.xyz * dV6.z + V7.xyz * dV7.z + V8.xyz * dV8.z + V9.xyz * dV9.z;

        // The above should be our 3X3 jacobian.

        // Compute determinants and generate improvements
        float d = determinant(mat3(rcol, scol, tcol));
        if(abs(d) < 1e-20) {
            return false; // Determinant too small, likely singular
        }
        // Newton Raphson update formula, x_new = x_old - f(x) / f'(x), but generalized to 
        // multiple dimensions. fcol has principle values, while other two contain gradients, 
        // so the ratio effectively calculates changes needed using Cramer's rule.
        pc.x = pc_curr.x - (determinant(mat3(fcol, scol, tcol)) / d);
        pc.y = pc_curr.y - (determinant(mat3(rcol, fcol, tcol)) / d);
        pc.z = pc_curr.z - (determinant(mat3(rcol, scol, fcol)) / d);

        // Check for convergence
        if(all(lessThan(abs(pc - pc_curr), vec3(CONVERGED_ERROR)))) {
            converged = true;
            break;
        } else if(any(greaterThan(abs(pc), vec3(DIVERGED_ERROR)))) {
            return false;
        } else {
            pc_curr = pc; // Commit the updated canonical coordinates
        }
    }

    // Check for containment
    float lowerlimit = 0.0 - CONVERGED_ERROR;
    float upperlimit = 1.0 + CONVERGED_ERROR;
    if(any(lessThan(pc_curr, vec3(lowerlimit))) || any(greaterThan(pc_curr, vec3(upperlimit))))
        return false;
    // Special containment test for quadratic tetrahedron in cannonical rst space
    if(pc_curr[0] + pc_curr[1] + pc_curr[2] >= 1.001)
        return false;

    quadraticTetrahedronInterpolationFunctions(pc_curr, V0.w, V1.w, V2.w, V3.w, V4.w, V5.w, V6.w, V7.w, V8.w, V9.w);
    return true;
}

//-----------------------------------------------------------------------------
// Utils
//-----------------------------------------------------------------------------

vec3 viridis(float t) {

    t = clamp(t, 0.0, 1.0);

    const vec3 c0 = vec3(0.2777273272234177, 0.005407344544966578, 0.3340998053353061);
    const vec3 c1 = vec3(0.1050930431085774, 1.404613529898575, 1.384590162594685);
    const vec3 c2 = vec3(-0.3308618287255563, 0.214847559468213, 0.09509516302823659);
    const vec3 c3 = vec3(-4.634230498983486, -5.799100973351585, -19.33244095627987);
    const vec3 c4 = vec3(6.228269936347081, 14.17993336680509, 56.69055260068105);
    const vec3 c5 = vec3(4.776384997670288, -13.74514537774601, -65.35303263337234);
    const vec3 c6 = vec3(-5.435455855934631, 4.645852612178535, 26.3124352495832);

    vec3 srgb = c0 + t * (c1 + t * (c2 + t * (c3 + t * (c4 + t * (c5 + t * c6)))));
    return pow(srgb, vec3(2.2));

}

vec4 over(vec4 a, vec4 b) {
    vec4 result;
    result.a = a.a + b.a * (1. - a.a);
    if(result.a == 0.)
        return a; // avoid NaN
    result.rgb = (a.rgb * a.a + b.rgb * b.a * (1. - a.a)) / result.a;
    return result;
}

#define M_2PI 6.2831853071795865f
#define M_GRC 0.61803398875f

// Vertex positions for the element
const float angle_offset = M_2PI / 4.0;

//-----------------------------------------------------------------------------
// Main functions
//-----------------------------------------------------------------------------
vec4 query(vec3 p) {
    float time = iTime * 4.;

    // Corner vertices
    vec4 v0 = vec4(cos((1.0 / 3.0) * M_2PI), -.75, sin((1.0 / 3.0) * M_2PI), 0.0);
    vec4 v1 = vec4(cos((2.0 / 3.0) * M_2PI), -.75, sin((2.0 / 3.0) * M_2PI), 0.0);
    vec4 v2 = vec4(cos((3.0 / 3.0) * M_2PI), -.75, sin((3.0 / 3.0) * M_2PI), 0.0);
    vec4 v3 = vec4(0.0, .75, 0.0, 0.0);

    vec4 cen = (v0 + v1 + v2 + v3) / 4.0;

    // Edge vertices
    vec4 v4 = vec4((v0 + v1).xyz * .5, 0.0); // -> midpoint between 0 and 1
    vec4 v5 = vec4((v1 + v2).xyz * .5, 0.0); // -> midpoint between 1 and 2
    vec4 v6 = vec4((v0 + v2).xyz * .5, 0.0); // -> midpoint between 0 and 2
    vec4 v7 = vec4((v0 + v3).xyz * .5, 0.0); // -> midpoint between 0 and 3
    vec4 v8 = vec4((v1 + v3).xyz * .5, 0.0); // -> midpoint between 1 and 3
    vec4 v9 = vec4((v2 + v3).xyz * .5, 0.0); // -> midpoint between 2 and 3

    // Make the edge vertices wiggle
    v4 = v4 + .2 * normalize(v4 - cen) * cos(time * .1);
    v5 = v5 + .2 * normalize(v5 - cen) * cos(time * .2);
    v6 = v6 + .2 * normalize(v6 - cen) * cos(time * .3);
    v7 = v7 + .2 * normalize(v7 - cen) * cos(time * .4);
    v8 = v8 + .2 * normalize(v8 - cen) * cos(time * .5);
    v9 = v9 + .2 * normalize(v9 - cen) * cos(time * .6);

    if(!interpolateQuadraticTetrahedron(p, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9))
        return vec4(0.0);

    // data values weighted by barycentrics

    float val0 = (.5 + .5 * cos(time * 0.1)) * v0.w;
    float val1 = (.5 + .5 * cos(time * 0.2)) * v1.w;
    float val2 = (.5 + .5 * cos(time * 0.3)) * v2.w;
    float val3 = (.5 + .5 * cos(time * 0.4)) * v3.w;
    float val4 = (.5 + .5 * cos(time * 0.5)) * v4.w;
    float val5 = (.5 + .5 * cos(time * 0.6)) * v5.w;
    float val6 = (.5 + .5 * cos(time * 0.7)) * v6.w;
    float val7 = (.5 + .5 * cos(time * 0.8)) * v7.w;
    float val8 = (.5 + .5 * cos(time * 0.9)) * v8.w;
    float val9 = (.5 + .5 * cos(time * 1.0)) * v9.w;
    float val = val0 + val1 + val2 + val3 + val4 + val5 + val6 + val7 + val8 + val9;

    // Colormapped value and a hardcoded optical density
    return vec4(viridis(val) * EXPOSURE, 2.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 q = fragCoord.xy / iResolution.xy;
    vec2 v = -1.0 + 2.0 * q;
    v.x *= iResolution.x / iResolution.y;

    float an = 0.25 * iTime + 6.283185 * iMouse.x / iResolution.x;
    vec3 ro = vec3(3.5 * cos(an), 0.7, 3.5 * sin(an));
    vec3 ta = vec3(0.0, -0.1, 0.0);

    // camera matrix
    vec3 ww = normalize(ta - ro);
    vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
    vec3 vv = normalize(cross(uu, ww));

    // create view ray
    vec3 rd = normalize(v.x * uu + v.y * vv + 3.0 * ww);

    vec4 color = vec4(.0);

    float startRayOffset = 0.0;
    int frame = 1;

    // blue noise
    startRayOffset = texture(iChannel0, fragCoord / 1024.0).r;
    startRayOffset = fract(startRayOffset + float(frame) * M_GRC);

    float zMin = 2.0;
    float zMax = 5.0;
    float step = (zMax - zMin) / float(NUM_STEPS);
    vec3 p = ro + rd * zMin + rd * step * startRayOffset;
    for(int i = 0; i < NUM_STEPS; i++) {
        vec4 rgbd = query(p);
        float density = rgbd[3];
        float rho = 1.0 - exp(-density * step);
        color = over(color, vec4(rgbd.xyz, rho));
        if(color.a > .95)
            break;
        p += rd * step;
    }

    // Composite over a background
    color = over(color, vec4(vec3(0.01) * (1.0 - 0.2 * length(v)), 1.0));

    color.rgb = pow(color.rgb, vec3(1.0 / 2.2));

    // cheap dithering
    color.rgb += sin(fragCoord.x * 114.0) * sin(fragCoord.y * 211.1) / 512.0;

    fragColor = color;

}
#include <../common/main_shadertoy.frag>