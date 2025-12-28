# Awesome Flutter Shaders

awesome flutter shaders, manual migration from https://www.shadertoy.com some of most viewed shaders one by one

## Considerations
Currently, Flutter supports some shaders, but there isn't a collection to showcase Flutter-supported shader examples.

This surprising discovery led me to learn a bit about shaders and realize that some shaders can be directly used in Flutter. I then embarked on extensive exploration, manually migrating shaders I found to Flutter. Although most attempts were unsuccessful, I eventually obtained some usable shaders.

## Issues
The problems encountered can be categorized into three types:
1. Compilation errors such as `Only simple shader sampling is supported` or `syntax error, unexpected IDENTIFIER`. The former is particularly challenging to resolve.
2. Runtime errors like `for loop(;;)`, unsupported `uvec3`, or `program is too large`.
3. Shader effects not matching expectations, typically when multiple buffers are involved, resulting in discrepancies from the effect displayed on the `shadertoy` website.

## Gallery

[Gallery](https://mengyanshou.github.io/awesome_flutter_shaders/)

## Migration
For example, consider https://www.shadertoy.com/view/ctSSDR:

```glsl
#define PI 3.1415926535897932384626433832795

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 center = fragCoord / iResolution.xy - vec2(0.5, 0.5);
    
    float dist = length(center);
    float p = (atan(center.y, center.x)) / (2.0 * PI);
    float numStripes = 12.0;
        
    bool stripeA = mod(floor((p * numStripes) + (sin(dist * 10.0 + sin(iTime)))), 2.0) == 1.0;
    bool stripeB = mod(floor((p * numStripes) - (sin(dist * 10.0 + cos(iTime)))), 2.0) == 1.0;
    
    vec3 col;
    
    if (stripeA && stripeB) {
        col = vec3(0.4);
    } else if (!stripeA && stripeB) {
        col = vec3(0.5, 0.2, 0.1);
    } else if (stripeA && !stripeB) {
        col = vec3(0.3, 0.2, 0.1);
    } else {
        col = vec3(0.7);
    }

    fragColor = vec4(col, 1.0);
}
```
Traditionally, you would change `void mainImage(out vec4 fragColor, in vec2 fragCoord)` to void `main(void)` and then import the `runtime_effect.glsl` package at the top of the current file, modifying the main function as follows:
```
#include <flutter/runtime_effect.glsl>
void main(void) {
    iResolution = uSize;
    vec2 fragCoord = FlutterFragCoord();
    // *
}
```
However, this approach becomes cumbersome when migrating many shaders.

Referring to the shader_buffers approach, you only need to import `#include <common/common_header.frag>` at the top and `#include <common/main_shadertoy.frag>` at the bottom of the file. If the current shader requires inputs like iChannel0, iChannel1..., declare them below the import line:

```uniform sampler2D iChannel0;```
You can determine the number and type of inputs from the shader's details on shadertoy.

Here is the complete code for this example:
```glsl
#include <common/common_header.frag>
#define PI 3.1415926535897932384626433832795

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 center = fragCoord / iResolution.xy - vec2(0.5, 0.5);
    
    float dist = length(center);
    float p = (atan(center.y, center.x)) / (2.0 * PI);
    float numStripes = 12.0;
        
    bool stripeA = mod(floor((p * numStripes) + (sin(dist * 10.0 + sin(iTime)))), 2.0) == 1.0;
    bool stripeB = mod(floor((p * numStripes) - (sin(dist * 10.0 + cos(iTime)))), 2.0) == 1.0;
    
    vec3 col;
    
    if (stripeA && stripeB) {
        col = vec3(0.4);
    } else if (!stripeA && stripeB) {
        col = vec3(0.5, 0.2, 0.1);
    } else if (stripeA && !stripeB) {
        col = vec3(0.3, 0.2, 0.1);
    } else {
        col = vec3(0.7);
    }

    fragColor = vec4(col, 1.0);
}
#include <common/main_shadertoy.frag>
```
common_header.frag
```glsl
// This include is mandatory for all shaders since the [LayerBuffer] always
// sets the uniforms defined here
#version 460 core
#include <flutter/runtime_effect.glsl>
precision mediump float;

// Add `uniform sampler2D iChannel[0-N];` into the fragment source as needed
uniform vec2 iResolution;
uniform float iTime;
uniform float iFrame;
uniform vec4 iMouse;

out vec4 fragColor;
```
main_shadertoy
```glsl
void main() {
    // Shader compiler optimizations will remove unusued uniforms.
    // Since [LayerBuffer.computeLayer] needs to always set these uniforms, when 
    // this happens, an error occurs when calling setFloat()
    // `IndexError (RangeError (index): Index out of range: index should be less than 3: 3)`
    // With the following line, the compiler will not remove unusued
    float tmp = (iFrame/iFrame) * (iMouse.x/iMouse.x) * 
        (iTime/iTime) * (iResolution.x/iResolution.x);
    if (tmp != 1.) tmp = 1.;

    mainImage( fragColor, FlutterFragCoord().xy * tmp );
}
```

<iframe width="640" height="360" frameborder="0" src="https://www.shadertoy.com/embed/ldfyzl?gui=true&t=10&paused=true&muted=false" allowfullscreen></iframe>


传入的鼠标事件好像没有 * radio

想一个防作弊的方案，如何防止用户用同一个激活码激活所有的app


sudo scutil --set ComputerName "Laurie's MacBook-Pro-M2Max"
sudo scutil --set HostName "Laurie's MacBook-Pro-M2Max"
sudo scutil --set LocalHostName "Laurie's MacBook-Pro-M2Max"


