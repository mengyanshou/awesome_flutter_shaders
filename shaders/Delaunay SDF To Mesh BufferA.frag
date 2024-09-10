#include <common/common_header.frag>
#include <Delaunay SDF To Mesh Common.frag>

uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    uint flatID = to1d(floor(fragCoord), vec2(textureSize(iChannel0, 0)));
    const Entity INVALID_ENTITY = Entity(vec2(-FLOAT_INF), vec2(0));
    fragColor = encodeEntity(INVALID_ENTITY);
    if (flatID >= PARTICLE_COUNT)
        return;

    uint flatSeed = murmur3(flatID); 
    rngSeed = flatSeed;

    Entity current;
    if (iFrame <= 8) {
        float angle = nextFloat() * 2.0 * PI;
        float radius = sqrt(nextFloat()) *  iResolution.x * 0.25;
    current.position += vec2(cos(angle), sin(angle)) * radius + iResolution.xy * 0.5;

    } else {
        current = decodeEntity(iChannel0, flatID);
    }

    vec2 p = (current.position - 0.5 * iResolution.xy) / min(iResolution.x, iResolution.y); p *= 2.0;

    uvec4 closest = fetchClosest(current.position, iChannel1);
    
    vec2 delta = gsdCross(p);
    float dist = sdCross(p);
        
    if (dist > 0.0) {
        float cost = dist;
        float lambda = -cost;
        vec2 grad = delta / dist;
        vec2 correction = grad * lambda;

        current.position += correction * 2.0;
    }

    
    for (int i = 0; i < 4; i++) {
        if (closest[i] == flatID || closest[i] == -1u) {
            continue;
        }

        Entity other = decodeEntity(iChannel0, closest[i]);

        vec2 delta = current.position - other.position;
        float dist = length(delta);
        float dist3 = (dist * dist * dist);
        
        vec2 correction = -(1.0 / dist3) * delta;
            
        current.position -= correction * 100.0;
    }

    fragColor = encodeEntity(current);
}

#include <common/main_shadertoy.frag>