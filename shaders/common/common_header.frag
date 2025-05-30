// This include is mandatory for all shaders since the [LayerBuffer] always
// set the uniforms defined here
#version 460 core
#include <flutter/runtime_effect.glsl>
precision mediump float;


// add `uniform sampler2D iChannel[0-N];` into frag source as needed
uniform vec2 iResolution;
uniform float iTime;
uniform float iFrame;
uniform vec4 iMouse;

out vec4 fragColor;

// vec2 iChannelResolution[4] = vec2[4](
//     iResolution,  // iChannel0 的分辨率
//     iResolution,  // iChannel1 的分辨率
//     iResolution,  // iChannel2 的分辨率
//     iResolution   // iChannel3 的分辨率
// );
// vec4 textureLod(highp sampler2D sam, highp vec2 uv, highp float lod) {
//     // 在Flutter中，我们只能使用texture函数，忽略lod参数
//     return texture(sam, uv);
// }

// vec4 texture(sampler2D sampler, vec2 coord, float bias){
//     // 在Flutter中，我们只能使用texture函数，忽略lod参数
//     return texture(sampler, coord);
// }
// // 两个参数的版本
// vec4 texture(sampler2D sampler, vec2 coord) {
//     return texture(sampler, coord);
// }
