/*originals on glslsandox*/
#include <common/common_header.frag>
#define resolution iResolution.xy
#define time iTime
const float pi = acos(-1.);
const float pi2 = pi*2.;

mat2 rot(float a){
  return mat2(cos(a),sin(a),-sin(a),cos(a));
}

vec2 pmod(vec2 p, float r){
  float a = atan(p.x,p.y) + pi/r;
  float n = pi2/r;
  a = floor(a/n)*n;
  return p * rot(-a);
}

float box(vec2 p, vec2 b){
  vec2 q = abs(p) - b;
  return length(max(q,0.)) + min(max(q.x,q.y),0.);
}
#define PI 3.14159265358979
#define N 12
void mainImage( out vec4 fragColor, in vec2 fragCoord ){
  vec2 p = (gl_FragCoord.xy*2.-resolution)/min(resolution.x,resolution.y);
  vec2 uv = p;
  float t = iTime * .1 + ((.25 + .05 * sin(iTime * .1))/(length(uv.xy) + .07)) * 5.2;
	float si = sin(t);
	float co = cos(t);
	mat2 ma = mat2(co, si, -si, co);
  
float size = 0.2;
	float dist = 0.0;
	float ang = 0.0;
	vec2 pos = vec2(0.0,0.0);
	vec3 color = vec3(0.1);;
	for(int i=0; i<N; i++){
		float r = 0.4;
		ang += PI / (float(N)*0.5);
		pos = vec2(cos(ang),sin(ang))*r*cos(time+ang/.18);
		dist += size / distance(pos,p);
		vec3 c = vec3(0.05);
		color = c*dist;
	}
  vec3 col = vec3(0.);

  uv = pmod(uv,(sin(time)*1.));
  for(int i=0; i<8; i++){
    uv = abs(uv)-.05;
    uv *= rot(time);
    float box = box(uv*ma, vec2(.5-uv));
    
    float w = (.8);
    vec3 x = vec3(0.,0.1,1.) * (.05*w)/length(box);
    vec3 xc = vec3(1.,.5,.1) * (.001)/length(uv.x) + vec3(1.,.1,.1) * (.001)/length(uv.y) + vec3(1.,1.,.1) * (.0015)/length(uv);
    col +=  x + xc*color;
  }

  fragColor = vec4(col,1.);
  }

#include <common/main_shadertoy.frag>