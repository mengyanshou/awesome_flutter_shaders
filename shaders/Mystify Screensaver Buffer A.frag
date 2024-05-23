#include <common/common_header.frag>
//Make random values more random
float randSeed = 0.;

#define FLOORI(x) float(int(floor(x)))

/* old function
float smoothRand(float interval, float seed) {
    float next = rand(1.+floor(iTime/interval)+seed);
    float curr = rand(floor(iTime/interval)+seed);
    randSeed++;
    return mix(curr, next, fract(iTime/interval));
}
*/

float smoothRand(float interval, float seed) {
    float next = rand(.000001*FLOORI(1000000.*(1.+FLOORI(iTime/interval)+seed+randSeed)));
    float curr = rand(.000001*FLOORI(1000000.*(FLOORI(iTime/interval)+seed+randSeed)));
    randSeed++;
    return mix(curr, next, fract(iTime/interval));
}

float f(vec2 point) {
	return sin(point.x*2.+iTime*1.275)+point.y;   
}

vec2 grad( in vec2 x )
{
    vec2 h = vec2( 0.01, 0.0 );
    return vec2( f(x+h.xy) - f(x-h.xy),
                 f(x+h.yx) - f(x-h.yx) )/(2.0*h.x);
}

//https://iquilezles.org/articles/distance
float color( in vec2 point, in int lineWidth, in vec3 iResolution)
{
    float v = f( point );
    vec2  g = grad( point );
    float de = abs(v)/length(g);
    float normalizedLineRadius = (float(max(5,lineWidth)) / iResolution.y) / 2.;
    float edgeWidth = 1. / iResolution.y;
    if(normalizedLineRadius<1./iResolution.x)
        return 0.;
    float eps = max(1./iResolution.x, 1./iResolution.y)*normalizedLineRadius;
    return 1.-clamp(smoothstep( 0., normalizedLineRadius, de ), 0., 1.);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{    
    //init
    vec2 uv = fragCoord/iResolution.xy;
    vec2 point = vec2( fragCoord.xy - 0.5*iResolution.xy );
	point = 2.0 * point.xy / iResolution.y;
    float x,y,z = 0.;
    fragColor = vec4(0);
 
    //Limit "frames" for uniterrupted animation
    float frameRatio = floor(iFrameRate/ 30.);
    if(mod(float(iFrame), frameRatio) != 0.) {
        float decay = sinNorm(iTime*0.789)*0.5+0.1;
        fragColor += texture(iChannel0, uv) * (1.-(1./(decay*iFrameRate)));

        //Clamp to prevent overexposure
        fragColor.r = clamp(fragColor.r, 0., 1.);
        fragColor.g = clamp(fragColor.g, 0., 1.);
        fragColor.b = clamp(fragColor.b, 0., 1.);
        return;   
    }
    
    //Scaling
    const float maxZoom = 1.5;
    const float minZoom = 0.5;
    const float changeInterval = 2.;
    float nextZ = rand(1.+floor(iTime/changeInterval));
    float currZ = rand(floor(iTime/changeInterval));
    z=minZoom+(maxZoom-minZoom)*mix(currZ, nextZ, fract(iTime/changeInterval));
    point/=vec2(z);
    
    //Rotation
    float rot = smoothRand(0.5,354.856)*PI;
    point=vec2(cos(rot)*point.x+sin(rot)*point.y, -sin(rot)*point.x+cos(rot)*point.y);
    
    //Translation
    point.x+=smoothRand(1.,842.546)*2.-1.;
    //No need to translate y here, bc y is set by the function in "f(point)" and the rotation.
    
    //Line
    const float minLength = 0.25;
    const float maxLength=0.5;
    float lineLength=minLength+smoothRand(4.,0.846)*(maxLength-minLength)+minLength;
    float linePoint = (point.x+lineLength/2.) / lineLength;
    //				clamp - make sure the value is in bounds
    //						  smoothVal - make the line thinner at the ends
    int lineWidth = int(clamp(floor(smoothVal(linePoint*100., 100.)*iResolution.x*0.025*z), 2., floor(iResolution.x*0.025*z)));//max(3,int((iResolution.x*0.1)*  pow((point.x*(1./lineLength)),3.)  ));
    if(point.x >= -lineLength / 2. && point.x <= lineLength / 2.) { //Only show a small segment
    	fragColor+=color(vec2(point.x,point.y), lineWidth, iResolution);//line(lineWidth, vec2(x,y), point, iResolution);
	}	
    /*if(point.x-x<0.005) {
        fragColor = vec4(1.);
    }
    if(point.y-y<0.005) {
		//fragColor = vec4(1.);
    }*/
    //Color
    fragColor.rgb*=hsv2rgb(vec3(fract(iTime/7.), sinNorm(iTime*rand(135.54))*0.4+0.6,1.));
    fragColor.rgb+=pow((fragColor.r+fragColor.g+fragColor.b)/3.+0.25,3.)-pow(0.25,3.);
    
    //Fade
    float decay = sinNorm(iTime*0.789)*0.5+0.25;
    fragColor += texture(iChannel0, uv) * (1.-(1./(decay*iFrameRate)));
    
    //Clamp to prevent overexposure
    fragColor.r = clamp(fragColor.r, 0., 2.);
    fragColor.g = clamp(fragColor.g, 0., 2.);
    fragColor.b = clamp(fragColor.b, 0., 2.);
    fragColor.a = 0.;
}
#include <common/main_shadertoy.frag>