// --- Migrate Log ---
// 添加 Flutter 兼容性 includes，修复 ZERO 宏定义为 int(min(iFrame, 0.0))
// Added Flutter compatibility includes, fixed ZERO macro to int(min(iFrame, 0.0))

#include <../common/common_header.frag>

// https://www.shadertoy.com/view/XlXGzB - sky
// https://www.shadertoy.com/view/MdXyzX - water

#if HW_PERFORMANCE == 0
#define AA 1
#else
#define AA 0   // make this 2 or 3 for antialiasing
#endif
#define ZERO int(min(iFrame, 0.0))
#define PI 3.14159265358979323846

// General Parameters
const float CameraHeight = 1.5;
const float FOV = 60.0;
const bool SunAnimation = false;
const bool BobberAnimation = true;

// Wave Parameters
const float BeckmanSpecular = 0.98;   // Higher values tighten the specular range.
const float FresnelFactor = 8.0;
const float WaterDepth = 1.0;
const float DragMultiplier = 0.38; // Changes how much waves pull on the water.
const int RaymarchSteps = 32;
const int RaymarchNormalSteps = 32;


// Atmosphere Parameters
const int AtmosphereViewSteps = 64; 
const int AtmosphereLightSteps = 32;
const float SunLightPower = 25.0; // sun light power, 10.0 is normal
const float SunIntensity = 8.0; // sun intensity for sun
const float G = 0.98; // Light concentration for HG phase function - lower for hazier/dispersed effect
const float Haze = 0.1;

// Atmosphere Constants
const float PlanetRadius = 6360e3; // Planet radius 6360e3 actual 6371km
const float AtmosphereRadius = 6380e3; // Atmosphere radius 6380e3 troposphere 8 to 14.5km
const vec3 PlanetCenter = vec3(0.0, -PlanetRadius, 0.0);
const float Hr = 8e3;   // Rayleigh scattering top //8e3
const float Hm = 1.3e3; // Mie scattering top //1.3e3

// -------------------- Helpers ---------------------
float sphere_intersect(in vec3 p, in vec3 d, in float R) 
{
	vec3 v = p - PlanetCenter;
	float b = dot(v, d);
	float c = dot(v, v) - R*R;
	float det2 = b * b - c;
	if (det2 < 0.) return -1.;
	float det = sqrt(det2);
	float t1 = -b - det, t2 = -b + det;
	return (t1 >= 0.) ? t1 : t2;
}


float plane_intersect(vec3 origin, vec3 direction, vec3 point, vec3 normal) 
{ 
    return clamp(dot(point - origin, normal) / dot(direction, normal), -1.0, 999999.0); 
}


mat3 rotate_angle_axis(vec3 axis, float angle) 
{
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;
  return mat3(
    oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s, 
    oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c, oc * axis.y * axis.z - axis.x * s, 
    oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c
  );
}
// -------------------- Helpers ---------------------


// -------------------- PostFX ----------------------
vec3 aces_tonemap(vec3 color) 
{  
    mat3 m1 = mat3(
        0.59719, 0.07600, 0.02840,
        0.35458, 0.90834, 0.13383,
        0.04823, 0.01566, 0.83777
    );
    mat3 m2 = mat3(
        1.60475, -0.10208, -0.00327,
        -0.53108,  1.10813, -0.07276,
        -0.07367, -0.00605,  1.07602
    );
    vec3 v = m1 * color;  
    vec3 a = v * (v + 0.0245786) - 0.000090537;
    vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081;
    return pow(clamp(m2 * (a / b), 0.0, 1.0), vec3(1.0 / 2.2));  
}
// -------------------- PostFX ----------------------


// -------------------- Atmosphere ---------------------
void calculate_particle_densities(in vec3 pos, out float rayleigh, out float mie) 
{
	float h = length(pos - PlanetCenter) - PlanetRadius;
	rayleigh =  exp(-h/Hr);
	mie = exp(-h/Hm) + Haze;
}

