#include <../common/common_header.frag>
// https://www.shadertoy.com/view/NtXyWr
// Optimisations used:
// Domain reflections to get 5/6 balls for free and 2/3 cylenders for free
// raytraced bounding volumes
// less raymarch steps 
// faster rotations (mat2 instead of mat3)

// Performance is around 10-14 times faster on my laptop, although if you look closely there are a few small artifacts
// Using more raymrach steps would fix this but hurt performance
// Although instead of geeting rif of them completly it would be probably faster to implement 2x SSAA
// For some reason the terahedron normals function seems to be slower in this shader, at least on my laptop

// Also the easy to followness of this tutorial shader is kinda gone because of my modifications

/**
 * Part 6 Challenges:
 * - Make a scene of your own! Try to use the rotation transforms, the CSG primitives,
 *   and the geometric primitives. Remember you can use vector subtraction for translation,
 *   and component-wise vector multiplication for scaling.
 */

const float MIN_DIST = 0.0;
const float MAX_DIST = 100.0;
const float EPSILON = 0.01;

//Rotate around an axis
//Set on the two other components of the vector that you aren't rotating round
//for example x axis rotation
//pos.yz *= rotate(0.1);

mat2 rotate(float a){
    float s = sin(a);
    float c = cos(a);
    return mat2(c,-s,
                s, c);
}

/**
 * Constructive solid geometry intersection operation on SDF-calculated distances.
 */
float intersectSDF(float distA, float distB) {
    return max(distA, distB);
}

/**
 * Constructive solid geometry union operation on SDF-calculated distances.
 */
float unionSDF(float distA, float distB) {
    return min(distA, distB);
}

/**
 * Constructive solid geometry difference operation on SDF-calculated distances.
 */
float differenceSDF(float distA, float distB) {
    return max(distA, -distB);
}

/**
 * Signed distance function for a cube centered at the origin
 * with dimensions specified by size.
 */
float boxSDF(vec3 p, vec3 size) {
    vec3 d = abs(p) - (size / 2.0);
    
    // Assuming p is inside the cube, how far is it from the surface?
    // Result will be negative or zero.
    float insideDistance = min(max(d.x, max(d.y, d.z)), 0.0);
    
    // Assuming p is outside the cube, how far is it from the surface?
    // Result will be positive or zero.
    float outsideDistance = length(max(d, 0.0));
    
    return insideDistance + outsideDistance;
}

/**
 * Signed distance function for a sphere centered at the origin with radius r.
 */
float sphereSDF(vec3 p, float r) {
    return length(p) - r;
}

/**
 * Signed distance function for an XY aligned cylinder centered at the origin with
 * height h and radius r.
 */
float cylinderSDF(vec3 p, float h, float r) {
    // How far inside or outside the cylinder the point is, radially
    float inOutRadius = length(p.xy) - r;
    
    // How far inside or outside the cylinder is, axially aligned with the cylinder
    float inOutHeight = abs(p.z) - h/2.0;
    
    // Assuming p is inside the cylinder, how far is it from the surface?
    // Result will be negative or zero.
    float insideDistance = min(max(inOutRadius, inOutHeight), 0.0);

    // Assuming p is outside the cylinder, how far is it from the surface?
    // Result will be positive or zero.
    float outsideDistance = length(max(vec2(inOutRadius, inOutHeight), 0.0));
    
    return insideDistance + outsideDistance;
}

vec2 boxIntersection( in vec3 ro, in vec3 rd, vec3 boxSize) 
{
    vec3 m = 1.0/rd; // can precompute if traversing a set of aligned boxes
    vec3 n = m*ro;   // can precompute if traversing a set of aligned boxes
    vec3 k = abs(m)*boxSize;
    vec3 t1 = -n - k;
    vec3 t2 = -n + k;
    float tN = max( max( t1.x, t1.y ), t1.z );
    float tF = min( min( t2.x, t2.y ), t2.z );
    if( tN>tF || tF<0.0) return vec2(-1.0); // no intersection
    return vec2( tN, tF );
}
vec2 sphIntersect( in vec3 ro, in vec3 rd, in vec3 ce, float ra )
{
    vec3 oc = ro - ce;
    float b = dot( oc, rd );
    float c = dot( oc, oc ) - ra*ra;
    float h = b*b - c;
    if( h<0.0 ) return vec2(-1.0); // no intersection
    h = sqrt( h );
    return vec2( -b-h, -b+h );
}

/**
 * Signed distance function describing the scene.
 * 
 * Absolute value of the return value indicates the distance to the surface.
 * Sign indicates whether the point is inside or outside the surface,
 * negative indicating inside.
 */
