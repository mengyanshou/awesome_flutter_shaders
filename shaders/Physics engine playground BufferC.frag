#include <common/common_header.frag>
#include <Physics engine playground Common.frag>
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
uniform sampler2D iChannel3;
vec3 getCubeVelQP(int ci,vec3 querypos)
{
    return cross(querypos-getCubePos(ci),
    
    getCubeTempRotVel(ci)) + getCubeTempVel(ci);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    int pixelx = int(fragCoord.x);
    int pixely = int(fragCoord.y);
    
  
    int ci = pixelx;
    int cj = pixely;
    
    if (cj>=ci) discard;
    if (ci>=CUBECOUNT) discard;
    
    if ((length(getCubePos(ci)-getCubePos(cj))>length(size(ci))+length(size(cj))&& cj!=0))  // bounding check
    {
        fragColor = vec4(0.,0.,0.,0.);
        return;
    }
    

    vec3 totalForce  =  getForce(ci,cj).xyz;
    vec3 collpos =   getCollPos(ci,cj).xyz;


    if (collpos.xyz!=vec3(0.)) // x==0 means no collision at the force denoted by this pixel
    {
        vec3 veldiff = getCubeVelQP(cj,collpos)-getCubeVelQP(ci,collpos);

        vec3 collisNormal = getCollNorm(ci,cj).xyz;

        totalForce += veldiff*elasticConstant*dt;

        float perpart = dot(collisNormal,totalForce);
        vec3 tangentialpart = totalForce-collisNormal*perpart;

        if (length(tangentialpart)>perpart*FrictionConstant)
        {
            tangentialpart *= (perpart*FrictionConstant)/length(tangentialpart);
            totalForce = tangentialpart + collisNormal*perpart;
        }

        if (perpart<0.0) totalForce = vec3(0.);
        
    }
    else totalForce= vec3(0.);
     
    if (INIT) totalForce = vec3(0.);
    fragColor = vec4(totalForce,1.0);
}

#include <common/main_shadertoy.frag>