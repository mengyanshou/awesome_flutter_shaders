#define NANLEVEL 20

	// Minor values
#define Epsilon 1e-3 // epsilon
#define PI 3.142
#define MAXFLOAT 1e15

	// Useful functions

#define Rotate(p,a) p=cos(a)*p+sin(a)*vec2(-p.y,p.x);
#define saturate(x) clamp(0.,1.,x)
#define nanCheck(x) if(any(isnan(x)))

#define CRYSTAL(f,p,s,a,b,c) p*=s;a=floor(p)/s,b=ceil(p)/s,c=fract(p);s=mix(mix(mix(f(vec3(a.x,a.y,a.z)),f(vec3(b.x,a.y,a.z)),c.x),mix(f(vec3(a.x,b.y,a.z)),f(vec3(b.x,b.y,a.z)),c.x),c.y),mix(mix(f(vec3(a.x,a.y,b.z)),f(vec3(b.x,a.y,b.z)),c.x),mix(f(vec3(a.x,b.y,b.z)),f(vec3(b.x,b.y,b.z)),c.x),c.y),c.z);

struct Ray { // Ray
	vec4 origin;
	vec3 dir;
	bool inside; // Used to indicate ray is inside surface (e.g. glass)
};

struct Box {
	vec3 a, b;
};

struct Triangle {
	vec3 v, a, b;
};

    // id, color, baseSmoothness, coatSmoothness, coatOpacity, fresnel, coatSaturation
struct Material{
	int id; // 0: standard, 1: light, 2: glass
	vec3 color;
		// Standard materials have 2 layers, allowing for e.g. matte base and reflective coat
	float baseSmoothness, coatSmoothness, coatOpacity, fresnel, coatSaturation;
};

	/// Stores the result of an intersection test - normal, distance, material
struct Intersection {
	vec4 result; // Result: xyz = normal, w = dist
	Material material; // Material
			   //	S scene; // S number
};

// *** Prototypes ***

Intersection intersectScene(inout Ray ray, in vec3 k);

// *** Hashing and sampling ***

	/// Basic hash function
vec3 hash(in vec3 p){
	p=fract(p*vec3(443.897,441.423,437.195));
	p+=dot(p,p.yxz+19.19);
	return fract((p.xxy+p.yxx)*p.zyx);
}

	/// Returns a point on a sphere, r is in 0..1 range
vec3 pointOnSphere(in vec2 r) {
	r=vec2(6.283185*r.x,2.*r.y-1.);
	vec3 p = vec3(sqrt(1.+Epsilon-r.y*r.y)*vec2(cos(r.x),sin(r.x)),r.y); // 1.001 required to avoid NaN
          
    #if NANLEVEL>9
    nanCheck(p) {p = vec3(0,1,0);} 
    #endif
    
    return p;
}

	/// Returns a cosine weighted sample
vec3 lambertSample(in vec3 n, in vec2 r) {
	vec3 p = normalize(n*(1.+Epsilon)+pointOnSphere(r)); // 1.001 required to avoid NaN

    #if NANLEVEL>10
    nanCheck(p) {p = vec3(0,1,0);} 
    #endif
    
    return p;
}

// *** Materials

	/// Applies glass, including fresnel reflection
