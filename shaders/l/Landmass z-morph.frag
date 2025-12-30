// ============================================================================
// 迁移日志 / Migration Log:
// 项目 / Project: Shadertoy → Flutter/Skia SkSL
// 文件 / File: Landmass z-morph.frag
// 
// 关键修改 / Key Changes:
// 1. 移除 C 风格浮点后缀 (0.0f → 0.0 等) / Remove C-style float suffixes
// 2. 初始化全局变量 / Initialize global variables
// 3. 声明纹理采样器 / Declare texture samplers
// 4. 添加必要的 include 指令 / Add required include directives
// ============================================================================

// Landmass z-morph - Result of an improvised live coding session on Twitch
// Thankx to zblll, 5jeesus, stobeee and others for the ideas
// LIVE SHADER CODING, SHADER SHOWDOWN STYLE, EVERY TUESDAYS 20:00 Uk time: 
// https://www.twitch.tv/evvvvil_

#include <../common/common_header.frag>

uniform sampler2D iChannel0; // 修改 1 / Change 1: 声明纹理采样器 / Declare texture sampler

vec2 z,v,e=vec2(.0035,-.0035);float t,tt,mixer,g=0.0;vec3 np,modP,op,po,no,al,ld;
float bo(vec3 p,vec3 r) {p=abs(p)-r;return max(max(p.x,p.y),p.z);}
mat2 r2(float r){return mat2(cos(r),sin(r),-sin(r),cos(r));}
float smin( float d1, float d2, float k ){  float h = max(k-abs(d1-d2),0.0);return min(d1,d2)-h*h*0.25/k; }
float smax( float d1, float d2, float k ){  float h = max(k-abs(-d1-d2),0.0);return max(-d1,d2)+h*h*0.25/k; }
vec4 texNoise(vec2 uv){ float f = 0.0; f+=SG_TEX0(iChannel0, uv*.125).r*.5; f+=SG_TEX0(iChannel0,uv*.25).r*.25;
                       f+=SG_TEX0(iChannel0,uv*.5).r*.125; f+=SG_TEX0(iChannel0,uv*1.).r*.125; f=pow(f,1.2);return vec4(f*.45+.05);} // 修改 1 / Change 1: 移除 C 风格浮点后缀 (0.0f → 0.0)