void scatter(vec3 ro, vec3 rd, vec3 lp, out vec3 col, out vec3 scat, in float t) 
{
    vec3 mie_constant = vec3(21e-6); // Standard Mie distribution 
    vec3 rayleigh_constant = vec3(5.8e-6, 13.5e-6, 33.1e-6); // Standard Rayleigh distribution

	float L = sphere_intersect(ro, rd, AtmosphereRadius);	
	float mu = dot(rd, lp);
	float opmu2 = 1.0 + mu * mu;
	float rayleigh_phase = 0.0596831 * opmu2;
    
    // HG phase functions for Mie scattering
    const float g2 = G * G;
    const float s = 0.999;
	float mie_phase = 0.1193662 * (1.0 - g2) * opmu2 / ((2.0 + g2) * pow(1.0 + g2 - 2.0 * G * mu, 1.5));
    float sun_phase = 0.1193662 * (1.0 - s) * opmu2 / ((2.0 + s) * pow(1.0 + s - 2.0 * s * mu, 1.5));
	
    // Optical depth for mie and rayleigh particles
	float depth_rayleigh = 0.0, depth_mie = 0.0;
    
    // Rayleigh and Mie scattering distributions
	vec3 R = vec3(0.0), M = vec3(0.0);
	
	float view_step_size = L / float(AtmosphereViewSteps);
	for (int i = 0; i < AtmosphereViewSteps; ++i) 
    {
		float l = float(i) * view_step_size;
		vec3 sample_p_view = (ro + rd * l);

		float density_rayleigh, density_mie;
        
		calculate_particle_densities(sample_p_view, density_rayleigh, density_mie);
        
		density_rayleigh *= view_step_size; 
        density_mie *= view_step_size;
        
		depth_rayleigh += density_rayleigh;
		depth_mie += density_mie;

		float to_light_isect = sphere_intersect(sample_p_view, lp, AtmosphereRadius);
		if (to_light_isect > 0.0) 
        {
			float light_step_size = to_light_isect / float(AtmosphereLightSteps);
			float depth_rayleigh_light = 0.0, depth_mie_light = 0.0;
            
			for (int j = 0; j < AtmosphereLightSteps; ++j) 
            {
				float ls = float(j) * light_step_size;
				vec3 sample_p_light = sample_p_view + lp * ls;
                
				float density_rayleigh_light, density_mie_light;
				calculate_particle_densities(sample_p_light, density_rayleigh_light, density_mie_light);
                
				depth_rayleigh_light += density_rayleigh_light * light_step_size;
				depth_mie_light += density_mie_light * light_step_size;
			}

			vec3 absorption = exp(-(rayleigh_constant * (depth_rayleigh_light + depth_rayleigh) + mie_constant * (depth_mie_light + depth_mie)));
			R += absorption * density_rayleigh;
			M += absorption * density_mie;
		} 
	}

    col = SunLightPower * M * mie_constant * mie_phase;            // Mie scattering
    col += SunLightPower * R * rayleigh_constant * rayleigh_phase; // Rayleigh scattering

    col += SunIntensity * M * mie_constant * sun_phase;            // Sun
    scat = 0.01 * mie_constant * depth_mie;
}
// -------------------- Atmosphere ---------------------


// -------------------- Waves ---------------------
vec2 wave_dx(vec2 position, vec2 direction, float frequency, float timeshift) 
{
// Calculates wave value and its derivative, for the wave direction, position in space, wave frequency and time

  float x = dot(direction, position) * frequency + timeshift;
  float wave = exp(sin(x) - 1.0);
  float dx = wave * cos(x);
  return vec2(wave, -dx);
}

