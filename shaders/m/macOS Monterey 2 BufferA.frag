// ============================================================================
// 迁移日志 / Migration Log:
// 项目 / Project: Shadertoy → Flutter/Skia SkSL
// 文件 / File: macOS Monterey 2 BufferA.frag
// 
// 关键修改 / Key Changes:
// 1. 移除 C 风格浮点后缀 / Remove C-style float suffixes
// 2. 添加必要的 include 指令 / Add required include directives
// ============================================================================

#include <../common/common_header.frag>

vec3 sin_shape(in vec2 uv, in float offset_y) {
  // Time varying pixel color
  float y = sin((uv.x + iTime * -0.06 + offset_y) * 5.5);

  float x = uv.x * 8.0;
  float a=1.0; // 修改 1 / Change 1: 移除浮点后缀
	for (int i=0; i<5; i++) {
		x*=0.53562;
		x+=6.56248;
		y+=sin(x)*a;		
		a*=.5;
	}

  float y0 = step(0.0, y * 0.08 - uv.y + offset_y);
  return vec3(y0, y0, y0);
}

vec2 rotate(vec2 coord, float alpha) {
  float cosA = cos(alpha);
  float sinA = sin(alpha);
  return vec2(coord.x * cosA - coord.y * sinA, coord.x * sinA + coord.y * cosA);
}

vec3 scene(in vec2 uv) {
    vec3 col = vec3(0.0, 0.0, 0.0);
    col += sin_shape(uv, 0.3) * 0.2;
    col += sin_shape(uv, 0.7) * 0.2;
    col += sin_shape(uv, 1.1) * 0.2; // 修改 2 / Change 2: 标准化浮点值

    vec3 fragColor;
    
if (col.x >= 0.6 ) {			fragColor = vec3(0.12549019607843137, 0.043137254901960784, 0.4117647058823529);
    } else if (col.x >= 0.4) {	fragColor = vec3(0.27254901960784315, 0.05411764705882353, 0.607843137254902);
    } else if (col.x >= 0.2) {	fragColor = vec3(0.7215686274509804, 0.19215686274509805, 0.7294117647058823);
    } else {					fragColor = vec3(0.8352941176470589, 0.3764705882352941, 0.6588235294117647);
    }
    return fragColor;
} // 修改 3 / Change 3: 保持原样（已为小数形式）

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    fragCoord = rotate(fragCoord + vec2(0.0, -300.0), 0.5);
    // Normalized pixel coordinates (from 0 to 1)
    vec3 col0 = scene((fragCoord * 2.0)/iResolution.xy);
    vec3 col1 = scene((-(fragCoord * 2.0) + vec2(1.0, 0.0))/iResolution.xy);
    vec3 col2 = scene((-(fragCoord * 2.0) + vec2(1.0, 1.0))/iResolution.xy);
    vec3 col3 = scene(((fragCoord * 2.0) + vec2(0.0, 1.0))/iResolution.xy);

    // Output to screen
    fragColor = vec4((col0 + col1 + col2 + col2) / 4.0,1.0);
} // 修改 4 / Change 4: 保持原样

// 修改 5 / Change 5: 添加必要的 include 指令 / Add required include directive
#include <../common/main_shadertoy.frag>