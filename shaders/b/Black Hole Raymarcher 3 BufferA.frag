// --- Migrate Log ---
// 本次迁移修改:
// - 添加迁移头文件并保持原算法不变；初始化必要变量以避免未定义行为。
// change summary:
// - Added migration header; initialized necessary locals to avoid undefined behavior; kept original algorithm.
// -------------------

#include <../common/common_header.frag>

//Buffer A calculates the ray vectors from the camera. Badly implemented, have to look into camera matrixes
const vec2 camAngle = vec2(-5.0, 0.0);
const float FOV = 60.0 * 0.0174533; //Radians Conversion
void mainImage( out vec4 pixVector, in vec2 fragCoord )
{
    //Calculate ray vector
    vec2 newCam = camAngle;
    if(iMouse.xy == vec2(0.0)) {newCam = vec2(-1.6, 0.55);}
    newCam.y = newCam.y + (-0.15 * sin(((iTime + 15.0) / 15.0)) - 0.2);
    vec2 pixAxis =  newCam + vec2(8.0, 3.5) * (iMouse.xy) / iResolution.xy - 0.5 + FOV * (0.5 + fragCoord) / iResolution.x;
    
    
    //Send ray vectors to next buffer
    pixVector = vec4(pixAxis, 0.0, 1.0);
}

#include <../common/main_shadertoy.frag> 