#include <../common/common_header.frag>
#include <Physics engine playground Common.frag>
uniform sampler2D iChannel3;
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  int pixelx, pixely;
  pixelx = int(fragCoord.x);
  pixely = int(fragCoord.y);

  int ci = pixelx;
  int cj = pixely;
  int k = 0;

  bool intersect = false;
  float idepth;
  vec3 idir, ipos;

  obj o1, o2;
  o1.c = getCubePos(ci);
  o1.b = size(ci);
  o1.s = shape(ci);
  o1.r = getCubeQuat(ci);

  o2.c = getCubePos(cj);
  o2.b = size(cj);
  o2.s = shape(cj);
  o2.r = getCubeQuat(cj);

  if(length(getCubePos(ci) - getCubePos(cj)) > length(size(ci)) + length(size(cj)))
    intersect = false;
  else
    intersect = MPRPenetration(o1, o2, idepth, idir, ipos) >= 0;

  fragColor = vec4(intersect ? ipos : vec3(0), intersect);

}

#include <../common/main_shadertoy.frag>