// "Physics engine playground" by kastorp
//  most of the code is from 
//    "Physics engine" by Archee
//     https://www.shadertoy.com/view/MdXBD8
//---------------------------------------
// buffer A:
//     collision Point (for each box pair)
// buffer B
//     guess new vel (for each box)
//     guess new rotation vel (for each box)
//     separating plane (for each colliding box pair)
// buffer C
//     friction+repulsion collision force ( for each colliding box pair)
// buffer D
//     position (for each box)
//     new velocity (for each box)
//     rotation quaternion (for each box)
//     rotation velocity (for each box)
//-------------------------------------------------
#include <common/common_header.frag>
#include <Physics engine playground Common.frag>
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
uniform sampler2D iChannel3;
vec3 rayPos,rayDir;
float minDist;
vec3 minDistNormal;
float minDistMaterial;
vec2 minDistUv;

void renderBox(int ci){
     vec4 q =//vec4(0,0,0,1),
         getCubeQuat(ci),
         qi=vec4(-q.xyz,q.w);
     vec3 pos = getCubePos(ci);     
     vec3 b =size(ci);
     int sh = shape(ci);

       
#ifndef MPR       
     vec3 ro =rotate(qi,rayPos -pos),
          rd =rotate(qi,rayDir);  
     vec2 t;
     if(sh==0) t= iBox( ro,  rd,  b);
     else if(sh==1) t= iSphere( ro,  rd,  b.x);
     else if(sh==2) t= iCylinderVertical(ro,rd,b.y,b.x);
     if( minDist>t.x && t.x>0.){
         minDist=t.x-.0002;
         minDistNormal= rotate(q,oNor);
         //int ncoll= getNColl(ci);  
         minDistMaterial= sh>0?float(sh)+2.: material(ci); 
         minDistUv=oFuv.yz;
     }
#else
    //MPR intersector (NOT COMPILING WITH ANGLE)
     float d;
     int iter;   
     obj oo;
     oo.b= size(ci);
     oo.s=shape(ci);
     oo.c=pos;
     oo.r=q;
     
     vec2 t= iSupportFunction( rayPos-pos, rayDir, oo,oNor);
     if( minDist>t.x && t.x>0. ){
         minDist=t.x-.0002;
         minDistNormal= oNor;
         minDistMaterial= sh>0?float(sh)+2.: material(ci);  
         vec3 lp=rotateInv(q,rayPos+t.x*rayDir-pos);
         minDistUv=lp.xz;
     }
#endif
}

void renderScene()
{
    minDist = 1e30;   
    for(int i=0;i<(CUBECOUNT);i++)
    {       
        //bounding sphere
        if ( length(cross(getCubePos(i)-rayPos,rayDir))<=length(size(i)))
        {
            renderBox(i);
        }
    }
}



vec3 getDiffuse()
{
    vec3 difColor;
    if (minDistMaterial==0.) difColor = texture(iChannel0,rayPos.zx/8.0).xyz; // floor
    else if(minDistMaterial==1.) difColor =  texture(iChannel1,minDistUv/2.).xyz; // floor
    else if(minDistMaterial>=2.) difColor = texture(iChannel2,minDistUv/2.).xyz;
    else difColor=vec3(1,0,0);
    
    if(minDistMaterial==3.) difColor = difColor.zyx;
    if(minDistMaterial==4.) difColor = difColor.yxz;
    if(minDistMaterial==5.) difColor = difColor.xyz;
    if(minDistMaterial==6.) difColor = difColor.zxy;
    if(minDistMaterial==7.) difColor = difColor.yzx;
    return difColor;
}

vec3 backGround(vec3 dir,vec3 pos)
{
	float f = max(dir.y,0.0)*0.5+0.5;
	vec3 color = 1.0-vec3(1,0.85,0.7)*f;
	color *= dir.x*-0.3+1.0;
	
	if (dot(sunDir,dir)>0.0) // sun reflected on cubes
	{
	 f = max(length(cross(sunDir,dir))*10.0,1.0);
		
	 color += vec3(1,0.9,0.7)*40.0/(f*f*f*f);
	}
	return color;
}

vec3 getRayDir(vec3 ro, vec3 lookAt, vec2 uv) {
	vec3 f = normalize(lookAt - ro),
		 r = normalize(cross(vec3(0, 1, 0), f));
	return normalize(f + r * uv.x + cross(f, r) * uv.y);
}


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
 
    float a =sin(iTime*.2),d=22.;
    if(iMouse.z>0.){ a = iMouse.x/iResolution.x*4.-2.; d*=iMouse.y/iResolution.y+.8;}
	vec3 campos = vec3(-d*sin(a),15.,-d*cos(a));   
    vec2 uv= (fragCoord-iResolution.xy*.5)/iResolution.y*.8;
    vec3 pdir = getRayDir(campos,vec3(0,2.5,0), uv); 

    rayPos = campos;
    rayDir=pdir;

    renderScene();
           
    if (minDist<1e30)
    {
        minDistNormal = normalize(minDistNormal);
        const vec3 sunColor = vec3(1.0,0.8,0.5)*1.0;
        const vec3 skyColor = vec3(1.0,1.2,1.5)*0.6;
        rayPos += rayDir*minDist;
        vec3 firstHitPos = rayPos;
        vec3 refdir = reflect(rayDir,minDistNormal);
        float f = 1.-max(dot(minDistNormal,-rayDir),0.);
        float fresnel = 0.65*f*f*f*f*f+0.05;

        vec3 difColor =getDiffuse();
        
        fragColor = vec4(difColor*skyColor*((minDistNormal).y*0.5+0.5),0.);
        float suncos = dot((minDistNormal),sunDir);
        if (suncos>0.0)
        {
            // spot sun light pointing on the thrown cube.
            vec3 v = cross(sunDir,rayPos-vec3(0))/20.;
            suncos *= max(0.,1.0-dot(v,v));
            rayDir = sunDir;
    	    renderScene();
	        if (minDist==1e30) 
            {
                fragColor.xyz += difColor * suncos * sunColor;
            }
        }
        
        rayPos = firstHitPos;
        rayDir = refdir;
        renderScene();
        
        vec3 refColor;
        if (minDist<1e30)
        {
            rayPos += rayDir * minDist;
            vec3 difColor = getDiffuse();
            
            refColor = difColor*(normalize(minDistNormal).y*0.5+0.5);
        }
        else
        {
            refColor = backGround(rayDir,rayPos);
        }
        fragColor.xyz = mix(fragColor.xyz,refColor,fresnel);
    }
    else
    {
		fragColor = vec4(backGround(pdir,campos),0.0);
    }
 
}





#include <common/main_shadertoy.frag>