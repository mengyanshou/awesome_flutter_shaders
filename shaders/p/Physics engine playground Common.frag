#define CUBECOUNT 200
#define STATIC_CUBE_COUNT 5
#define CUBE_PILES 10
#define INIT (iFrame%(60*8)==0)

const float PI = 3.141592653;
const float gravity = -0.004;
const float repulsion = 0.003;
const float FrictionConstant = 0.7;
const float elasticConstant = 0.004;
const float FS = 50.;
const float dt=1.; //if dt is lower, you can increase both elasticConstant and repulsion
const vec3 sunDir = normalize(vec3(0.8,.8,-0.3));
const float RotationalImmobilityTensor =(1.8);    // vec3(sz.y*sz.y+sz.z*sz.z,sz.x*sz.x+sz.z*sz.z,sz.x*sz.x+sz.y*sz.y);

#if 0 //ENABLE THIS TO SEE ALTERNATE SETTINGS
    vec3  size( int i) { return int(i)==0?vec3(30,1,30):i<STATIC_CUBE_COUNT?vec3(20,6,.5) : i>=25?vec3(1.):vec3(1.2,.6,1.2);}
    int shape(int i) {return i<STATIC_CUBE_COUNT?0:i<15?5:i<25?3:4;}
    float material(int i) {return i<STATIC_CUBE_COUNT?0.:i<15? 2.: 1.;}
    #define MPR //MPR RAY INTERSECTION
    #define MORE_SHAPES
    #define SLOPE 0.
    #undef CUBECOUNT 
    #define CUBECOUNT 40
#else
    vec3  size( int i) { return int(i)==0?vec3(30,1,30):i<STATIC_CUBE_COUNT?vec3(20,6,.5) : i>=150?vec3(1.2,.6,.9):i>60?vec3(.6,1.2,.6):vec3(1.2,.6,1.2);}
    int shape(int i) {return i<130?0:i<170?2:1;}
    float material(int i) {return i<STATIC_CUBE_COUNT?0.:i>60? 2.: 1.;}
    #define SLOPE PI/12.
#endif 


//---------------------------------------------

vec4 readTex(sampler2D ch, int cx,int cy)  { return texelFetch(ch,ivec2(cx,cy),0);}
vec3 getCubePos(sampler2D ch,int ci)       { 
    vec3  p=  readTex(ch,ci,0).xyz;
    return mod( p+vec3(50),vec3(100.))-vec3(50);
}
int  getNColl(sampler2D ch,int ci)         { return int(readTex(ch,ci,0).w);}
vec4 getCubeQuat(sampler2D ch, int ci)     { return readTex(ch, ci,1).xyzw;}
vec3 getCubeVel(sampler2D ch,int ci)       { return readTex(ch,ci,2).xyz;}
vec3 getCubeRotVel(sampler2D ch,int ci)    { return readTex(ch,ci,3).xyz;}
vec3 getCubeTempVel(sampler2D ch,int ci)   { return readTex(ch,ci+(CUBECOUNT),2).xyz;}
vec3 getCubeTempRotVel(sampler2D ch,int ci){ return readTex(ch,ci+(CUBECOUNT),3).xyz;}

#define  getCollPos(ci,cj) readTex(iChannel0, ci,cj).xyz
#define  getCollNorm(ci,cj) readTex(iChannel1, ci,cj)
#define  getForce(ci,cj) readTex(iChannel2, ci,cj).xyz
#define  getCubePos( ci) getCubePos(iChannel3, ci)
#define  getNColl(  ci) getNColl(iChannel3, ci)
#define  getCubeQuat( ci) getCubeQuat(iChannel3, ci)
#define  getCubeTempVel( ci) getCubeTempVel(iChannel1, ci)
#define  getCubeVel(  ci) getCubeVel(iChannel3, ci)
#define  getCubeRotVel( ci) getCubeRotVel(iChannel3, ci)
#define  getCubeTempRotVel( ci) getCubeTempRotVel(iChannel1, ci)

vec3 rotateAxisAngle(vec3 axis,float angle,vec3 v)
{
	return v*cos(angle) + axis*((v*axis) * (1.0-cos(angle))) + cross(v,axis)*sin(angle);
}

