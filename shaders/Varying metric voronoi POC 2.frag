#include <common/common_header.frag>

#define FK(k) floatBitsToUint(k)^floatBitsToUint(cos(k))

float hash(vec2 p)
{
    uint x = FK(p.x);
    uint y = FK(p.y);
    
    return float((x*x-y)*(y*y+x)-x)/4.28e9;
}

float noise(vec2 p)
{
    vec2 i = floor(p);
    vec2 f = smoothstep(0., 1., p-i);
    const vec2 o = vec2(1,0);
    
    return mix(
        mix(hash(i), hash(i + o), f.x),
        mix(hash(i + o.yx), hash(i + 1.), f.x),
    f.y);
}

mat2 rot(float a)
{
    float s = sin(a);
    float c = cos(a);
    
    return mat2(c,-s,s,c);
}

float cheb(vec2 v, float k)
{
    return pow(pow(abs(v.x), k) + pow(abs(v.y), k), 1./k);
}

float vor(vec2 p)
{
    float dist = 10000.;
    float id;
    vec2 i = floor(p);
    
    for (float x = -3.; x < 4.; ++x)
    for (float y = -3.; y < 4.; ++y)
    {
        vec2 c = vec2(x, y) + i;
        float h = hash(c);
        vec2 o = vec2(h, fract((h * .5 + .9653) * 12.321) * 2. - 1.);
        
        o += sin(o + h * 5. + iTime * h * .8);
        
        float d = cheb(p - o - c, 1.2 + h * h * 3.);
        d += noise(normalize(p - o - c) * (9.5 + 2.5 * h)) * h * min(d * d, 1.) * .5;
        if (dist > d)
        {
            dist = d;
            id = h;
        }
    }
    
    return id;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord - iResolution.xy * .5) / iResolution.y;

    float v = vor(uv * 8.);
    vec3 col = (sin(53. * v * vec3(1.2, -.132, 3.1)) * .5 + .5);

    fragColor = vec4(col,1.0);
}
#include <common/main_shadertoy.frag>
