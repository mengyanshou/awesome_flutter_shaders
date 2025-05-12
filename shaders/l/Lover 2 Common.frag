vec2 R; int I;
#define A(U) texture(iChannel0,(U)/R)
#define B(U) texture(iChannel1,(U)/R)
#define C(U) texture(iChannel2,(U)/R)
#define D(U) texture(iChannel3,(U)/R)
#define Main void mainImage(out vec4 Q, in vec2 U) { R = iResolution.xy; I = iFrame;
float G2 (float w, float s) {
    return 0.15915494309*exp(-.5*w*w/s/s)/(s*s);
}
float G1 (float w, float s) {
    return 0.3989422804*exp(-.5*w*w/s/s)/(s);
}
float heart (vec2 u) {
    u -= vec2(.5,.4)*R;
    u.y -= 10.*sqrt(abs(u.x));
    u.y *= 1.;
    u.x *= .8;
    if (length(u)<.35*R.y) return 1.;
    else return 0.;
}

float _12(vec2 U) {

    return clamp(floor(U.x)+floor(U.y)*R.x,0.,R.x*R.y);

}

vec2 _21(float i) {

    return clamp(vec2(mod(i,R.x),floor(i/R.x))+.5,vec2(0),R);

}

float sg (vec2 p, vec2 a, vec2 b) {
    float i = clamp(dot(p-a,b-a)/dot(b-a,b-a),0.,1.);
	float l = (length(p-a-(b-a)*i));
    return l;
}

float hash (vec2 p)
{
	vec3 p3  = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}
float noise(vec2 p)
{
    vec4 w = vec4(
        floor(p),
        ceil (p)  );
    float 
        _00 = hash(w.xy),
        _01 = hash(w.xw),
        _10 = hash(w.zy),
        _11 = hash(w.zw),
    _0 = mix(_00,_01,fract(p.y)),
    _1 = mix(_10,_11,fract(p.y));
    return mix(_0,_1,fract(p.x));
}
float fbm (vec2 p) {
    float o = 0.;
    for (float i = 0.; i < 3.; i++) {
        o += noise(.1*p)/3.;
        o += .2*exp(-2.*abs(sin(.02*p.x+.01*p.y)))/3.;
        p *= 2.;
    }
    return o;
}
vec2 grad (vec2 p) {
    float 
    n = fbm(p+vec2(0,1)),
    e = fbm(p+vec2(1,0)),
    s = fbm(p-vec2(0,1)),
    w = fbm(p-vec2(1,0));
    return vec2(e-w,n-s);
}
