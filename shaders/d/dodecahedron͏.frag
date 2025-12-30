// --- Migrate Log ---
// 初始化局部变量（初始化 d, tempFresnel），并把对 iChannel0 的 texelFetch 替换为 SG_TEXELFETCH0；
// 在文件顶部加入共用 include，并补充缺失的 `uniform sampler2D iChannel0`。
// 未对算法或相机作其它更改。
//
// Initialize local variables (initialize d, tempFresnel) and replace texelFetch(iChannel0) with SG_TEXELFETCH0;
// Add common include at top and declare missing `uniform sampler2D iChannel0`.
// No other algorithmic/camera changes were made.

#include <../common/common_header.frag>
uniform sampler2D iChannel0;

//#define bufferless
//#define borthrallaMode
//#define ultra 
//  ^ TRY THIS ^ //

const int bounces = 4096;



const float phi = (1.+sqrt(5.))*.5;
float dodecahedron(vec3 p){

    const vec3 n = normalize(vec3(phi,1,0));

    p = abs(p);
	float a = dot(p,n.xyz);
    float b = dot(p,n.zxy);
    float c = dot(p,n.yzx);
    return max(max(a,b),c)-phi*n.y;
} // Stolen *ahem* Permanently Borrowed™ from https://www.shadertoy.com/view/XtKfWW

#define n(x) m=min(m, x)
float df(vec3 p){
    float m = 1e9;
    
    //n(length(p) - .9);
    n(dodecahedron(p));
    
    #ifdef borthrallaMode
        m = max(m, .6 - length(p));
    #endif
    
      
    return m;
}

vec3 norm(vec3 p, float e){
    return normalize(vec3(
        df(p + vec3(e, 0, 0)) - df(p - vec3(e, 0, 0)),
        df(p + vec3(0, e, 0)) - df(p - vec3(0, e, 0)),
        df(p + vec3(0, 0, e)) - df(p - vec3(0, 0, e))
    ));
}

void mainImage( out vec4 O, vec2 U ){

    vec2 r = iResolution.xy;
    vec2 uv = U/r;
    vec2 cuv = (2.*U-r)/r.y;
    vec2 muv = 
    #ifdef bufferless
    iMouse.z > 0.?(2.*iMouse.xy-r)/r.y:vec2(iTime/2., .3); // Bufferless mouse controls.
    #else
    SG_TEXELFETCH0(ivec2(0)).xy;
    #endif
    
    vec3 o = vec3(0);
    vec3 dir = vec3(sin(muv.x)*cos(muv.y), cos(muv.x)*cos(muv.y), sin(muv.y));
    o -= dir*
    #ifdef borthrallaMode
    2.
    #else
    3.
    #endif
    ;
    vec3 right = normalize(cross(dir, vec3(0, 0, 1)));
    vec3 up = cross(right, dir);
    
    vec2 camUV = cuv * .5;
    vec3 dirV = vec3(sin(camUV.x)*cos(camUV.y), cos(camUV.x)*cos(camUV.y), sin(camUV.y));
    dirV = normalize(dir * dirV.y + right * dirV.x + up * dirV.z);

    vec3 p = o;
    float d = 0.0, t = 0.0;
    for (int i = 128; i-->0;){
        p = o + dirV * t;
        d = df(p);
        t += d*1.1;
        if (d < 0.) i--;
    }
    
    vec3 normal = norm(p, 1e-4);
    float edge = 1.-dot(norm(p, 32./r.y), normal);

    if (length(p) > 2.){ // Skybox
        O = vec4(0);
        if (dirV.z < 0.){
            t = (o.z + 1.) / -dirV.z;
            p = o + dirV * t;
            O = vec4(1.) / (1. + p.x*p.x*2. + p.y*p.y);
        }
        return;
    }

    // Surface reflection
    float fresnel = pow(1.+dot(normal, dirV), 5.);
    float tempFresnel = 0.0;
    
    if (edge > 1e-4){ // Outer frame styling
        O = vec4(0);
        return;
    } 
            
    // Recursive reflection stuff!
    
    O = vec4(1,0,0,1);
    // Set to red to debug 
    
    float totalT = t;
    t = 0.;
    float attenuation = 1.;
    p += dirV * 
    #ifdef borthrallaMode
    .05
    #else
    .1
    #endif
    ;
    // Light bar thickness. Cannot be zero. 
    normal = norm(p, 1e-4);
    edge = 1.-dot(norm(p, .05), normal);
    
    if (edge > 1e-4){ // First visible light
        O = vec4(1);
        return;
    }

    for (int b = 0; b<bounces; b++){
        for (int i = 0; i<
        #ifdef ultra
        int(max(exp(-float(b))*128., 32.))
        #else
        int(max(exp(-float(b))*64., 12.))
        #endif
        ; i++){
            
            d = df(p);
            p -= dirV * d;
            totalT -= d;

        }
        
        normal = norm(p, 1e-4);
        edge = 1.-dot(norm(p, 
        #ifdef ultra
        .01
        #else
        .05
        #endif
        ), normal);
        //tempFresnel = pow(1.-dot(normal, dirV), 5.);
        
        attenuation *= 
        #ifdef ultra
        .95
        #else
        .9
        #endif
        ;
        
        if (edge > 1e-4){
            O = vec4(attenuation);
            break;
        }
        
        dirV = reflect(dirV, normal);
        p += dirV;
    }
    
    O = mix(O, vec4(0), fresnel);
}

#include <../common/main_shadertoy.frag>