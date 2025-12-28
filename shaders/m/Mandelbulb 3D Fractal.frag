// --- Migrate Log ---
// 初始化 r 为安全值以防止 log(0) 或除以 0 的未定义行为
// 将步数计数器明确为 int，避免隐式 float-int 转换
// 用显式初始化替换未定义的局部变量
// --- Migrate Log (EN) ---
// Initialize r with a safe value to avoid log(0)/divide-by-zero undefined behavior
// Use an integer step counter to prevent implicit float-int conversions
// Explicitly initialize local variables to avoid undefined state

#include <../common/common_header.frag>

//Try to tweak these values
const float epsilon = 0.0002;
const float fov = radians(35.);
const float mandelbulb_power = 8.;
const float view_radius = 20.;
const int mandelbulb_iter_num = 16;
const float camera_distance = 4.;
const float rotation_speed = 1./36.5;



float mandelbulb_sdf(vec3 pos) {
	vec3 z = pos;
	float dr = 1.0;
	float r = 1e-6; // initialize r to a small positive value to avoid log(0)
	for (int i = 0; i < mandelbulb_iter_num ; i++)
	{
		r = length(z);
		if (r>1.5) break;
		
		// convert to polar coordinates
		float theta = acos(z.z / r);
		float phi = atan(z.y, z.x);

		dr =  pow( r, mandelbulb_power-1.0)*mandelbulb_power*dr + 1.0;
		
		// scale and rotate the point
		float zr = pow( r,mandelbulb_power);
		theta = theta*mandelbulb_power;
		phi = phi*mandelbulb_power;
		
		// convert back to cartesian coordinates
		z = pos + zr*vec3(sin(theta)*cos(phi), sin(phi)*sin(theta), cos(theta));
	}
	// protect against r==0
	r = max(r, 1e-6);
	return 0.5*log(r)*r/dr;
}

float scene_sdf(vec3 p)
{
	return mandelbulb_sdf(p);
}

vec3 ray_marching(const vec3 eye, const vec3 ray, out float depth, out float steps)
{
	depth = 0.;
	// use integer steps internally
	int isteps = 0;
	float dist = 0.;
	vec3 intersection_point = eye;

	do
	{
		dist = scene_sdf(intersection_point);
        intersection_point += dist*ray;
		depth += dist;
		isteps++;
	}
	while(depth < view_radius && dist > epsilon);
	steps = float(isteps);

	return intersection_point;
}

vec2 transformed_coordinates(vec2 frag_coord)
{
	// fragCoord is in pixel space; convert to -1..1 keeping aspect
	vec2 coord = (frag_coord / iResolution.xy) * 2.0 - 1.0;
	coord.y *= (iResolution.y / iResolution.x);
	return coord;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 coord = transformed_coordinates(fragCoord);
    
	vec3 ray = normalize(vec3(coord*tan(fov), 1));

    float angle = radians(360.)*iTime*rotation_speed + radians(35.);
    
    mat3 cam_basis = mat3(0, cos(angle), sin(angle),
                          -1, 0, 0,
                          0, -sin(angle), cos(angle));
    
	ray = cam_basis*ray;
    
    vec3 cam_pos = -cam_basis[2]*camera_distance;
    
	float depth = 0.;
	float steps = 0.;
	vec3 intersection_point = ray_marching(cam_pos + epsilon*ray, ray, depth, steps);

	//AO
	float ao = steps * 0.015;
	ao = 1. - ao / (ao + 1.0);  // reinhard
    ao = pow(ao, 2.);
    
    // Output to screen
    fragColor = vec4(vec3(ao),1.0);
}

#include <../common/main_shadertoy.frag>