void applyGlass(inout Ray ray, in Intersection hit, in vec3 k, inout vec4 rayColouration){
	
		// Fresnel term
	float fresnel = 1. - max(0., -dot(ray.dir, hit.result.xyz));
	fresnel = pow(fresnel, 2.);
    #if NANLEVEL>11
    if(isnan(fresnel)) {fresnel = 0.;} 
    #endif
	
		// Randomly reflect or refract, probability based on fresnel term
		// If non-fresnel, refract
	if (k.z > fresnel) {
			// refraction
			// Index of refraction
		float ior = ray.inside ? 1.5 : 1./1.5;
		
			// Find refraction angle, accounting for surface roughness
		vec3 rayDir = normalize( // Ray dir must be normalised
					  mix( // Mix between...
					      refract(ray.dir, hit.result.xyz, ior), // the refracted angle
					      lambertSample(-hit.result.xyz, k.xy), // and a random angle projected into the surface
					      hit.material.baseSmoothness // based on how smooth the glass surface is
					      )
					  );
    #if NANLEVEL>12
    nanCheck(rayDir) {rayDir = vec3(0,1,0);} 
    #endif
		
			// Test for total internal reflection
		if(dot(hit.result.xyz, rayDir) < 0.) {
				// Not TIR, we're OK to refract
				// Step through suface along normal
			ray.origin.xyz -= hit.result.xyz * Epsilon * 4.;
			
				// Set the ray direction
			ray.dir=rayDir;
			
				// Flip the inside value as we pass through the surface
			ray.inside=!ray.inside;
    #if NANLEVEL>13
    nanCheck(ray.dir) {ray.dir = vec3(0,1,0);} 
    nanCheck(ray.origin) {ray.origin = vec4(0,0,-10,0);} 
    #endif
			return;
		}
	}
	
		// Ray failed to refract, therefore reflection
		// Step away from the surface along the normal
	ray.origin.xyz+=hit.result.xyz*Epsilon*2.;
	
		// Standard reflection
	ray.dir=reflect(ray.dir,hit.result.xyz);//mix(reflect(ray.dir,hit.result.xyz),lambertSample(hit.result.xyz,k.xy),hit.material.baseSmoothness);

    #if NANLEVEL>14
    nanCheck(ray.dir) {ray.dir = vec3(0,1,0);} 
    #endif
}

	/// This is hacky, I need to rework it, but it works for basic materials for now
void applyMaterial(inout Ray ray, inout Intersection hit, in vec3 k, inout vec4 rayColouration, inout vec3 outputColour){
		// useROI, useMainLight, angular (0=volume)
		// b, cs, o, f, s
		// There's no refraction so step away from suRayFactorace to prevent re-intersection
	ray.origin.xyz+=hit.result.xyz*Epsilon*2.;
	
		// Fresnel value
	float f=1.+dot(ray.dir,hit.result.xyz),c; // 0 head on, 1 at oblique angle
	f*=f*f*hit.material.fresnel; // Fresnel is dependent on the coating
	
		// Add the coat opacity. This means the outer suRayFactorace will be visible, but still respects fresnel
	f+=(hit.material.coatOpacity);
    
    #if NANLEVEL>15
    if(isnan(f)) f = 0.;
    #endif
	
		// Split randomly between coat and base
		//	Should write this without conditionals - coatLayer = 0 | 1, then just change base values to base or coat accordingly
	c=step(k.z,f);
	
		// Colour by m, blended into whe (no colouration) according to coat colouration (allows for coloured reflections)
	rayColouration.xyz*=mix(hit.material.color,mix(vec3(1),hit.material.color,hit.material.coatSaturation),c);
	
		// We'll use base m only, so set that to base or coat
	hit.material.baseSmoothness=pow(mix(hit.material.baseSmoothness,hit.material.coatSmoothness,c),.5);
		//	hit.material.baseSmoothness = 0.0;
		// If there's a main light, sample it
	
		//	lightSample(r,h,k,i,o);
	
	
		// Standard suRayFactorace handling
		// Properties: base roughness, coat roughness, coat opacity, coat fresnel
	
		// Get random direction
	vec3 s=pointOnSphere(k.xy),n=normalize(hit.result.xyz+s*.9*(1.-pow(hit.material.baseSmoothness,.125)));
	ray.dir=normalize(reflect(ray.dir,n)*hit.material.baseSmoothness // mirror
			  +s*pow(k.z+Epsilon,hit.material.baseSmoothness*hit.material.baseSmoothness*10.) // rough
			  );
    #if NANLEVEL>16
    nanCheck(ray.dir) {ray.dir = vec3(0,1,0);} 
    #endif
	
		// If normal points away from r, flip it
	if(dot(ray.dir,hit.result.xyz)<0.)ray.dir=normalize(hit.result.xyz*(1.+Epsilon)+s*pow(k.z+Epsilon,0.25));
    #if NANLEVEL>17
    nanCheck(ray.dir) {ray.dir = vec3(0,1,0);} 
    #endif
	
}

	/// Applies a checkerboard texture to the material
void check(in Ray ray, inout Intersection hit, float s) {
	ray.origin.xyz = ray.origin.xyz + ray.dir * hit.result.w;
	ray.origin.xz = mod(floor(ray.origin.xz * s), 2.0);
	hit.material.color *= floor(mod(ray.origin.x + ray.origin.z, 2.0) * .95 + .05);
}

	/// Applies a polka dot texture to the material
