#include <common/common_header.frag>
// uniform sampler2D iChannel0;

#define R(p,a,r)mix(a*dot(p,a),p,cos(r))+sin(r)*cross(p,a)
#define H(h)(cos((h)*2.3+vec3(13,33,41))*2.5+.5)
#define rot(a) mat2(cos(a + vec4(0, 11, 33, 0)))
#define t iTime
#define L(q) max(q.z, length(q.xy)) - .05
float happy_star(vec2 uv, float anim)
{
    uv = abs(uv);
    vec2 pos = min(uv.xy/uv.yx, anim);
    float p = (2.0 - pos.x - pos.y);
    return (2.0+p*(p*p-1.5)) / (uv.x+uv.y);      
}
const float PI = 3.1415927;
const float TWOPI = 2.0*PI;

bool alert = false;
void assert(bool b) {
  if (!b) alert = true;
}

const int CHAR_0 = 48;
const int CHAR_A = 65;
const int CHAR_B = 66;
const int CHAR_C = 67;
const int CHAR_D = 68;
const int CHAR_F = 70;
const int CHAR_R = 82;
const int CHAR_T = 84;
const int CHAR_X = 88;

const int KEY_LEFT = 37;
const int KEY_UP = 38;
const int KEY_RIGHT = 39;
const int KEY_DOWN = 40;

#if !defined(key)
#define key(code) (texelFetch(iChannel3, ivec2((code),2),0).x != 0.0)
#endif
#define store(i,j) (texelFetch(iChannel2, ivec2((i),(j)),0))
#define keycount(code) (int(store((code),0).x))

bool dorotate = false;  // Autorotate scene
bool doclifford = true; // Do Clifford translation

float eyedist = 5.0;     // Distance of eye from origin
vec3 light = vec3(0,2,1); // Light direction
int numsteps = 200;       // Maximum raymarching steps
float precis = 1e-3;      // Raymarching precision
float lfactor = 0.2;      // "Lipschitz" factor (note new fudge calculation in march())
float eradius = 0.05;    // Radius of edge
float pradius = 0.15;     // Radius of point

// Auxiliary functions
vec4 stereographic(vec3 p3, inout float scale); // Stereographic projection
vec4 qmul(vec4 p, vec4 q); // Quaternion multiplication

// Distance of point p from the circle through P,Q,R. This is for
// 4 dimensional space, but the calculation is much the same as
// in 3 dimensions. It's not impossible that this can be optimized a little.
float circle(vec4 p, vec4 P, vec4 Q, vec4 R) {
  p -= R; P -= R; Q -= R; // Rebase at R
  float PP = dot(P,P), PQ = dot(P,Q), QQ = dot(Q,Q);

  mat2 m = inverse(mat2(PP,PQ,PQ,QQ));
  vec2 ab = m*vec2(dot(p,P),dot(p,Q)); // Or use Cramer here?
  vec4 p1 = mat2x4(P,Q)*ab;
  vec4 centre = 0.5*mat2x4(P,Q)*m*vec2(PP,QQ);
  float radius = distance(centre,P);
  // Now find closest point to p1 on circle
  p1 -= centre;
  p1 *= radius/length(p1);
  p1 += centre;
  return distance(p,p1);
}

vec4 points(int i) {
  const float a = TWOPI/3.0;
  const vec4 POINTS[] =
    vec4[](
         normalize(vec4(cos(-a),sin(-a),cos(-a),sin(-a))),
         normalize(vec4(cos(-a),sin(-a),1,0)),
         normalize(vec4(cos(-a),sin(-a),cos(a),sin(a))),
         normalize(vec4(1,0,cos(-a),sin(-a))),
         normalize(vec4(1,0,1,0)),
         normalize(vec4(1,0,cos(a),sin(a))),
         normalize(vec4(cos(a),sin(a),cos(-a),sin(-a))),
         normalize(vec4(cos(a),sin(a),1,0)),
         normalize(vec4(cos(a),sin(a),cos(a),sin(a)))
         );
  return POINTS[i];
}

