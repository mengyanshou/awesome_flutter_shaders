// --- Migrate Log ---
// 添加 Flutter 兼容性 includes，声明 iChannel0，添加 ZERO 宏，修复 Finger 函数中的 for 循环使用 int 计数器，导入 Common.frag，修复 texture 调用使用 r.xy 以兼容 vec2 参数
// Added Flutter compatibility includes, declared iChannel0, added ZERO macro, fixed Finger function for loop to use int counter, imported Common.frag, fixed texture call to use r.xy for vec2 compatibility

#include <../common/common_header.frag>

uniform sampler2D iChannel0;

#define ZERO int(min(iFrame, 0.0))

#include "DULL SKULL - Prometheus Common.frag"

// "Dull Skull"
// Prometheus
// 2023
// by KΛTUR

/* license CC BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 * Author: KΛTUR
 * Original Shader: DULL SKULL
 * You may remix, adapt, and build upon this work for non-commercial
 * purposes, but you must give appropriate credit and indicate
 * changes were made.

=======================================================================

DULL SKULL - Playlist
https://www.shadertoy.com/playlist/c3sXWn

In this shader, I explore the intricacies of the human skeleton through
the lens of mathematics, focusing on the skull as an SDF built mostly
with classic linear algebra and constructive solid geometry.

The first step of what later became the DULL SKULL series — a journey of
learning, experimenting, and slowly refining my SDF sculpting and lighting
skills.

=======================================================================

CHOOSE FROM DIFFERENT STYLES HERE

0 = MONOCHROME DIFFUSE
1 = FUNKY NORMAL FRESNEL
2 = SPECULAR ZOMBIE
3 = GHOST MODE
4 = GOLDEN REFLEX (Added 2025)
*/

#define SHADE 4

//===================================================================//

float Bone(vec3 p,vec3 a, vec3 b, float delta, float r, float r2, float bb){
    float bone = Capsule(p,a,b,(abs((pow(p.z-delta,2.))))*r2+r);
    p.z -= delta;
    bone = max(bone,rBox(p,vec3(bb),.0));//bounding box
    return bone;
}

float Finger(vec3 p, float scale, float iter, float r, float r2, float bb, float angle){
    vec3 a = vec3(0);
    vec3 b = vec3(0,0,1)*scale;
    float delta = (b-a).z;
    p.yz *= Rot(angle*.3);
    float fbone = Bone(p,a,b,delta/2.,r,r2,bb);
    float eps = .1;
    float dist = (b-a).z;
        
    for (int i=ZERO;i<int(iter);i++){
            a.z = b.z+.08;
            b.z = a.z+dist;
            delta = a.z+(dist)/2.;
            dist -= eps;
            p.z -= a.z;
            p.yz *= Rot(angle);
            p.z += a.z;
            r -= 0.001;
    fbone = min(fbone,Bone(p,a,b,delta,r,r2,bb));
    }
    return fbone;
}

