// --- Migrate Log ---
// 1) 保护 log(d) 防止 d=0（spiralzoom 使用 -log(d)）
// 2) 使用 SG_TEX 宏以支持 wrap/filter uniform（替代 texture(iChannelN, uv)）
// 3) 修改 iChannelResolution[3] 为 iChannelResolution3
// 4) 输出写满 vec4(..., 1) 避免未初始化通道/alpha 在多 pass + linear 下污染
// 5) 关闭鼠标对 BufferA 的涡旋扭曲（只让 Main pass 的“灯光”响应鼠标）
//
// 1) Protect log(d) against d=0 (spiralzoom uses -log(d))
// 2) Use SG_TEX macros to honor wrap/filter uniforms (replace texture(iChannelN, uv))
// 3) Change iChannelResolution[3] to iChannelResolution3
// 4) Write a fully-defined vec4(..., 1) to avoid undefined channels/alpha contaminating multi-pass + linear
// 5) Disable mouse-driven vortex warp in BufferA (mouse should only affect lighting in Main)

#include <../common/common_header.frag>

uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
uniform sampler2D iChannel3;

// main reaction-diffusion loop

// actually the diffusion is realized as a separated two-pass Gaussian blur kernel and is stored in buffer C

#define pi2_inv 0.159154943091895335768883763372

vec2 complex_mul(vec2 factorA, vec2 factorB){
    return vec2( factorA.x*factorB.x - factorA.y*factorB.y, factorA.x*factorB.y + factorA.y*factorB.x);
}

vec2 spiralzoom(vec2 domain, vec2 center, float n, float spiral_factor, float zoom_factor, vec2 pos){
    vec2 uv = domain - center;
    float d = length(uv);
    d = max(d, 1e-6);
    return vec2( atan(uv.y, uv.x)*n*pi2_inv + d*spiral_factor, -log(d)*zoom_factor) + pos;
}

vec2 complex_div(vec2 numerator, vec2 denominator){
    return vec2( numerator.x*denominator.x + numerator.y*denominator.y,
                numerator.y*denominator.x - numerator.x*denominator.y)/
        vec2(denominator.x*denominator.x + denominator.y*denominator.y);
}

float circle(vec2 uv, vec2 aspect, float scale){
    return clamp( 1. - length((uv-0.5)*aspect*scale), 0., 1.);
}

float sigmoid(float x) {
    return 2./(1. + exp2(-x)) - 1.;
}

float smoothcircle(vec2 uv, vec2 aspect, float radius, float ramp){
    return 0.5 - sigmoid( ( length( (uv - 0.5) * aspect) - radius) * ramp) * 0.5;
}

float conetip(vec2 uv, vec2 pos, float size, float min)
{
    vec2 aspect = vec2(1.,iResolution.y/iResolution.x);
    return max( min, 1. - length((uv - pos) * aspect / size) );
}

float warpFilter(vec2 uv, vec2 pos, float size, float ramp)
{
    return 0.5 + sigmoid( conetip(uv, pos, size, -16.) * ramp) * 0.5;
}

vec2 vortex_warp(vec2 uv, vec2 pos, float size, float ramp, vec2 rot)
{
    vec2 aspect = vec2(1.,iResolution.y/iResolution.x);

    vec2 pos_correct = 0.5 + (pos - 0.5);
    vec2 rot_uv = pos_correct + complex_mul((uv - pos_correct)*aspect, rot)/aspect;
    float _filter = warpFilter(uv, pos_correct, size, ramp);
    return mix(uv, rot_uv, _filter);
}

vec2 vortex_pair_warp(vec2 uv, vec2 pos, vec2 vel)
{
    vec2 aspect = vec2(1.,iResolution.y/iResolution.x);
    float ramp = 5.;

    float d = 0.2;

    float l = length(vel);
    vec2 p1 = pos;
    vec2 p2 = pos;

    if(l > 0.){
        vec2 normal = normalize(vel.yx * vec2(-1., 1.))/aspect;
        p1 = pos - normal * d / 2.;
        p2 = pos + normal * d / 2.;
    }

    float w = l / d * 2.;

    // two overlapping rotations that would annihilate when they were not displaced.
    vec2 circle1 = vortex_warp(uv, p1, d, ramp, vec2(cos(w),sin(w)));
    vec2 circle2 = vortex_warp(uv, p2, d, ramp, vec2(cos(-w),sin(-w)));
    return (circle1 + circle2) / 2.;
}

vec2 mouseDelta(){
    vec2 pixelSize = 1. / iResolution.xy;
    float eighth = 1./8.;
    vec4 oldMouse = SG_TEX2(iChannel2, vec2(7.5 * eighth, 2.5 * eighth));
    vec4 nowMouse = vec4(iMouse.xy / iResolution.xy, iMouse.zw / iResolution.xy);
    if(oldMouse.z > pixelSize.x && oldMouse.w > pixelSize.y &&
       nowMouse.z > pixelSize.x && nowMouse.w > pixelSize.y)
    {
        return nowMouse.xy - oldMouse.xy;
    }
    return vec2(0.);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / iResolution.xy;
    vec2 pixelSize = 1. / iResolution.xy;


        // Shadertoy reference: mouse should only affect the lighting in the main pass.
        // Keep the diffusion field in BufferA independent of mouse input.
        // vec2 mouseV = mouseDelta();
        // vec2 aspect = vec2(1.,iResolution.y/iResolution.x);
        // uv = vortex_pair_warp(uv, iMouse.xy*pixelSize, mouseV*aspect*1.4);

    vec4 blur1 = SG_TEX1(iChannel1, uv);

    vec4 noise = SG_TEX3(iChannel3, fragCoord.xy / iChannelResolution3.xy + fract(vec2(42,56)*iTime));

    // get the gradients from the blurred image
	vec2 d = pixelSize*4.;
	vec4 dx = (SG_TEX1(iChannel1, fract(uv + vec2(1,0)*d)) - SG_TEX1(iChannel1, fract(uv - vec2(1,0)*d))) * 0.5;
	vec4 dy = (SG_TEX1(iChannel1, fract(uv + vec2(0,1)*d)) - SG_TEX1(iChannel1, fract(uv - vec2(0,1)*d))) * 0.5;

    vec2 uv_red = uv + vec2(dx.x, dy.x)*pixelSize*8.; // add some diffusive expansion

    float new_red = SG_TEX0(iChannel0, fract(uv_red)).x + (noise.x - 0.5) * 0.0025 - 0.002; // stochastic decay
	new_red -= (SG_TEX1(iChannel1, fract(uv_red + (noise.xy-0.5)*pixelSize)).x -
				SG_TEX0(iChannel0, fract(uv_red + (noise.xy-0.5)*pixelSize))).x * 0.047; // reaction-diffusion

    if(iFrame<10)
    {
        fragColor = vec4(noise.xyz, 1.0);
    }
    else
    {
        fragColor = vec4(clamp(new_red, 0., 1.), 0.0, 0.0, 1.0);
    }

//    fragColor = noise; // need a restart?
}

#include <../common/main_shadertoy.frag>
