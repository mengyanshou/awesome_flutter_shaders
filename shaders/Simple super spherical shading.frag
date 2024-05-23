// CC0: Simple super spherical shading
//  I wanted super spherical with no ray trace step
#include <common/common_header.frag>
#define TIME        iTime
#define RESOLUTION  iResolution

vec3 sphere8(vec3 col, vec2 p, float aa, float r, vec3 lightDir) {
  vec2 p4 = p*p;
  p4 *= p4;
  float r8 = r*r;
  r8 *= r8;
  r8 *= r8;
  float z8 = r8-dot(p4, p4);
  if (z8 > 0.) {
    float z = pow(z8, 1./8.);
    vec3 cp = vec3(p, z);
    vec3 cp2 = cp*cp;
    vec3 cp7 = cp2*cp2;
    cp7 *= cp2*cp;
    vec3 cn = normalize(cp7);
    float cd= max(dot(lightDir, cn), 0.0);
    
    vec3 ccol = col;
    ccol = cd*cd*vec3(1.0);
    float d = pow(dot(p4, p4), 1./8.)-r;
    col = mix(col, ccol, smoothstep(0., -2.*aa, d));
  }
  return col;
}

vec3 effect(vec2 p, vec2 pp) {
  const vec3 lightDir = normalize(vec3(1.0, 1.5, 2.0));
  float aa = sqrt(2.)/RESOLUTION.y;
  vec3 col = vec3(0.025);

  col = sphere8(col, p, aa, 0.75, lightDir);
  col *= smoothstep(1.5, 0.5, length(pp));
  col = sqrt(col);
  return col;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
  vec2 q = fragCoord/RESOLUTION.xy;
  vec2 p = -1. + 2. * q;
  vec2 pp =p;
  p.x *= RESOLUTION.x/RESOLUTION.y;
  vec3 col = vec3(0.05);
  col = effect(p, pp);
  fragColor = vec4(col, 1.0);
}
#include <common/main_shadertoy.frag>