https://www.shadertoy.com/view/tXBGD3

Compilation to SkSL failed.
/Users/lori/Desktop/nightmare-space/awesome_flutter_shaders/shaders/p/Pentagon Line Animation BufferA.frag: GLSL to SPIRV failed; Compilation error. 6 error(s) and 0 warning(s).
/Users/lori/Desktop/nightmare-space/awesome_flutter_shaders/shaders/p/Pentagon Line Animation BufferA.frag:292: error: '=' :  cannot convert from ' global float' to ' temp int'
/Users/lori/Desktop/nightmare-space/awesome_flutter_shaders/shaders/p/Pentagon Line Animation BufferA.frag:317: error: '=' :  cannot convert from ' global float' to ' temp int'
/Users/lori/Desktop/nightmare-space/awesome_flutter_shaders/shaders/p/Pentagon Line Animation BufferA.frag:348: error: '=' :  cannot convert from ' global float' to ' temp int'
/Users/lori/Desktop/nightmare-space/awesome_flutter_shaders/shaders/p/Pentagon Line Animation BufferA.frag:617: error: 'texture' : no matching overloaded function found
/Users/lori/Desktop/nightmare-space/awesome_flutter_shaders/shaders/p/Pentagon Line Animation BufferA.frag:617: error: 'xyz' : vector swizzle selection out of range
/Users/lori/Desktop/nightmare-space/awesome_flutter_shaders/shaders/p/Pentagon Line Animation BufferA.frag:617: error: '=' :  cannot convert from ' const float' to ' temp 3-component vector of float'
3



https://www.shadertoy.com/view/3XXSWS

just not working


https://www.shadertoy.com/view/3XXSDB

just not working

Interactive Ripples
https://www.shadertoy.com/view/3sB3WW

textureLod 不支持

Simple Water Ripple Effect
https://www.shadertoy.com/view/wdtyDH

texelFetch

There was a compiler error: Only simple shader sampling is supported.

Buoy
https://www.shadertoy.com/view/XdsGDB
textureLod

Plasma Globe retake
https://www.shadertoy.com/view/WXfSRf
3d noise
textureLod


colorful cosmos spiral

将 textureLod 改为 texture work 了

promot: 修复当前的textureLod以支持flutter使用texture替代


https://www.shadertoy.com/view/lfGXDw

这个有很多buffer，但是不好看，作为后面的挑战

https://www.shadertoy.com/view/wl2SDt

https://www.shadertoy.com/view/ldyXRw

https://www.shadertoy.com/view/lc3XzM


Goodbye Dream Clouds


自实现了噪声

```bash
我看到了输入的噪声纹理图片。对于这个云朵着色器来说，我们可以使用改进的Simplex噪声来替代当前的实现，这样可以获得更好的视觉效果。以下是优化后的噪声函数：

````glsl
// ...existing code...

// 简单的哈希函数
vec4 hash4(vec3 p) {
    p = vec3(dot(p,vec3(127.1,311.7, 74.7)),
             dot(p,vec3(269.5,183.3,246.1)),
             dot(p,vec3(113.5,271.9,124.6)));
    return -1.0 + 2.0 * fract(sin(p.xyzx + 20.0) * 43758.5453123);
}

float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    
    // 四次多项式平滑
    f = f * f * (3.0 - 2.0 * f);
    
    // 8个顶点的贡献
    return mix(
        mix(mix(dot(hash4(i + vec3(0,0,0)).xyz, f - vec3(0,0,0)),
                dot(hash4(i + vec3(1,0,0)).xyz, f - vec3(1,0,0)), f.x),
            mix(dot(hash4(i + vec3(0,1,0)).xyz, f - vec3(0,1,0)),
                dot(hash4(i + vec3(1,1,0)).xyz, f - vec3(1,1,0)), f.x), f.y),
        mix(mix(dot(hash4(i + vec3(0,0,1)).xyz, f - vec3(0,0,1)),
                dot(hash4(i + vec3(1,0,1)).xyz, f - vec3(1,0,1)), f.x),
            mix(dot(hash4(i + vec3(0,1,1)).xyz, f - vec3(0,1,1)),
                dot(hash4(i + vec3(1,1,1)).xyz, f - vec3(1,1,1)), f.x), f.y), f.z)
        * 0.5 + 0.5;
}

// ...existing code...
````

这个新的噪声实现有以下优点：

1. 使用了更好的梯度分布
2. 不依赖外部纹理
3. 具有更好的视觉连续性
4. 性能相对较好

主要改进：
- 使用了4D哈希函数来生成更均匀的随机梯度
- 采用了更平滑的插值函数
- 输出范围保持在[0,1]之间
- 减少了条件分支，提高了性能

你可以直接将原来的`noise`函数替换成这个新版本，其他代码不需要修改。这个实现会产生更自然的云层效果，同时避免了使用外部纹理的局限性。

Similar code found with 2 license types
```


Hell

移除了 noise，



https://www.shadertoy.com/view/mtScRc

black screen


https://www.shadertoy.com/view/fljBWc

需要2d噪声和3d噪声

好像如果直接用函数代替噪声的话，性能会更慢


当前文件的texelFetch语法flutter不支持，修复，不要用textureSize和texture2D

min(iFrame, 0)需要再包一层