vec2 fbAngular( vec3 p )
{
    float mMix=mix(2.0,1.0,clamp(mixer,.5,1.0)*2.0-1.0);//MATERIAL ID MIXER
    vec2 h,t=vec2(bo(p,vec3(21,.5,.5)),mMix); 
    h=vec2(bo(p,vec3(20.8,.3,.7)),2.0+mMix); 
    h.x=min(h.x,bo(p,vec3(20.6,.9,.1)));
    t=t.x<h.x?t:h;
    h=vec2(bo(p,vec3(20.8,.7,.3)),1.0); 
    p.x=mod(p.x,3.0)-1.5;
    h.x=min(h.x,length(p.xy)-.15+abs(p.z)*.1);
    t=t.x<h.x?t:h;
    return t;
} // 修改 2 / Change 2: 移除 C 风格浮点后缀 (2.0 替代 2.)
vec2 mp( vec3 p )
{   
    op=modP=p; //SCENE 1 ANGULAR SCENE
    mixer=clamp(sin(tt*.65+p.z*.1),-.5,.5)+.5; //OVERALL SCENE MIXER 
    modP.z=mod(modP.z+tt*2.0,40.0)-20.0; 
    np=modP; 
    for(int i=0;i<5;i++){
        np.xz=abs(np.xz)-vec2(3.5,2.0);
        np.xz*=r2(.785);
        np.yz*=r2(-sin(-p.y*.1 )*.1);
    }  
    vec2 h,scene1=fbAngular(np);  
    np.xz+=1.2;
    np.xy*=r2(.785*2.0);  
    h=fbAngular(np*1.5); h.x/=1.5;
    scene1=scene1.x<h.x?scene1:h;  
    np.xz*=r2(-.785*2.0);
    np.x+=4.0;
    h=fbAngular(abs(np*.5)-vec3(0.0,0.0,5.0)); h.x/=.5;
    scene1=scene1.x<h.x?scene1:h;
    scene1.x*=0.8;  //SCENE 2 ORGANIC SCENE    
    float tnoi=texNoise((p.xz+vec2(0.0,tt*2.0))*.02).r*1.5; 
    float tDisp=sin((p.z+tt*2.0)*.5+p.x*.2);
    p.y+=tDisp;
    vec2 scene2 =vec2(p.y+5.0+tnoi*5.0,1.0); //TERRAIN  
    scene2.x=smin(scene2.x,length(abs(modP.xz+tnoi*2.0)-vec2(3.5,2.0))-2.0+tnoi*2.0+sin(p.y*.3)+sin(p.y*2.0*p.x)*0.03,5.0); //VERTICAL CYLINDERS
    vec3 cylP=modP+vec3(0.0,5.0,0.0); cylP.x=abs(cylP.x)-8.0+tDisp;
    scene2.x=smin(scene2.x,length(cylP.xy+tnoi*2.0)-2.0+tnoi*2.0+sin(p.y*.3)+sin(p.y*2.0*p.x)*0.017,5.0);//HORIZONTAL CYLINDERS
    scene2.x=smax(length(modP+vec3(0.0,6.0,0.0)+tnoi*3.0)-4.0,scene2.x,5.0);  //HOLE IN MIDDLE OF TERRAIN
    //scene2.x=smax(length(modP+vec3(0,12,0))-3.4+tnoi,scene2.x,2.); //Dig hole where blue sphere with tentacle is, removed to optimize shader as design impact is minimal
    scene2.x*=0.5;
    h=vec2(length(np.yz+vec2(-.3,0.0)),6.0);
    h.x=min(h.x,max(length(cos(p*.5+sin(op.z*.2)+vec3(0.0,tt,tt))),abs(p.x)-3.0));
    modP.xz*=r2(sin(p.y*.2+tt));  
    h.x=min(h.x,length(abs(modP.xz)-.5)-max(0.0,.5-abs(p.y+10.0)*.1));  
    h.x=smin(h.x,length(modP+vec3(0.0,12.0,0.0))-3.0+tnoi,1.5);
    scene2.x=min(scene2.x,h.x);  
    g+=0.1/(0.1+h.x*h.x*(40.0-39.0*sin(op.z*.7)));  
    vec2 t=mix(scene1,scene2,vec2(mixer,0.0));  
    return t;
} // 修改 3 / Change 3: 移除所有 C 风格浮点后缀
vec2 tr( vec3 ro, vec3 rd )
{
    vec2 h,t=vec2(.1);
    for(int i=0;i<128;i++){
        h=mp(ro+rd*t.x);
        if(h.x<.0001||t.x>60.0) break;
        t.x+=h.x;t.y=h.y;
    }
    if(t.x>60.0) t.y=0.0;  
    return t;
} // 修改 4 / Change 4: 移除浮点后缀
#define a(d) clamp(mp(po+no*d).x/d,0.,1.)
#define s(d) smoothstep(0.,1.,mp(po+ld*d).x/d)
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv=(fragCoord.xy/iResolution.xy-0.5)/vec2(iResolution.y/iResolution.x,1.0);
    tt=23.6+mod(iTime,62.82);
    vec3 ro=mix(vec3(12.0,5.0,-9.0),vec3(0.0,-2.0,-10.0),ceil(sin(tt*.4))),
         cw=normalize(vec3(0.0,-2.0,0.0)-ro),cu=normalize(cross(cw,vec3(0.0,1.0,0.0))),cv=normalize(cross(cu,cw)),
         rd=mat3(cu,cv,cw)*normalize(vec3(uv,.5)),co,fo; // 修改 6 / Change 6: 声明 co 和 fo 变量
    z=tr(ro,rd);t=z.x;  
    float timeMixer=clamp(sin(tt*.65),-.5,.5)+.5;
    ld=normalize(vec3(.3,.2,.5));
    vec3 sun=vec3(pow(clamp(dot(ld,rd),0.0,1.0),32.0))*mix(vec3(.7,.4,0.0),vec3(0.2),timeMixer);  
    co=fo=sun+(mix(vec3(.6,.3,.3),vec3(.1,.15,.2),timeMixer)-length(uv)*.1-rd.y*.2);
    if(z.y>0.0){ 
        po=ro+rd*t; 
        no=normalize(e.xyy*mp(po+e.xyy).x+e.yyx*mp(po+e.yyx).x+e.yxy*mp(po+e.yxy).x+e.xxx*mp(po+e.xxx).x);
        al=vec3(1.0);
        if(z.y>=1.0) al=mix(vec3(.1,.2,.4),vec3(1.0),2.0-z.y);
        if(z.y>=3.0) al=mix(vec3(0.0),vec3(1.0),4.0-z.y);   
        float dif=max(0.0,dot(no,ld)),    
              fr=pow(1.0+dot(no,rd),4.0),    
              spo=exp2(1.0+25.0*texNoise(.05*vec2(np.y,dot(np.xz,vec2(.7)))).r),
              sp=pow(max(dot(reflect(-ld,no),-rd),0.0),spo);
        co=mix(sp*.5+al*(a(.05)*a(.1)+.2)*(dif+s(2.0)),fo,min(fr,.5));
        co=mix(fo,co,exp(-.00005*t*t*t));
    }
    fragColor = vec4(pow(co+g*.2*mix(vec3(.7,.2,.1),vec3(.1,.2,.7),timeMixer),vec3(.45)),1.0);
}

// 修改 7 / Change 7: 添加必要的 include 指令 / Add required include directive
#include <../common/main_shadertoy.frag> 