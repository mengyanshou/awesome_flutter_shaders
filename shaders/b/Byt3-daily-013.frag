// --- Migrate Log ---
// 添加 Flutter 兼容性 include 文件，更改 for 循环计数器为 int 类型
// Added Flutter compatibility includes, changed for loop counter to int type
/** 

    License: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License
    
    Inspired by @Shanes' recent shaders, just trying to figure the hexagon/cube thing. 
    Tweaked some things / did that inversion thing - thanks @mla for the looping tricks
    with IQ's/Shane's noise function - see common tab

    Byt3-daily-013
    08/28/2024  @byt3_m3chanic
    
*/

#include <../common/common_header.frag>
#include <Byt3-daily-013 Common.frag>
uniform vec4 iDate;
#define R     iResolution
#define T     iTime
#define M     iMouse

#define PI    3.141592653
#define PI2   6.283185307

// Hexagon grid system, can be simplified but
// written out long-form for readability. 
// return vec2 uv and vec2 id
vec4 hexgrid(vec2 uv) {
    vec2 p1 = floor(uv/vec2(1.732,1))+.5;
    vec2 p2 = floor((uv-vec2(1,.5))/vec2(1.732,1))+.5;
    
    vec2 h1 = uv-p1*vec2(1.732,1);
    vec2 h2 = uv-(p2+.5)*vec2(1.732,1);
    return dot(h1,h1) < dot(h2,h2) ? vec4(h1,p1) : vec4(h2,p2+.5);
}

vec3 hue(vec3 a) { 
    float t = a.x+T*.1;
    vec3 d = vec3(0.929,0.690,0.027);
    return .45 +.45*cos( PI2*t*vec3(.984,.914,.914)+d ); 
}
float truch(vec2 uv, vec2 id) {
    float ln = .125;
    vec2 vv = uv;
    vec2 vd = floor(vv*10.);
    vv = fract(vv*10.)-.5;
    float rnd = hash21(vd+id+iDate.z);
    if(rnd>.5) vv.x = -vv.x;
    
    float t = abs(max(abs(vv.x),abs(vv.y))-.5)-.02;
    vec2 q = length(vv-.5) < length(vv+.5) ? vv-.5 : vv+.5;
    float d = abs(length(q)-.5)-ln;
    if(fract(rnd*43.57)>.8) d = min(length(vv.x)-ln,length(vv.y)-ln);
    float ck = mod(vd.x+vd.y,2.)*2.-1.;
    return min(t,d);
}

void cube(inout vec3 C, vec2 uv, vec2 id, float px, float rnd, float lvl) {

    float ln = .005, hn = ln/2.;
    float hs = 1.;
    
    float d = max(abs(uv.x)*.866025 + abs(uv.y)/2., abs(uv.y))-(hs*.497);
    C = mix(C,vec3(0),smoothstep(px,-px,abs(d)-ln));
    
    uv.x -= (hs*.5);
    float tbase =length( abs(uv.x)*.866025 + abs(uv.y)/2.)- (hs*.433);
    float e = min(tbase, length(uv.y));
    
    rnd = fbm3(vec3(id*5.,1.));
    lvl = (lvl*1.35)+fract(rnd*31.37);
    
    // color sides
    C = mix(C,hue(vec3(lvl,.5,.8)),smoothstep(px,-px,max(tbase,d)) );
    C = mix(C,hue(vec3(lvl+.15,1,.4)),smoothstep(px,-px,max(max(uv.y,-tbase),d)) );
    C = mix(C,hue(vec3(lvl+.75,1,.2)),smoothstep(px,-px,max(max(max(-uv.y,uv.x),-tbase),d)) );

    if(lvl>1.) C = mix(C,rnd>.5? C+.25: C*.25,smoothstep(px,-px,length(uv+vec2(.52,0)*hs)-(hs*.35)));
    
    // truchet patterns
    id+=floor(rnd*15.);
    float uvx = uv.x*.86602;
    float uvy = uv.y/1.33;
    vec2 vv = vec2(uvx,uv.y/2.);

    vv *= rot(.78);
    vv *= 1.12;
    vv += vec2(.05,-.05);
    float t = truch(vv, id);
    C = mix(C,clamp(C+.25,C,vec3(1)),smoothstep(px,-px,max(max(tbase,d),t)) );
    
    vv = vec2(uvx,uvy)+vec2(uv.y*.5,0);
    vv *= 1.02;
    vv -= vec2(.055,.01);
    t = truch(vv, id);
    C = mix(C,clamp(C+.2,C,vec3(1)),smoothstep(px,-px,max(max(uv.y,max(d,-tbase)),t) ) );
    
    vv = vec2(uvx,uvy)-vec2(uv.y*.5,0);
    vv *= 1.02;
    vv -= vec2(.055,-.01);
    t = truch(vv, id);
    C = mix(C,clamp(C-.15,vec3(0),C),smoothstep(px,-px,max(max(max(-uv.y,uv.x),-tbase),t)) );
 
    C = mix(C,vec3(0),smoothstep(px,-px,max(abs(e)-hn,d)));
}

const float mx = 4.;
const float mz = mx-1.;
    
void mainImage( out vec4 fragColor, in vec2 F )
{
    vec2 uv = (2.*F-R.xy)/max(R.x,R.y);

    vec3 C = vec3(.004);
    uv *= rot(T*.05);
    uv = vec2(log(length(uv)),atan(uv.y,uv.x))-((2.*M.xy-R.xy)/R.xy);
    uv /= 3.627;
    uv *= N;
    uv.x += T*.05;
  
    float px = fwidth(uv.x);

    vec4 H;
    vec2 p, id;
    float rnd;
    
    
    for(int i=0; i<int(mx); i++) {
        float sc = mx-i;
        sc*=2.;
        H = hexgrid(uv.yx*sc);
        p = H.xy, id = H.zw;
        rnd = fbm3(vec3((id*sc)+i,1.));
        if(rnd>.55) cube(C,p,id*sc,px,rnd,i+.5);
        if(i<mz) C *= (i+.5)*.3;
        uv.x += T*.05;
    }
    
    fragColor = vec4(pow(C,vec3(.4545)),1);
}










// end

#include <../common/main_shadertoy.frag>

