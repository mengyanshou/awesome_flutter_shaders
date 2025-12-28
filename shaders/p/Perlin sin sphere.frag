// --- Migrate Log ---
// - 初始化 MFSDF_Obj_Maker_rotate3d 中的 rv 变量
// - 在 Simple360HDR_renderHDR360 中添加除零保护
// - 添加 include 和迁移日志，修复浮点常量格式，初始化变量
// --- Migrate Log (EN) ---
// - Initialized 'rv' variable in MFSDF_Obj_Maker_rotate3d
// - Added division-by-zero protection in Simple360HDR_renderHDR360
// - Added include and migration log, fixed float constant format, initialized variables

#include <../common/common_header.frag>

// Perlin sin sphere
// By Paulo Falcao
//
// Inspired on https://x.com/andrewray/status/1791630436789355001
// 
// Made in Material Maker ( https://www.materialmaker.org/material?id=987 )
//
// Generated shader revised for shadertoy
//

float hash(float p) {
	return  fract(sin(p) * 43758.545);
}



vec3 rand33(vec3 p) {
	p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 124.6)));
	return -1.0 + 2.0 * fract(sin(p) * 43758.545);
}

// Main step-hold function with smooth transitions
float smoothStepHold(float x, float holdDuration, float transitionDuration) {
    float cycleDuration = holdDuration + transitionDuration;
    float cycleNumber = floor(x / cycleDuration);
    float cyclePosition = mod(x, cycleDuration);
    float currentValue = hash(cycleNumber * 127.1);
    float nextValue = hash((cycleNumber + 1.0) * 127.1);
    if (cyclePosition < holdDuration) {
        return currentValue;
    } else {
        float transitionProgress = (cyclePosition - holdDuration) / transitionDuration;
        float t = smoothstep(0.0, 1.0, transitionProgress);
        return mix(currentValue, nextValue, t);
    }
}

float tex3d_fbm_perlin_nowrap(vec3 coord, vec3 size) {
	vec3 t = vec3(0.0) ,
	     o = floor(coord) + size,
	     f = fract(coord),
	     v000 = normalize(rand33(o) - vec3(0.5)),
	     v001 = normalize(rand33(o + vec3(0.0, 0.0, 1.0)) - vec3(0.5)),
	     v010 = normalize(rand33(o + vec3(0.0, 1.0, 0.0)) - vec3(0.5)),
	     v011 = normalize(rand33(o + vec3(0.0, 1.0, 1.0)) - vec3(0.5)),
	     v100 = normalize(rand33(o + vec3(1.0, 0.0, 0.0)) - vec3(0.5)),
	     v101 = normalize(rand33(o + vec3(1.0, 0.0, 1.0)) - vec3(0.5)),
	     v110 = normalize(rand33(o + vec3(1.0, 1.0, 0.0)) - vec3(0.5)),
	     v111 = normalize(rand33(o + vec3(1.0)) - vec3(0.5));
	float p000 = dot(v000, f),
	      p001 = dot(v001, f - vec3(0.0, 0.0, 1.0)),
	      p010 = dot(v010, f - vec3(0.0, 1.0, 0.0)),
	      p011 = dot(v011, f - vec3(0.0, 1.0, 1.0)),
	      p100 = dot(v100, f - vec3(1.0, 0.0, 0.0)),
	      p101 = dot(v101, f - vec3(1.0, 0.0, 1.0)),
	      p110 = dot(v110, f - vec3(1.0, 1.0, 0.0)),
	      p111 = dot(v111, f - vec3(1.0));
	t = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
	return 0.5 + mix(mix(mix(p000, p100, t.x), mix(p010, p110, t.x), t.y), mix(mix(p001, p101, t.x), mix(p011, p111, t.x), t.y), t.z);
}

float fbm3d_perlin_nowrap(vec3 coord) {
	vec3 size = vec3(0.5);
	float normalize_factor = 0.0,
	      value = 0.0,
	      scale = 1.0;
	for (int i = 0; i < 1; i++) {
		value += tex3d_fbm_perlin_nowrap(coord * size, size) * scale;
		normalize_factor += scale;
		size *= 2.0;
		scale *= 1.2;
	}

	return value / normalize_factor;
}