float de(vec3 p3, out int type) {
  float scale = 1.0;
  float t = 0.5*iTime;
  vec4 p = stereographic(p3,scale);

  if (doclifford) {
    float t = 10.5*iTime;
    vec4 Q = vec4(-sin(t)*vec3(0,0,1),cos(t));
    p = qmul(Q,p);
  }
  
  float d = 1e8,d0 = d;
  for (int i = 0; i < 9; i++) {
    vec4 P = points(i);
    d = min(d,distance(p,P)-pradius);
  }
  if (d < d0) type = 1;
  d0 = d;
    d = min(d,circle(p,points(0),points(1),points(2))-eradius);
    d = min(d,circle(p,points(3),points(4),points(5))-eradius);
    d = min(d,circle(p,points(6),points(7),points(8))-eradius);
    if (d < d0) { type = 2; d0 = d; }

    d = min(d,circle(p,points(0),points(3),points(6))-eradius);
    d = min(d,circle(p,points(1),points(4),points(7))-eradius);
    d = min(d,circle(p,points(2),points(5),points(8))-eradius);
    if (d < d0) { type = 3; d0 = d; }

    d = min(d,circle(p,points(0),points(4),points(8))-eradius);
    d = min(d,circle(p,points(1),points(5),points(6))-eradius);
    d = min(d,circle(p,points(2),points(3),points(7))-eradius);
    if (d < d0) { type = 4; d0 = d; }

  // Finally return the distance, but taking into account the
  // scaling factor from the stereographic projection.
  return d/scale;
}

float de(vec3 p) { int t; return de(p,t); }

float march(vec3 q, vec3 r) {
  float a = TWOPI/3.0;
  float t = 0.01; // Total distance so far.
  float maxdist = eyedist + 10.0;
  for (int i = 0; i < numsteps; i++) {
    //assert(i < 20);
    vec3 p = q+t*r;
    float d = de(p);
    if (abs(d) < t*precis) return t;
    t += d/(1.0+lfactor*d);
    if (t < 0.0 || t > maxdist) break;
  }
  return -1.0;
}

// Get the normal of the surface at point p.
vec3 getnormal(vec3 p, float t) {
  float eps = 1e-3;
  vec2 e = vec2(eps,0);
  return normalize(vec3(de(p + e.xyy) - de(p - e.xyy),
                        de(p + e.yxy) - de(p - e.yxy),
                        de(p + e.yyx) - de(p - e.yyx)));
}

vec4 invert(vec4 p, vec4 q, float r2, inout float scale) {
  // Invert p in circle, centre q, radius square r2.
  // Return inverted point and multiply scale by scaling factor.
  p -= q;
  float k = r2/dot(p,p);
  p *= k;
  scale *= k;
  p += q;
  return p;
}

vec4 stereographic(vec3 p, inout float scale) {
  return invert(vec4(p,0),vec4(0,0,0,-1),2.0,scale);
}

// Rotate vector p by angle t.
vec2 rotate(vec2 p, float t) {
  return cos(t)*p + sin(t)*vec2(-p.y,p.x);
}

// Quaternion multiplication
// (p+P)(q+Q) = pq + pQ + qP + PQ
vec4 qmul(vec4 p, vec4 q) {
  vec3 P = p.xyz, Q = q.xyz;
  return vec4(p.w*Q+q.w*P+cross(P,Q),p.w*q.w-dot(P,Q));
}

vec3 getbackground(vec3 r) {
  return vec3(0.5,0.8,0.5);
  return r; // Colourful fun
  return vec3(0); // The more sober option.
}

vec3 getbasecolor(int type) {
  assert(type >= 0);
  if (type == 0) return vec3(1,1,0.45);
  if (type == 1) return vec3(0.2);
  if (type == 2) return vec3(1,0,0);
  if (type == 3) return vec3(1,1,0);
  if (type == 4) return vec3(0,0,1);
  return vec3(1,0,1);
}

// Rotate according to mouse position
vec3 transformframe(vec3 p) {
  if (iMouse.x > 0.0) {
    // Full range of rotation across the screen.
    float phi = (2.0*iMouse.x-iResolution.x)/iResolution.x*PI;
    float theta = (2.0*iMouse.y-iResolution.y)/iResolution.y*PI;
  
  }
  // autorotation
  if (dorotate) {
 p.yx = rotate(p.yx,iTime*1.125);
 
  }
  return p;
}

