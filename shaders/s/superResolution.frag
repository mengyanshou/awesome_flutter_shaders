// --- Migrate Log ---
// 添加 common_header 并声明缺失的 iChannel samplers 与 iChannelResolution 数组；移除 texture() 中不兼容的 bias/lod 第三参数
// --- Migrate Log (EN) ---
// Added common_header and declared missing iChannel samplers and iChannelResolution array; removed incompatible texture(...) bias/lod third arguments
#include <../common/common_header.frag>
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
uniform sampler2D iChannel3;
uniform vec2 iChannelResolution[4];

// superResolution - Image
//
// Main image composition.
// From left to right: result of 2x bicubic upsampling of input image,
// neural network upsampled result and original, ground truth image.
//
// This is just a toy project. Playing with Convolutional Neural Networks
// and their deployment on low end systems that only support shaders and OpenGL.
//
// In this case we have 3 layer network that takes input luminance
// and performs 2x upscaling. The key difference between this configuration and
// what was presented in the original paper is the use of pooling layer
// between conv1 and conv2 by doing bilinear upsampling so that we can
// utilize texture units in the shader to do that for "free".
//
// Using such pooling allows for larger sensing areas, however 2x2 conv2
// is required to achieve best quiality. In many of my tests using such
// configuration resulted in much better convergence, better quality
// and faster runtime performance.
//
// Training was performed with Lasagne/Theano/Python/cuDNN framework
// on a single GeForce GTX Titan GPU and took 21 hours to achieve given quality.
// In addition to 91 training images from the paper a few extra one were
// prepared based on street photos of London's Piccadilly Circus.
//
// All final filter value were quantized in order to get constant reusage needed
// to fit into 224 vec4 constant limitation on some hardware. Such operation
// does not affect the final quality.
//
// Using other GPU APIs it is possible to achieve much higher runtime performance,
// while using more filters increases reconstruction quality.
//
// Image Super-Resolution Using Deep Convolutional Networks.
// Shadertoy implementation of SRCNN described in https://arxiv.org/pdf/1501.00092.pdf
//
// Created by Dmitry Andreev - and'2017
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

#define SRCNN_SHARPEN   1
#define BICUBIC_SHARPEN 0

//

vec4 loadA(int x, int y)
{
    return texture(iChannel3, (vec2(float(x), float(y)) + 0.5) / iChannelResolution[3].xy);
}

vec4 loadD(int x, int y)
{
    return texture(iChannel2, (vec2(float(x), float(y)) + 0.5) / iChannelResolution[2].xy);
}

vec4 putChar(vec4 r, vec2 ouv, const int cx, const int cy)
{
    r = all(greaterThan(ouv, r.zw)) && all(lessThan(ouv, r.zw + vec2(1.0 / 34.0, 1.0 / 16.0)))
        ? vec4(ouv - r.zw + vec2(cx, cy) / 16.0 + vec2(1.0 / 60.0, 0.0), r.z, r.w) : r;

    r.z += 1.0 / 34.0;

    return r;
}

