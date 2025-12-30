// https://www.shadertoy.com/view/XfKSDy
// --- Migrate Log ---
// 添加 filter 适配：将 texture(iChannel0, ...) 替换为 SG_TEX0(...) 以支持可控 wrap/filter
// 在文件顶部加入 common_header.frag 并声明 uniform sampler2D iChannel0;
// --- Migrate Log (EN) ---
// Add filter adaptation: replace texture(iChannel0, ...) with SG_TEX0(...) to support controllable wrap/filter
// Insert common_header.frag include and declare uniform sampler2D iChannel0;

#include <../common/common_header.frag>
uniform sampler2D iChannel0;

#define PI 3.141592653589793


float newton( in float alpha, in float r0 )
{
    float sina = sin(alpha);
    return alpha + 0.25*(3.0 + cos(2.0*alpha) - 4.0 * r0 * sina)/(cos(alpha)*(r0+sina));
}


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 ratio = vec2(iResolution.x / iResolution.y, 1.0);
    vec2 uv = 4.0 * ratio * fragCoord/iResolution.xy - 2.0 * ratio; // y from -2.0 -> 2.0
    
    float r = length(uv);
    
    if (r <= 1.0)
    {
        fragColor = vec4(0.0, 0.0, 0.0, 1.0); // The Black Hole is Black
        return;
    }

    float alpha = newton(1.0/r, r); // three iterations of the newton method to solve (with Rs=1)
    alpha = newton(alpha, r);       //     0 == -sin(alpha)/r + Rs/(2 r^2) * (1 + cos(alpha)^2)
    alpha = newton(alpha, r);       // 1.0/r is the solution for small angle approx: sin(x) = x, cos(x) = 1
    
    /*
    Light had direction (1,0) and now gets rotated by angle a:
        (sin(a), cos(a)) / sin(a) = (1, cos(a)/sin(a))
    We are only interested in the y-Component, x should be 1.
    
    Black Hole o at 0, light ray starting at -1, direction to 1.
    No inflection at point +, with inflection at point @ and that's
    were we are sampling the texture (x is the view direction)

         x: 1    0   -1
            +----o----|
                /
               /
              /
             /
            @

    */
    uv *= (1.0 - 1.0 / tan(alpha)); // inflection
    
    uv = (uv+vec2(0.0,2.0))*0.125;
    
    vec3 color = SG_TEX0(iChannel0, uv + vec2(iTime*0.0625, 0.0)).rgb;
    color = pow(1.25*(color-0.0625), vec3(8.0*(1.0-1.0/r))); // brighten the image with lorentz^2 factor
    
    fragColor = vec4(pow(color, vec3(1.0/2.2)),1.0); // Gamma Correction for Gamma=2.2
}

#include <../common/main_shadertoy.frag> 
