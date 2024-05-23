vec2 R;
vec4 Mouse;
float time;
int frame;

#define A(p) texelFetch(iChannel0, ivec2(mod(p,R)), 0)
#define B(p) texelFetch(iChannel1, ivec2(mod(p,R)), 0)

#define CH(c, p) texelFetch(c, ivec2(mod(p,R)), 0)

//loop in range
#define range(i,a,b) for(int i = a; i <= b; i++)

#define dt 1.0
#define max_vel 1.0
#define rad 1

#define diffusion 0.25
#define gravity 0.005

#define PI 3.14159265

#define rest_rho 1.0
#define eos_pressure 0.5

//reduce rotation/shearing of low density particles
//without this the vacuum and border state very chaotic, but it still works fine
//in usual MPM that isn't necessary since the particles don't change mass
float affine_str(float m)
{
    return 1.0; //full APIC
  //  return smoothstep(0.5*rest_rho,0.55*rest_rho,m);
}

//pressure equation of state
float pressure(float rho)
{
    return 1.2*(rho - 0.5); //gas
   // return eos_pressure*(pow(rho/rest_rho,4.) - 1.0); //Tait EOS (water)
}
float hash12(vec2 p)
{
	vec3 p3 = mod(vec3(p.xyx) * .1031,1.0);
	p3 += dot(p3, p3.yzx + 33.33);
	return mod((p3.x + p3.y) * p3.z,1.0);
}
float hash13(vec3 p3)
{
	p3 = mod(p3 * .1031,1.0);
	p3 += dot(p3, p3.zyx + 31.32);
	return mod((p3.x + p3.y) * p3.z,1.0);
}
void InitialConditions(inout float m, inout vec2 v, vec2 P)
{
    vec2 dx = P - R*vec2(0.3, 0.5);

    float d = smoothstep(R.y*0.3, R.y*0.19, length(dx));  
   //if(P.y>R.y-50.0) m += 0.2;
    if(P.y>R.y-5.0) m += 0.02*clamp(pow(hash13(vec3(P, time )),8.0),0.0,1.0);

 //if(P.y>R.y-5.0) m += 0.84*clamp(pow(hash13(vec3(P, time )),738.0),0.0,1.0);
   // v = d*0.3*normalize(vec2(dx.y,-dx.x));
}

//KERNEL FUNCTIONS

float k0(vec2 dx) //linear kernel
{
    vec2 k = max(1.0 - abs(dx), 0.);
    return k.x*k.y;
}

vec3 K0(vec2 dx) //linear kernel with the center of mass
{
    vec2 k = max(1.0 - abs(dx), 0.);
    return vec3(dx*0.5, k.x*k.y);
}

float k1(vec2 dx) //quadratic kernel
{
    vec2 f = max(1.5 - abs(dx), 0.0);
    vec2 k = min(max(0.75 - dx*dx, 0.5), 0.5*f*f);
    return k.x*k.y;
}

//box size enstimator
vec2 destimator(vec2 dx)
{
    return clamp(1.0 - 2.0*abs(dx), 0.0001, 1.0);
}

//box overlap with center of mass
vec3 overlap(vec2 dx, vec2 box)
{
    vec2 min0 = max(dx - box*0.5, -0.5); 
    vec2 max0 = min(dx + box*0.5, 0.5); 
    vec2 size = max(max0 - min0, 0.); 
    return vec3(0.5*(max0 + min0), size.x*size.y/(box.x*box.y));
}

//boundary
#define border_h 1.0
mat2 Rot(float ang)
{
    return mat2(cos(ang), -sin(ang), sin(ang), cos(ang)); 
}

