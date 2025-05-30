// https://www.shadertoy.com/view/MslGRn
#include <../common/common_header.frag>
////////////////////////////////////////////////////////////////////////////////////////
// INFO:
// - use the mouse to navigate (x is rotation, y is zoom)
// - play with the defines below to change the visuals
////////////////////////////////////////////////////////////////////////////////////////

// the more slices the slower
#define SLICES 			50.0
// start amplitude for the noise
#define START_AMPLITUDE	0.01
// start frequency for the noise
#define START_FREQUENCY	1.25
// start density value
#define START_DENSITY	0.0
// animation speed
#define ANIMATION_SPEED 0.075

////////////////////////////////////////////////////////////////////////////////////////
// iq's 3d noise functions from the elevated shader (incl. modifications where needed)
////////////////////////////////////////////////////////////////////////////////////////

// rotation matrix for fbm octaves
mat3 m = mat3(0.00, 0.80, 0.60, -0.80, 0.36, -0.48, -0.60, -0.48, 0.64);

float hash(float n) {
    return fract(sin(n) * 43758.5453123);
}

// 3d noise function
float noise(in vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    float n = p.x + p.y * 57.0 + 113.0 * p.z;
    float res = mix(mix(mix(hash(n + 0.0), hash(n + 1.0), f.x), mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y), mix(mix(hash(n + 113.0), hash(n + 114.0), f.x), mix(hash(n + 170.0), hash(n + 171.0), f.x), f.y), f.z);
    return res;
}

// fbm noise for 2-4 octaves including rotation per octave
float fbm(vec3 p) {
    float f = 0.0;
    f += 0.5000 * noise(p);
    p = m * p * 2.02;
    f += 0.2500 * noise(p); 
// set to 1 for 2 octaves	
#if 0	
    return f / 0.75;
#else	
    p = m * p * 2.03;
    f += 0.1250 * noise(p);
// set to 1 for 3 octaves, 0 for 4 octaves	
#if 1	
    return f / 0.875;
#else	
    p = m * p * 2.01;
    f += 0.0625 * noise(p);
    return f / 0.9375;
#endif	
#endif	
}

////////////////////////////////////////////////////////////////////////////////////////

// color gradient
vec3 gradient(float s) {
    return vec3(0.0, max(1.0 - s * 2.0, 0.0), max(s > 0.5 ? 1.0 - (s - 0.5) * 5.0 : 1.0, 0.0));
}

// intersection for a sphere with a ray
#define RADIUS 0.5
bool intersectSphere(vec3 origin, vec3 direction, out float tmin, out float tmax) {
    bool hit = false;
    float a = dot(direction, direction);
    float b = 2.0 * dot(origin, direction);
    float c = dot(origin, origin) - 0.5 * 0.5;
    float disc = b * b - 4.0 * a * c;           // discriminant
    tmin = tmax = 0.0;

    if(disc > 0.0) {
        // Real root of disc, so intersection
        float sdisc = sqrt(disc);
        float t0 = (-b - sdisc) / (2.0 * a);          // closest intersection distance
        float t1 = (-b + sdisc) / (2.0 * a);          // furthest intersection distance

        tmax = t1;
        if(t0 >= 0.0)
            tmin = t0;
        hit = true;
    }

    return hit;
}

// rotate around axis
vec2 rt(vec2 x, float y) {
    return vec2(cos(y) * x.x - sin(y) * x.y, sin(y) * x.x + cos(y) * x.y);
}

// shader main function
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
	// normalized and aspect ratio corrected pixel coordinate
    vec2 p = (fragCoord.xy / iResolution.xy) * 2.0 - 1.0;
    p.x *= iResolution.x / iResolution.y;

	// camera and user input
    vec3 oo = vec3(0, 0, 1.0 - iMouse.y / iResolution.y);
    vec3 od = normalize(vec3(p.x, p.y, -2.0));
    vec3 o, d;
    o.xz = rt(oo.xz, 6.3 * iMouse.x / iResolution.x);
    o.y = oo.y;
    d.xz = rt(od.xz, 6.3 * iMouse.x / iResolution.x);
    d.y = od.y;

	// render
    vec4 col = vec4(0, 0, 0, 0);
    float tmin, tmax;
    if(intersectSphere(o, d, tmin, tmax)) {	
		// step thoug the sphere with max SLICES steps
        for(float i = 0.0; i < SLICES; i += 1.0) {
			// stay within the sphere bounds
            float t = tmin + i / SLICES;
            if(t > tmax)
                break;
            vec3 curpos = o + d * t;

			// get sphere falloff in s
            float s = (0.5 - length(curpos)) * 2.0;
            s *= s;

			// get turbulence in d
            float a = START_AMPLITUDE;
            float b = START_FREQUENCY;
            float d = START_DENSITY;
            for(int j = 0; j < 3; j++) {
                d += 0.5 / abs((fbm(5.0 * curpos * b + ANIMATION_SPEED * iTime / b) * 2.0 - 1.0) / a);
                b *= 2.0;
                a /= 2.0;
            }

			// get gradient color depending on s
            col.rgb += gradient(s) * max(d * s, 0.0);
        }
    }

    fragColor = col;
}

#include <../common/main_shadertoy.frag>