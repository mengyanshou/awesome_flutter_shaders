#include <../common/common_header.frag>
uniform sampler2D iChannel0;
// Make this a smaller number for a smaller timestep.
// Don't make it bigger than 1.4 or the universe will explode.
const float delta = 1.0;

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    if(iFrame == 0) {
        fragColor = vec4(0);
        return;
    }

    float pressure = texelFetch(iChannel0, ivec2(fragCoord), 0).x;
    float pVel = texelFetch(iChannel0, ivec2(fragCoord), 0).y;

    float p_right = texelFetch(iChannel0, ivec2(fragCoord) + ivec2(1, 0), 0).x;
    float p_left = texelFetch(iChannel0, ivec2(fragCoord) + ivec2(-1, 0), 0).x;
    float p_up = texelFetch(iChannel0, ivec2(fragCoord) + ivec2(0, 1), 0).x;
    float p_down = texelFetch(iChannel0, ivec2(fragCoord) + ivec2(0, -1), 0).x;

    // Change values so the screen boundaries aren't fixed.
    if(fragCoord.x == 0.5)
        p_left = p_right;
    if(fragCoord.x == iResolution.x - 0.5)
        p_right = p_left;
    if(fragCoord.y == 0.5)
        p_down = p_up;
    if(fragCoord.y == iResolution.y - 0.5)
        p_up = p_down;

    // Apply horizontal wave function
    pVel += delta * (-2.0 * pressure + p_right + p_left) / 4.0;
    // Apply vertical wave function (these could just as easily have been one line)
    pVel += delta * (-2.0 * pressure + p_up + p_down) / 4.0;

    // Change pressure by pressure velocity
    pressure += delta * pVel;

    // "Spring" motion. This makes the waves look more like water waves and less like sound waves.
    pVel -= 0.005 * delta * pressure;

    // Velocity damping so things eventually calm down
    pVel *= 1.0 - 0.002 * delta;

    // Pressure damping to prevent it from building up forever.
    pressure *= 0.999;

    //x = pressure. y = pressure velocity. Z and W = X and Y gradient
    fragColor.xyzw = vec4(pressure, pVel, (p_right - p_left) / 2.0, (p_up - p_down) / 2.0);

    if(iMouse.z > 1.0) {
        float dist = distance(fragCoord, iMouse.xy);
        if(dist <= 20.0) {
            fragColor.x += 1.0 - dist / 20.0;
        }
    }
}
#include <../common/main_shadertoy.frag>