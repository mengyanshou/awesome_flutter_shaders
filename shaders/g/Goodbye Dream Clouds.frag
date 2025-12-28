
// --- Migrate Log ---
// 添加必要的 include 指令以兼容 Flutter/Skia
// 修复 vec3a 类型错误，改为 vec3
// 替换 Hash 函数以避免位操作，使用三角函数版本
// 替换 Noise 函数为程序化实现，移除 iChannel0 依赖
// Add required include directives for Flutter/Skia compatibility
// Fixed vec3a type error, changed to vec3
// Replaced hash function to avoid bitwise operations, using trigonometric version
// Replaced noise function with procedural implementation, removed iChannel0 dependency

#include <../common/common_header.frag>

//
// Clouds shader from Goodbye Dream, released at Outline 2024
// by teadrinker 2024, License: CC BY-NC-SA
//
//   https://youtu.be/ZXXnBtW2NcI
//   https://demozoo.org/productions/345947/
//


#define _BaseSize         0.18
#define _BaseOffset       0.2
#define _BaseGradient    -1.8
#define _Animate          1.0
#define _AnimateBase      0.53
#define _AnimateDetail   -0.11
#define _AnimateDetail2   0.1
#define _AnimateBaseV     vec3(0.0, 0.00, 1.00)
#define _AnimateDetailV   vec3(1.0, 0.31, 0.55)
#define _AnimateDetail2V  vec3(1.0, 0.00, 0.00)
#define _BaseShape        1.54
#define _BaseWeight       2.06
#define _DetailWeight     0.93
#define _DetailCombine   -0.25
#define _DensityCutoff    0.47
#define _LowDensityColor  vec4(0.668, 0.586, 0.801, 0.043)
#define _HighDensityColor vec4(0.317, 0.250, 0.368, 0.270)
#define _SunColor         vec4(1.000, 0.572, 0.410, 0.620)
#define _BackgroundC      vec4(0.317, 0.250, 0.368, 0.886)
#define _BackgroundSunC   vec4(0.698, 0.321, 0.239, 0.317)
#define _BackgroundSunSize 0.22
#define _Near             6.0
#define _Far              42.0
#define _FarFade          0.75
#define _SunDir           vec3(-0.61, -0.1, 1.96)
#define _SunCurve         0.286
#define _SunOffset        0.963
#define _Gamma            4.0
#define _DetailCutoff    -0.4
#define _AlphaMax         0.93
#define _StepSizeInside   0.27
#define _StepSizeOutside  0.66
#define _Jitter           2.0
#define _Debug            0.0  // 0.8 to see iterations, 0.6 to see 1st density hit

#define Loop_Max 159

float hashu(vec2 q) {
    return fract(sin(dot(q, vec2(12.9898, 78.233))) * 43758.5453);
}

float hash(vec2 n) {
    return hashu(n);
}


// Simple hash function for 3D noise
vec4 hash4(vec3 p) {
    p = vec3(dot(p,vec3(127.1,311.7, 74.7)),
             dot(p,vec3(269.5,183.3,246.1)),
             dot(p,vec3(113.5,271.9,124.6)));
    return -1.0 + 2.0 * fract(sin(p.xyzx + 20.0) * 43758.5453123);
}

float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    
    // Cubic smoothstep
    f = f * f * (3.0 - 2.0 * f);
    
    // 8 vertex contributions
    return mix(
        mix(mix(dot(hash4(i + vec3(0,0,0)).xyz, f - vec3(0,0,0)),
                dot(hash4(i + vec3(1,0,0)).xyz, f - vec3(1,0,0)), f.x),
            mix(dot(hash4(i + vec3(0,1,0)).xyz, f - vec3(0,1,0)),
                dot(hash4(i + vec3(1,1,0)).xyz, f - vec3(1,1,0)), f.x), f.y),
        mix(mix(dot(hash4(i + vec3(0,0,1)).xyz, f - vec3(0,0,1)),
                dot(hash4(i + vec3(1,0,1)).xyz, f - vec3(1,0,1)), f.x),
            mix(dot(hash4(i + vec3(0,1,1)).xyz, f - vec3(0,1,1)),
                dot(hash4(i + vec3(1,1,1)).xyz, f - vec3(1,1,1)), f.x), f.y), f.z)
        * 0.5 + 0.5;
}