// Follow ray from q, direction r.
vec3 raycolor(vec3 q, vec3 r) {
  float t = march(q,r);
  if (t < 0.0) return getbackground(r);
  vec3 p = q+t*r;
  vec3 normal = getnormal(p,t);
  int type;
  de(p,type); // Just to get the object type
  vec3 color = getbasecolor(type);
  float ambient = 0.3;
  float specular = type == 0 ? 0.0 : 0.1;
  vec3 speccolor = type == 1 ? color : vec3(1);
  float specularpow = 4.0;
  vec3 lightdir = normalize(light);
  float diffuse = 0.7*clamp(dot(normal,lightdir),0.0,1.0);
  color *= ambient+ diffuse;
  float s = pow(max(0.0,dot(reflect(light,normal),r)),specularpow);
  color += specular*s*speccolor;
  //color = mix(color,getbackground(r),t/maxdist);
  return color;
}

// Get the colour for a screen point (with normalized coordinates)
vec3 screencolor(vec2 z) {
  vec3 eye = vec3(0,0,eyedist);
  vec3 ray = vec3(z,-2);
  eye = transformframe(eye);
  ray = transformframe(ray);
  light = transformframe(light);
  ray = normalize(ray);
  vec3 col = raycolor(eye,ray);
  col = pow(col,vec3(0.4545)); // Gamma correction - see elsewhere
  return col;
}

void mainImage(out vec4 O, vec2 C)
{
 vec2 uv = ( C - .5*iResolution.xy ) / iResolution.y;
 uv *= 2.0 * ( cos(iTime * 2.0) -2.5); // scale
    float anim = sin(iTime * 12.0) * 0.1 + 1.0;  // anim between 0.9 - 1.1 
    
vec4 cor = vec4(3, 2, 1.5, 0) * .01;

    float r, dd, d = 9.;
          vec2 U=C;
    vec3 q2, P, 
         R2 = iResolution, 
         D = normalize(vec3((U - R2.xy / 2.) / R2.y, -1)),
         p = vec3(0, 0, 4), 
         C2 = 3. * cos(.3 * t + vec3(0, 11, 0));
                 
   vec4 O3 = vec4(0); 
    while(R2.z ++ < 120.  && d > .01) {
        P = p;
  
        
        int i;
        while(i++ < 5) {
            q2 = P, 
            
            q2.x -= .7, 
            q2 = abs(q2) - 1.; 
            
            i < 4
                ? cor = cor.zxyw : O3;
            
            dd = min(L(q2.xyz), min(L(q2.yzx), L(q2.zxy))),
            d = d > dd 
                ? O3 -= cor, dd : d,
                
            P.xy *= rot(1.26);
        }
            
        p += .2 * d * D;
    }
        O3 *= O3 * O3 * O3 * .5;
   
O = vec4(0);
 dorotate = !key(CHAR_R);
  doclifford = !key(CHAR_C);
  eyedist *= 1.0+0.1*float(keycount(KEY_DOWN)-keycount(KEY_UP));
  vec2 z = (2.0*C-iResolution.xy)/iResolution.y;
  vec3 col = screencolor(z);
  if (alert) col.r = 1.0; // Check nothing has gone wrong.
 
    vec3 n1,q,r2=iResolution,
    d2=normalize(vec3((C*2.-r2.xy)/r2.y,1));  
    for(float i=0.,a,s,e,g=0.;
        ++i<110.;
        O.xyz+=mix(vec3(1),H(g*.1),sin(.8))*1./e/8e3
    )
    {
        n1=g*d2;
          float t = iTime * .1 + ((.25 + .05 * sin(iTime * .1))/(length(n1.xy) + .07)) * 210.2;
	float si = sin(t);
	float co = cos(t);
	mat2 ma = mat2(co, si, -si, co);
    n1.xy*=ma;
         n1.z-=10.*iTime;
        a=22.;
        n1=mod(n1-a,a*2.)-a;
        s=5.;
        for(int i=0;i++<8;){
            n1=.5-abs(n1);
          
            n1.y<n1.z?n1=n1.zyx:n1;
            n1.z<n1.x?n1=n1.xzy:n1;
          
            s*=e=1.6+sin(iTime*.434)*.01;
            n1=abs(n1)*e-
                vec3(
                    25.+cos(floor(abs(iTime)*exp(n1.x))*.23+.5*sin(iTime*.3))*3.,
                    100.,
                    20.+dot(cos(iTime*2.5),tan(iTime*0.5))
                 )*col;
         }
         g+=e=(length(n1.zx*O3.xy)+(length(n1.zy+O3.xy)))/s;
    }
   O*= vec4(happy_star(uv, anim) * vec3(0.535,0.5,0.55)*10., 1.0);  
}
#include <common/main_shadertoy.frag>
