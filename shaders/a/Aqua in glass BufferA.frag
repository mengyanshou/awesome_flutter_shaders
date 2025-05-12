#include <../common/common_header.frag>
#include <Aqua in glass Common.frag>
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
#define RayFactor 2. // total rays is square of this
#define RayCount (RayFactor*RayFactor) // Number of rays per pixel
#define Bounces 12 // Number of bounces per ray
#define Tilesize 2

	// Camera values
#define CameraTarget vec3(0,1.5,0)
#define CameraPosition (vec3(0, 0.2+(iMouse.y*5. / iResolution.y), 3))
#define Zoom 0.9 // Lens zoom
#define Fisheye 0.5 // Use with wider lenses (zoom of 1 or less)
#define Aperture 0.2 // For depth of field
#define BokehShape 0.5 // Changes the bokeh shape between gaussian (1), disk (0.5) and ring (0)

	// The scene can have a main light (a sphere)
#define LightPosition vec3(-10,0,10)
#define LightSize 4.0 // Sphere radius

	// Materials
	// We have to #define these like barbarians because there's no enums in GLSL

#define MatteWhite 0
#define Silver 1
#define Gold 2
#define Glass 3
#define ColorGlass 4
#define MatteGrey 5
#define GlossyBlue 6

// Material definitions:
// MaterialID (0=standard, 1=light, 2=glass)
// The next parameters control material properties, depending on type:
// Standard:
	// baseSmoothness, coatSmoothness, coatOpacity, fresnel, coatSaturation;
// Glass:
	// Roughness, 

const Material materials[] = Material[](Material(0, vec3(1.), 0., 0., 0., 0., 0.), // MatteWhite
Material(0, vec3(1.), .7, 0., 0., 0., 0.), // Silver
Material(0, vec3(1, 0, 0), .8, 0., 0., 0., 0.), // Gold
Material(2, vec3(.2, .2, 1), 0., 0., 0., 0., 0.), // Glass
Material(2, vec3(1, 0, 0), .1, 0., 0., 0., 0.), // ColorGlass
Material(0, vec3(.7), 0., 0., 0., 0., 0.), // MatteGrey
Material(0, vec3(.1, .3, 1), .1, .7, .1, 1., 0.)  // GlossyBlue
);

// *** Lighting *** 

	/// Not used atm, but takes a direct light sample
bool lightSample(in Ray ray, in Intersection hit, in vec3 k, in vec4 i, inout vec3 o) {
		// Get r to random point on light
		//			return 0;
		//	r.dir=lD(r,k);

	ray.dir = LightPosition + (k * 2. - 1.) * LightSize;
	ray.dir = normalize(ray.dir - ray.origin.xyz);

		// Get cosine of r and normal
	float c = dot(ray.dir, hit.result.xyz);

		// Reject if facing away from light
	if(c <= 0.)
		return false;

		// Shiny suRayFactoraces have no falloff with angle
		//	c = mix(c, 1, hit.material.properties.x);
		//	c = pow(c, hit.material.baseSmoothness + 1.);

		// See if the r hs a light souRayCounte (can be any light or the sky)
	hit = intersectScene(ray, k);

	if(hit.material.id == 1) {
			//		C is measuring cosine of light dir and normal, which is right for diffuse only
		o += i.xyz * c * hit.material.color * (hit.material.color / (4. * PI * hit.result.w));
			//		lI(hit.material.color,hit.result.w);
		return true;
	}
	return false;
}

// *** Scene functions

	/// Distance function for the raymarched elements
	/// Returns 2 components, distance and material ID
vec2 df(vec3 p) {
	p.y -= 2.001;
	vec2 d = vec2(3.), e = vec2(4);
	;
	d.x = boxDist(p, vec3(0), vec3(1, 1.9, 1));
	d.x = abs(d.x) - .1;
	d.x = max(d.x, p.y - .9);
	e.x = p.y + (sin(p.x * 4. + sin(p.z * 7.) * .5) + sin(p.z * 7. + sin(p.x * 7.) * .5)) * .1;
	e.x = max(boxDist(p, vec3(0), vec3(.9, 1.8, .9)), e.x) * .7;
	d = d.x < e.x ? d : e;
	return d;
}

