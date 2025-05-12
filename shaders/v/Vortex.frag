/* "Vortex" by @kishimisu (2024) - https://www.shadertoy.com/view/MX33Dr
      
   It eventually leads somewhere...
   
   [388 → 378 chars by @Xor]
*/
#include <../common/common_header.frag>
#define R mat2(cos(vec4(0,11,33,0)

void mainImage(out vec4 O, vec2 F) {
    
    vec3    V             = iResolution, 
              o           ;
    float       r         = iTime,
                  t       = .1, 
                    e     , 
                      x   ;

    for (O *= e; e++ < 40.;
        
        o.y += t*t*.09,
        o.z = mod(o.z + r, .2) - .1,
        x = t*.06 - r*.2,
        
        o.x = fract(
            o.xy *= R+round((atan(o.y, o.x) - x) / .314) * .314 + x))
        ).x - .8,
        
        t += x = length(o)*.5 - .014,
        
        O += (1. + cos(t*.5 + r + vec4(0,1,2,0)))
           * (.3 + sin(3.*t + r*5.)/4.)
           / (8. + x*4e2)
    )
        o = t * normalize(vec3((F+F-V.xy)*R+r*.15)),V.y));
}
#include <../common/main_shadertoy.frag>