vec3 rotateAxis(vec3 axis,vec3 v)
{
    float len = length(axis);
    if (len==0.0) return v;
    else return rotateAxisAngle(normalize(axis),len,v);
}

vec3 rotate(vec4 quat,vec3 v)
{
    float sinsqr = (1.0-quat.w*quat.w);
    if (sinsqr!=0.0)
    {
        v=v*quat.w + quat.xyz*((dot(v,quat.xyz)*(1.0-quat.w))*(1.0/sinsqr)) + cross(v,quat.xyz);
        v=v*quat.w + quat.xyz*((dot(v,quat.xyz)*(1.0-quat.w))*(1.0/sinsqr)) + cross(v,quat.xyz);
    }
    return v;
}

vec3 rotateInv(vec4 quat,vec3 v)
{
    quat.xyz*=-1.;
    return rotate( quat, v);
}


vec4 getRotation(vec3 x,vec3 y,vec3 z){
    // convert back to quaternion
	float trace = x.x + y.y + z.z;
    vec4 q;
	if( trace > 0.0 ) {
		float s = 0.5 / sqrt(trace+ 1.0);
		q=vec4(( z.y - y.z ) * s,( x.z - z.x ) * s,( y.x - x.y )*s, 0.25 / s);		
	} else {
		if ( x.x > y.y && x.x > z.z ) {
		    float s = 2.0 * sqrt( 1.0 + x.x - y.y - z.z);
			q =vec4( 0.25 * s,(x.y + y.x ) / s,(x.z + z.x ) / s,(z.y - y.z ) / s);
		} else if (y.y > z.z) {
			float s = 2.0 * sqrt( 1.0 + y.y - x.x - z.z);
			q = vec4((x.y + y.x ) / s,0.25 * s, (y.z + z.y ) / s,(x.z - z.x ) / s);
		} else {
			float s = 2.0 * sqrt( 1.0 + z.z - x.x - y.y ); 
			q= vec4((x.z + z.x ) / s,(y.z + z.y ) / s,0.25 * s,(y.x - x.y ) / s);
		}
	}   
    return normalize(q); 
}

vec4 rotateRotation(vec4 q,vec3 axis) {
    vec3 x,y,z; // conversion to 3 perpendicular vectors, and rotation
    x = rotateAxis(axis,rotate(q,vec3(1.0,0.0,0.0)));
    y = rotateAxis(axis,rotate(q,vec3(0.0,1.0,0.0)));
    z = rotateAxis(axis,rotate(q,vec3(0.0,0.0,1.0)));
    return getRotation(x,y,z);
}  
#define NOHIT 1e30
vec3 oFuv; 
vec3 oNor;
vec2 iBox( in vec3 ro, in vec3 rd, vec3 boxSize) 
{
    vec3 m = 1./rd; 
    vec3 n = m*ro;   
    vec3 k = abs(m)*boxSize;

    vec3 t1 = -n - k;
    vec3 t2 = -n + k;
    float tN = max( max( t1.x, t1.y ), t1.z );
    float tF = min( min( t2.x, t2.y ), t2.z );
    if( tN>tF ) return vec2(NOHIT); // no intersection
    oNor = -sign(rd)*step(t1.yzx,t1.xyz)*step(t1.zxy,t1.xyz); 
    oFuv=vec3( dot(abs(oNor),vec3(1,5,9)+ oNor)/2.,dot(ro+rd*tN,oNor.zxy),dot(ro+rd*tN,oNor.yzx));   
    return vec2(tN,tF);

}

vec2 iSphere( in vec3 ro, in vec3 rd, float ra )
{
    vec3 oc = ro ;
    float b = dot( oc, rd );
    float c = dot( oc, oc ) - ra*ra;
    float h = b*b - c;
    if( h<0. ) return vec2(NOHIT); // no intersection
    h = sqrt( h);
    oNor =normalize(ro-(b+h)*rd); oFuv=vec3(0.,atan(oNor.y,length(oNor.xz)),atan(oNor.z,oNor.x))*ra*1.5708  ;
    return vec2(-b-h,+b-h);

}