void rayMarch(in Ray ray, inout Intersection hit, in vec3 k) {
		// Current position
	vec3 p = ray.origin.xyz;

		// distance field thickness - this clamps the range of p.y (early termination if ray goes out of bounds)
		// and also steps to bounds if the ray is outside
		// TODO: It should be bounding volume based really!
	float dfThickness = 6.;

		// Trace to near plane
	if(abs(p.y) > dfThickness) {
		float distToPlane = (p.y - (dfThickness * sign(p.y))) / -ray.dir.y;
		if(distToPlane < 0.) {
				// Near plane is behind
			return; // ray pointing away from zone
		} else {
				// Near plane is in front
			p += ray.dir * distToPlane;
		}
	}

		// How much to step the ray by. Inverted when ray is inside
	float scale = ray.inside ? -1. : 1.;
		//	scale*=1; // If you need shorter steps (inaccurate distance function) set it here

		// Marching loop
	for(int i = 0; i < 150; i++) {

			// Total distance ray travelled (used for early termination and returning intersection distance)
		float totalDist = length(ray.origin.xyz - p);

			// Early termination if ray travelled further than the last intersection, or if out of bounds
		if(totalDist > hit.result.w || abs(p.y) > dfThickness + Epsilon)
			return;

			// Get the distance (x = dist, y = material ID)
		vec2 dist = df(p);

			// Check if we hit a surface
		if(abs(dist.x) < Epsilon * 0.5) {
				// intersection
				// Get normals
			vec2 e = vec2(Epsilon * .01, 0.);
			vec3 n = normalize(vec3(df(p + e.xyy).x - df(p - e.xyy).x, df(p + e.yxy).x - df(p - e.yxy).x, df(p + e.yyx).x - df(p - e.yyx).x));

				// Flip normals if inside object
			if(ray.inside)
				n = -n;

    #if NANLEVEL>1
			nanCheck(n) {
				n = vec3(0, 1, 0);
			} 
    #endif

				// Set the intersection result
			hit.result = vec4(n, totalDist);

				// Set the material
			hit.material = materials[int(dist.y)];
			return;
		}

			// Step along ray
		p += ray.dir * dist.x * scale;
	}
}

	/// This is where you set up the scene
Intersection intersectScene(inout Ray ray, in vec3 k) {
		// Create a material
	Material mat;

		// Create an intersection result. This is the background, so no intersection needed. The normal is
		// the opposite of the ray dir and distance is 'far away'. Material is undefined, we'll set that later.
	Intersection hit = Intersection(vec4(-ray.dir, MAXFLOAT), mat);

		// Background lighting materials
		//	 hit.material = {1,mix(vec3(1.5,.5,.3), vec3(0,0,1), hit.result.y*hit.result.y)}; // pink / blue
		//	hit.material = {1,abs(hit.result.y)*1.5}; // white with dark horizon
	hit.material = Material(1, vec3(1. - ray.dir.y) + ray.dir.y * vec3(.4, .5, 1.), .0, .0, .0, .0, .0); // Blue sky
			      //	hit.material = {1, mix(mix(vec3(2,.3,.3), vec3(2,.3,0), ray.dir.x*.5+.5),vec3(1), ray.dir.y*.25+.25)}; // orange pink gradient
			      //	hit.material = {1, vec3(2,.3,.3)}; // pink
			      //	hit.material = {1, vec3(2,.3,0)}; // orange
			      //	hit.material = {1,pow(ray.dir.x*.5+.5,4)*4}; // Biased white
			      //	hit.material = {1,pow(max(0., dot(ray.dir, normalize(vec3(1,2,1)))*.5+.5),8)*2+.5}; // Biased white up right
			      //	hit.material = {1, mix(vec3(2,.3,.3), vec3(2,.3,0), ray.dir.x*.5+.5) + pow(max(0., dot(ray.dir, normalize(vec3(1,2,1)))*.5+.5),8)*2}; // orange pink gradient
			      //	hit.material = {1,step(0.5, fract(abs(ray.dir)*5))*2}; // Coloured stripes

    // Add some directional light
	hit.material.color += pow(dot(ray.dir, normalize(vec3(4, 4, 0))), 60.) * 16.;
	hit.material = Material(1, texture(iChannel1, ray.dir).rgb, .0, .0, .0, .0, .0); // Blue sky

    	// Ground
		// set material
	mat = materials[MatteWhite];
	intersectGround(ray, hit, mat);

    	// Can check if the material is ground because the material ID is 0
	if(hit.material.id == 0) {
        // Apply a texture to the material
        //check(ray, hit, 0.5);
		polka(ray, hit, 0.5);
	}

		// Set material to matte grey
	mat = materials[MatteGrey];

		// Intersect a box
	intersectCube(ray, Box(vec3(-6, 0, -3), vec3(-4, 3.5, -1)), hit, mat);

    	// Set material colour to grey (preserving other values)
	mat = materials[GlossyBlue];

		// Intersect a sphere
	intersectSphere(ray, vec4(5, 1.5, -2, 1.5), hit, mat);

    // Set material to gold
	mat = materials[Gold];
	intersectTriangle(ray, Triangle(vec3(0, 0, -2), vec3(3, 4, -2), vec3(-3, 4, -2)), hit, mat);

		// Raymarch (do this last for better performance)
	rayMarch(ray, hit, k);

    #if NANLEVEL>2
	nanCheck(hit.result) {
		hit.result = vec4(0, 1, 0, MAXFLOAT);
	} 
    #endif

	return hit;
}

