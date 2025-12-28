// --- Migrate Log ---
// 初始化局部变量 L 以避免未定义行为
// 初始化 a 变量
// --- Migrate Log (EN) ---
// Initialize local variable L to avoid undefined behavior
// Initialize variable a

#include <../common/common_header.frag>

/*
    "Origami" by @XorDev

    I wanted to try out soft shading like paper,
    but quickly discovered it looks better with
    color and looks like bounce lighting!

    X : X.com/XorDev/status/1727206969038213426
    Twigl: twigl.app?ol=true&ss=-NjpcsfowUETZLMr_Ki6

    <512 char playlist: shadertoy.com/playlist/N3SyzR
    Thanks to FabriceNeyret2 for many tricks
*/
//Rotate trick
#define R mat2(cos(a/4.+vec4(0,11,33,0)))

void mainImage(out vec4 O, vec2 I )
{
    //Initialize hue and clear fragcolor
    vec4 h; O=++h;
    
    //Uvs and resolution for scaling
    vec2 u,r=iResolution.xy;
    //Alpha, length, angle and iterator/radius
    float A = 0.0; float l = 0.0; float L = 0.0; float a = 0.0;
    for(float i=7.;--i>0.;
            //A = anti-aliased alpha using SDF
            //Pick layer color
            O=mix(h=sin(i+a/3.+vec4(1,3,5,0))*.2+.7,O, A=min(--l*r.y*.02,1.))*
            //Soft shading
            (l + h + .5*A*u.y/L )/L)
        
        //Smoothly rotate a quarter at a time
        a-=sin(a-=sin(a=iTime*4.+i*.4)),
        //Scale and center
        u=(I+I-r)/r.y/.1,
        //Compute round square SDF
        L = l = max(length(u -= R*clamp(u*R,-i,i)),1.);
        
        
}

#include <../common/main_shadertoy.frag>

///Original [329]
/*
//Rotate trick
#define R mat2(cos(a/4.+vec4(0,11,33,0)))

void mainImage(out vec4 O, vec2 I )
{
    //Initialize hue and clear fragcolor
    vec4 h; O=++h;
    
    //Uvs and resolution for scaling
    vec2 u,r=iResolution.xy;
    //Alpha, length, angle and iterator/radius
    for(float A,l,a,i=.6;i>.1;i-=.1)
        //Smoothly rotate a quarter at a time
        a-=sin(a-=sin(a=(iTime+i)*4.)),
        //Scale and center
        u=(I+I-r)/r.y,
        //Compute round square SDF
        l=max(length(u-=R*clamp(u*R,-i,i)),.1),
        //Compute anti-aliased alpha using SDF
        A=min((l-.1)*r.y*.2,1.),
        //Pick layer color
        O=mix(h=sin(i/.1+a/3.+vec4(1,3,5,0))*.2+.7,O,A)*
        //Soft shading
        mix(h/h,h+.5*A*u.y/l,.1/l);
}
*/