float CubeSDF(vec3 samplePoint) {    
    samplePoint.xz *= rotate(.5 * iTime); 
    vec3 cylinderCoords = samplePoint;
    cylinderCoords = (abs(cylinderCoords))*-1.;
    cylinderCoords.xy = ((cylinderCoords.x - cylinderCoords.y < 0.) ? cylinderCoords.yx : cylinderCoords.xy);  
    cylinderCoords.zy = ((cylinderCoords.z - cylinderCoords.y > 0.) ? cylinderCoords.yz : cylinderCoords.zy);
    float cylinderRadius = 0.4 + (1.0 - 0.4) * (1.0 + sin(1.7 * iTime)) / 2.0;
    float cylinder1 = cylinderSDF(cylinderCoords, 4.0, cylinderRadius);
    
    float cube = boxSDF(samplePoint, vec3(1.8, 1.8, 1.8));
    
    float sphere = sphereSDF(samplePoint, 1.2);
    
    return differenceSDF(intersectSDF(cube, sphere),
                        cylinder1);
    
}

float BallsSDF(vec3 samplePoint){
    samplePoint.xz *= rotate(.5 * iTime); 
    float ballOffset = 0.4 + 1.0 + sin(1.7 * iTime);
    float ballRadius = 0.3;
    vec3 ballCoords = samplePoint;
    ballCoords = (abs(ballCoords) )*-1.;
    ballCoords.xy = ((ballCoords.x - ballCoords.y < 0.) ? ballCoords.yx : ballCoords.xy);  
    ballCoords.zy = ((ballCoords.z - ballCoords.y > 0.) ? ballCoords.yz : ballCoords.zy);
    
    return sphereSDF(ballCoords +vec3(0.,.0,ballOffset), ballRadius);
}
//Basiclly just for the normals
float sceneSDF(vec3 samplePoint){
    return min(BallsSDF(samplePoint), CubeSDF(samplePoint));
}

/**
 * Return the shortest distance from the eyepoint to the scene surface along
 * the marching direction. If no part of the surface is found between start and end,
 * return end.
 * 
 * eye: the eye point, acting as the origin of the ray
 * marchingDirection: the normalized direction to march in
 * start: the starting distance away from the eye
 * end: the max distance away from the ey to march before giving up
 */
float shortestDistanceToCube(vec3 eye, vec3 marchingDirection, float start, float end) {
const int MAX_MARCHING_STEPS = 20;

    float depth = start;
    for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
        float dist = CubeSDF(eye + depth * marchingDirection);
        if (dist < EPSILON) {
			return depth;
        }
        depth += dist;
        if (depth >= end) {
            return end;
        }
    }
    return end;
}

float shortestDistanceToBalls(vec3 eye, vec3 marchingDirection, float start, float end) {
const int MAX_MARCHING_STEPS = 10;

    float depth = start;
    for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
        float dist = BallsSDF(eye + depth * marchingDirection);
        if (dist < EPSILON) {
			return depth;
        }
        depth += dist;
        if (depth >= end) {
            return end;
        }
    }
    return end;
}
            
float intersection(vec3 ro, vec3 rd, float start, float end){
    //Cube
    float cube;
    vec2 CubeBound = boxIntersection(ro, rd, vec3(1.2,.9,1.2)); 
    if(CubeBound.x > -0.1) {
        cube = shortestDistanceToCube(ro, rd, CubeBound.x, CubeBound.y);
        if ( abs(cube - CubeBound.y) < .1)
            cube = 1000.;
     } else
        cube = 1000.;
        
        
    //Balls
    return min(cube, shortestDistanceToBalls(ro, rd,start,end));
}

/**
 * Return the normalized direction to march in from the eye point for a single pixel.
 * 
 * fieldOfView: vertical field of view in degrees
 * size: resolution of the output image
 * fragCoord: the x,y coordinate of the pixel in the output image
 */
vec3 rayDirection(float fieldOfView, vec2 size, vec2 fragCoord) {
    vec2 xy = fragCoord - size / 2.0;
    float z = size.y / tan(radians(fieldOfView) / 2.0);
    return normalize(vec3(xy, -z));
}

/**
 * Using the gradient of the SDF, estimate the normal on the surface at point p.
 */
vec3 estimateNormal(vec3 p) {
    const float e = 0.0001;
    return normalize(vec3(
        sceneSDF(vec3(p.x + e, p.y, p.z)) - sceneSDF(vec3(p.x - e, p.y, p.z)),
        sceneSDF(vec3(p.x, p.y + e, p.z)) - sceneSDF(vec3(p.x, p.y - e, p.z)),
        sceneSDF(vec3(p.x, p.y, p.z  + e)) - sceneSDF(vec3(p.x, p.y, p.z - e))
    ));
}