vec3 MFSDF_Obj_Maker_rotate3d(vec3 p, vec3 a) {
	float c = cos(a.x),
	      s = sin(a.x);
	vec3 rv = vec3(0.0);
	rv.x = p.x;
	rv.y = p.y * c + p.z * s;
	rv.z = -p.y * s + p.z * c;
	c = cos(a.y);
	s = sin(a.y);
	p.x = rv.x * c + rv.z * s;
	p.y = rv.y;
	p.z = -rv.x * s + rv.z * c;
	c = cos(a.z);
	s = sin(a.z);
	rv.x = p.x * c + p.y * s;
	rv.y = -p.x * s + p.y * c;
	rv.z = p.z;
	return rv;
}

vec2 Simple360HDR_equirectangularMap(vec3 dir) { return vec2(atan(dir.y, dir.x), acos(dir.z)) / vec2(6.28319, 3.1415926); }

float Simple360HDR_hash12(vec2 p) {
	vec3 p3 = fract(p.xyx * .1031);
	p3 += dot(p3, p3.yzx + 33.33);
	return fract((p3.x + p3.y) * p3.z);
}

float Simple360HDR_noise(vec2 v) {
	vec2 v1 = floor(v),
	     v2 = smoothstep(0., 1., fract(v));
	return mix(mix(Simple360HDR_hash12(v1), Simple360HDR_hash12(v1 + vec2(0, 1)), v2.y), mix(Simple360HDR_hash12(v1 + vec2(1, 0)), Simple360HDR_hash12(v1 + vec2(1)), v2.y), v2.x);
}

float Simple360HDR_noiseOct(vec2 p) {
    return Simple360HDR_noise(p) * 0.5 + Simple360HDR_noise(p * 2.0 + 13.0) * 0.25 + Simple360HDR_noise(p * 4.0 + 23.0) * 0.15 + Simple360HDR_noise(p * 8.0 + 33.0) * 0.1 + Simple360HDR_noise(p * 16.0 + 43.0) * 0.05;
}

vec3 Simple360HDR_skyColor(vec3 p) {
	vec3 v = (Simple360HDR_noiseOct(p.xz * 0.1) - 0.5) * vec3(1.0);
	float d = length(p);
	return mix(vec3(0.15, 0.3, 0.6) + v, vec3(0.2, 0.5, 1.0) + v * 12.0 / max(d, 20.0), clamp(d * 0.1, 0.0, 1.0));
}

vec3 Simple360HDR_floorColor(vec3 p) {
    return (Simple360HDR_noiseOct(p.xz * 0.1) * 0.5 + 0.25) * vec3(0.7, 0.5, 0.4);
}

vec3 Simple360HDR_renderHDR360(vec3 rd) {
	vec3 p = vec3(0.0), c = vec3(0.0);
	if (rd.y > 0.0) {
		p = rd * 5.0 / max(rd.y, 1e-6);
		c = Simple360HDR_skyColor(p);
	}
	else {
		p = rd * -10.0 / min(rd.y, -1e-6);
		c = mix(Simple360HDR_floorColor(p), vec3(0.5, 0.7, 1.0), clamp(1.0 - sqrt(-rd.y) * 3.0, 0.0, 1.0));
	}

	float ds = clamp(dot(vec3(-0.57735, 0.57735, -0.57735), rd), 0.0, 1.0);
	vec3 sunc = (ds > 0.9997 ? vec3(2.0) : vec3(0.0)) + pow(ds, 512.0) * 4.0 + pow(ds, 128.0) * vec3(0.5) + pow(ds, 4.0) * vec3(0.5);
	if (rd.y > 0.0) c += vec3(0.3) * pow(1.0 - abs(rd.y), 3.0) * 0.7;
	return c + sunc;
}

vec3 Simple360HDR_make360hdri(vec2 p) {
	vec2 thetaphi = (p * 2.0 - vec2(1.0)) * vec2(3.1415926, 1.5708);
	return Simple360HDR_renderHDR360(vec3(cos(thetaphi.y) * cos(thetaphi.x), sin(thetaphi.y), cos(thetaphi.y) * sin(thetaphi.x)));
}

float o7714_input_sdf(vec3 p) { return length(p) - 1.6; }

vec3 o7714_input_tex3d(vec4 p) { return sin(vec3(fbm3d_perlin_nowrap(p.xyz)) * smoothStepHold(iTime+10.0,2.0,1.0)*100.0 - iTime * 5.) * .868; }

vec3 normal_o7714(vec3 p) {
	return normalize(p);
}

