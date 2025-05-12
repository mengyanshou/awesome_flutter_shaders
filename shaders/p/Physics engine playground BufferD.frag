#include <../common/common_header.frag>
#include <Physics engine playground Common.frag>
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
uniform sampler2D iChannel3;

vec3 pos;
vec4 quat;
vec3 vel;
vec3 rotvel;

void initScene(int cubei) {
    vel = vec3(0., 0., 0.);
    rotvel = vec3(0., 0., 0.);
    quat = vec4(0.0, 0.0, 0.0, 1.0);
    if(cubei < STATIC_CUBE_COUNT) // static floor
    {
        pos = vec3(0, -1, 0);

        if(cubei == 0) {
            vec3 ro = vec3(SLOPE, 0, 0.);
            quat = rotateRotation(normalize(vec4(0.0, 0.0, 0.0, 1.0)), ro);

        }
        if(cubei > 0) {
            vec3 ro = vec3(0., PI * (float(cubei) * 2.0) / 4., 0.);
            pos = rotateAxis(ro, vec3(0, 0, 20));
            quat = rotateRotation(normalize(vec4(0.0, 0.0, 0.0, 1.0)), ro);
        }
        return;
    }

    cubei -= STATIC_CUBE_COUNT;
    float cubeif = float(cubei);
    int div = CUBE_PILES;
    vec3 ro = vec3(0., PI * (float(cubei) * 2.0) / float(div), 0.);
    pos = rotateAxis(ro, vec3(0.0, 1. + float(cubei / div) * 2.3, 4.5));
    if(CUBECOUNT > 200)
        pos = vec3(cubei % 8 - 4, 1. + float(cubei / 64), (cubei / 8) % 8 - 4) * 2.;

    quat = rotateRotation(normalize(vec4(0.0, 0.0, 0.0, 1.0)), ro);

    vel = vec3(-0.00, 0.0, 0.00);
    rotvel = vec3(0);// vec3(cubeif*-0.0001*cos(float(iFrame)),0.0,cubeif*-0.0001); // randomize start setup        
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    int pixelx = int(fragCoord.x);
    int pixely = int(fragCoord.y);

    fragColor = vec4(0.0, 0.0, 0.0, 0.0);

    if(pixely >= 4)
        discard;
    if(pixelx >= (CUBECOUNT))
        discard;
    int cubei = pixelx;

    pos = getCubePos(cubei);
    quat = getCubeQuat(cubei);
    vel = getCubeVel(cubei);
    rotvel = getCubeRotVel(cubei);
    int ncoll = 0;

    if(cubei >= STATIC_CUBE_COUNT) {
        // apply forces (just the changes)

        for(int i = 0; i < CUBECOUNT - 1; i++) {
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

            if(!(length(getCubePos(ci) - getCubePos(cj)) > length(size(ci)) + length(size(cj)) && cj >= STATIC_CUBE_COUNT)) // bounding check
            {
                vec3 forcepos = getCollPos(ci, cj).xyz;
                if(forcepos != vec3(0)) {
                    vec3 force = getForce(ci, cj);
                    ncoll++;
                    // add repulsive force
                    vec4 collisnormal = getCollNorm(ci, cj);
                    collisnormal.xyz *= max(abs(dot(forcepos, collisnormal.xyz) - collisnormal.w) - 0.01, 0.0);
                    force += collisnormal.xyz * repulsion * dt;

                    force *= scaler * FS;
                    vel += dt * force;
                    //vec3 t =normalize(cross(forcepos-pos,force));
                    //float ri = max(.1, dot(RotationalImmobilityTensor,t*t));
                    rotvel -= dt * cross(forcepos - pos, force) / (RotationalImmobilityTensor);
                }
            }
        }

        // move by adding velocity to position, and rotate
        pos += dt * vel;
        quat = rotateRotation(quat, rotvel * dt);
        vel.y += dt * gravity;
        if(length(vel) > 2.)
            vel *= .98;
    }

    if(INIT)
        initScene(cubei);

    fragColor = vec4(pos, ncoll);
    if(pixely == 1)
        fragColor = quat;
    if(pixely == 2)
        fragColor = vec4(vel, 0.0);
    if(pixely == 3)
        fragColor = vec4(rotvel, 0.0);

}

#include <../common/main_shadertoy.frag>