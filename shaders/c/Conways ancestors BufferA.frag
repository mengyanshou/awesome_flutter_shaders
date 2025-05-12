
//https://www.shadertoy.com/view/XlXcW4
#include <../common/common_header.frag>
uniform sampler2D iChannel0;
const uint k = 1103515245U;  // GLIB C
vec3 hash(uvec3 x) {
    x = ((x >> 8U) ^ x.yzx) * k;
    x = ((x >> 8U) ^ x.yzx) * k;
    x = ((x >> 8U) ^ x.yzx) * k;

    return vec3(x) * (1.0 / float(0xffffffffU));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;

    //check cells and find average
    vec2 avg = vec2(0);
    int count = 0;
    vec2 inRes = 1. / iResolution.xy;
    for(int x = -1; x <= 1; x++) {
        for(int y = -1; y <= 1; y++) {
            vec3 cur = texture(iChannel0, uv + vec2(x, y) * inRes).xyz;
            bool curAlive = cur.z > 0.5;
            bool shouldAdd = curAlive && (x != 0 || y != 0);
            //if-less addition
            avg += cur.xy * vec2(curAlive);
            count += int(shouldAdd);
        }
    }
    //to avoid dividing by 0 and counting self
    bool alive = texture(iChannel0, uv).z > 0.5;
    avg /= float(count + int(count == 0 || alive));
    //standard conways game of life
    alive = (alive && count == 2) || (count == 3);

    //update cell if-less
    fragColor = vec4(avg * vec2(alive) + texture(iChannel0, uv).xy * vec2(!alive), alive, 1);

    // CLEAR SETTINGS

    //execute on first frame if-less
    bool first = iFrame == 0 || iMouse.z > 0.5;
    bool b = hash(uvec3(fragCoord, iFrame)).x > 0.6;

    //keep alive by adding alive cells every once in a while
    bool force = hash(uvec3(fragCoord, iFrame)).x > 0.9999;
    b = b || force;
    first = first || force;

    //if-less set
    fragColor = fragColor * vec4(!first) + vec4(uv, b, 1) * vec4(first);
}
#include <../common/main_shadertoy.frag>