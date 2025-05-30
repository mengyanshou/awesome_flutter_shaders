#include <../common/common_header.frag>
// superResolution - Buf A
//
// Initial processing and mouse navigation.
//
// Image Super-Resolution Using Deep Convolutional Networks.
// Shadertoy implementation of SRCNN described in https://arxiv.org/pdf/1501.00092.pdf
//
// Created by Dmitry Andreev - and'2017
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

#define DO_TEST_UPSCALE 0

//

vec4 loadSelf(int x, int y)
{
    return texture(iChannel1, (vec2(x, y) + 0.5) / iChannelResolution[1].xy);
}

vec2 mirror_uv(vec2 uv)
{
    #if DO_TEST_UPSCALE
        uv *= 0.5;
    #endif

    return 2.0 - (abs(fract(uv / 2.0) - 0.5) + 0.5) * 2.0;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 stc = floor(fragCoord);

    // Mouse control.

    vec4 self = loadSelf(0, 0);
    vec4 new_self = self;

    if (iMouse.z >= 0.0 && iMouse.w >= 0.0)
        new_self.xy = floor(self.zw + (iMouse.xy - iMouse.zw));
    else
        new_self.zw = self.xy;

    if (iMouse.x == iMouse.z && iMouse.y == iMouse.w)
        new_self.xyzw = self.xyxy;

    if (stc.x == 0.0 && stc.y == 0.0)
        fragColor = new_self;

    // Start with some nice image framing.

    if (iFrame == 0)
    {
        new_self = -vec2(625, 405).xyxy;
        fragColor = new_self;
    }

    // Downsample original input with pre-filtering.

    if (!(stc.x == 0.0 && stc.y == 0.0))
    {
        vec2 mpos  = new_self.xy;
        vec2 offs  = 0.5 - floor(floor(mpos / 3.0) / 2.0) * 2.0;
        vec2 tsize = iChannelResolution[0].xy;

        float bias = -1.0;
        vec3 tl = texture(iChannel0, mirror_uv((stc.xy * 2.0 + vec2(-0.25,-1  ) + offs) / tsize)).rgb;
        vec3 tr = texture(iChannel0, mirror_uv((stc.xy * 2.0 + vec2( 1.25,-1  ) + offs) / tsize)).rgb;
        vec3 bl = texture(iChannel0, mirror_uv((stc.xy * 2.0 + vec2(-0.25, 2  ) + offs) / tsize)).rgb;
        vec3 br = texture(iChannel0, mirror_uv((stc.xy * 2.0 + vec2( 1.25, 2  ) + offs) / tsize)).rgb;
        vec3 cl = texture(iChannel0, mirror_uv((stc.xy * 2.0 + vec2(   -1, 0.5) + offs) / tsize)).rgb;
        vec3 cr = texture(iChannel0, mirror_uv((stc.xy * 2.0 + vec2(    2, 0.5) + offs) / tsize)).rgb;
        vec3 cc = texture(iChannel0, mirror_uv((stc.xy * 2.0 + vec2(  0.5, 0.5) + offs) / tsize)).rgb;

        // fragColor.rgb = cc;

        // Before doing bilinear downsampling, input data has to be pre-filtered to minimize aliasing.
        // This effect happens naturally in optical systems when taking pictures.

        fragColor.rgb = (2.0 * (tl + tr + bl + br) + 3.0 * (cl + cr) + 18.0 * cc) / 32.0;

        // Put luminance into alpha channel.
        fragColor.a = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));

        if (floor(fragCoord.x) > iResolution.x * 0.75)
        {
            // Store original image on the right side of Buf A
            // so we have a single place where input gets specified in Shadertoy.

            vec2 uv = (stc - floor(vec2(iResolution.x * 0.75, 0.0)) + 0.5 - floor(mpos / 3.0)) / iChannelResolution[0].xy;
            fragColor = texture(iChannel0, mirror_uv(uv));
        }
    }
}

#include <../common/main_shadertoy.frag>