float cloudDensity(vec3 p, float len) {
    float linearField = (p.y * _BaseGradient + _BaseOffset) * _BaseWeight;
    if (linearField < -_BaseWeight)
        return -1000.;
    float time = iTime * _Animate;
    p += time * _AnimateBase * _AnimateBaseV;
    
    float basenoise = noise(mat3(0.5, -0.5, 0.70711, 0.85355, 0.14644, -0.5, 0.14644, 0.85355, 0.5) * p);
    
    float nd = 0.5 + 0.5 * basenoise; // normalized course density noise (0 to 1)
    nd = pow(nd, _BaseShape);
    float d = _BaseWeight * (nd*2.-1.);
    d += linearField;
    
    // d here represents the course/larger cloud shape 
    
    if (d > _DetailCutoff)
    {
        // detail density
        p += time * _AnimateDetail * _AnimateDetailV;
        float f = 0.28 * noise(p * 5.);
        f += 0.2 * noise(p * 10.1);
        p += time * _AnimateDetail2 * _AnimateDetail2V;
        f += 0.1 * noise(p * 22.52);
        
        
        float fadeDist = 6.;
        if (len < fadeDist)
        {
            f += 0.057 * noise(p * 54.28);
            
            // fade fine detail by distance to avoid alias
            // and increase detail on very close clouds
            // (not ideal impl, tweaked for a lower resolution...)
            float fadeByDist = (fadeDist - len) * (1. / fadeDist);
            f += 0.1 * fadeByDist * noise(p * 154.28);
        }
        
        // comment out this line to see only course cloud shape 
        d += _DetailWeight * f * (1.0 - _DetailCombine * (nd - 0.5));

    }    
    return d;
}

float gm(float c) { return pow(c, _Gamma); }
vec3 gm(vec3 c) { return pow(c.rgb, vec3(_Gamma)); }
vec4 gm(vec4 c) { c.rgb = pow(c.rgb, vec3(_Gamma)); return c; }

vec4 rm(vec3 ro, vec3 rd, vec2 uv) {

    float len = 0.0;
    vec4 sum = vec4(0.0);
    float depthAlphaSum = 0.0;
    
    // As the ray-marching step size is 
    // quite large, each ray actually misses
    // a lot of detail. Randomly offsetting
    // initial distance helps a lot.
    // The result is noisy though...
    len = _Jitter * hash(uv+fract(iTime));

    vec4 ldColor = gm(_LowDensityColor);  
    vec4 hdColor = gm(_HighDensityColor);
    vec3 sunColor = gm(_SunColor).rgb;
    float ambient = gm(_SunColor.a);

    int n = 0;
    for (; n < Loop_Max; ++n)
    {
        vec3 p = ro + len * rd;
        p *= _BaseSize;
        float d = cloudDensity(p, len * _BaseSize);

        if (d < -100. && sign(_BaseGradient)*rd.y < 0.)
            break;
            
        if (d > _DensityCutoff) {

            if(_Debug > 0.5 && _Debug < 0.75)
            { 
                vec4 col = vec4(d, d, d, 1.0);
                sum += col * (1.0 - sum.a);
            }
            else
            {
                // Approximate lighting with a single extra sample of the
                // density function. Thanks to iq for this delightful trick:
                //
                //    https://iquilezles.org/articles/derivative/
                //
                float sundiff = cloudDensity(p+0.06*normalize(_SunDir), len * _BaseSize)-d;
                
                // Fake the appearance of shadowed valleys, just assume sun is low on the
                // horizon, so the lower a point is, the more likely it is in shadow
                float sunCurve = pow(max(0.0, _SunOffset - p.y*_BaseGradient*_SunCurve), 8.);
            
                float sun = max(0.0, -sunCurve * sundiff / 0.2);
                            
                d = clamp(d, 0., 1.);
                vec4 col = mix(ldColor, hdColor, d);
                col.rgb *= ambient + sunColor * sun * 5.;
              
                // make close clouds more transparent
                col.a *= min(1.0, len / _Near);

                // accumulate color and depth alpha
                float weight = col.a * (1.0 - sum.a);
                depthAlphaSum += weight * smoothstep(1.0 - _FarFade, 1.0, len / _Far);                               
                sum.rgb += weight * col.rgb;
                sum.a += weight;
            }
        }

        len += d > _DetailCutoff ? _StepSizeInside : _StepSizeOutside;

        if (len > _Far || sum.a > _AlphaMax)
            break;
    }

    if (_Debug >= 0.75)
        return vec4(vec3((float(n)/float(Loop_Max))), 1.0);


    float depthAlpha = 1.0 - depthAlphaSum / (sum.a + 0.00001);

    // if alpha has reached _AlphaMax
    // clouds should be fully opaque
    sum.a = sum.a / _AlphaMax;
    
    // "fog" / fade out by depth
    sum.a *= depthAlpha;
    
    
    // If you want to blend the clouds with other stuff
    // the bright parts sort of disappear, to have more
    // of an expected look, this hack tries to make bright
    // parts more opaque, so that the final composite
    // is more like the result of mixing the rgb with
    // the sort of extreme gamma of 4.0 
    
    // sum.a += depthAlpha * depthAlpha * dot(vec3(2.0), sum.rgb);


    sum.a = min(1.0, sum.a);
    return sum;
}