// same as above, but specialized to the Y axis
vec2 iCylinderVertical( in vec3 ro, in vec3 rd, float he, float ra )
{
    float k2 = 1.0        - rd.z*rd.z;
    float k1 = dot(ro,rd) - ro.z*rd.z;
    float k0 = dot(ro,ro) - ro.z*ro.z - ra*ra;
    
    float h = k1*k1 - k2*k0;
    if( h<0.0 ) return vec2(NOHIT);
    h = sqrt(h);
    float t = (-k1-h)/k2;

    // body
    float z = ro.z + t*rd.z;
    if( z>-he && z<he ) {       
        oNor= (ro + t*rd - vec3(0.0,0.0,z))/ra;
        oFuv = vec3(0,(ro + t*rd).xy);
        return vec2(t);//todo t.y
    }
    // caps
    t = ( ((z<0.0)?-he:he) - ro.z)/rd.z;
    if( abs(k1+k2*t)<h ) {
        oNor= vec3(0.0,0.0,sign(z));
        oFuv = vec3(0, (ro + t*rd).xy);
        return vec2(t);//todo t.y
    }
    return vec2(NOHIT);
}
//----------------------------------

struct obj{
    vec3 c; //center
    vec3 b; //bounding box
    vec4 r; //rotation quat
    int s; //shape (0=box,1=sphere,2=cylinder,3=cone, 5=segment)
};

obj _ob1,_ob2;
vec3 a,b,c,d; //difference simplex
vec3 a1,b1,c1,d1; //obj1 simplex
vec3 a2,b2,c2,d2; //obj2 simplex



#define  tripleCross(a,b,c) cross(a,cross(b,c))


#define MAX_ITER 10
//-------------------

vec3 supMax(vec3 d, vec3 a, vec3 b)
{
    return dot(d,a) > dot(d,b) ? a : b;
}


vec3 support(vec3 dir, obj o){
    const float h=(sqrt(5.)-1.)*.5,h2=h*h;
    if(o.s==1) //SPHERE
        return normalize(dir)*(o.b.x);
    else if(o.s==2) //CYLINDER
        return  supMax( dir, vec3(normalize(dir.xy)*o.b.x, o.b.y),vec3(normalize(dir.xy)*o.b.x, -o.b.y) );
#ifdef MORE_SHAPES        
    else if(o.s==3) //CONE
        return  supMax( dir, vec3(normalize(dir.xy)*o.b.z, o.b.z) ,vec3(0,0,-o.b.z)
        );
   else if(o.s==4)  //ICOSAHEDRON
       return  o.b/(1.+h)* supMax(dir,  sign(dir)*vec3(1.,1.+h,0), supMax(dir, sign(dir)*vec3(0,1.,1.+h),sign(dir)*vec3(1.+h,0,1.))
      );
   else if(o.s==5) return normalize(dir*o.b)*(o.b); //ELLIPSOID
   //see https://www.shadertoy.com/view/dtVyzz for more shapes
#endif
   else return sign(dir)*o.b; // BOX (DEFAULT)
} 

//Minkowsky difference support function
vec3 support(vec3 dir,out vec3  s1, out vec3 s2){

    //mat3 rt = mrot(_ob1.r);
    vec4 q =_ob1.r;
    s1 = support(rotateInv(q,dir),_ob1);   
    s1=  rotate(q, s1 +rotateInv(q,_ob1.c)); 
    
    q = (_ob2.r);
    s2 = support(rotateInv(q,-dir),_ob2);
    s2=  -rotate(q,s2 +rotateInv(q,_ob2.c));
    
    return s1+s2;
}

vec3 supportr(vec3 dir, obj o, mat3 rm){
    dir=dir*rm;
    vec3 s= support(dir,  o);
    return s *transpose(rm)+ o.c ;
}

//------------------------------------