/**
 * Lighting contribution of a single point light source via Phong illumination.
 * 
 * The vec3 returned is the RGB color of the light's contribution.
 *
 * k_a: Ambient color
 * k_d: Diffuse color
 * k_s: Specular color
 * alpha: Shininess coefficient
 * p: position of point being lit
 * eye: the position of the camera
 * lightPos: the position of the light
 * lightIntensity: color/intensity of the light
 *
 * See https://en.wikipedia.org/wiki/Phong_reflection_model#Description
 */
vec3 phongContribForLight(vec3 k_d, vec3 k_s, float alpha, vec3 p, vec3 eye,
                          vec3 lightPos, vec3 lightIntensity) {
    vec3 N = estimateNormal(p);
    vec3 L = normalize(lightPos - p);
    vec3 V = normalize(eye - p);
    vec3 R = normalize(reflect(-L, N));
    
    float dotLN = dot(L, N);
    float dotRV = dot(R, V);
    
    if (dotLN < 0.0) {
        // Light not visible from this point on the surface
        return vec3(0.0, 0.0, 0.0);
    } 
    
    if (dotRV < 0.0) {
        // Light reflection in opposite direction as viewer, apply only diffuse
        // component
        return lightIntensity * (k_d * dotLN);
    }
    return lightIntensity * (k_d * dotLN + k_s * pow(dotRV, alpha));
}

/**
 * Lighting via Phong illumination.
 * 
 * The vec3 returned is the RGB color of that point after lighting is applied.
 * k_a: Ambient color
 * k_d: Diffuse color
 * k_s: Specular color
 * alpha: Shininess coefficient
 * p: position of point being lit
 * eye: the position of the camera
 *
 * See https://en.wikipedia.org/wiki/Phong_reflection_model#Description
 */
vec3 phongIllumination(vec3 k_a, vec3 k_d, vec3 k_s, float alpha, vec3 p, vec3 eye) {
    const vec3 ambientLight = 0.5 * vec3(1.0, 1.0, 1.0);
    vec3 color = ambientLight * k_a;
    
    vec3 light1Pos = vec3(4.0 * sin(iTime),
                          2.0,
                          4.0 * cos(iTime));
    vec3 light1Intensity = vec3(0.4, 0.4, 0.4);
    
    color += phongContribForLight(k_d, k_s, alpha, p, eye,
                                  light1Pos,
                                  light1Intensity);
    
    vec3 light2Pos = vec3(2.0 * sin(0.37 * iTime),
                          2.0 * cos(0.37 * iTime),
                          2.0);
    vec3 light2Intensity = vec3(0.4, 0.4, 0.4);
    
    color += phongContribForLight(k_d, k_s, alpha, p, eye,
                                  light2Pos,
                                  light2Intensity);    
    return color;
}

/**
 * Return a transform matrix that will transform a ray from view space
 * to world coordinates, given the eye point, the camera target, and an up vector.
 *
 * This assumes that the center of the camera is aligned with the negative z axis in
 * view space when calculating the ray marching direction. See rayDirection.
 */
mat3 viewMatrix(vec3 eye, vec3 center, vec3 up) {
    // Based on gluLookAt man page
    vec3 f = normalize(center - eye);
    vec3 s = normalize(cross(f, up));
    vec3 u = cross(s, f);
    return mat3(s, u, -f);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec3 viewDir = rayDirection(45.0, iResolution.xy, fragCoord);
    vec3 eye = vec3(8.0, 5.0 * sin(0.2 * iTime), 7.0);
    
    mat3 viewToWorld = viewMatrix(eye, vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));
    
    vec3 worldDir = viewToWorld * viewDir;
    float dist;
    vec2 boundingSphere = sphIntersect(eye, worldDir, vec3(0), max(1.2,1.7 + sin(1.7 * iTime)) );
    if (boundingSphere.x > -0.1){//no intersection
        dist = intersection(eye, worldDir, boundingSphere.x, boundingSphere.y);
        if (abs(dist - boundingSphere.y) < 0.0001)
            dist = 1000.;
    } else {
        dist = 1000.;
    }
    if (dist > 320.) {
        // Didn't hit anything
        fragColor = vec4(0.0, 0.0, 0.0, 0.0);
		return;
    }
    
    // The closest point on the surface to the eyepoint along the view ray
    vec3 p = eye + dist * worldDir;
    
    vec3 nor = estimateNormal(p);
    // Use the surface normal as the ambient color of the material
    vec3 K_a = (nor + vec3(1.0)) / 2.0;
    vec3 K_d = K_a;
    vec3 K_s = vec3(1.0, 1.0, 1.0);
    float shininess = 10.0;
    
    vec3 color = phongIllumination(K_a, K_d, K_s, shininess, p, eye);
    
    fragColor = vec4(color, 1.0);
    
}

#include <../common/main_shadertoy.frag>