// --- Migrate Log ---
// 添加 common_header 引入并补充 iChannel0 声明；保护对 iTime 的除法以及对归一化/除法的除零保护以避免 NaN
// --- Migrate Log (EN) ---
// Added common_header include and declared iChannel0; protect divisions by iTime and normalize/denominator to avoid NaNs

#include <../common/common_header.frag>
uniform sampler2D iChannel0;

//Use as you will.

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    //Sawtooth function to pulse from centre.
    float offset = (iTime > 0.0) ? (fract(iTime) / iTime) : 0.0;
	float CurrentTime = iTime * offset;
    
	vec3 WaveParams = vec3(10.0, 0.8, 0.1 ); 
    
    float ratio = iResolution.y/iResolution.x;
    
    //Use this if you want to place the centre with the mouse instead
	//vec2 WaveCentre = vec2( iMouse.xy / iResolution.xy );
       
    vec2 WaveCentre = vec2(0.5, 0.5);
    WaveCentre.y *= ratio; 
   
	vec2 texCoord = fragCoord.xy / iResolution.xy;      
    texCoord.y *= ratio;    
	float Dist = distance(texCoord, WaveCentre);
    

	
	vec4 Color = texture(iChannel0, texCoord);
    
//Only distort the pixels within the parameter distance from the centre
if ((Dist <= ((CurrentTime) + (WaveParams.z))) && 
	(Dist >= ((CurrentTime) - (WaveParams.z)))) 
	{
        //The pixel offset distance based on the input parameters
		float Diff = (Dist - CurrentTime); 
		float ScaleDiff = (1.0 - pow(abs(Diff * WaveParams.x), WaveParams.y)); 
		float DiffTime = (Diff  * ScaleDiff);
        
        //The direction of the distortion (safe normalize)
        vec2 _dir = texCoord - WaveCentre;
        float _dirLen = max(length(_dir), 1e-6);
        vec2 DiffTexCoord = _dir / _dirLen;         
        
        //Perform the distortion and reduce the effect over time (protect denominator)
        float _denom = max(CurrentTime * Dist * 40.0, 1e-6);
        texCoord += ((DiffTexCoord * DiffTime) / _denom);
        Color = texture(iChannel0, texCoord);
        
        //Blow out the color and reduce the effect over time
        Color += (Color * ScaleDiff) / _denom;
	} 
    
	fragColor = Color; 
}

#include <../common/main_shadertoy.frag>