int discoverPortal()
{
    vec3 dir; 
   
    // vertex a is center of portal
    a1=_ob1.c;a2=-_ob2.c; a= a1+a2; 
    
    if (a==vec3(0)) {a1+= vec3(1e-3,0,0); a+=vec3(1e-3,0,0);}

    // vertex b = support in direction of origin
	dir= -normalize(a);  
    b = support(dir,b1,b2);

    // test if origin isn't outside of b
    if ( dot(b, dir) <=0.) return -1;

    // vertex c
	dir = cross(a, b);					 					   
    if (length(dir)==0.){
        if (b == (_ob1.c-_ob2.c)) return 1; // origin lies on b
        else return 2; // origin lies on a-b segment
    }
    
	c= support(normalize(dir),c1,c2);
    if ( dot(c, dir) <=0.) return -1;

    // vertex d direction

	dir= normalize(cross(b-a,c-a));

    // it is better to form portal faces to be oriented "outside" origin

    if (dot(dir, a) > 0.){
        vec3 t =b; b=c;c=t; t =b1; b1=c1;c1=t; t =b2; b2=c2;c2=t;//swap
        dir *=-1.;
    }
    
    
    int cont=1;
    int iter=0;
    while (cont>0 && iter <20){
        
		d= support(dir,d1,d2);        
        if (dot(d, dir) <=0.) return -1;
        cont = 0;

        // test if origin is outside (b, a, d) - set c as d and continue
        if ( dot(cross (b,d), a)  < 0. ){
			c=d;c1=d1;c2=d2;
            cont = 1;      
        }
        
        if (cont==0){
            // test if origin is outside (d, a, c) - set b as d and continue
            if (dot(cross (d,c), a) < 0. ){
                b=d;b1=d1;b2=d2;
                cont = 1;               
            }
        }
        if (cont!=0) dir =normalize(cross( b-a, c-a));
        iter++;
    }
    return 0;
}


int refinePortal()
{
    vec3 dir;
    vec3 v4,v41,v42;
    int iter=2;
    
    while (iter<20){
        iter++;
        // compute direction outside the portal (from v0 throught v1,v2,v3 face)
        dir= normalize(cross( c-b, d-b));

        // test if origin is inside the portal
        if ( dot(dir, b)>= 0.) return iter;

        // get next support point
        v4 = support(dir,v41,v42);
       
        // find the smallest dot product of dir and {a-v4, b-v4, c-v4}
        float dv1 = dot(a, dir);
        float dv2 = dot(b, dir);
        float dv3 = dot(c, dir);
        float dv4 = dot(v4, dir);
        bool portalReachTolerance=   (min(min(dv4 - dv1, dv4 - dv2),dv4 - dv3)  <= 1e-4);

        // test if v4 can expand portal to contain origin and if portal
        // expanding doesn't reach given tolerance
        if ( dot(v4, dir)<0.  || portalReachTolerance)  return -iter;
        
        // expandPortal( v4);
        // b-c-d triangle must be rearranged to face outside Minkowski
        // difference (direction from a).     
        vec3 v4a =cross( v4,a);   
        if (dot(b, v4a) > 0.) {
            if(dot (c, v4a) > 0.) {b=v4;b1=v41;b2=v42;}
            else  {d=v4;d1=v41;d2=v42;}
        }
        else{
            if(dot(d, v4a) > 0.)  {c=v4;c1=v41;c2=v42;}
            else {b=v4;b1=v41;b2=v42;}
        }        
    }

    return -iter;
}

// return value:
//  <=0 ouside 
//  >0 inside 
int MPRIntersect(obj o1 , obj o2)
{

    int res;
    _ob1 =o1;
    _ob2=o2;
    // Phase 1: Portal discovery - find portal that intersects with origin
    // ray (ray from center of Minkowski diff to origin of coordinates)
    res = discoverPortal();
    if (res != 0) return res;

    // Phase 2: Portal refinement
    res = refinePortal();
    return res; 
}



float dot2( in vec3 v ) { return dot(v,v); }
// Iq:  https://www.shadertoy.com/view/ttfGWl
float  PointTriDist2(in vec3 p,  in vec3 v0, in vec3 v1, in vec3 v2, out vec3 dir  )
{
    vec3 v10 = v1 - v0; vec3 p0 = p - v0;
    vec3 v21 = v2 - v1; vec3 p1 = p - v1;
    vec3 v02 = v0 - v2; vec3 p2 = p - v2;
    vec3 nor = cross( v10, v02 );

    if( dot(cross(v10,nor),p0)<0.0 ) dir=  v0 + v10*clamp( dot(p0,v10)/dot2(v10), 0.0, 1.0 );
    else if( dot(cross(v21,nor),p1)<0.0 ) dir= v1 + v21*clamp( dot(p1,v21)/dot2(v21), 0.0, 1.0 );
    else if( dot(cross(v02,nor),p2)<0.0 ) dir= v2 + v02*clamp( dot(p2,v02)/dot2(v02), 0.0, 1.0 );
    else dir= p - nor*dot(nor,p0)/dot2(nor);
    return dot2(p-dir);  
}

