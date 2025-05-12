#include <../common/common_header.frag>
#include <Physics engine playground Common.frag>
uniform sampler2D iChannel0;
uniform sampler2D iChannel3;
uniform sampler2D iChannel2;

vec3 pos;
vec4 quat;
vec3 vel;
vec3 rotvel;

vec4 findSepPlane(int cia, int cib) {

    if(cia >= CUBECOUNT)
        discard;
    if(cib >= cia)
        discard;
    float best = 1e30;
    vec4 bestsep = vec4(0, 1, 0, 0);

    bool intersect;
    float idepth;
    vec3 idir, ipos;

    obj o1, o2;
    o1.c = getCubePos(cia);
    o1.b = size(cia);
    o1.s = shape(cia);
    o1.r = getCubeQuat(cia);

    o2.c = getCubePos(cib);
    o2.b = size(cib);
    o2.s = shape(cib);
    o2.r = getCubeQuat(cib);

    if(getCollPos(cia, cib) == vec3(0.))
        return vec4(0, 1, 0, 0);
    int res = MPRPenetration(o1, o2, idepth, idir, ipos);
    if(res >= 0) {
        bestsep.w = -idepth - dot(ipos, idir);
        bestsep.xyz = -idir;
    }

    return vec4(normalize(bestsep.xyz), bestsep.w);
    ;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    int pixelx = int(fragCoord.x);
    int pixely = int(fragCoord.y);

    fragColor = vec4(0.0, 0.0, 0.0, 0.0);

    if(pixelx < CUBECOUNT) {

        fragColor = findSepPlane(pixelx, pixely);
        return;
    }
    if(pixely >= 4 || pixely < 2)
        discard; // just output velocity and rotational velocity
    int cubei = pixelx - CUBECOUNT;

    pos = getCubePos(cubei);
    quat = getCubeQuat(cubei);
    vel = getCubeVel(cubei);
    rotvel = getCubeRotVel(cubei);

    if(cubei >= STATIC_CUBE_COUNT) {
    // apply forces (just the changes)
        for(int i = 0; i < int(CUBECOUNT) - 1; i++) {
            int ci, cj;
            float scaler;
            if(i < cubei) {
                ci = cubei;
                cj = i;
                scaler = 1.0;
		 // if the other cube cannot be pushed away, because its's the floor or other unmovable, 
          // this one moves double amount
                if(cj < STATIC_CUBE_COUNT)
                    scaler = 2.0;
            } else {
                ci = i + 1;
                cj = cubei;
                scaler = -1.0; // applying the opposite forces on the cube pair
            }
            if(!(length(getCubePos(ci) - getCubePos(cj)) > length(size(ci)) + length(size(cj)) && cj != 0)) // bounding check
        //for(uint j=0u;j<uint(CP);j++)
            {
                vec3 forcepos = getCollPos(ci, cj).xyz;
                if(forcepos.x != 0.0) {
                    vec3 force = getForce(ci, cj).xyz;

                    force *= scaler * FS;
                    vel += dt * force;
                    rotvel -= dt * cross(forcepos - pos, force) / RotationalImmobilityTensor;
                }
            }
        }

    }

    fragColor = vec4(vel, 0.0);
    if(pixely == 3)
        fragColor = vec4(rotvel, 0.0);

}

#include <../common/main_shadertoy.frag>