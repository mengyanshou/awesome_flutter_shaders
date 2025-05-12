
#include <../common/common_header.frag>
#define rot(a) mat2(cos(a + vec4(0, 11, 33, 0)))
#define t iTime
#define L(q) max(q.z, length(q.xy)) - .05

vec4 cor = vec4(3, 2, 1.5, 0) * .01;
void mainImage(out vec4 O, vec2 U) {
    float r, dd, d = 9.;

    vec3 q, P, R = iResolution, D = normalize(vec3((U - R.xy / 2.) / R.y, -1)), p = vec3(0, 0, 4), C = 3. * cos(.3 * t + vec3(0, 11, 0));

    O = vec4(0);
    while(R.z++ < 120. && d > .01) {
        P = p;
        P.yz *= rot(C.y);
        P.xy *= rot(C.x);

        int i;
        while(i++ < 5) {
            q = P, q.x -= .7, q = abs(q) - 1.;

            i < 4 ? cor = cor.zxyw : O;

            dd = min(L(q.xyz), min(L(q.yzx), L(q.zxy))), d = d > dd ? O -= cor, dd : d, P.xy *= rot(1.26);
        }

        p += .2 * d * D;
    }

    O *= O * O * O * .5;
}

#include <../common/main_shadertoy.frag>