#include <../common/common_header.frag>
// https://www.shadertoy.com/view/llj3Dz
//Use as you will.


uniform sampler2D iChannel0;

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    //Sawtooth function to pulse from centre.
    float offset = (iTime- floor(iTime))/iTime;
	float CurrentTime = (iTime)*(offset);    
    
	vec3 WaveParams = vec3(10.0, 0.8, 0.1 ); 
    
    float ratio = iResolution.y/iResolution.x;
    
    //Use this if you want to place the centre with the mouse instead
	vec2 WaveCentre = vec2( iMouse.xy / iResolution.xy );
       
    // vec2 WaveCentre = vec2(0.5, 0.5);
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
        
        //The direction of the distortion
		vec2 DiffTexCoord = normalize(texCoord - WaveCentre);         
        
        //Perform the distortion and reduce the effect over time
		texCoord += ((DiffTexCoord * DiffTime) / (CurrentTime * Dist * 40.0));
		Color = texture(iChannel0, texCoord);
        
        //Blow out the color and reduce the effect over time
		Color += (Color * ScaleDiff) / (CurrentTime * Dist * 40.0);
	} 
    
	fragColor = Color; 
}

#include <../common/main_shadertoy.frag>