void polka(in Ray ray, inout Intersection hit, float s){
	ray.origin.xyz = ray.origin.xyz + ray.dir * hit.result.w;
	hit.material.color *= step(0.35, length(mod(ray.origin.xz * s, 1.0) - 0.5));
    #if NANLEVEL>18
    nanCheck(hit.material.color) {hit.material.color = vec3(0,1,0);} 
    #endif
}

// *** Ray intersection functions

	/// Ground plane intersection
void intersectGround(in Ray ray, inout Intersection hit, in Material material){
	ray.origin.w = -ray.origin.y / ray.dir.y;
	if(ray.origin.w > 0. && ray.origin.w < hit.result.w){
		hit.result = vec4(0,1,0, ray.origin.w);
		hit.material = material;
	}
}

	/// Sphere intersection
void intersectSphere(in Ray ray, in vec4 sphere, inout Intersection hit, in Material material){
	ray.origin.xyz -= sphere.xyz;
	ray.origin.w = dot(ray.dir.xyz, ray.origin.xyz) * 2.;
	float a = dot(ray.origin.xyz, ray.origin.xyz) - sphere.w * sphere.w;
	a = ray.origin.w * ray.origin.w - 4. * a;
	if (a < 0.) { return; }
	a = sqrt(a);
	vec2 g = (vec2(-a, a) - ray.origin.w) / 2.;
	a = g.x < 0. ? g.y : g.x;
	sphere.w *= sign(g.x);
	if (a> hit.result.w || a < 0.) { return; }
	hit.result = vec4((ray.dir.xyz * a + ray.origin.xyz) / sphere.w, a);
	hit.material = material;
}

	/// Cube intersection
void intersectCube(in Ray r, in Box c, inout Intersection hit, in Material m){
	vec3 a=(c.a-r.origin.xyz)/r.dir, // near
	b=(c.b-r.origin.xyz)/r.dir, // far
	f=max(a,b), // furthest
	n=min(a,b); // nearest
	float x=min(f.x,min(f.y,f.z)), // furthest plane
	d=max(n.x,max(n.y,n.z)), // nearest plane
	o=d<0.?x:d; // nearest in front
	if(isnan(n.x)||d>=x||o>hit.result.w||o<0.)return; // d>=x = invalid, o>t = behind other geometry, o<0 behind
	hit.result.w=o;
	hit.result.xyz=normalize(step(Epsilon,abs(a-hit.result.w))-step(Epsilon,abs(b-hit.result.w)))*sign(d);
	hit.material=m;
}


	/// Intersection test for triangle
void intersectTriangle(in Ray r, in Triangle t, inout Intersection hit, in Material m){
	vec3 p=cross(r.dir,t.b),q,s;
	float e=dot(t.a,p),u,v;
	if(e<Epsilon)return;
	
	float f=1./e;
	
	s=r.origin.xyz-t.v;
	u=dot(s,p)*f;
	float i=step(0.,u)*(1.-step(1.,u));
	
	q=cross(s,t.a);
	v=dot(r.dir,q)*f;
	i*=step(0.,v)*(1.-step(1.,u+v));
	if(i==0.)return;
	
	u=dot(t.b,q)*f;
	
	f=step(0.,-u);
	u=u*(1.-f)+(f*MAXFLOAT);
	if(u>hit.result.w)return;
	p=normalize(cross(t.a,t.b));
	hit = Intersection(vec4(p*sign(e),u),m);
}

// *** Distance functions

	/// Box, origin is o, size is s
float boxDist(vec3 p, vec3 o, vec3 s){
	vec3 q = abs(p-o) - s;
	return length(max(q,0.)) + min(max(q.x,max(q.y,q.z)),0.);
}

	/// Torus
float torus(vec3 p, vec2 t){
	vec2 q = vec2(length(p.xz)-t.x,p.y);
	return length(q)-t.y;
}

vec2 minDF(vec2 a, vec2 b){
    return a.x<b.x ? a : b;
}

float smin(float a, float b, float k) {
    float res = exp2(-k*a) + exp2(-k*b);
    return -log2(res)/k;
}