float map(vec3 p){
    
    float t = iTime;
    
// ||||||||||||||||||||============|||||||||||||||||||| //    
// ==================== UPPER BODY ==================== //
// ||||||||||||||||||||============|||||||||||||||||||| //    
    
    // ===== SPINE ===== //
    vec3 p_spine = p;
        p_spine.y -= sin(t*.1)*.3;
        p_spine.z -= .6+sin(t*.2)*sin(t*.51);
        vec3 p_vert = p_spine+vec3(0,.15,0);
        vec3 sSpine = vec3(.13,.09,.13);
    float spine = Ellipsoid(p_vert,sSpine);//vertebrae - no anatomical accuracy, just an indication that there are vertebrae :)
        for (float i=0.;i<4.;i++){
            p_vert.y += .2;
            p_vert.z += i*.09;
            spine = min(spine,Ellipsoid(p_vert,sSpine));  
        }
    spine -= sin(29.*p_vert.x)*sin(21.*p_vert.y)*sin(12.*p_vert.z*.003);//deformation
    
    // ===== COLLARBONE ===== //
    float side = sign(p_spine.x);//side definition
    
    vec3 p_cbone = vec3(abs(p_spine.x),p_spine.yz);
        p_cbone += vec3(-.2,.9,.5);
        p_cbone.xz *= Rot(1.8+sin(t*.09)*.2);
        p_cbone.yz *= Rot(sin((side-.23)*t*.6)*.2);
    float cbone = Bone(p_cbone+sin(p_cbone.z*3.)*.1, vec3(0),vec3(0,0,1.6),.8,.04,.04,1.5);
    
// ======================  ARMS ====================== //  

    // ===== UPPER ARM ===== //
        p_cbone.xz *= Rot(-1.8-sin(t*.09)*.2);//invert collarbone transformation
    vec3 p_uArm = vec3(abs(p_cbone.x)-1.8,p_cbone.y+.1,p_cbone.z+.3);
        float ruAxz = (side-.59)*t*.3;
        p_uArm.xz *= RotSin(ruAxz,.2,.35);
        p_uArm.xy *= RotSin((side-.19)*t*.42,sin(t*.18)*.6,0.2);
        p_uArm.yz *= RotSin((side+.12)*t*.62,.2,.1);
        p_uArm.z -= 1.;
    float uABone = Bone(p_uArm,vec3(0,0,-1),vec3(0,0,1),0.,.06,.09,1.3);//bone sdf
    float uArm = sMax(Sphere(p_uArm+vec3(.08,-0.,-1.1),.13),uABone,.2);//deformation of front end of bone
    
    // ===== LOWER ARM ===== //
    vec3 p_lArm = vec3(p_uArm.x,p_uArm.y,p_uArm.z-1.1);
        p_lArm.xz *= RotSin(-ruAxz,.3,-.6);
        float t1 = t*.6+sin(t*.22);     
        float rlAxySin = (side+.13)*t1*.5;
        float rlAxyAmo = p_lArm.z*.3;
        float rlAxyOff = p_lArm.z*.7;
        p_lArm.xy *= Rot(-.3);
        p_lArm.xy *= RotSin(rlAxySin,-rlAxyAmo,-rlAxyOff-.2);//crossing Ulna and Radius
        p_lArm.z -= 1.;
    vec3 p_lArmS = vec3(abs(p_lArm.x)-.09,p_lArm.yz);//mirroring single bone
        p_lArmS.x += (abs(pow(p_lArmS.z+.7,2.)))*.04;//bending bones
        vec3 a = vec3(.1,0,1), b = vec3(0.,0,-1);
        float r2=.04, r = .03, bb = 1.5;
    float lArm = Bone(p_lArmS,a,b,0.,r,r2,1.2);//lower arm
    float arm = min(lArm, uArm);//union upper and lower arm

    // ===== HANDS ===== //
        // CARPUS
        
        p_lArm.xy *= RotSin(rlAxySin,rlAxyAmo,rlAxyOff+.2);//inverse the crossing of Ulna and Radius
    vec3 p_hand = p_lArm;
        p_hand.z -= 1.1;//translate anchor point
        float t2 = sin(t1)+(side-.19)*t1;
        p_hand.xy *= Rot(1.5);
        p_hand.xy *= RotSin(-rlAxySin,1.,0.);
        p_hand.yz *= RotSin(t2+1.91,1.,.45);
        p_hand.xy *= RotSin((side-.32)*t1+.3,.1,.1);
    float hand = Ellipsoid(p_hand,vec3(.2,.04,.1));//ellipsoid as base
        hand -= (sin(27.*p_hand.x)+sin(37.*p_hand.z)*sin(19.*p_hand.y))*.015;//deformation of ellipsoid
        
        // FINGERS
    vec3 pf = vec3(p_hand.xy,p_hand.z-.2);
         r = .03, r2=.7, bb=.5;
            
            // POINT
    vec3 pf1 = pf;
        pf1.xz += vec2(.13,.08);
        pf1.xz *= Rot(-.2);
        float fpoint = Finger(pf1,.3,3.,r,r2,bb,(sin(cos(t2*.5)+t2-.12)*(sin(t2)*.4+.7)*.6-.7));
            // MIDDLE
    vec3 pf2 = pf;
        pf2.z += .03;
        pf2.xz *= Rot(0.);
        pf2.xy *= Rot(.2);
        float fmiddle = Finger(pf2,.32,3.,r,r2,bb,(sin(cos(t2*.3)+t2-.2)*(sin(t2)*.4+.7)*.7-.9));
            // RING
    vec3 pf3 = pf;    
        pf3.xz -= vec2(.13,-.05);
        pf3.xz *= Rot(.15);
        pf3.xy *= Rot(.3);
        float fring = Finger(pf3,.3,3.,r,r2,bb,(sin(cos(t2*.7)+t2-.4)*(sin(t2)*.3+.7)*.8-1.));//+sin(t*.7+.5)*.3-.3);
            // PINKY
    vec3 pf4 = pf;    
        pf4.xz -= vec2(.23,-.12);
        pf4.xz *= Rot(.5);
        pf4.xy *= Rot(.4);
        float fpinky = Finger(pf4,.25,3.,r,r2,bb,(sin(cos(t2*.9)+t2)*(sin(t2)*.2+.6)*.8-1.));//;+sin(t+.7)*.2-.4);
            // THUMB
    vec3 pf5 = pf;
        pf5.xz += vec2(.22,.2);
        pf5.xz *= Rot(-1.2);
        pf5.xy *= Rot(-.6);
        pf5.yz *= Rot(-.2);
        float thumb = Finger(pf5,.14,2.,0.035,r2,bb,(sin(t2-.16)*(sin(t2)*.6+.8)*.8-1.));//+sin(t+1.2)*.3-.15)*.8;        
        
    float fingers = min(fpoint,min(fmiddle,min(fring,min(fpinky,thumb))));//union all fingers
    
    hand = min(hand, fingers);//union fingers and carpus = hand
    arm = min(hand,min(arm,min(cbone,spine)));//union hand, arm, collarbone and spine


// ||||||||||||||||||||||=======|||||||||||||||||||||| //    
// ====================== SKULL ====================== //
// ||||||||||||||||||||||=======|||||||||||||||||||||| //

    
    // ===== HEAD ===== //
    vec3 p_skull = p_spine-vec3(0,.7,.7);
        p_skull.xy *= RotSin(t*.1,cos(t*.4)*.4,sin(t*.3)*.4);
        p_skull.yz *= RotSin(t*.13,cos(t*.27)*.2,sin(t*.23)*.1);
    vec3 p_head = p_skull;
        float d = Ellipsoid(p_head,vec3(.9,1.1,1.2));//head base
        float p_cutb = p_head.y+.7 + sin(p_head.x + sin(cos(p_head.z*1.4)) * 21.)*.02; //bottom cut
    p_cutb = sMin(p_cutb, Ellipsoid(p_head-vec3(0,-.3,-.2),vec3(.7)),.0);//head hole
    p_cutb = sMin(p_cutb, Ellipsoid(p_head-vec3(0,-.24,.5),vec3(.51)),.1);//head hole front    
    d = sMax(p_cutb, d,.05); //bottom cut
        float p_cutf = -p_head.z+1.1; //forehead plane
    d = sMax(p_cutf, d,.2); //forehead cut
    d = min(d, spine);
    
        // TEMPLES
        float cuts_temple = Capsule(vec3(-abs(p_head.x),p_head.yz), vec3(-1.,-1,.8), vec3(-1.8,3,.0), .5 );//temple deepenings
    d = sMax(cuts_temple, d,.3); //temple cuts
        float bcut_temple = Capsule(p_head, vec3(-2.,-1.1,.6), vec3(2,-1.1,.6), .6 );//side cuts
    d = sMax(bcut_temple, d,.3); //side cuts 
        
        // ZYGOMATIC ARCH
    vec3 p_zyg = vec3(abs(p_skull.x),p_skull.yz);
        p_zyg.x += sin(p_zyg.z*4.+PI)*.08;
        p_zyg.y += cos(p_zyg.z*9.)*.03;
        float zyg = Capsule(p_zyg,vec3(.5,-.3,.8),vec3(.75,-.3,0.1),(p_zyg.z)*.1);
    d = sMin(d,zyg,.06);
    
    // ===== UPPER JAW ===== //
    vec3 p_jaw = p_skull-vec3(0,.36,.1);
        p_jaw.yz *= Rot(PI);
        p_jaw.y -= sin(p_jaw.x*37.)*.007 - cos(p_jaw.z*59.)*.01;//deformation
        float ujaw = HollowSphere(p_jaw+vec3(0,-.95,.6),.38,.02,.05 );//jaw sdf
        float p_cutB = p_skull.z-.6;//cutting plane back
        ujaw = sMax(p_cutB, ujaw,.05); //jaw back cut
    vec3 p_jawsc = vec3(abs(p_skull.x),p_skull.yz); //new point def for side cuts
        p_jawsc.xy *= Rot(-1.);
        p_jawsc.yz *= Rot(-.4);
        p_jawsc.y += .3; 
        ujaw = sMax(p_jawsc.y, ujaw,.04); //side cuts
    d = sMin(ujaw, d,.1);//union upper jaw and d     
    d -= sin(10.*p_skull.x)*sin(8.*p_skull.y)*sin(7.*p_skull.z)*.01;//deformation head
        
    // ===== EYES ===== // 
    
        // CHEEKBONES
    vec3 p_eyesur = p_skull-vec3(0,.3,0);
        float eyesur = Ellipsoid(vec3(abs(p_eyesur.x),p_eyesur.yz)+vec3(-.34,.5,-.87),vec3(.25,.24,.2));//cheekbones   
        eyesur += sin(12.*p_skull.x)*sin(9.*p_skull.y)*sin(13.*p_skull.z)*.05;//deformation
    d = sMin(eyesur, d,.2);//union cheekbones and d
   
        // EYE HOLES
    vec3 p_eye = p_skull;
        p_eye += sin(p_eye.x*29.+cos(p_eye.y*32.))*.008; //eye distortion
        float eye = Ellipsoid(vec3(abs(p_eye.x),p_eye.y-.4,p_eye.z)+vec3(-.29,.49,-1.1),vec3(.21,.25,.25)); // eye ball
        eye = sMin(eye,Sphere(vec3(abs(p_skull.x),p_skull.yz)-vec3(.25,0.,.7),.35),.05);// eye hole back
        eye = sMax(-p_eye.y,eye,.2);
    d = sMax(eye, d,.05); //eye ball subtraction        
        
    // ===== NOSE ===== //
    
        // NOSE BONE
    vec3 p_nbone = p_skull;
        p_nbone.yz *= Rot(-2.2);
        float nbone = HollowSphere(p_nbone+vec3(0,-1.,.4),.1,0.08,.04 );
    d = sMin(d,nbone,.05);
    
        // NOSE HOLE
    vec3 p_nose = vec3(abs(p_skull.x),p_skull.yz);
        p_nose.xy *= Rot(-.4);
        float nose = Ellipsoid(p_nose-vec3(-.1,-.3,1.),vec3(.05,.1,.8));
    d = sMax(nose, d,.06); //nose subtraction
        
    // ===== LOWER JAW ===== //
        
        // LOWER JAW TRANSFORMATION
    vec3 pN = p_skull;
        pN.z -= .5;
        pN.y += .4;
        pN.yz *= RotSin(sin(t*.8),sin(t)*.3+smoothstep(0.,1.,sin(t)*.3),-.4);
        pN.z += .5;
        pN.y -= .4;
        pN -= sin(pN.y*15.)*.001 - cos(pN.z*39.)*.001;//deformation
        
        // CHIN
    vec3 p_ljaw = pN;
        p_ljaw.y *= .8;
        p_ljaw.z -= sin(pN.y*26.)*.008;
        p_ljaw.y -= cos(pN.x*15.+sin(pN.y*7.)*2.)*.01;
    float ljaw = HollowSphere(p_ljaw+vec3(0,.77,-.74),.38,0.03,.04 );//chin  
    ljaw = sMax(p_ljaw.z-.65,ljaw,.1);
        
        // MANDIBLE BACK
    vec3 p_maB = vec3(abs(pN.x),pN.yz);
        p_maB.yz *= Rot(-1.3);
        p_maB.xz *= Rot(-.34);
        p_maB.xy *= Rot(-.39);
        p_maB -= vec3(0.85,.0,.63);
       ljaw = sMin(ljaw,rBox(p_maB,vec3(0.,smoothstep(0.,6.,abs(-p_maB.z)+.9),.45),.04),.17);//union chin + mandible
       ljaw = sMax(Ellipsoid(p_maB-vec3(.0,.0,-.55),vec3(.5,.15,.26)),ljaw,.04);//mandible top cut to get a V
        p_ljaw -= sin(p_ljaw.y*32.)*.001 - cos(p_ljaw.z*29.)*.007;//deformation
       ljaw = sMax(p_ljaw.y+.93,ljaw,.02);//bottom cut

    d = min(ljaw, d);//union chin and d      

    // ===== UPPER TEETH ===== //
    vec3 p_tooth = p_skull;
        p_tooth -= vec3(0,-.77,.7);
        p_tooth *= vec3(1.2,1,1);
        pModPolar(p_tooth.xz, 28.0);//alignment polar

        float teeth = Ellipsoid(p_tooth - vec3(0.43, 0., 0.), vec3(0.03, 0.15, 0.045));
        teeth = max(teeth, -p_skull.y-.73+sin(p_skull.x*32.)*.006);//cut teetch bottom
        teeth = max(teeth, -p_skull.z+.7);// cut teeth back
    d = min(d,teeth);
        
    // ===== LOWER TEETH ===== //
    vec3 p_ltooth = pN;
        p_ltooth -= vec3(0,-.77,.7);
        p_ltooth *= vec3(1.2,1,1);
        pModPolar(p_ltooth.xz, 28.0);//alignment polar

        float lteeth = Ellipsoid(p_ltooth - vec3(0.42, 0., 0.), vec3(0.03, 0.15, 0.045));
        lteeth = max(lteeth, pN.y+.79+sin(p_skull.x*29.)*.004);//cut teeth top
        lteeth = max(lteeth, -pN.z+.7);// cut teeth back
    d = min(d,lteeth);
       
    d = min(d,arm);//union skull, arm, hand and fingers
    
    return d;
}
float March(vec3 ro, vec3 rd){
    float h=0.;
    for(int i=0;i<MAX_STEPS; i++){
        vec3 p = ro + rd*h;
        float d = map(p);
        h += d;
        if(h>MAX_DIST||abs(d)<SURF_DIST) break;
    }
    return h;
}

