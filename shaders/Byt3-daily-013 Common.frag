/** 

    License: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License
    
    Inspired by @Shanes' recent shaders, just trying to figure the hexagon/cube thing.

    Byt3-daily-013
    08/28/2024  @byt3_m3chanic
    
*/

mat2 rot(float g) {
 return mat2(cos(g), sin(g),-sin(g), cos(g));
}

float hash21( vec2 p ) {
    return fract(sin(dot(p,vec2(23.43,84.21)))*4832.3234);
}

const float N = 3.;
// @Shane - a very tightly compacted, self-contained version 
// of IQ's 3D value noise function.
//---------------------------------------------------------------
float n3D(vec3 p){
    const vec3 s = vec3(113, 57, 27);
    vec3 ip = floor(p); p -= ip; 
    vec4 h = vec4(0., s.yz, s.y + s.z) + dot(ip, s);
    p = p*p*(3. - 2.*p);
    h = mix(fract(sin(h)*43758.5453), fract(sin(h + s.x)*43758.5453), p.x);
    h.xy = mix(h.xz, h.yw, p.y);
    return mix(h.x, h.y, p.z); // Range: [0, 1].
}
//---------------------------------------------------------------
// @iq fbm generator
float fbm3( in vec3 x) {

    //@mla : shifting the xy value from the range [-PI,+PI] to [0,2N]
    x.x = mod(x.x,4.*N);
    x.y = mod(x.y,4.*N);
    
    x*=.085;
    float a = 0.1,b = .5,f = 2.;
    vec3  d = vec3(0.);
    for (int i = 0; i < 4; ++i) {      
        float n = n3D(f*x);
        a += b*n;
        b *= 0.5;
        f *= 1.8;
    }
	return a;
}