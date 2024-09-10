#include <common/common_header.frag>
#include <Hex Glitch Common.frag>
uniform sampler2D iChannel0;
#define kCaptureTimeDelay 0.0
#define kCaptureTimeSpeed 1.0

vec3 Render(vec2 uvScreen, int idx, int maxSamples, bool isDisplaced, float jpegDamage, out float blend)
{       
    #define kMBlurGain      (isDisplaced ? 100. : 10.0)
    #define kZoomOrder      2
    #define kEndPause       0.0
    #define kSpeed          0.15
     
    // x: Lambda
    // y: Motion blur
    // z, w: Warping and distortion
    
    // Sample the time domain for motion blur
    vec4 xi = Rand(iChannel0);
    uint hash = HashOf(uint(98796523), uint(gFragCoord.x), uint(gFragCoord.y));        
    xi.y = (float(idx) + HaltonBase2(uint(idx) + hash)) / float(maxSamples);
    //xi.x = OrderedDither();
    xi.x = xi.y;
    float time = 1. * max(0.0, iTime - kCaptureTimeDelay);
    time = (time * kCaptureTimeSpeed + xi.y * kMBlurGain / 60.0) * kSpeed; 
    //time = time - 0.2 * sqrt(uvScreen.y / iResolution.y);
    
    float phase = fract(time);
    int interval = int(time) & 1;    
    interval <<= 1;
    float morph;
    float warpedTime;
    float spectrumBlend;
    #define kIntervalPartition 0.85
    if(phase < kIntervalPartition)
    {
        float y = (interval == 0) ? uvScreen.y : (iResolution.y - uvScreen.y);
        warpedTime = (phase / kIntervalPartition) - 0.2 * sqrt(y / iResolution.y) - 0.1;
        phase = fract(warpedTime);
        morph = 1.0 - PaddedSmoothStep(sin01(kTwoPi * phase), 0., 0.4);
        blend = float(interval / 2) * 0.5;
        if(interval == 2) { warpedTime *= 0.5; }
    }
    else
    {
        time -=  0.8 * kSpeed * xi.y * kMBlurGain / 60.0;
        warpedTime = time;
        phase = (fract(time) - kIntervalPartition) / (1.0 - kIntervalPartition);
        morph = 1.0;
        blend = (KickDrop(phase, vec2(0.0, 0.0), vec2(0.2, -0.1), vec2(0.3, -0.1), vec2(0.7, 1.0)) + float(interval / 2)) * 0.5;        
        interval++;
    }
    
    float beta = abs(2.0 * max(0.0, blend) - 1.0);
    
    #define kMaxIterations  2
    //int kMaxIterations = 2 + 2 * int(round(jpegDamage));
    #define kTurns 7
    #define kNumRipples 5
    //#define kRippleDelay 1.
    #define kRippleDelay (float(kNumRipples) / float(kTurns))
    #define kThickness mix(0.5, 0.4, morph)
    #define kExponent mix(0.05, 0.55, morph)
    
    float expMorph = pow(morph, 0.3);
    //#define kZoom mix(0.3, 0.3, expMorph)
    #define kZoom 0.35
    #define kScale mix(2.6, 1.1, expMorph)
    //float kScale = (exp(5. * (1. - expMorph)) - 1.) + 1.05;
    
    //#define kZoom 0.35
    //#define kScale mix(1.7, 1.3, pow(phase, 0.3))    

    // Apply the transformation matrix and clip to screen space
    mat3 M = WorldToViewMatrix(blend * kTwoPi, vec2(0.0), kZoom);
    vec2 uvView = TransformScreenToWorld(uvScreen);
    int invert = 0;
     
   
    // Defocus blur
    //vec4 blueNoise = texture(iChannel0, vec2(fract(iTime * 0.002), 0.5));
    //blueNoise = pow(saturate((blueNoise - 0.5) / (1.0 - 0.5)), vec4(2.0));
    //uvView += vec2(cos(kTwoPi * xi.z), sin(kTwoPi * xi.z)) * xi.w * 0.05 * blueNoise.x;
    
    // Chromatic aberration
    //uvView /= 1.0 + mix(0.1, 0.5, length(uvView) * xiLambda * blueNoise.y); // Dynamic
    uvView /= 1.0 + 0.05 * length(uvView) * xi.z; // Static
    
    //uvView *= 1.0 + length(uvView) * xi * 0.05;

    uvView = (vec3(uvView, 1.0) * M).xy; 
    
     vec3 bary;
    ivec2 ij;
    Cartesian2DToHexagonalTiling(uvView / 1.4, bary, ij);    
    //float len = cwiseMax(abs(bary * mix(1.2, 1., cos01(1. * kTwoPi * blend))));
    float len = cwiseMax(abs(bary));
    //if(ij == ivec2(0) && len > 0.995 && len <= 1.) invert = 1;
    
    vec2 uvViewWarp = uvView;
    uvViewWarp.y *= mix(1.0, 0.1, sqr(1.0 - morph) * xi.y * saturate(sqr(0.5 * (1.0 + uvView.y))));   
    //uvViewWarp.x += mix(-1.0, 1.0, xi.w) * 0.002;
    
    float theta = toRad(30.0) * beta;
    mat2 r = mat2(vec2(cos(theta), -sin(theta)), vec2(sin(theta), cos(theta)));
    uvViewWarp = r * uvViewWarp;    

    vec3 sigma = vec3(0.0);
    for(int iterIdx = 0; iterIdx < kMaxIterations; ++iterIdx)
    {   
        vec3 bary;
        ivec2 ij;
        Cartesian2DToHexagonalTiling(uvViewWarp, bary, ij);        
                        
        if(!isDisplaced && ij != ivec2(0)) { break; }   
        
        //if(iterIdx == 0 && cwiseMax(abs(bary)) > 0.99) { invert = invert ^ 1; }
        
        int subdiv = 1 + int(exp(-sqr(10. * mix(-1., 1., phase))) * 100.);
        
        float theta = kTwoPi * (floor(cos01(kTwoPi * phase) * 12.) / 6.);
        Cartesian2DToHexagonalTiling(uvViewWarp * (0.1 + float(subdiv)) - kHexRatio.y * vec2(sin(theta), cos(theta)) * floor(0.5 + sin01(kTwoPi * phase) * 2.) / 2., bary, ij);        
        uint hexHash = HashOf(uint(phase * 6.), uint(subdiv), uint(ij.x), uint(ij.y));
        if(hexHash % 2u == 0u)
        {
            float alpha = PaddedSmoothStep(sin01(phase * 20.0), 0.2, 0.75);
            float dist = mix(cwiseMax(abs(bary)), length(uvView) * 2.5, 1.0 - alpha);
            float hashSum = bary[hexHash % 3u] + bary[(hexHash + 1u) % 3u];

            if( dist > 1.0 - 0.02 * float(subdiv)) { invert = invert ^ 1; }
            else if( fract(20. / float(subdiv) * hashSum) < 0.5)  { invert = invert ^ 1; }
            if(iterIdx == 0) break;
        }
        
        float sigma = 0.0, sigmaWeight = 0.0;
        for(int j = 0; j < kTurns; ++j)
        {   
            float delta = float(j) / float(kTurns);
            float theta = kTwoPi * delta;
            for(int i = 0; i < kNumRipples; ++i)
            {
                float l = length(uvViewWarp - vec2(cos(theta), sin(theta))) * 0.5;
                float weight = log2(1.0 / (l + 1e-10));
                sigma += fract(l - pow(fract((float(j) + float(i) / kRippleDelay) / float(kTurns) + warpedTime), kExponent)) * weight;
                sigmaWeight += weight;
            }            
        }
        invert = invert ^ int((sigma / sigmaWeight) > kThickness);
        
        //return vec3(sigma / sigmaWeight); 
       
        theta = kTwoPi * (floor(cos01(kTwoPi * -phase) * 5. * 6.) / 6.);
        uvViewWarp = r * (uvViewWarp + vec2(cos(theta), sin(theta)) * 0.5);
        uvViewWarp *= kScale; 
    }
    
    sigma = vec3(float(invert != 0));
    
    return mix(1.0 - sigma, sigma * mix(kOne, SampleSpectrum(xi.x), sqr(beta)), beta);
}

