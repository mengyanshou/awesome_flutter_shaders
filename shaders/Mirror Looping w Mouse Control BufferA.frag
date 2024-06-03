#include <common/common_header.frag>
uniform sampler2D iChannel0;
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 click_pos = iMouse.zw;
    vec2 mouse_pos = iMouse.xy;
    vec4 state = texelFetch(iChannel0, ivec2(0, 0), 0);

    if(distance(click_pos, mouse_pos) > 5.) {
        //Update pitch and yaw based on last mouse
        float diff_x = mouse_pos.x - state.z;
        float diff_y = mouse_pos.y - state.w;
        state.x = mod(state.x + diff_x, 628.);
        state.y = clamp(state.y - diff_y, -150., 150.);
    }
    state.z = mouse_pos.x;
    state.w = mouse_pos.y;
    fragColor = state;
}
#include <common/main_shadertoy.frag>