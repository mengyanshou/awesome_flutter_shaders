// --- Migrate Log ---
// 添加 common_header 引入并补充缺失采样器声明；保持原始过渡算法不变
// --- Migrate Log (EN) ---
// Added common_header include and declared missing sampler; keep original transition algorithm unchanged

#include <../common/common_header.frag>
uniform sampler2D iChannel0;

// Screen Transition effect (SST)
#define PI 3.14159

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord.xy / iResolution.xy;
    
    float t1 = mod(iTime*0.5,1.5);
    if (t1>1.25)
        t1=0.0;
    t1 = clamp(t1,0.0,1.0);
    float nt = fract(t1);

    float eRad = 1.5 * nt;
    float eAng = (2. * PI) * (nt*4.5);

    vec2 centre = vec2(.5,.5);
    uv -= centre;
    float len = length(uv * vec2(iResolution.x / iResolution.y, 1.));
    float ang = atan(uv.y, uv.x) + eAng * smoothstep(eRad, 0., len);
    float rad = length(uv);
    
    vec3 col1 = texture(iChannel0, vec2(rad * cos(ang), rad * sin(ang)) + centre ).xyz;    
    float nt2 = (len*2.0) - (nt*2.0);
    nt2 = mix(1.0,nt2-nt,nt);
    nt2 = clamp(nt2,0.0,1.0);
   	vec3 col2 = texture(iChannel0,uv+ centre).xyz;  
    if (iMouse.z>0.5)
    	col2 = vec3(0.0);
    
    col1 = mix(col2,col1,nt2);
    fragColor = vec4(col1,1.0);
}

#include <../common/main_shadertoy.frag>