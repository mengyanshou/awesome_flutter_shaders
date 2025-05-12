
#include <../common/common_header.frag>
#include <Space Orb Common.frag>
uniform sampler2D iChannel0;
#define ST smootherstep
#define MR linear_map_range

#if HW_PERFORMANCE == 0
#define AA 1
#else
#define AA 2
#endif

#define WIDTH 3.

#define TERRAIN_SEED 5.
#define CLOUDS_SEED 10.

#define TERRAIN_WARP_STRENGTH .2
#define CLOUDS_WARP_STRENGTH .1

#define TERRAIN_SCALE 4.
#define CLOUDS_SCALE 10.

#define CLOUDS_COVERAGE .35
#define TERRAIN_COVERAGE .48

// https://iquilezles.org/articles/warp/
float wn(vec2 p, float pp, float size, float s, float w) {
    const int o = 5;
    vec2 q = vec2(fbm(p, size, o, pp, s), fbm(p, size, o, pp, s + 2.)) - 0.5;
    return fbm(p + q * w, size, o, pp, s);
}

void mainImage(out vec4 O, in vec2 I) {
    vec3 tot, col = vec3(0.);
    vec2 ss = WIDTH / iResolution.xy / float(AA);
    vec2 p = (2. * I - iResolution.xy) / iResolution.y * 1.3;

    const vec2 off = vec2(.05, .01) * .5;
    const vec2 dp = vec2(.7, .5);

    for(int x = 0; x++ < AA;) for(int y = 0; y++ < AA;) {
            vec2 uv = p;
            uv += (vec2(float(x), float(y)) + vec2(.5)) * ss;

        // sphere coords
            float dduv = dot(uv, uv);
            vec2 sp = uv / (sqrt(1.3 - dduv) + .85);

            float am = ST(1.32, 1.3, dduv);
            sp *= am;

        // mouse offset
            vec2 spm = (iMouse.z > 0. ? sp + (-iMouse.xy / iResolution.xy * 3.) : sp);

        // terrain noise
            float t = floor(-.8 + wn(fract((spm * .5 + off * iTime)), .75, TERRAIN_SCALE, TERRAIN_SEED, TERRAIN_WARP_STRENGTH) * 32.) / 32.;

        // clouds noise
            float c = floor(wn(fract((spm * .45 + off * iTime)), .65, CLOUDS_SCALE, CLOUDS_SEED, CLOUDS_WARP_STRENGTH) * 24.) / 24.;

        // clouds noise shadows
            float cs = floor(wn(fract(((spm + vec2(.015)) * .45 + off * iTime)), .65, CLOUDS_SCALE, CLOUDS_SEED, CLOUDS_WARP_STRENGTH) * 24.) / 24.;

            float cc = MR(CLOUDS_COVERAGE, 0., 1., -.25, .48);
            c += cc;
            cs += cc;

            float tc = MR(TERRAIN_COVERAGE, 0., 1., -.5, .4);
            t += tc;

        // terrain colors
            col = mix(vec3(.06, .25, .39), vec3(0, .09, .15), ST(.5, .3, t));
            col = mix(col, vec3(0, .03, .05), ST(.32, .2, t));
            col = mix(col, vec3(.85, .43, .25), ST(.42, .5, t));
            col = mix(col, vec3(.15, .25, .04) * .8, ST(.48, .55, t));
            col = mix(col, vec3(.1, .19, .1) * .5, ST(.55, .7, t));

        // clouds
            col = mix(col, col * .4, ST(0.45, .6, cs));
            col = mix(col, vec3(1.), ST(0.5, .7, c));

        // stars
            vec2 vp = uv;
            vec2 v = voronoi(p * 80.);
            float vm = exp(MR(v.y, -.1, 1., -1.2, -5.)) - v.x;
            vm = ST(-.02, 0.1, vm) * ST(1.3, 2., dduv);

        // bg color + stars
            vec3 bgs = max(vec3(0.0, 0.02, .05), vm);

        // planet bg glow
            float bgf = ST(0., 2.5, distance(uv, vec2(-.8)));
            bgs = mix(bgs, bgs * 2.5 * vec3(1., 1.5, 1.), ST(4., -1., dduv) * bgf);
            bgs = mix(bgs, bgs * 2.5 * vec3(1., 2.5, 2.), ST(2.5, -1., dduv) * bgf);

        // planet
            col = mix(bgs, col, ST(1.3, 1.25, dduv));

        // shadows
            col = mix(col, col * .1, ST(.9, 1.5, distance(sp, dp)));
            col = mix(col, vec3(0.), ST(.5, 1.8, distance(sp, dp)));

        // highlights
            col = mix(col, col * 2., ST(1.2, .6, distance(sp, dp)));
            col = mix(col, col * 2.8 * vec3(2., 1.2, .9), ST(.8, .15, distance(sp, dp)));

        // atmosphere
            col = mix(col, vec3(.1, .3, .6), ST(.6, 2.6, dduv) * am * bgf * 2.);
            col = mix(col, vec3(.1, .7, 1.5) * 2., ST(1.1, 1.9, dduv) * am * bgf);

        // outer glow
            col = mix(col, vec3(.0, .3, 1.), ST(.2, -.6, abs(dduv - 1.32)) * bgf);
            col = mix(col, vec3(.0, .45, .8), ST(.45, -1., abs(dduv - 1.32)) * bgf);

            tot += col;
        }
    tot = tot / float(AA * AA);

    O = vec4(tot, 0);
}
#include <../common/main_shadertoy.frag>