// Calculates waves by summing octaves of various waves with various parameters
float calculate_wave_at_p(vec2 position, int iterations) 
{
  float iter = 0.0; // this will help generating well distributed wave directions
  float frequency = 1.0; // frequency of the wave, this will change every iteration
  float time_mult = 2.0; // time multiplier for the wave, this will change every iteration
  float weight = 1.0;// weight in final sum for the wave, this will change every iteration
  float sum_of_values = 0.0; // will store final sum of values
  float sum_of_weights = 0.0; // will store final sum of weights
  
  for(int i=0; i < iterations; i++) 
  {
    vec2 p = vec2(sin(iter), cos(iter));
    vec2 wave_data = wave_dx(position, p, frequency, iTime * time_mult);

    // Shift position around according to wave drag and derivative of the wave
    position += p * wave_data.y * weight * DragMultiplier;

    sum_of_values += wave_data.x * weight;
    sum_of_weights += weight;

    // Modify next octave
    weight = mix(weight, 0.0, 0.2);
    frequency *= 1.18;
    time_mult *= 1.07;

    // Add some kind of random value to make next wave look random too
    iter += 1232.399963;
  }
  
  return sum_of_values / sum_of_weights;
}
// -------------------- Waves ---------------------


// -------------------- March ----------------------
float march(vec3 camera, vec3 start, vec3 end, float depth) 
{
    vec3 p = start;
    vec3 dir = normalize(end - start);

    for(int i=0; i < 64; i++) 
    {
        float wave_height = calculate_wave_at_p(p.xz, RaymarchSteps) * depth - depth;
        if(wave_height + 0.1 > p.y) 
           return distance(p, camera);

        p += dir * (p.y - wave_height);
    }

    return distance(start, camera);
}

// Calculate normal at point by calculating the height at the pos and 2 additional points very close to pos
vec3 normal(vec2 p, float e, float depth) 
{
  vec2 ex = vec2(e, 0);
  float wave_height = calculate_wave_at_p(p.xy, RaymarchNormalSteps) * depth;
  vec3 a = vec3(p.x, wave_height, p.y);
  return normalize(
    cross(
      a - vec3(p.x - e, calculate_wave_at_p(p.xy - ex.xy, RaymarchNormalSteps) * depth, p.y), 
      a - vec3(p.x, calculate_wave_at_p(p.xy + ex.yx, RaymarchNormalSteps) * depth, p.y + e)
    )
  );
} 
// -------------------- March ----------------------


// -------------------- Stars ----------------------
float hash21(vec2 p) 
{
    p = fract(p*vec2(123.34,234.34));
    p += dot(p, p+23.43);
    return fract(p.x*p.y);
}


float star_layer(vec2 p, float seed) 
{
    float t = iTime * 2.0 + seed;
    vec2 id = floor(p);
    vec2 gv = fract(p) - 0.5;
    
    float n = hash21(id);
    float x = fract(n * 12.32);
    float y = fract(n * 123.32);
    vec2 offs = vec2(x,y) - 0.5;
    
    float d = length(gv - offs * 0.9);
    float m = smoothstep(0.01, 0.0, d);
    
    m *= pow(sin(t + n * 6.2832)* 0.5 + 0.5, 3.0);
    return m;
}
// -------------------- Stars ----------------------


