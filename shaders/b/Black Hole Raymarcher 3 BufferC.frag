// --- Migrate Log ---
// 本次迁移修改:
// - 删除不兼容的浮点后缀并初始化局部变量以避免未定义行为。
// change summary:
// - Removed incompatible 'f' suffixes and initialized locals where needed.
// -------------------

#include <../common/common_header.frag>

uniform sampler2D iChannel0;
// Kelvin to RGB algorithm thanks to https://tannerhelland.com/2012/09/18/convert-temperature-rgb-algorithm-code.html
vec3 tempConvert( float temp)
{
    vec3 color = vec3(0.0);
    float newtemp = pow((temp / (1.0)), 3.0) * 255.0;
    if(newtemp <= 66.0) 
        {
            color.r = 255.0;
            color.g = 99.4708025861 * log(newtemp) - 161.1195681661;
            if(newtemp <= 19.0) {color.b = 0.0;}
                else 
                {
                    color.b = newtemp - 10.0;
                    color.b = 138.5177312231 * log(color.b) - 305.0447927307;
                }
        }
        else 
        {
            color.r = newtemp - 60.0;
            color.r = 329.698727446 * pow(color.r, -0.13321);
            color.g = newtemp - 60.0;
            color.g = 288.1221695283 * pow(color.g, -0.075515);
            color.b = 255.0;
        }
   
    return clamp(color / 610.0, 0.0, 1.0);
}


//ACES tonemapping
vec3 ACESFilm(vec3 x)
{
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0);
}


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;
    vec3 col = texture(iChannel0, uv).rgb;
    vec3 temp = tempConvert(col.r);
    
    //Quick and dirty faking of blue shift, mostly meant to look pretty
    vec3 shift = mix(vec3(1.0, 0.3, 0.1), vec3(0.55, 0.7, 1.0), vec3(col.g));
    
    col = vec3(pow(col.r, 2.0) * (temp / (temp + 1.0)));
    col *= shift;
    col = pow(mix(col, ACESFilm(col), 1.0), vec3(1.0 / 2.2));
     
   
    // Output to screen
    fragColor = vec4(col,1.0);
}

#include <../common/main_shadertoy.frag> 