/// Sets the camera up. uv = screen position, k = random value
Ray setupCamera(Ray ray, vec2 uv, vec3 k) {
		// Basic lens zoom first
	uv /= Zoom;

		// get the ray dir
	vec3 camPos = CameraPosition;
	Rotate(camPos.xz, ((iMouse.x / iResolution.x) * 2. - 1.) * PI);
	ray.dir = CameraTarget - camPos;

		// f = focal length
	float f = length(ray.dir), a;

		// This transforms k into a random point in a sphere
	k = pointOnSphere(k.xy) * pow(k.z, BokehShape);

		// Add random sphere point * aperture to camera position for DoF
	ray.origin.xyz = camPos + k * Aperture;// * length(uv); // Can uncomment this to create soft focus at edges only

		// Update the ray direction, then project back from the camera target to the camera plane
	ray.dir = normalize(CameraTarget - ray.origin.xyz);
	ray.origin.xyz = CameraTarget - ray.dir * f;

		// Transform the camera to account for uv
	a = inversesqrt(1. - ray.dir.y * ray.dir.y);
	mat3x3 c = mat3x3(vec3(-ray.dir.z, 0, ray.dir.x) * a, vec3(-ray.dir.x * ray.dir.y, 1. - ray.dir.y * ray.dir.y, -ray.dir.y * ray.dir.z) * a, -ray.dir);
	a = length(uv);

		// Scaling for fisheye distortion
	f = a * Fisheye;

		// Last bit of uv transform
	ray.dir = normalize(c * mix(vec3(uv, -1), vec3(uv / a * sin(f), -cos(f)), .4));

    #if NANLEVEL>3
	nanCheck(ray.dir) {
		ray.dir = vec3(0, 0, 1);
	} 
    #endif     
    #if NANLEVEL>4
	nanCheck(ray.origin) {
		ray.origin = vec4(0, 0, -10, 0);
	} 
    #endif

	return ray;
}

