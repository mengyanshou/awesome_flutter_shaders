// ============================================================================
// 迁移日志 / Migration Log:
// 项目 / Project: Shadertoy → Flutter/Skia SkSL
// 文件 / File: macOS Monterey 2.frag (后处理/Post-processing)
// 
// 关键修改 / Key Changes:
// 1. 声明纹理采样器 / Declare texture sampler
// 2. 添加必要的 include 指令 / Add required include directives
// ============================================================================

#include <../common/common_header.frag>

uniform sampler2D iChannel0; // 修改 1 / Change 1: 声明纹理采样器 / Declare texture sampler

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord/iResolution.xy;
  fragColor = texture(iChannel0, uv);

  fragColor.xyz *= (uv.y * 1.08 + 0.65);
  // fragColor = vec4(col); // Output to screen
}

// 修改 2 / Change 2: 添加必要的 include 指令 / Add required include directive
#include <../common/main_shadertoy.frag>