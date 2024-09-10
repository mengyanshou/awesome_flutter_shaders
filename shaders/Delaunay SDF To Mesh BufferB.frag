#include <common/common_header.frag>
#include <Delaunay SDF To Mesh Common.frag>

uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
void sortClosest(
        inout vec4 distances,
        inout uvec4 indices, 
        uint index,
        vec2 center
        ) {
    if (index == uint(-1) || any(equal(indices, uvec4(index)))) {
        return;
    } 

    Entity e = decodeEntity(iChannel0, index);
    float dist = length(center - e.position);
    
    if (dist < distances[0]) {
        distances = vec4(dist, distances.xyz);
        indices = uvec4(index, indices.xyz);
    } else if (dist < distances[1]) {
        distances = vec4(distances.x, dist, distances.yz); 
        indices = uvec4(indices.x, index, indices.yz);
    } else if (dist < distances[2]) {
        distances = vec4(distances.xy, dist, distances.z); 
        indices = uvec4(indices.xy, index, indices.z);
    } else if (dist < distances[3]) {
        distances = vec4(distances.xyz, dist);             
        indices = uvec4(indices.xyz, index);
    }
}

void fetchAndSortClosest( inout vec4 distances, inout uvec4 idList, in vec2 samplePoint, in vec2 cellCenter ) {
    uvec4 ids = fetchClosest(samplePoint, iChannel1);
    
    for (int i = 0; i < 4; i++) {
        sortClosest(distances, idList, ids[i], cellCenter);
    }
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    uvec4 closestIndices = uvec4(-1);
    vec4 bestDistances = vec4(FLOAT_INF);
    
    uint seed = uint(iFrame) + uint(fragCoord.x) + uint(fragCoord.y);
    float rad = 4.0;

    fetchAndSortClosest(bestDistances, closestIndices, fragCoord, fragCoord);
    fetchAndSortClosest(bestDistances, closestIndices, fragCoord + randomDir(seed) * rad, fragCoord);
    fetchAndSortClosest(bestDistances, closestIndices, fragCoord + randomDir(seed) * rad, fragCoord);
    fetchAndSortClosest(bestDistances, closestIndices, fragCoord + randomDir(seed) * rad, fragCoord);
    fetchAndSortClosest(bestDistances, closestIndices, fragCoord + randomDir(seed) * rad, fragCoord);
    
    rngSeed = murmur3(uint(fragCoord.x)) ^ murmur3(floatBitsToUint(fragCoord.y)) ^ murmur3(floatBitsToUint(iTime));

    for (int i = 0; i < 16; i++) {
        sortClosest(bestDistances, closestIndices, wrap1d(nextUint()), fragCoord);
    }

    fragColor = uintBitsToFloat(closestIndices);
}

#include <common/main_shadertoy.frag>