vec3 CalcNormal (vec3 p){
    // inspired by tdhooper and klems - a way to prevent the compiler from inlining map() 4 times
    vec3 n = vec3(0.0);
    for( int i=ZERO; i<4; i++ ){
        vec3 e = 0.5773*(2.0*vec3((((i+3)>>1)&1),((i>>1)&1),(i&1))-1.0);
        n += e*map(p+.001*e);
    }
    return normalize(n);
}

//by https://iquilezles.org/
float CalcAO( in vec3 pos, in vec3 nor ){
	float occ = 0.0;
    float sca = 1.0;
    for( int i=0; i<8; i++ )
    {
        float h = 0.001 + 0.15*float(i)/4.0;
        float d = map( pos + h*nor );
        occ += (h-d)*sca;
        sca *= 0.95;
    }
    return clamp( 1.0 - 1.5*occ, 0.0, 1.0 );    
}

//by https://iquilezles.org/
float CalcSoftshadow( in vec3 ro, in vec3 rd, in float mint, in float tmax){
	float res = 1.0;
    float t = mint;
    float ph = 1e10;
    
    for( int i=0; i<32; i++ )
    {
		float h = map( ro + rd*t );
        {
        	res = min( res, 10.0*h/t );
        }
            float y = h*h/(2.0*ph);
            float d = sqrt(h*h-y*y);
            res = min( res, 10.0*d/max(0.0,t-y) );
            ph = h;
        t += h;
        
        if( res<0.0001 || t>tmax ) break;
    }
    
    res = clamp( res, 0.0, 1.0 );
    return res*res*(3.0-2.0*res);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y;
    vec3 ro = vec3(0, sin(iTime*.18)*2.*cos(iTime*.52), 12.5);
    ro.yz *= Rot(sin(iTime*.41)*.2);
    ro.xz *= Rot(cos(iTime*.32)*.2);
    vec3 rd = RayDir(uv, ro, vec3(0,0.,0), 2.);
    
    vec3 col = vec3(0);
    float d = March(ro, rd);
    
    if(d<MAX_DIST){ 
        vec3 p = ro + rd*d;
        vec3 n = CalcNormal(p);
        vec3 r = reflect(rd,n);
        vec3 ref = texture(iChannel0, r.xy).rgb;
        vec3 material = vec3(.95,.6,.1);
        vec3 l = normalize(vec3(3,3,1));
        vec3 hal = normalize(normalize(vec3(3,2,1))-rd);
        float dif = clamp(dot(n,l),.0,1.)*CalcSoftshadow(p,l,.01,3.);//diffuse
        float spe = pow(clamp(dot(n,hal),0.,1.),8.0)*clamp(1.2+dot(hal,rd),0.,1.);//specular
        float amb = clamp(-n.x,0.,1.);//ambient
        float ao = CalcAO(p,n);//ambient occlusion
        float fresnel = pow(1.+dot(rd, n),3.); //fresnel
            
    #if SHADE==0
    col = vec3(dif)*3.+.06;
    col *= ao;
    #endif
    #if SHADE==1
    col = vec3(fresnel*4.);
    col *= n*.5+.9;
    #endif
    #if SHADE==2
    material = vec3(.6,1.,.7);
    col = material*dif*30.*spe;
    col += material*amb*ao;
    col *= n*.7+.5;
    col *= 1.-fresnel;
    #endif
    #if SHADE==3
    col = vec3(d*.4);
    #endif
    #if SHADE==4
    col = material;
    col *= 32.*spe+amb;
    col *= ref;
    col *= ao;
    #endif
    
    }
    
    col = mix( col, vec3(0), clamp(d*.086,0.,1.));//fog    
    col = pow(col, vec3(.4545)); //gamma correction
    
    fragColor = vec4(col,1.);
}

#include <../common/main_shadertoy.frag>