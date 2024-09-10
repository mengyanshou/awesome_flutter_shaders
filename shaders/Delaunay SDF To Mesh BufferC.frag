#include <common/common_header.frag>
#include <Delaunay SDF To Mesh Common.frag>

uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;

struct Line {
    vec2 midpoint;
    vec2 normal;
};

struct VoronoiCell {
    vec2 vertices[MAX_VORONOI_VERTICES];
    int vertexCount;
    float Rk;
    vec2 triangle[3];
};

vec2 intersectLines(Line l1, Line l2) {
    vec2 p1 = l1.midpoint;
    vec2 p2 = l2.midpoint;
    vec2 d1 = l1.normal;
    vec2 d2 = l2.normal;
    
    float det = d1.x * d2.y - d1.y * d2.x;
    if (abs(det) < 1e-6) {
        return vec2(-1);
    }
    
    float t = ((p2.x - p1.x) * d2.y - (p2.y - p1.y) * d2.x) / det;
    return p1 + d1 * t;
}

Line computeBisector(vec2 p1, vec2 p2) {
    vec2 midpoint = (p1 + p2) * 0.5;
    vec2 dir = normalize(p2 - p1);
    vec2 normal = vec2(-dir.y, dir.x);
    Line bisector;
    bisector.midpoint = midpoint;
    bisector.normal = normal;
    return bisector;
}

VoronoiCell computeVoronoiCell(vec2 site, uint siteIndex, uvec4 candidates) {
    VoronoiCell cell;
    cell.vertexCount = 0;
    cell.Rk = 0.0; 
    
    Line bisectors[4];
    for (int i = 1; i < 4; i++) {
        vec2 neighbor = decodeEntity(iChannel0, candidates[i]).position;
        bisectors[i - 1] = computeBisector(site, neighbor);
    }
    
    bisectors[3].midpoint = vec2(0);
    bisectors[3].normal = vec2(0, 1);
    
    for (int i = 0; i < 3; i++) {
        for (int j = i + 1; j < 4; j++) {
            vec2 intersection = intersectLines(bisectors[i], bisectors[j]);
            if (intersection.x != -1.0) {
                cell.vertices[cell.vertexCount++] = intersection;
                if (cell.vertexCount >= MAX_VORONOI_VERTICES) break;

                float distance = length(intersection - site);
                cell.Rk = max(cell.Rk, distance);
                
                uvec4 cornerIndices = floatBitsToUint(texelFetch(iChannel1, ivec2(intersection), 0));
                uvec3 triangleCandidates = uvec3(candidates[i + 1], candidates[((j + 1) % 4)], siteIndex);
                if (any(equal(uvec3(cornerIndices[0]), triangleCandidates)) &&
                    any(equal(uvec3(cornerIndices[1]), triangleCandidates)) &&
                    any(equal(uvec3(cornerIndices[2]), triangleCandidates))) {
                    cell.triangle[0] = decodeEntity(iChannel0, triangleCandidates.x).position;
                    cell.triangle[1] = decodeEntity(iChannel0, triangleCandidates.y).position;
                    cell.triangle[2] = site;
                }
            }
        }
        if (cell.vertexCount >= MAX_VORONOI_VERTICES) break;
    }
    
    return cell;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 p = (fragCoord - 0.5 * iResolution.xy) / min(iResolution.x, iResolution.y); 
    p *= 2.0;
    uvec4 closestIndices = floatBitsToUint(texelFetch(iChannel1, ivec2(fragCoord), 0));
    uint seedId = closestIndices[0];
    vec2 closestPos = decodeEntity(iChannel0, seedId).position;
    
    VoronoiCell cell = computeVoronoiCell(closestPos, seedId, closestIndices);

    float crss = sdCross(p);
    float mdist = 99999.0;
    for (int i = 0; i < cell.vertexCount; i++) {
        vec2 current = cell.vertices[i];
        vec2 next = cell.vertices[(i + 1) % cell.vertexCount];

        mdist = min(mdist, sdSegment(fragCoord, cell.triangle[0], cell.triangle[1]) - 1.0);
        mdist = min(mdist, sdSegment(fragCoord, cell.triangle[1], cell.triangle[2]) - 1.0);
        mdist = min(mdist, sdSegment(fragCoord, cell.triangle[2], cell.triangle[0]) - 1.0);
    }

    vec3 col = vec3(0.8);
    float contour = smoothstep(0.01, 0.0, abs(crss));
    col = mix(vec3(contour), col, smoothstep(0.5, 0.3, contour));
    
    col = mix(col, vec3(0.5), smoothstep(0.7, 0.5, mdist));
    col = mix(col, vec3(1.0), smoothstep(0.5, 0.3, mdist));
    col = mix(col, vec3(0.5), smoothstep(4.0, 3.4, length(closestPos - fragCoord)));
    col = mix(col, vec3(1.0, 0.5, 0.0), smoothstep(3.01, 3.0, length(closestPos - fragCoord)));

    fragColor = vec4(col * (crss < 0.0 ? 1.0 : 0.88), 1.0);
}

#include <common/main_shadertoy.frag>
