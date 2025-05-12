#include <../common/common_header.frag>
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
void mainImage(out vec4 color, vec2 coord) {
    //Resolution for scaling
    vec3 res = iResolution, 
    //Compute ray direction ranging from -1 to 1 (aspect corrected, with +z forward)
    dir = vec3(res.xy - coord * 2., res.x) / res.x,
    //Sample position
    pos;

    //Use RG channels of last frame for the GB (brightened by /.7)
    //This produces a simple chromatic aberration effect!
    color = vec4(0, texture(iChannel0, coord / res.xy) / .7);

    //Loop 100 times
    for(float i = 0.; i < 1e2; i++)
        //Compute sample point along ray direction plus an arbitrary offset
        //Starts at random point between 0 and 0.1 and increments 0.1 each step
        pos = dir * (texture(iChannel2, coord / 1e3).r + i) * .1 + 9.,
        //Rotate about the y-axis
        pos.xz *= mat2(cos(iTime * .1 + asin(vec4(0, 1, -1, 0)))),
        //Add sample point, decreasing intensity with each interation (down to 0)
        color.r += (1e2 - i) / 1e5 /
        //Attenuate from the absolute distance to the noise + gyroid shape
            abs(texture(iChannel1, pos * .1).r + dot(sin(pos), cos(pos.yzx)));
}
#include <../common/main_shadertoy.frag>