void findPos(out vec3 pos)
{
    vec3  dir;
    float k0,k1,k2,k3, sum;

    dir= normalize(cross( c-b, d-b));
    
    // use barycentric coordinates of tetrahedron to find origin    
    k0 = dot(cross(b,c),d);
    k1 = dot(cross(d,c),a);
    k2 = dot(cross(a,b),d); 
    k3 = dot(cross(c,b),a);  

	sum = k0 + k1 + k2 + k3;
    if (sum<=0.){
		k0 = 0.;
        k1 = dot(cross(b,c),dir);  
        k2 = dot(cross(d,b),dir);  
        k3 = dot(cross(b,c),dir);   
		sum = k1 + k2 + k3;
	}
    
    vec3 p1= a1*k0+b1*k1+c1*k2+d1*k3;
    vec3 p2= a2*k0+b2*k1+c2*k2+d2*k3;

    pos=.5*(p1-p2)/sum;
}
void findPenetr(out float depth, out vec3 dir, out vec3 pos){

    
    vec3 v4,v41,v42;
    int iterations;

    iterations = 0;
    while (true){
        // compute portal direction and obtain next support point
        dir= normalize(cross( c-b, d-b));
        v4 =support(dir,v41,v42);

        float dv1 = dot(a, dir);
        float dv2 = dot(b, dir);
        float dv3 = dot(c, dir);
        float dv4 = dot(v4, dir);
        bool portalReachTolerance=   (min(min(dv4 - dv1, dv4 - dv2),dv4 - dv3)  <= 1e-4);
        
        // reached tolerance -> find penetration info
        if (portalReachTolerance|| iterations > MAX_ITER){
            depth = PointTriDist2(vec3(0) ,b,c,d, dir);
            depth = sqrt(depth);
            if (depth==0.){
                // If depth is zero, then we have a touching contact.
                // So following findPenetrTouch(), we assign zero to
                // the direction vector (it can actually be anything
                // according to the decription of ccdMPRPenetration
                // function).
                dir=vec3(0,1,0);
            }else{
                dir=normalize(dir);
            }

            // barycentric coordinates:
            findPos(pos);

            return;
        }

        //ExpandPortal(v4)
        // b-c-d triangle must be rearranged to face outside Minkowski
        // difference (direction from a).     
        vec3 v4a =cross( v4,a);   
        if (dot(b, v4a) > 0.) {
            if(dot (c, v4a) > 0.) {b=v4;b1=v41;b2=v42;}
            else  {d=v4;d1=v41;d2=v42;}
        }
        else{
            if(dot(d, v4a) > 0.)  {c=v4;c1=v41;c2=v42;}
            else {b=v4;b1=v41;b2=v42;}
        } 
        iterations++;
    }
}

int MPRPenetration(obj o1 , obj o2 , out float depth, out vec3 dir, out vec3 pos)
{
    
    int res;
    _ob1 =o1;
    _ob2 =o2;
    
    dir= vec3(0,1,0);
    // Phase 1: Portal discovery
    res = discoverPortal();
    if (res < 0){
        // Origin isn't inside portal - no collision.
        return -1;

    }else if (res == 1){
        // Touching contact on portal's b.
            // Touching contact on portal's b - so depth is zero and direction
            // is unimportant and pos can be guessed
            depth = 0.;
            dir= vec3(0,1,0); 
            pos=(b1+b2)*.5;

    }else if (res == 2){
        // Origin lies on a-b segment.
        // Depth is distance to b, direction also and position must be
        // computed
         pos=(b1+b2)*.5;
         depth = length(b);
         dir =normalize(b);

    }else if (res == 0){
        // Phase 2: Portal refinement
        res = refinePortal();
        if (res < 0)  return -1;
        // Phase 3. Penetration info
        findPenetr(depth, dir, pos);
        return res;
    }

    return 0;
}


