// --- Migrate Log ---
// 添加 include 和迁移日志，初始化变量避免未定义行为
// --- Migrate Log (EN) ---
// Added include and migration log, initialized variables to avoid undefined behavior

#include <../common/common_header.frag>

uniform sampler2D iChannel0;
uniform sampler2D iChannel1;

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord/iResolution.xy;
    float m = iMouse.x/iResolution.x; // 0 <> 1
    float m2 = sin(3.14159265 * m);
    
    float parallax = 0.2;
    vec3 col1 = texture(iChannel0, uv + vec2(m*parallax, 0.0)).rgb;
    vec3 col2 = texture(iChannel1, uv + vec2(-parallax + m*parallax, 0.0)).rgb;
    
    float curve = uv.y * sin(uv.y + m * 3.14159265) * 0.1 * m2;
    float s = uv.x + curve;
    float cut = smoothstep(0.5, 0.501, s+m-0.5);
    vec3 col = mix(col1, col2, cut);

    fragColor = vec4(col,1.0);
}

#include <../common/main_shadertoy.frag>