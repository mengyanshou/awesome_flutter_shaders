// --- Migrate Log ---
// 初始化局部变量并使用整数循环计数器以兼容 SkSL；初始化累积变量 `w`；保持算法不变
// --- Migrate Log (EN) ---
// Initialize local variables and use an integer loop counter for SkSL compatibility; initialize accumulator `w`; keep algorithm unchanged

#include <../common/common_header.frag>

/*
    "Singularity" by @XorDev

    A whirling blackhole.
    Feel free to code golf!
    
    FabriceNeyret2: -19
    dean_the_coder: -12
    iq: -4
*/
void mainImage(out vec4 O, vec2 F)
{
    // Iterator and attenuation (distance-squared)
    float i = 0.2;
    float a = 0.0;
    // Resolution for scaling and centering
    vec2 r = iResolution.xy;
    // Centered ratio-corrected coordinates
    vec2 p = (F + F - r) / r.y / 0.7;
    // Diagonal vector for skewing
    vec2 d = vec2(-1.0, 1.0);
    // Blackhole center
    vec2 b = p - i * d;
    // Rotate and apply perspective
    vec2 c = p * mat2(vec2(1.0, 1.0), d / (0.1 + i / dot(b, b)));
    // Rotate into spiraling coordinates
    vec2 v = c * mat2(cos(0.5 * log(a = dot(c, c)) + iTime * i + vec4(0.0, 33.0, 11.0, 0.0))) / i;
    // Waves cumulative total for coloring (initialized)
    vec2 w = vec2(0.0);
    
    // Loop through waves — use integer loop counter for SkSL compatibility and preserve original progression
    for (int it = 1; it <= 9; it++) {
        float fi = float(it) + 0.2; // matches original i values inside the loop (1.2 ... 9.2)
        // Distort coordinates (body)
        v += 0.7 * sin(v.yx * fi + iTime * fi) / fi + 0.5;
        // Step: accumulate waves using updated v
        w += 1.0 + sin(v);
    }
    //Acretion disk radius
    i = length( sin(v/.3)*.4 + c*(3.+d) );
    //Red/blue gradient
    O = 1. - exp( -exp( c.x * vec4(.6,-.4,-1,0) )
                   //Wave coloring
                   /  w.xyyx
                   //Acretion disk brightness
                   / ( 2. + i*i/4. - i )
                   //Center darkness
                   / ( .5 + 1. / a )
                   //Rim highlight
                   / ( .03 + abs( length(p)-.7 ) )
             );
    }



//Original [432]
/*
void mainImage(out vec4 O,in vec2 F)
{
    vec2 p=(F*2.-iResolution.xy)/(iResolution.y*.7),
    d=vec2(-1,1),
    c=p*mat2(1,1,d/(.1+5./dot(5.*p-d,5.*p-d))),
    v=c;
    v*=mat2(cos(log(length(v))+iTime*.2+vec4(0,33,11,0)))*5.;
    vec4 o=vec4(0);
    for(float i;i++<9.;o+=sin(v.xyyx)+1.)
    v+=.7*sin(v.yx*i+iTime)/i+.5;
    O=1.-exp(-exp(c.x*vec4(.6,-.4,-1,0))/o
    /(.1+.1*pow(length(sin(v/.3)*.2+c*vec2(1,2))-1.,2.))
    /(1.+7.*exp(.3*c.y-dot(c,c)))
    /(.03+abs(length(p)-.7))*.2);
}*/

#include <../common/main_shadertoy.frag>