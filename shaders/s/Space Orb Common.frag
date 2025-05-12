// https://www.shadertoy.com/view/4djSRW
float hash11(float p)
{
    p = fract(p * .1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
}

float hash12(vec2 p)
{
	vec3 p3  = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p)
{
	vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx+33.33);
    return fract((p3.xx+p3.yz)*p3.zy);
}

// https://www.shadertoy.com/view/MslGD8
vec2 voronoi( in vec2 x )
{
    vec2 n = floor( x );
    vec2 f = fract( x );

	vec3 m = vec3( 8.0 );
    for( int j=-1; j<=1; j++ )
    for( int i=-1; i<=1; i++ )
    {
        vec2  g = vec2( float(i), float(j) );
        vec2  o = hash22( n + g );
        vec2  r = g - f + o;
		float d = dot( r, r );
        if( d<m.x )
            m = vec3( d, o );
    }

    return vec2( sqrt(m.x), m.y+m.z );
}

//https://projects.blender.org/blender/blender/src/branch/main/source/blender/gpu/shaders/material/gpu_shader_material_map_range.glsl
float smootherstep(float edge0, float edge1, float x)
{
  x = clamp((x - edge0)/(edge1 - edge0), 0.0, 1.0);
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

float linear_map_range(float value, float fromMin, float fromMax, float toMin, float toMax)
{
  return toMin + ((value - fromMin) / (fromMax - fromMin)) * (toMax - toMin);
}

// https://github.com/RodZill4/material-maker/blob/master/addons/material_maker/nodes/fast_blur_shader.mmg
vec4 blur(sampler2D sampler, vec2 uv, vec2 scale, float sigma) {
    vec4 O = vec4(0.0);
	float samples = sigma * 4.0; 
	int LOD = max(0, int(log2(float(samples)))-2);
	int sLOD = 1 << LOD;
	int s = max(1, int(samples/float(sLOD)));
	float sum = 0.0;
	for (int i = 0; i < s*s; i++) {
		vec2 d = vec2(float(i%s), float(i/s))*float(sLOD) - 0.5*float(samples);
		vec2 dd = d / sigma;
		float g = exp(-.5*dot(dd,dd))/(6.28318*sigma*sigma);
		O += g * textureLod(sampler, uv + 1./scale * d, float(LOD));
		sum += g;
	}
	return O / sum;
}

// https://github.com/RodZill4/material-maker/blob/master/addons/material_maker/nodes/fbm2.mmg
float value_noise_2d(vec2 coord, vec2 size, float seed) {
	vec2 o = floor(coord)+hash22(vec2(seed, 1.0-seed))+size;
	vec2 f = fract(coord);
	float p00 = hash12(mod(o, size));
	float p01 = hash12(mod(o + vec2(0.0, 1.0), size));
	float p10 = hash12(mod(o + vec2(1.0, 0.0), size));
	float p11 = hash12(mod(o + vec2(1.0, 1.0), size));
	vec2 t =  f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
	return mix(mix(p00, p10, t.x), mix(p01, p11, t.x), t.y);
}

float fbm(vec2 coord, float size, int octaves, float persistence, float seed) {
	float normalize_factor = 0.0;
	float value = 0.0;
	float scale = 1.0;
	for (int i = 0; i < octaves; i++) {
		float noise = value_noise_2d(coord*size, vec2(size), seed);
		value += noise * scale;
		normalize_factor += scale;
		size *= 2.0;
		scale *= persistence;
	}
	return value / normalize_factor;
}

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