vec3 traceRay(vec2 uv, float pixelSize, float t, int rayCount, Ray ray) {

	vec3 lightSum = vec3(0), // Light sum, we add lights to this and return it at the end
	k = hash(vec3(uv + t, t)); // initial random value

		// Go through rays
	for(int j = 0; j < rayCount; j++) {
		ray.inside = false; // Set to 1 if the camera is inside a glass object!

			// This gives us 2 values of stratified sampling plus one random value on z
		k.xy = vec2(mod(float(j), RayFactor), floor(float(j) / RayFactor)) / RayFactor + k.xy / RayFactor;

    #if NANLEVEL>5
		nanCheck(k) {
			k = vec3(0.);
		} 
    #endif

			// To save memory and registers, use append the time to the ray origin
		ray.origin.w = t;

			// setup camera, get ray
			// We add a small random value to uv here, this gives us anti-aliasing
		ray = setupCamera(ray, uv + k.xy * pixelSize, k);

			// This stores the ray colouration. If the ray hits a surface, this is multiplied by the surface colour.
			// That stores the light absorbed by each surface the ray intersects
			// If we hit a light, we just multiply the light colour by the ray colouration to get a light value for the whole path
			// The w value stores hue if we do spectral rendering
		vec4 rayColouration = vec4(1, 1, 1, 0);

			// iterate through Bounces
		for(int bounce = 0; bounce < Bounces; bounce++) {
				// intersect and move ray
			Intersection hit = intersectScene(ray, k);

				// If the ray is inside an object, subtract the material colour scaled by the distance the ray just travelled
				// This gives us accurate coloured glass, including when the ray bounces multiple times inside the object
			if(ray.inside) {
				rayColouration.xyz = max(vec3(0), rayColouration.xyz - (hit.material.color * hit.result.w));
			}

    #if NANLEVEL>6
			nanCheck(rayColouration) {
				rayColouration = vec4(1, 0, 1, 1);
			} 
    #endif

				// Move along ray to surface
			ray.origin.xyz += ray.dir * hit.result.w;

    #if NANLEVEL>7
			nanCheck(ray.origin) {
				ray.origin = vec4(0, 0, -10, 0);
			} 
    #endif

				// Apply the material
				// Light
			if(hit.material.id == 1) {
					// Add light and terminate the ray
				lightSum += hit.material.color * rayColouration.xyz;
				break;
			}

				// Glass
			if(hit.material.id == 2) {
				applyGlass(ray, hit, k, rayColouration);
			}

				// Standard material
			if(hit.material.id == 0) {
				applyMaterial(ray, hit, k, rayColouration, lightSum);
			}

				// Early exit if h light or r nearly expired
				// This improves performance in scenes with dark surfaces, as the ray gets terminated if it's too dark
				//			if(all(rayColouration.xyz < .1)) break;

				// Sometimes useful for debug...
				//			if (Bounces >= 2.0) break;
		}

			// New hash value for next ray
		k = hash(k);
	}

	if(any(isnan(lightSum)))
		lightSum = vec3(0);
	return lightSum;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {    
    // Normalized pixel coordinates (from 0 to 1)
	vec2 res = iResolution.xy;
	vec2 uv = fragCoord / res;

    // Stole from yx
    // grab the previous color so we can iteratively render.
	fragColor = texture(iChannel0, uv);

    #if NANLEVEL>8
	nanCheck(fragColor) {
		fragColor = vec4(0, 1, 0, 1);
	} 
    #endif

    // Stolen from yx
    // reset buffer if we're clicking
	bool mouseDown = iMouse.z > 0.;
	if(mouseDown)
		fragColor *= 0.;

	int index = iFrame % (Tilesize * Tilesize);
	int x = iFrame % Tilesize, y = (iFrame / Tilesize) % Tilesize;
	vec2 tileSize = res / float(Tilesize);
	vec2 tileCenter = vec2(x, y) * tileSize + (tileSize / 2.);
	vec2 outsideTile = max(vec2(0.), abs(fragCoord - tileCenter) - (tileSize / 2.));
	if(outsideTile.x + outsideTile.y == 0. || mouseDown) {
		uv = (vec2(fragCoord * 2.) - res) / res.y;

		Ray a;

		vec3 p = traceRay(uv, 4. / res.x, // AA
		iTime, int(RayCount), a);
		p /= RayCount;

//p = pow(p*pow(saturate(2.1-length(uv)),.5) / RayCount, vec3(1. / 2.2));

//if (any(isnan(p))) p = vec3(1,0,1);
//if (any(isinf(p))) p = vec3(0,1,1);
		fragColor += vec4(p, 1.0);
	}

}