vec4 distortHeighByNormal_o7714(vec3 uv) {
	float d = o7714_input_sdf(uv);
	if (d <= 0.081) {
		vec3 n = normal_o7714(uv),
		     s = o7714_input_tex3d(vec4(uv - d * n, 0.0));
		return vec4(s, o7714_input_sdf(uv - n * s * 0.071));
	}

	return vec4(vec3(0.0), d);
}

vec3 o7710_input_BaseColor_tex3d(vec4 p) {
	vec4 o7714_0_d = distortHeighByNormal_o7714((p).xyz);
	o7714_0_d.w /= 1.98882;
	return vec3(o7714_0_d.xyz * 0.882 + vec3(0.636));
}

float o7710_input_sdf3d(vec3 p) {
	vec4 o7714_0_d = distortHeighByNormal_o7714((p).xyz);
	o7714_0_d.w /= 1.98882;
	return o7714_0_d.w;
}

vec4 PBRObjectMaker_o7710(vec4 uv) {
	uv.xyz = MFSDF_Obj_Maker_rotate3d(uv.xyz, vec3(iTime * 9.0, iTime * 5.0, iTime * 7.0) * 0.01745329) ;
	float sdf = o7710_input_sdf3d(uv.xyz) ;
	if (uv.w > 0.5) return vec4(vec3(1.0) * clamp(o7710_input_BaseColor_tex3d(vec4(uv.xyz, 1.0)), vec3(0.0), vec3(1.0)), sdf);
	else return vec4(vec3(0.0), sdf);
}

vec4 o7702_input_mfsdf(vec4 p) { return PBRObjectMaker_o7710(p); }

vec3 o7702_input_hdri(vec2 uv) { return Simple360HDR_make360hdri(vec2((uv).x, -(uv).y + 1.0)); }

vec3 normal_o7702(vec3 p) {
	const vec3 e = vec3(0.001, -0.001, 0.0);
	float v1 = o7702_input_mfsdf(vec4(p + e.xyy, 0.0)).w,
	      v2 = o7702_input_mfsdf(vec4(p + e.yyx, 0.0)).w,
	      v3 = o7702_input_mfsdf(vec4(p + e.yxy, 0.0)).w,
	      v4 = o7702_input_mfsdf(vec4(p + e.xxx, 0.0)).w;
	return normalize(vec3(v4 + v1 - v3 - v2, v3 + v4 - v1 - v2, v2 + v4 - v3 - v1));
}

void march_o7702(inout float d, inout vec3 p, float dS, vec3 ro, vec3 rd) {
	for (int i = 0; i < 500; i++) {
		p = ro + rd * d;
		dS = o7702_input_mfsdf(vec4(p, 0.0)).w;
		d += dS;
		if (d > 50.0 || abs(dS) < 1e-4) break;
	}
}


vec3 raymarch_o7702(vec2 uv) {
	float objMetallic = 0.0,
	      d = 0.0,
	      dS = 0.0;
	uv -= 0.5;
	vec3 objColor = vec3(0.0),
	     color = vec3(0.0),
	     cam = vec3(sin(iTime * 0.2) * 5.0, sin(iTime * 0.13) + 2.0, 5.0),
	     ray = normalize(vec3(0.0) - cam),
	     cX = normalize(cross(vec3(0.0, 1.0, 0.0), ray)),
	     rd = normalize(ray * 1.5 + cX * uv.x + normalize(cross(cX, ray)) * uv.y),
	     ro = cam,
	     p = vec3(0.0);
	march_o7702(d, p, dS, ro, rd);
	objColor = o7702_input_mfsdf(vec4(p, 1.0)).xyz;
	objMetallic = 0.9;
	if (d < 50.0) {
		vec3 ref = vec3(0.0), objColorRef = vec3(0.0),
		     n = normal_o7702(p);
		ref = normalize(reflect(rd, -n));
		objColorRef = o7702_input_hdri(Simple360HDR_equirectangularMap(ref.xzy)).xyz;
		color = mix(color, objColorRef,mix(vec3(1.0), objColor, objMetallic));
	}
	else color = o7702_input_hdri(Simple360HDR_equirectangularMap(rd.xzy)).xyz;

	return pow(color, vec3(0.71429));
}

void mainImage(out vec4 fragColor, vec2 fragCoord) {
	float minSize = min(iResolution.x, iResolution.y);
	fragColor = vec4(raymarch_o7702(vec2(0.0, 1.0) + vec2(1.0, -1.0) * (fragCoord - 0.5 * (iResolution.xy - vec2(minSize))) / minSize), 1.0);
}

#include <../common/main_shadertoy.frag>
