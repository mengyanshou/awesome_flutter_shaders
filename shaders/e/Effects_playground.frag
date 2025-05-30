#include <../common/common_header.frag>
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
void applyDistortion(inout vec2 uv, vec2 pos, float power){
    float noiseX = texture(iChannel1, pos.xy / 768. + vec2(iTime * .01)).x;
    float noiseY = texture(iChannel1, pos.xy / 4096. + vec2(iTime * .01)).x;
 	uv += vec2((noiseX - 0.5) * power, (noiseY - 0.5) * power);   
}

void applyGray(inout vec3 color, float gray){
    float g = dot(color.rgb, vec3(.299, .587, .114));
    color = mix(color, vec3(g), gray);
}

vec4 getColorAt(vec2 pos, vec2 fragCoord){
    vec2 uv = vec2(pos);
    applyDistortion(uv, fragCoord, .008);
    
    vec4 color = texture(iChannel0, uv);
    
    applyGray(color.rgb, abs(sin(iTime)));
    return color;
}


float impulse( float k, float x )
{
    float h = k*x;
    return h*exp(1.0-h);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / iResolution.xy;    
	
    vec4 color = getColorAt(uv, fragCoord);
    //some kind of random chromatic abberation
    float abbPower = .01 * sin(iTime) * sin(uv.y * iTime * 10.);
    color.r = getColorAt(uv - vec2(abbPower, .0), fragCoord).r;
    color.b = getColorAt(uv + vec2(abbPower, .0), fragCoord).b;
                 
	fragColor = color;
}
#include <../common/main_shadertoy.frag>