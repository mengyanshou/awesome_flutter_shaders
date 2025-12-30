// --- Migrate Log ---
// 移除自定义的 Shadertoy uniforms 与宏；使用工程统一的 common_header 定义（iResolution/iTime/iMouse 等）
// 初始化未赋值的局部变量（例如 a）以避免未定义行为；修复 texture() 的参数并替换 gl_FragCoord 用法
// --- Migrate Log (EN) ---
// Removed custom Shadertoy uniforms/macros; rely on common_header for iResolution/iTime/iMouse
// Initialize uninitialized locals (e.g. a) to avoid undefined behavior; fixed texture() arg and replaced gl_FragCoord usage
#include <../common/common_header.frag>
uniform sampler2D iChannel1;

/* sources https://www.shadertoy.com/view/lfVXRc https://www.shadertoy.com/view/XlfGRj https://www.shadertoy.com/view/mtyGWy and other*/


/*at least something or someone is in the positive, 
just like I am always in the positive.
The sacrifices are not in vain, it’s not my fault*/


float cheap_star(vec2 uv, float anim)
{
    uv = abs(uv);
    vec2 pos = min(uv.xy/uv.yx, anim);
    float p = (2.0 - pos.x - pos.y);
    return (2.0+p*(p*p-1.5)) / (uv.x+uv.y);      
}
 float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

float noise(vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}

float ridgednoise(vec3 d, int octaves)
{
    float outsum = 0.0;
    float div = 0.5;
    float divsum = 0.0;
    
    for(int i = 0; i != octaves; i++)
    {
        outsum += noise(d / div) * div;
        divsum += div;
        div *= 0.5;
    };
    
    return 2.0 * (0.5 - abs(0.5 - (outsum / divsum)));
}

float iqnoise(vec3 d, int octaves, int steps)
{
    float _out = 0.0;
    float sign_ = 1.0;
    for(int i = 0; i != steps; i++)
    {
        _out = ridgednoise(d - float(i) / float(steps), octaves);
        d += _out * sign_;
        sign_ *= -1.0;
    }
#ifdef FRACT_RIDGES
    return fract(_out * 3.14159265);
#endif
    return 2.0 * (0.5 - abs(0.5 - _out));
}

vec3 coloriqnoise(vec3 d, int octaves, int steps)
{
    return normalize(vec3(
        iqnoise(d, octaves, steps),
        iqnoise(d - vec3(0.0, 0.0, 0.05), octaves, steps),
        iqnoise(d - vec3(0.0, 0.0, 0.1), octaves, steps)
    ));
}

float happy_star(vec2 uv, float anim)
{
    uv = abs(uv);
    vec2 pos = min(uv.xy/uv.yx, anim);
    float p = (2.0 - pos.x - pos.y);
    return (2.0+p*(p*p-1.5)) / (uv.x+uv.y);      
}

 vec3 palette( float t ) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.263,0.416,0.557);

    return a + b*cos( 6.28318*(c*t+d) );
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{

    vec2 uv = fragCoord / iResolution - 0.5;
    // Adjust UV coordinates back to a range of 0 to 1 for texture sampling
    vec2 uvTex = uv * 0.5 + 0.5;

    // Get the color from the distortion texture, adding time to make it move (use vec2 to offset UV)
    vec4 dist = sg_texture0(iChannel1, uvTex + vec2(iTime * 0.02));

    // Use the red channel of the distortion texture to create a small offset
    vec2 distortionOffset = dist.rr * vec2(0.0155, 0.0155);
    
    vec2 C = fragCoord;

    vec2 pos = (fragCoord / iResolution) * 2.0 - 1.0;
    uv += distortionOffset;

    float anim = sin(iTime * 12.0) * 0.1 + 1.0;  // anim between 0.9 - 1.1 
    
	


vec3 directory = vec3(uv, (iTime * 0.0001));
vec3 from = vec3(1.0, 0.5, 0.5);
vec2 uv0 = uv;

vec3 finalColor = vec3(0.0);

vec3 col = palette(length(uv * cos(iTime)));

float s = 0.5;
float fade = 1.0;
vec3 output2 = vec3(0.0);
for (int r = 0; r < 10; r++) {

    vec3 p = s + from * directory * 0.5;
    p = abs(vec3(0.8) - mod(p, vec3(0.8 * 2.0)));
    float a = 0.0;
    for (int i = 0; i < 15; i++) {
        p = abs(p) / dot(p, p) - 0.73;
        p.xy *= mat2(cos(iTime * 0.05), sin(iTime * 0.05), -sin(iTime * 0.05), cos(iTime * 0.05)); // the magic formula
        a += abs(length(p));
    }
    s += 0.1;
    a *= a * a;

    output2 += vec3(0.1, 0.1, 0.7) * 0.0015 * a;

}
output2 = mix(vec3(length(output2)), output2, 0.7);




fragColor = vec4(output2 * 0.013 + col, 1.0);

    fragColor *= vec4(iqnoise(vec3(uv, iTime / 10.0), 23, 3));
    fragColor.a *= iqnoise(vec3(uv, iTime / 10.0), 23, 3);
    uv *= 2.0 * (cos(iTime * 2.0) - 2.5); // scale

    fragColor += vec4(happy_star(uv, anim) * vec3(0.05, 0.1, 1.55) * 0.1, 1.0);
}

#include <../common/main_shadertoy.frag>