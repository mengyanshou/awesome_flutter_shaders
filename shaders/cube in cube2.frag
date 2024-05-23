#include <common/common_header.frag>

uniform sampler2D iChannel0;
/*originals https://www.shadertoy.com/view/lclXzH https://www.shadertoy.com/view/stsXDl*/
#define R(p,a,r)mix(a*dot(p,a),p,cos(r))+sin(r)*cross(p,a)
#define H(h)(cos((h)*6.3+vec3(15,33,51))*.5+.5)
#define H2(a) (cos(radians(vec3(-30, 60, 150))+(a)*6.2832)*.5+.5)  // hue
#define A(v) mat2(cos((v*3.1416) + vec4(0, -1.5708, 1.5708, 0)))  // rotate
#define s(a, b) c = max(c, .01/abs(L( u, K(a, v, h), K(b, v, h) )+.02)*k*10.*o); // segment
//#define s(a, b) c += .02/abs(L( u, K(a, v, h), K(b, v, h) )+.02)*k*o*(1.-i);  // alt segment

// line
float L(vec2 p, vec3 A, vec3 B)
{
    vec2 a = A.xy, 
         b = B.xy - a;
         p -= a;
    float h = clamp(dot(p, b) / dot(b, b), 0., 1.);
    return length(p - b*h) + .01*mix(A.z, B.z, h);
}

// cam
vec3 K(vec3 p, mat2 v, mat2 h)
{
    p.zy *= v; // pitch
    p.zx *= h; // yaw
    if (texelFetch(iChannel0, ivec2(80, 2), 0).x < 1.) // P key
        p *= 4. / (p.z+4.); // perspective view
    return p;
}
void mainImage(out vec4 O, vec2 C)
{
    O=vec4(0);
     vec4 C2=O;
      vec2 U=C;
   
  
   
    
    vec2 R = iResolution.xy,
         u = (U+U-R)/R.y*1.2,
         m = (iMouse.xy*2.-R)/R.y;
    
    float t = iTime/60.,
          l = 15.,  // loop size
          j = 1./l, // increment size
          r = .8,   // scale size
          o = .1,   // brightness
          i = 0.;   // starting increment
    

        m = (t*116.2832 + vec2(0, 1.5708)), // move in circles
        m.x *= 2.; 
    
    mat2 v = A(m.y), // pitch
         h; // yaw (set in loop)
    
    vec3 p = vec3(0, 1, -1),    // cube coords
         c = .2*length(u)*H(t), // background
         k; // cube color (set in loop)
    
    // cubes
    for (; i<1.; i+=j)
    {
        k = H(i+iTime/3.)+.2; // cube color
        h = A(m.x*i+O.y); // rotate
        p *= r; // scale
      
        s( p.yyz, p.yzz )
        s( p.zyz, p.zzz )
        s( p.zyy, p.zzy )
        s( p.yyy, p.yzy )
        s( p.yyy, p.zyy )
        s( p.yzy, p.zzy )
        s( p.yyz, p.zyz )
        s( p.yzz, p.zzz )
        s( p.zzz, p.zzy )
        s( p.zyz, p.zyy )
        s( p.yzz, p.yzy )
        s( p.yyz, p.yyy )
        
    }
    
 
     vec3 n1,q,r2=iResolution,
      d=normalize(vec3((C*2.-r2.xy)/r2.y,1));  
    for(float i=0.,a,s,e,g=0.;
        ++i<70.;
        O.xyz+=mix(vec3(1),H(g*.1),.8)*1./e/8e3
    )
    {
        n1=g*d;
       
        a=20.;
          
        n1=mod(n1-a,a*2.)-a;
        s=4.;
        for(int i=0;i++<8;){
            n1=.3-abs(n1);
            n1.x<n1.z?n1=n1.zyx:n1;
            n1.z<n1.y?n1=n1.xzy:n1;
          
            s*=e=1.6+sin(iTime*.1)*.1;
            n1=abs(n1)*e-
                vec3(
                    5.+sin(iTime*.3+.5*sin(iTime*.3))*3.,
                    120,
                    8.+cos(iTime*.5)*5.
                 )*dot(c.y,n1.x);
         }
         g+=e=length(n1.xy)/s;
    }
    // squaring c for contrast, tanh limits brightness to 1 (less blowout)
  
    O=O;
}
#include <common/main_shadertoy.frag>
