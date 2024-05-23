#include <common/common_header.frag>
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    //Seeds used in resolution change check
    float oldTextureSeed = texture(iChannel1,vec2(0.0, 0.0)).w;
    float newTextureSeed = SeedFromResolution(iResolution);
    
    //UV
    vec2 uv = fragCoord/iResolution.xy;
    vec2 landscapeUV = LandscapeUV(fragCoord, iResolution);
    vec2 centeredSquareUV = CenteredSquareUV(fragCoord, iResolution);
    vec2 dotsUV = QuakeLavaUV(centeredSquareUV * SCALE, 0.1, 2.0, 20.0, iTime);
    
    //Color Sampling
    float sourceMask = clamp((((simplexNoise(centeredSquareUV * 20.0 + vec2(iTime*0.3)) * 13.0) + 0.5)), 0.0, 1.0);
    vec3 sourceA = sampleGreatSpotASmoothstepFilter(landscapeUV);
    vec3 sourceB = sampleGreatSpotBSmoothstepFilter(landscapeUV);
    vec3 source = mix( sourceA, sourceB, sourceMask);
   

    //If resolution changed then reset simulation
    if(iFrame == 0 || oldTextureSeed != newTextureSeed)
    {
        
        fragColor = vec4(source, newTextureSeed);
    }
    //Otherwise continue flow calculations
    else
    {
        //Flowfield Sampling
        vec3 flowfield = sampleFlowfieldBilinearFilter(landscapeUV);
        vec2 flowfieldVelocity = flowfield.xy;
        if(iResolution.x < iResolution.y)
        {
            flowfieldVelocity = vec2(flowfieldVelocity.y, -flowfieldVelocity.x);
        }
        float turbulenceMask = flowfield.z;   
    
        //Turbulence
        float turbulenceBigScale = 5.0;
        vec2 turbulenceBigUV = QuakeLavaUV(centeredSquareUV * turbulenceBigScale, 0.1, 2.0, 2.0, iTime) + iTime * vec2(-0.5, 0.0);
        float turbulenceBigNoise =  simplexNoise(turbulenceBigUV);
        vec2 turbulenceBigVelocity = vec2(dFdy(turbulenceBigNoise), -dFdx(turbulenceBigNoise));
    
        float turbulenceSmallScale = 10.0;
        vec2 turbulenceSmallUV = QuakeLavaUV(centeredSquareUV * turbulenceSmallScale, 0.2, 2.0, 10.0, iTime);
        float turbulenceSmallNoise =  simplexNoise(turbulenceSmallUV);
        vec2 turbulenceSmallVelocity = vec2(dFdy(turbulenceSmallNoise), -dFdx(turbulenceSmallNoise));
    
        vec2 turbulenceVelocity = (turbulenceSmallVelocity * 0.1 + turbulenceBigVelocity) * min(iResolution.x,iResolution.y) /500.0;
   
        //Combined Flowfield
        vec2 combinedVelocity = flowfieldVelocity * 0.008 + turbulenceVelocity * 0.08 * turbulenceMask;
        
        //Anty mixing mask
        float maskA = pow(texture(iChannel0, dotsUV * 0.1 + iTime * vec2(-0.01,-0.015)).x, 5.5);
        float maskB = pow(texture(iChannel0,-dotsUV * 0.2 + iTime * vec2( 0.05, 0.040)).x, 5.5);
        float mask = max(maskA, maskB);
        vec3 previousFrame = texture(iChannel1, uv + combinedVelocity).xyz;
        //Reintroducing small amount of source color to counteract mixing
        vec3 previousMixedWithLogo = mix(previousFrame, source, mask*0.05 );
        
        fragColor = vec4(previousMixedWithLogo, newTextureSeed);
    }    
}
#include <common/main_shadertoy.frag>