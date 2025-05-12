#include <../common/common_header.frag>
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
#include <Branches Common.frag>
Main if((iFrame * 4 + 2) % 2 == 0) {
Q = A(U);
vec2 V = unpackSnorm2x16(uint(Q.z));

for(float x = - 2.;
x <= 2.;
x ++) for(float y = - 2.;
y <= 2.;
y ++) {
vec4 q = A(Q.xy + vec2(x, y));
vec4 b = B(Q.xy + vec2(x, y));
vec2 v = unpackSnorm2x16(uint(q.z));
vec2 r = normalize(q.xy - Q.xy);
float l = length(r);
if(l > 0.) {
V += r / l / l * clamp(- .01 * (q.w) - .000 * b.x, - 1., 1.);
}
}
V -= .001 * V;
V.xy -= 2. * (C(U).xy * 2. - 1.) * pow(C(10. * U).z, 1000.);
Q.xy += 2. * V;

{

if(length(U - vec2(1, .5) * R) < 50.) {
Q = vec4(U, 0, 1);
V = - .1 * normalize(U - .5 * R);
}
}

if(U.x < 10. || R.x - U.x < 10. || R.y - U.y < 10. || U.y < 10.) Q.w *= 0.;

Q.z = float(packSnorm2x16(V));
} else {
Q = vec4(0);
vec2 V = vec2(0);
for(float x = - 4.;
x <= 4.;
x ++) for(float y = - 4.;
y <= 4.;
y ++) {

vec2 u = vec2(x, y);

vec4 q = A(U + u);
vec2 v = unpackSnorm2x16(uint(q.z));
float k = 2.;
vec4 o = clamp(q.xyxy - U.xyxy + k * vec4(- .5, - .5, .5, .5), - .5, .5);
float w = (o.z - o.x) * (o.w - o.y) / k / k;
q.xy = U + 0.5 * (o.xy + o.zw);
Q.xy += q.xy * q.w * w;
V += v * q.w * w;
Q.w += q.w * w;
}
if(Q.w > 0.) {
Q.xy /= Q.w;
V /= Q.w;
}
Q.z = float(packSnorm2x16(V.xy));

}

}
#include <../common/main_shadertoy.frag>
