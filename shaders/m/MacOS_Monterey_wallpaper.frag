#include <../common/common_header.frag>
uniform sampler2D iChannel0;
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord/iResolution.xy;
  fragColor = texture(iChannel0, uv);

  fragColor.xyz *= (uv.y * 1.08 + 0.65);
  // fragColor = vec4(col); // Output to screen
}
#include <../common/main_shadertoy.frag>