vec3 drawHud(vec3 clr, vec2 fragCoord)
{
    float s = iResolution.x / iResolution.y;
    vec2  uv = fragCoord.xy / iResolution.yy;
    vec2  ouv = uv;
    vec4  r = vec4(0.0);

    #define C(x, y) r = putChar(r, ouv, x, y);

    // Bicubic
    r.zw = vec2(0.108 * s, 0.93);
    C(2,11)C(9,9)C(3,9)C(5,8)C(2,9)C(9,9)C(3,9)

    // SRCNN
    r.zw = vec2(0.458 * s, 0.93);
    C(3,10)C(2,10)C(3,11)C(14,11)C(14,11)

    // Original
    r.zw = vec2(0.767 * s, 0.93);
    C(15,11)C(2,8)C(9,9)C(7,9)C(9,9)C(14,9)C(1,9)C(12,9)

    uv = r.xy;

    // textureGrad is not supported in some browsers. Use mips bias instead.
    // float d = textureGrad(iChannel1, uv, dFdx(ouv) * 0.5, dFdy(ouv) * 0.5).w;
    float d = texture(iChannel1, uv).w;

    float q = fwidth(ouv.y) * 10.0;
    float text = smoothstep(-q, q, 0.49 - d);
    float shadow = smoothstep(-q * 2.0, q * 2.0, 0.52 - d);

    // Header bar.
    if (ouv.y > 0.92)
        clr *= 0.3;

    // Separation lines.
    if (floor(fragCoord.x) == floor(iResolution.x / 3.0) || floor(fragCoord.x) == floor(iResolution.x * 2.0 / 3.0))
        clr = vec3(0.0);

    clr = mix(mix(clr, clr * 0.18, shadow), vec3(1.0), text);

    return clr;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2  ms   = loadA(0, 0).xy;
    vec2  fms  = ms - 3.0 * floor(ms / 3.0);
    vec2  fms3 = ms - 6.0 * floor(ms / 6.0);

    float view_size = floor(iResolution.x / 3.0);
    vec2  padding = vec2(34.5);
    vec2  stc = floor(fragCoord.xy) + padding;
    
    if (floor(fragCoord.x) < view_size)
    {
        // Bicubic

        vec2 res = 3.0 * iChannelResolution[2].xy;
        
        fragColor = texture(iChannel2, (stc - fms3) / res);

        #if BICUBIC_SHARPEN
            vec3 l = texture(iChannel2, (stc - fms3 + vec2(3.0, 0.0)) / res).rgb;
            vec3 r = texture(iChannel2, (stc - fms3 + vec2(-3.0, 0.0)) / res).rgb;
            vec3 t = texture(iChannel2, (stc - fms3 + vec2(0.0, 3.0)) / res).rgb;
            vec3 b = texture(iChannel2, (stc - fms3 + vec2(0.0, -3.0)) / res).rgb;
        
            fragColor.rgb = (fragColor.rgb * 5.0 - l - r - t - b) / 1.0;
        #endif
    }
    else if (floor(fragCoord.x) > floor(iResolution.x * 2.0 / 3.0))
    {
        // Original

        fragColor = texture(iChannel3, ((stc - floor(vec2(iResolution.x * 2.0 / 3.0, 0.0))
             + 3.0 * floor(vec2(iResolution.x * 0.75, 0.0))) - fms) / (3.0 * iChannelResolution[3].xy));
    }   
    else
    {
        // SRCNN

        vec2  res = 3.0 * iChannelResolution[2].xy;
        vec4  c = texture(iChannel2, (stc - vec2(view_size, 0.0) - fms3) / res);

        float bicubic_luma = dot(c.rgb, vec3(0.299, 0.587, 0.114));
        vec3  bicubic_chroma = c.rgb - vec3(bicubic_luma);

        #if SRCNN_SHARPEN
        {
            float l = texture(iChannel2, (stc - vec2(view_size, 0.0) - fms3 + vec2(3.0, 0.0)) / res).a;
            float r = texture(iChannel2, (stc - vec2(view_size, 0.0) - fms3 + vec2(-3.0, 0.0)) / res).a;
            float t = texture(iChannel2, (stc - vec2(view_size, 0.0) - fms3 + vec2(0.0, 3.0)) / res).a;
            float b = texture(iChannel2, (stc - vec2(view_size, 0.0) - fms3 + vec2(0.0,-3.0)) / res).a;

            fragColor.rgb = bicubic_chroma + (c.a * 12.0 - l - r - t - b) * 0.125;
        }
        #else
        {
            fragColor.rgb = bicubic_chroma + c.a;
        }
        #endif
    }

    fragColor.rgb = drawHud(fragColor.rgb, fragCoord);
    fragColor.a = 1.0;
}

#include <../common/main_shadertoy.frag>
