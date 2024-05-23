#include <common/common_header.frag>
#include <Streamlines Youtube Tutorial Common.frag>
uniform sampler2D iChannel0;


mat2 rot(float a) {
    float s = sin(a), c = cos(a);
    return mat2(c, s, -s, c);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    if(iFrame == 0) {
        fragColor = vec4(hash22(fragCoord), 1.0, 1.0);
    } else {
        vec4 txt = texelFetch(iChannel0, ivec2(fragCoord), 0);
        vec2 p = txt.rg;
        float n = noise(vec3(p * NOISE_FACTOR, iTime * TIME_FRACTOR));
        float angle = n * PI * 2.;
        vec2 vel = vec2(1., 0.);// hash22(fragCoord);
        vel *= rot(angle);
        //vel = normalize(vel);
        vel *= VEL_FACTOR;
        p += vel;
        fragColor = vec4(p, angle, 1.0);

        if(abs(p.x) > ASP || abs(p.y) > 1.) {
            vec2 p = hash22(fragCoord + floor(iTime));
            p.x *= ASP;
            fragColor = vec4(p, 0.0, 1.0);
        }
    }
}

#include <common/main_shadertoy.frag>