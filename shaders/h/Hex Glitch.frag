#include <../common/common_header.frag>
#include <Hex Glitch Common.frag>
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
// Vignetting is an effect caused by composite lenses whereby the image appears darker around the edges.
// Despite being an artefact of lens design, it is often applied deliberately as an artistic effect to 
// frame the image and draw the eye inward toward the center. 
float Vignette(in vec2 fragCoord) {
    #define kVignetteStrength         0.5             // The strength of the vignette effect
    #define kVignetteScale            0.6            // The scale of the vignette effect
    #define kVignetteExponent         3.0             // The rate of attenuation of the vignette effect

    vec2 uv = fragCoord / iResolution.xy;
    uv.x = (uv.x - 0.5) * (iResolution.x / iResolution.y) + 0.5;

    float x = 2.0 * (uv.x - 0.5);
    float y = 2.0 * (uv.y - 0.5);

    float dist = sqrt(x * x + y * y) / kRoot2;

    return mix(1.0, max(0.0, 1.0 - pow(dist * kVignetteScale, kVignetteExponent)), kVignetteStrength);
}

void mainImage(out vec4 rgba, in vec2 xy) {
    SetGlobals(xy, iResolution.xy, iTime);
    PCGInitialise(HashOf(uint(iFrame)));

    vec3 rgb = kZero;
    // if(kApplyBloom)
    // {
    //     vec3 bloom = Bloom(xy / float(kScreenDownsample), iResolution, ivec2(0, 1), iChannel0) * kBloomGain; 
    //     if(kDebugBloom)
    //     {
    //          rgba = vec4(bloom, 1.0);
    //          return;
    //     }

    //     rgb = pow(bloom, vec3(1.));      
    // }  

    // Composite
    rgb += texelFetch(iChannel1, ivec2(xy) / kScreenDownsample, 0).xyz * 0.6;
    rgb = saturate(rgb);
    rgb = pow(rgb, vec3(0.8));
    rgb = mix(kOne * 0.1, kOne * 0.9, rgb);
    rgb *= Vignette(xy);

    rgb = saturate(rgb);

    rgba.xyz = rgb;
    rgba.w = 1.0;
}

#include <../common/main_shadertoy.frag>