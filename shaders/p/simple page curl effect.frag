// --- Migrate Log ---
// 添加 include 和迁移日志，初始化变量，修复浮点常量格式
// --- Migrate Log (EN) ---
// Added include and migration log, initialized variables, fixed float constant format

#include <../common/common_header.frag>

uniform sampler2D iChannel0;
uniform sampler2D iChannel1;

#define pi 3.14159265359
#define radius 0.1

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    float aspect = iResolution.x / iResolution.y;

    vec2 uv = fragCoord * vec2(aspect, 1.0) / iResolution.xy;
    vec2 mouse = iMouse.xy  * vec2(aspect, 1.0) / iResolution.xy;
    vec2 mouseDir = normalize(abs(iMouse.zw) - iMouse.xy);
    vec2 origin = clamp(mouse - mouseDir * mouse.x / mouseDir.x, 0.0, 1.0);
    
    float mouseDist = clamp(length(mouse - origin) 
        + (aspect - (abs(iMouse.z) / iResolution.x) * aspect) / mouseDir.x, 0.0, aspect / mouseDir.x);
    
    if (mouseDir.x < 0.0)
    {
        mouseDist = distance(mouse, origin);
    }
  
    float proj = dot(uv - origin, mouseDir);
    float dist = proj - mouseDist;
    
    vec2 linePoint = uv - dist * mouseDir;
    
    if (dist > radius) 
    {
        fragColor = texture(iChannel1, uv * vec2(1.0 / aspect, 1.0));
        fragColor.rgb *= pow(clamp(dist - radius, 0.0, 1.0) * 1.5, 0.2);
    }
    else if (dist >= 0.)
    {
        // map to cylinder point
        float theta = asin(dist / radius);
        vec2 p2 = linePoint + mouseDir * (pi - theta) * radius;
        vec2 p1 = linePoint + mouseDir * theta * radius;
        uv = (p2.x <= aspect && p2.y <= 1.0 && p2.x > 0.0 && p2.y > 0.0) ? p2 : p1;
        fragColor = texture(iChannel0, uv * vec2(1.0 / aspect, 1.0));
        fragColor.rgb *= pow(clamp((radius - dist) / radius, 0.0, 1.0), 0.2);
    }
    else 
    {
        vec2 p = linePoint + mouseDir * (abs(dist) + pi * radius);
        uv = (p.x <= aspect && p.y <= 1.0 && p.x > 0.0 && p.y > 0.0) ? p : uv;
        fragColor = texture(iChannel0, uv * vec2(1.0 / aspect, 1.0));
    }
}

#include <../common/main_shadertoy.frag>