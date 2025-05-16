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

vec4 textureLod(sampler2D sam, vec2 uv, float lod) {
    // 在Flutter中，我们只能使用texture函数，忽略lod参数
    return texture(sam, uv);
}

// texelFetch
vec4 textureFetch(sampler2D sam, vec2 uv, int lod) {
    // 在Flutter中，我们只能使用texture函数，忽略lod参数
    return texture(sam, uv);
}