bool Interfere(inout vec2 xy, inout vec3 tint, in vec2 res)
{
    #define kStatic true
    #define kStaticFrequency 0.1
    #define kStaticLowMagnitude 0.01
    #define kStaticHighMagnitude 0.02
    
    #define kVDisplace true
    #define kVDisplaceFrequency 0.07
    
    #define kHDisplace true
    #define kHDisplaceFrequency 0.25
    #define kHDisplaceVMagnitude 0.1
    #define kHDisplaceHMagnitude 0.5
    
    float frameHash = HashToFloat(HashOf(uint(iFrame / int(10.0 / kCaptureTimeSpeed))));
    bool isDisplaced = false;
    
    if(kStatic)
    {
        // Every now and then, add a ton of static
        float interP = 0.01, displacement = res.x * kStaticLowMagnitude;
        if(frameHash < kStaticFrequency)
        {
            interP = 0.5;
            displacement = kStaticHighMagnitude * res.x;
            tint = vec3(0.5);
        }

        // CRT interference at PAL refresh rate 
        PCGInitialise(HashOf(uint(xy.y / 2.), uint(iFrame / int(60.0 / (24.0 * kCaptureTimeSpeed)))));
        vec4 xi = Rand();
        if(xi.x < interP) 
        {  
            float mag = mix(-1.0, 1.0, xi.y);        
            xy.x -= displacement * sign(mag) * sqr(abs(mag)); 
            //isDisplaced = true;
        }
    }
    
    // Vertical displacment
    if(kVDisplace && frameHash > 1.0 - kVDisplaceFrequency)
    {
        float dispX = HashToFloat(HashOf(8783u, uint(iFrame / int(10.0 / kCaptureTimeSpeed))));
        float dispY = HashToFloat(HashOf(364719u, uint(iFrame / int(12.0 / kCaptureTimeSpeed))));
        
        if(xy.y < dispX * res.y) 
        { 
            xy.y -= mix(-1.0, 1.0, dispY) * res.y * 0.2; 
            isDisplaced = true;
            tint = vec3(3.);
        }
    }
    // Horizontal displacment
    else if(kHDisplace && frameHash > 1.0 - kHDisplaceFrequency - kVDisplaceFrequency)
    {
        float dispX = HashToFloat(HashOf(147251u, uint(iFrame / int(9.0 / kCaptureTimeSpeed))));
        float dispY = HashToFloat(HashOf(287512u, uint(iFrame / int(11.0 / kCaptureTimeSpeed))));
        float dispZ = HashToFloat(HashOf(8756123u, uint(iFrame / int(7.0 / kCaptureTimeSpeed))));
        
        if(xy.y > dispX * res.y && xy.y < (dispX + mix(0.0, kHDisplaceVMagnitude, dispZ)) * res.y) 
        { 
            xy.x -= mix(-1.0, 1.0, dispY) * res.x * kHDisplaceHMagnitude; 
            isDisplaced = true;
            tint = vec3(3.);
        }
    }
    
    return isDisplaced;
}