vec2 Dir(float ang)
{
    return vec2(cos(ang), sin(ang));
}
float smin( in float k, in float a, in float b )
{
    k *= 4.0;
    float h = max(k-abs(a-b),0.0);
    float m = 0.25*h*h/k;
    float n = 0.50*  h/k;
    return ( min(a,  b) - m );
}
vec3 smin( in float k, in vec3 a, in vec3 b )
{
    k *= 4.0;
    float h = max(k-abs(a.x-b.x),0.0);
    float m = 0.25*h*h/k;
    float n = 0.50*  h/k;
    return vec3( min(a.x,  b.x) - m, 
                 mix(a.yz, b.yz, (a.x<b.x)?n:1.0-n) );
}
float sdBox( in vec2 p, in vec2 b )
{
    vec2 d = abs(p)-b;
    return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}
float sdSphere( in vec2 p, in float s )
{   
    return length(p)-s;
}
float border(vec2 p)
{
    float bound = -border_h-sdBox(p - R*0.5, R*vec2(0.5, 0.5)); 
    
//bound=min(bound,sdSphere(p-R*0.5,50.0));
//bound=min(bound,sdBox(p-R*0.5,vec2(5.0,R.y/4.0) ));
bound=smin(6.0,bound,sdBox(p-vec2(40.0,200.0),vec2(10.0,150.0) ));
bound=smin(6.0,bound,sdBox(p-vec2(200.0,200.0),vec2(150.0,10.0) ));
bound=smin(6.0,bound,sdBox(p-vec2(400.0,300.0),vec2(150.0,10.0) ));
bound=smin(6.0,bound,sdBox(p-vec2(550.0,340.0),vec2(150.0,10.0) ));
bound=smin(6.0,bound,sdBox(p-vec2(750.0,380.0),vec2(150.0,40.0) ));
bound=smin(6.0,bound,sdBox(p-vec2(290.0,130.0),vec2(150.0,10.0) ));
bound=smin(6.0,bound,sdBox(p-vec2(310.0,150.0),vec2(10.0,10.0) ));
bound=smin(6.0,bound,sdBox(p-vec2(190.0,150.0),vec2(10.0,10.0) ));
bound=smin(6.0,bound,sdSphere(p-vec2(370.0,250.0),20.0));
bound=smin(6.0,bound,sdSphere(p-vec2(290.0,300.0),20.0));
bound=smin(6.0,bound,sdSphere(p-vec2(390.0,330.0),30.0));
bound=smin(6.0,bound,sdBox(p-vec2(450.0,200.0),vec2(10.0,100.0) ));
bound=smin(6.0,bound,sdBox(p-vec2(450.0,30.0),vec2(10.0,30.0) ));
bound=smin(6.0,bound,sdBox(p-vec2(650.0,110.0),vec2(10.0,90.0) ));
bound=smin(6.0,bound,sdBox(p-vec2(600.0,100.0),vec2(10.0,100.0) ));
bound=smin(6.0,bound,sdBox(p-vec2(750.0,110.0),vec2(10.0,90.0) ));
bound=smin(6.0,bound,sdBox(p-vec2(800.0,100.0),vec2(10.0,100.0) ));
bound=smin(3.0,bound,sdBox(p-vec2(700.0,30.0),vec2(50.0,10.0) ));
bound=smin(3.0,bound,sdBox(p-vec2(670.0,200.0),vec2(20.0,10.0) ));
bound=smin(3.0,bound,sdBox(p-vec2(730.0,200.0),vec2(20.0,10.0) )); 
    return bound-0.0;
}

#define h 2.
vec3 bN(vec2 p)
{
    vec3 dx = vec3(-h,0,h);
    vec4 idx = vec4(-1./h, 0., 1./h, 0.25);
    vec3 r = idx.zyw*border(p + dx.zy)
           + idx.xyw*border(p + dx.xy)
           + idx.yzw*border(p + dx.yz)
           + idx.yxw*border(p + dx.yx);
    return vec3(normalize(r.xy), r.z + 1e-4);
}

//DATA PACKING

uint pack(vec2 x)
{
    x = 65534.0*clamp(0.5*x+0.5, 0., 1.);
    return uint(round(x.x)) + 65535u*uint(round(x.y));
}

vec2 unpack(uint a)
{
    vec2 x = vec2(a%65535u, a/65535u);
    return clamp(x/65534.0, 0.,1.)*2.0 - 1.0;
}

