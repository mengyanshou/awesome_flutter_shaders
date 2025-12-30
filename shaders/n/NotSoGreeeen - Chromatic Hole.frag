// https://www.shadertoy.com/view/M33GD8
// --- Migrate Log ---
// 本次迁移修改:
// 添加迁移日志和 include，变量已初始化无需额外修复
// change summary:
// Add migration log and includes, variables already initialized no extra fixes needed
// -------------------

#include <../common/common_header.frag>

uniform sampler2D iChannel0;

/*
This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to http://unlicense.org/
*/


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates
    vec2 uv = (2.0 * fragCoord - iResolution.xy) / min(iResolution.x, iResolution.y);

    vec3 col = vec3(0.0);

    col.x = 1.0 - length(uv + (sin(iTime) * 0.01));
    col.y = 1.0 - length(uv);
    col.z = 1.0 - length(uv - (cos(iTime) * 0.01));

    col *= length(uv - vec2(sin(iTime / 0.3) * 0.8 * sin(iTime * 0.5), atan(iTime) * 0.8));
    col *= length(uv - vec2(sin(iTime + 3.4) * 0.8 * sin(iTime * 0.3), atan(iTime) * 0.8));
    col *= length(uv - vec2(cos(iTime) * 0.7 * sin(iTime * 0.6), sin(cos(iTime)) * 0.8));
    col *= length(sin(uv) + vec2(sin(iTime) * 0.8 * cos(iTime + 1.0 * 0.8), sin(iTime - 0.4) * 0.5));
    col *= length(uv + vec2(cos(iTime) * 0.8, sin(iTime + (sin(13.0 * iTime) * 0.01)) * 0.8));
    col *= length(uv - 0.78);
    col *= length(uv + 0.7);
    col *= length(uv + 0.7) * atan(iTime);
    col *= length(vec2(uv.x - 0.75 - (sin(iTime - 3.1 * (sin(0.5) * 0.002)) * 0.2), uv.y + 0.75)) * 0.9;


    col = smoothstep(0.1, 0.11, col);

    vec4 tex = texture(iChannel0, fragCoord / iResolution.xy);

    tex.xyz *= col;


    fragColor = vec4(tex);
}

#include <../common/main_shadertoy.frag>