void mainImage( out vec4 rgba, in vec2 xy )
{
    rgba = vec4(0.);
    SetGlobals(xy, iResolution.xy, iTime);   
    
    if(xy.x > iResolution.x / float(kScreenDownsample) || xy.y > iResolution.y / float(kScreenDownsample)) { return; }      
    
    xy *= float(kScreenDownsample);
       
    vec3 tint;
    vec2 xyInterfere = xy;
    bool isDisplaced = Interfere(xyInterfere, tint, iResolution.xy);
    
    ivec2 xyDither = ivec2(xy) / int(HashOf(uint(iTime + sin(iTime) * 1.5), uint(xyInterfere.x / 128.), uint(xyInterfere.y / 128.)) & 127u);
    float jpegDamage = OrderedDither(xyDither);
   
    #define kAntiAlias 5
    vec3 rgb = vec3(0.0);
    float blend = 0.0;
    for(int i = 0, idx = 0; i < kAntiAlias; ++i)
    {
        for(int j = 0; j < kAntiAlias; ++j, ++idx)
        {
            vec2 xyAA = xyInterfere + vec2(float(i) / float(kAntiAlias), float(j) / float(kAntiAlias));            
            
            rgb += Render(xyAA, idx, sqr(kAntiAlias), isDisplaced, jpegDamage, blend);
        }
    }
    
    rgb /= float(sqr(kAntiAlias));
    rgb = mix(rgb, Overlay(rgb, vec3(.15, 0.29, 0.39)), blend);
    
    if(isDisplaced)
    {
        #define kColourQuantisation 5
        //int kColourQuantisation = (isDisplaced) ? 2 : (5 + int(HashOf(uint(iTime + cos(iTime) * 1.5), uint(xyInterfere.x / 128.), uint(xyInterfere.y / 128.)) % 5u));
        rgb *= float(kColourQuantisation);
        if(fract(rgb.x) > jpegDamage) rgb.x += 1.0;
        if(fract(rgb.y) > jpegDamage) rgb.y += 1.0;
        if(fract(rgb.z) > jpegDamage) rgb.z += 1.0;
        rgb = floor(rgb) / float(kColourQuantisation);
    }

        
    // Scanlines
    //rgb *= mix(1.0, 0.9, float((int(xy.y) / kScreenDownsample) & 1));
    
    // Grade
    vec3 hsv = RGBToHSV(rgb);    
    hsv.x += -sin((hsv.x + 0.05) * kTwoPi) * 0.07;
    hsv.y *= 1.0;    
    rgb = HSVToRGB(hsv);
    
    rgba.xyz = rgb;    
    rgba.w = 1.0;
}

#include <common/main_shadertoy.frag>