vec2 decode(float x)
{
    uint X = floatBitsToUint(x);
    return unpack(X)*1.0; 
}

float encode(vec2 x)
{
    uint X = pack(x/1.);
    return uintBitsToFloat(X); 
}

//particle to grid
vec4 P2G(sampler2D a, sampler2D b, vec2 P)
{
    vec2 x = vec2(0.0);
    vec2 v = vec2(0.0);
    float m = 0.0;
    float rho = 0.0;
    
    range(i, -rad, rad) range(j, -rad, rad)
    {
        //load data
        vec2 di = vec2(i,j);
        vec4 data0 = CH(a, P + di);
        vec4 data1 = CH(b, P + di);
        
        //unpack data
        float m0 = data0.y;
        float r0 = data0.w;
        vec2 x0 = decode(data0.x);
        vec2 v0 = decode(data1.x);
        //mat2 B0 = mat2(decode(data1.y),decode(data1.z)); //velocity gradient
        
        //estimate the shape of the distribution
        vec2 box = destimator(x0);
        
        //update particle position
        x0 = x0 + di + v0*dt;
    
        //find cell contribution
        vec3 o = overlap(x0, box);
         
        //update distribution
        x += m0*o.xy*o.z;
        m += m0*o.z;
        
        //find grid node contribution
        float w = k1(x0);
        //rho += m0*(w-(B0[0].x+B0[0].y)*0.01);
        
        //distribute momentum onto grid
        v += v0*w*m0;
        rho += m0*w;
    }
    
    //normalize
    if(rho > 0.0) v /= rho;
    if(m > 0.0) x /= m;
    
    //initial conditions
    //if(frame < 20)
    {
        InitialConditions(m, v, P);
    }
    
    v = (length(v)>max_vel)?normalize(v)*max_vel:v;
    
    return vec4(encode(x), m, encode(v), rho);
}

//grid to particle
vec4 G2P(sampler2D a, sampler2D b, vec2 P)
{
    vec2 V = vec2(0.0);
    mat2 B = mat2(0.0);
    
    vec4 data = CH(a, P);
    float m = data.y;
    vec2 x = decode(data.x);
    
    range(i, -rad, rad) range(j, -rad, rad)
    {
        //load data
        vec2 di = vec2(i,j);
        vec4 data0 = CH(a, P + di);
        
        //unpack data
        float m0 = data0.y;
        float rho = data0.w;
        vec2 dx = x - di;
        vec2 v0 = decode(data0.z);
        
        //find grid node contribution
        float w = k1(dx);
        
        float P = clamp(pressure(rho), -0.5, 0.5);
        vec2 F = rho*dx*P;
        
        //distribute velocities/forces to particles
        V += (F*dt)*w;
        B += affine_str(m)*mat2(v0*dx.x,v0*dx.y)*w;
    }
      //gravity
     V += vec2(0.0, -gravity)*dt;
    
    V += 1.0005*decode(data.z);
    
  
    
    //push fluid
   // V += vec2(0.0, 0.5)*exp(-0.02*pow(distance(P, R*vec2(0.7,0.3)), 2.));
    
    if(Mouse.z > 0.)
    {
        vec2 dx = (Mouse.xy - P); 
        V += 0.05*exp(-0.09*length(dx))*dx*dt; 
    }
    
    //border 
    vec3 N = bN(P + x);
    float vdotN = step(N.z, border_h)*dot(-N.xy, V);
    //V *= 1. - 0.1*exp(-N.z);
    V += (0. + 1.5*max(vdotN, 0.0))*N.xy*step(abs(N.z), border_h)*exp(-N.z);
    V = (length(V)>max_vel)?normalize(V)*max_vel:V;

    if(abs(V.y)<0.01)V.y+=sign(hash13(vec3(P, time ))-0.5)*0.03;
    if(abs(V.x)<0.01)V.x+=sign(hash13(vec3(P, time ))-0.5)*0.03;

    return vec4(encode(V), encode(B[0]), encode(B[1]), 1.0);
}

