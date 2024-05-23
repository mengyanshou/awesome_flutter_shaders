//rule: 2,3/3,4,6 (see https://en.wikipedia.org/wiki/Life-like_cellular_automaton#Notation_for_rules)
#include <common/common_header.frag>
#include <Pentagonal Conway's game Common.frag>
uniform sampler2D iChannel0;
// uniform sampler2D iChannel1;
bool gol(int n, bool s){
    return (s && (n == 2 || n == 3)) || (!s && (n == 3 || n == 4 || n == 6));
}

//each pixel stores 4 pentagons
void mainImage(out vec4 fragColor, in vec2 fragCoord){
    if (iFrame != 0){
        // if (iFrame % 20 == 0 && texelFetch(iChannel1, ivec2(32,2), 0).x > 0.0){
        //     vec4 result = vec4(0);

        //     //fetch surrounding pentagons
        //     vec4 g0 = texelFetch(iChannel0, ivec2(fragCoord), 0);
        //     vec4 g1 = texelFetch(iChannel0, ivec2(fragCoord) + ivec2(0,-1), 0);
        //     vec4 g2 = texelFetch(iChannel0, ivec2(fragCoord) + ivec2(1,-1), 0);
        //     vec4 g3 = texelFetch(iChannel0, ivec2(fragCoord) + ivec2(1,0), 0);
        //     vec4 g4 = texelFetch(iChannel0, ivec2(fragCoord) + ivec2(1,1), 0);
        //     vec4 g5 = texelFetch(iChannel0, ivec2(fragCoord) + ivec2(0,1), 0);
        //     vec4 g6 = texelFetch(iChannel0, ivec2(fragCoord) + ivec2(-1,1), 0);
        //     vec4 g7 = texelFetch(iChannel0, ivec2(fragCoord) + ivec2(-1,0), 0);
        //     vec4 g8 = texelFetch(iChannel0, ivec2(fragCoord) + ivec2(-1,-1), 0);

        //     //run conway's game on each pentagon in this pixel
        //     int neighbors = int(g0[1] + g0[2] + g0[3] + g1[2] + g1[3] + g7[1] + g8[3]);
        //     result[0] = float(gol(neighbors, g0[0] == 1.0));

        //     neighbors = int(g0[0] + g0[2] + g0[3] + g1[3] + g2[2] + g3[0] + g3[2]);
        //     result[1] = float(gol(neighbors, g0[1] == 1.0));

        //     neighbors = int(g0[0] + g0[1] + g0[3] + g5[0] + g6[1] + g7[3] + g7[1]);
        //     result[2] = float(gol(neighbors, g0[2] == 1.0));

        //     neighbors = int(g0[0] + g0[1] + g0[2] + g3[2] + g4[0] + g5[0] + g5[1]);
        //     result[3] = float(gol(neighbors, g0[3] == 1.0));
            
        //     fragColor = result;
        // } else {
            fragColor = texelFetch(iChannel0, ivec2(fragCoord), 0);
        // }
    } else {
        ivec2 c = ivec2(fragCoord);
        fragColor = vec4(
            c == ivec2(1,1),
            c == ivec2(1,1),
            c == ivec2(1,1),
            c == ivec2(1,1)
        );
    }
    
    if (iMouse.w > 0.0){
        ivec3 pcoord = coordtopenta(uvmap(iMouse.xy, iResolution.xy));
        if (pcoord.xy == ivec2(fragCoord)){
            fragColor[int(pcoord.z)] = float(texelFetch(iChannel0, ivec2(fragCoord), 0)[pcoord.z] == 0.0);
        }
    }
}
#include <common/main_shadertoy.frag>