vec3 render(vec2 uv) 
{
    vec2 mouse = (iMouse.xy - iResolution.xy * 0.5) / iResolution.y;
    float aspect = iResolution.x / iResolution.y;
    
    if(iMouse.x == 0.0 && iMouse.y == 0.0)
        mouse = vec2(0.0, -0.1);
    
    float fov_rads = tan(radians(FOV));
    
    float x = (sin(iTime * 0.5) + cos(iTime * 0.5)) * 0.5 + 0.5;
    vec3 ro = BobberAnimation 
        ? vec3(iTime * 0.1, mix(CameraHeight, CameraHeight - WaterDepth, x), 1.0)
        : vec3(iTime * 0.1, CameraHeight, 1.0);

    mat3 rot = rotate_angle_axis(vec3(1.0, 0.0, 0.0), -0.18);
    vec3 rd =  rot * normalize(vec3(uv, fov_rads / -2.5));
    vec3 lp = iMouse.z > 0.0 || !SunAnimation
        ? rot * normalize(vec3(mouse.xy, fov_rads / -2.5))
        : rot * normalize(vec3(sin(iTime * 0.1) * 0.9, cos(iTime * 0.1) * 0.9, fov_rads / -2.5));

    if (rd.y >= 0.0) 
    {
        vec3 sky_color = vec3(0.0);
        vec3 sky_scattering = vec3(0.0);
        scatter(ro, rd, lp, sky_color, sky_scattering, iTime);
        sky_color += sky_scattering;
        
        float offset = dot(rd, vec3(10.0));
        float stars = star_layer(uv * 10.0, offset);
        stars += star_layer(uv * 17.0+ 3.1, offset);
        stars += star_layer(uv * 23.+23.1, offset);
        stars *= smoothstep(0.0, -0.2, lp.y);
        return sky_color + stars; 
    }
    
    vec3 water_plane_high = vec3(0.0, 0.0, 0.0);
    vec3 water_plane_low = vec3(0.0, -WaterDepth, 0.0);

    // Calculate intersections and reconstruct positions.
    float high_plane_hit = plane_intersect(ro, rd, water_plane_high, vec3(0.0, 1.0, 0.0));
    float low_plane_hit = plane_intersect(ro, rd, water_plane_low, vec3(0.0, 1.0, 0.0));
    vec3 high_hit_p = ro + rd * high_plane_hit;
    vec3 low_hit_p = ro + rd * low_plane_hit;  

    float d = march(ro, high_hit_p, low_hit_p, WaterDepth);
    vec3 water_hit_p = ro + rd * d;

    vec3 N = normal(water_hit_p.xz, 0.01, WaterDepth);
    // Smooth the normal with distance to avoid disturbing high frequency noise.
    N = mix(N, vec3(0.0, 1.0, 0.0), 0.88 * min(1.0, sqrt(d * 0.01) * 0.9));
    vec3 L = normalize(lp);
    vec3 V = normalize(-rd);
    vec3 H = normalize(L + V);
    float NdotH = dot(N, H);

    // Specular reflection lighting coefficients
    float fresnel = (0.04 + (1.0 - 0.04) * (pow(1.0 - max(0.0, dot(-N, rd)), FresnelFactor)));
    float k = 0.0;

    float tan_a = length(cross(N, H)) / NdotH;
    float cos_a = NdotH;
    float m2 = BeckmanSpecular * BeckmanSpecular;
    float tana2 = tan_a * tan_a;
    float cosa4 = pow(abs(cos_a), 4.0);
    k = exp(-tana2 / m2) / (PI * m2 * cosa4) * 0.1;
    
    // Diffuse lighting coefficents & SSS
    float diff = max(0.0, dot(N, L));
    vec3 sss = vec3(0.0293, 0.0698, 0.1717) * 0.1 * (1.0 + (water_hit_p.y + WaterDepth) / WaterDepth);

    // Environment reflection
    vec3 R = normalize(reflect(rd, N));
    R.y = abs(R.y);
    vec3 water_reflect = vec3(0.0);
    vec3 water_scat = vec3(0.0);

    scatter(ro, R, lp, water_reflect, water_scat, iTime);
    water_reflect += water_scat;
    vec3 diffuse_scatter = (water_scat + sss) * diff;

    vec3 spec_reflection = water_reflect * k + fresnel * water_reflect;
    
    float offset = dot(rd * d, vec3(10.0));
    float stars = star_layer(rd.xz * 10.0, offset);
    stars += star_layer(rd.xz * 17.0 + 3.1, offset);
    stars += star_layer(rd.xz * 23.0 + 23.1, offset);
    stars *= smoothstep(0.0, -0.2, lp.y);

    return spec_reflection + diffuse_scatter + stars * 0.1;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec3 tot = vec3(0.0);
#if AA>1
    for( int m=ZERO; m<AA; m++ )
    for( int n=ZERO; n<AA; n++ )
    {
        vec2 o = vec2(float(m), float(n)) / float(AA) - 0.5;
        vec2 p = ((fragCoord + o) - iResolution.xy * 0.5)/iResolution.y;
#else    
        vec2 p = (fragCoord - iResolution.xy * 0.5) / iResolution.y;
#endif

        vec3 color = render(p);
        color = aces_tonemap(color);

        tot += color;
#if AA>1
    }
    tot /= float(AA*AA);
#endif
    
    fragColor = vec4(tot, 1.0 );
}

#include <../common/main_shadertoy.frag>