vec4 renderPixel(vec3 ro, vec3 rd, vec2 uv) {

    vec4 col = rm(ro, rd, uv);
    float sun = 0.5 + 0.5 * dot(normalize(_SunDir), rd);
    sun = pow((1. - pow(1. - sun, _BackgroundSunSize) ),1./ _BackgroundSunSize)* 5.;
    
    
    // cheap/fake corona simulation:
    //
    // Make it so that background is brighter when overlayed with
    // thin clouds close to the sun.
    //  ( it actually brightens thicker clouds even more, but that
    //    takes care of itself when blending bg and col later )
    //
    // together with the alpha-depth-fade-out/fog, this also
    // contribute to a slight subsurface-scattering-look at
    // further distances...
    sun *= 1. + col.a * 6.;
    
    
    // Note! there is an error in this line, bg.a might get larger than 1.0
    // however, this looks better, so... (constants were tweaked before I found this out)
    vec4 bg = gm(_BackgroundC) + _BackgroundSunC.a * sun * gm(_BackgroundSunC);
    
  
    col = mix(bg, vec4(col.rgb,1.0), col.a);
   
    // inverse gamma
    col.rgb = pow(col.rgb, vec3(1.0 / _Gamma));
    
    
    // Make sure output alpha don't exceed 1,
    // and if it does, apply it to color, 
    // (treat it as if it was blended from 0)
    col.rgb *= max(1.0, col.a);
    col.a = min(1.0, col.a);
    return col;

}


vec2 rot(vec2 p, float r) { float s = sin(r),  c = cos(r); return vec2(p.x * c - p.y * s, p.x * s + p.y * c); } 

// uv = fragCoord/iResolution.xy
// aspect = iResolution.x/iResolution.y
vec3 camraydir(vec2 uv, float aspect, vec3 pos, vec3 target, float fov, float roll) { 
    vec3 forward = normalize(target - pos);
    vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
    vec3 up = normalize(cross(forward, right));
    float halfH = tan(fov * 0.5);
    uv = (2.0 * uv - 1.0) * vec2(halfH * aspect, halfH);
    vec2 rotatedUV = mat2(cos(roll), -sin(roll), sin(roll), cos(roll)) * uv;
    return normalize(forward + rotatedUV.x * right + rotatedUV.y * up);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord/iResolution.xy;
    float aspect = iResolution.x / iResolution.y;
    vec2 mouse = (iMouse.xy-0.5*iResolution.xy)/iResolution.y;
    
    vec3 campos = vec3(0.0,1.7,-3.0);
    vec3 camtarget = vec3(0.0,1.7,6.0);
    
    float orbit = 0.0;
    float updown = 0.0;
    if (iMouse.z > 0.) {
        updown = clamp(-4.*mouse.y, -3.14159/2.0, 3.14159/2.0);
        orbit = -4.*mouse.x;
    }
    campos -= camtarget;
    campos.yz = rot(campos.yz, updown);
    campos.xz = rot(campos.xz, orbit);    
    campos += camtarget;
 
    vec3 ro = campos;
    vec3 rd = camraydir(uv, aspect, campos, camtarget, radians(40.), 0.0);
    ro += vec3(125.,0.,64.); // start position
    fragColor = renderPixel(ro, rd, uv);
}

#include <../common/main_shadertoy.frag>
 