//----------
#define TOLERANCE 1e-6
#define ITERATIONS 20
#define VAXIS vec3(0,1,0)
// adapted from:  https://www.shadertoy.com/view/wstyRB
//  Casts ray in rd direction from ro, estimates depth and normal 
vec2 iSupportFunction( in vec3 ro, in vec3 rd, obj o,out vec3 normal)
{   

    vec3 dir, tmp;   
    vec3 a,b,c,d;
     float d0=- dot(ro,rd);  
    //RX=horizontal axis, RY=vertical axis
    rd=normalize(rd);
    vec3 rx =normalize(cross(rd,VAXIS)),ry=cross(rx,rd);
    //switch to local coordinates
   normal=vec3(0,1,0);
   oFuv=vec3(0);
   
    //rd*=-1.;
    vec4 q= getRotation( rx,ry,-rd );
    mat3 rmai=mat3(
        rotate(q,vec3(1,0,0)),
        rotate(q,vec3(0,1,0)),
        rotate(q,vec3(0,0,-1))
    ), rma=transpose(rmai);

    ro*=rmai;
    
    
    mat3 rm= rma *
    mat3(
        rotate(o.r,vec3(1,0,0)),
        rotate(o.r,vec3(0,1,0)),
        rotate(o.r,vec3(0,0,-1))
    );  
    o.c =  cross(cross(vec3(0,0,-1),ro),vec3(0,0,-1)); 
    //o.r=o2.r;
    
    #define perp2d(v)  ((v).yx*vec2(-1,1))  //(cross(v,vec3(0,0,-1)).xy) 
    a=o.c;
    
    b=supportr(vec3(-a.xy, 0.),o,rm);
    if (dot(-a.xy, b.xy) <= 0.) return vec2(NOHIT);
    
    dir = vec3(perp2d(b-a),0.);
    if (dot(dir.xy, a.xy) >= 0.)
    {
        dir.xy *= -1.;
        tmp = a; a = b; b = tmp;
    }
    c=supportr(dir,o,rm);
    if (dot(c.xy, dir.xy) <= 0.)
        return vec2(NOHIT);
    
    for (int i = 0;; ++i)
    {
        
        if (i == 6) return vec2(NOHIT);
        if (dot(dir.xy = perp2d(c-a), c.xy) < 0.)
            {b = c;}
        else if (dot(dir.xy = perp2d(b-c), c.xy) < 0.)
             {a = c;}
        else break; // Origin in triangle -> intersection!
        
        c=supportr(dir,o,rm);    
        if (dot(c.xy, dir.xy) <= 0.)
            return vec2(NOHIT);
    }
  
    float iN=NOHIT,iF=NOHIT;
    int j= 0;
    //for(int j= 0;j<=1;j++){
        for (int i = 0; i < ITERATIONS; ++i)
        {

            dir = normalize(cross(b-a, c-a));
            if(j>0) dir*=-1.; // uncomment to get exit point
            d=supportr(dir,o,rm);

            if (abs(dot(dir, d) - dot(dir, a)) < TOLERANCE)break;

            // xd = origin left of xd line
            bool ad = dot(perp2d(d-a),d.xy) > 0.;
            bool bd = dot(perp2d(d-b), d.xy) > 0.;
            bool cd = dot(perp2d(d-c), d.xy) > 0.;

            // Choose triangle that intersects z-axis furthest in z direction
            if (ad && !bd) {c = d;}
            else if (bd && !cd) {a = d;}
            else if (cd && !ad) {b = d;}
            else break; // Should not happen

        }

       if(j==0){
            normal = -normalize(cross(b-a, c-a));
            //
        }
        float depth = a.z + dot(a.xy, normal.xy)/normal.z ;
        
        float t= (  -depth +d0); //todo uv
        if(j==0) iN=t;
        else iF=t;
        //}
    
    normal=normal*rma;

    return  vec2(iN,iF); 
}

