// --- Migrate Log ---
// 初始化局部变量以避免未定义行为
// 调整 for 循环结构，将累加逻辑移入循环体
// 将空/表达式型初始化循环改为固定次数的整数循环，以兼容 SkSL
//
// Initialize local variables to avoid undefined behavior
// Adjust for loop structure, move accumulation logic into loop body
// Replace empty/expression-style loop initializers with fixed-count integer loops for SkSL compatibility

#include <../common/common_header.frag>

/*
    "3D Fire" by @XorDev

    I really wanted to see if my turbulence effect worked in 3D.
    I wrote a few 2D variants, but this is my new favorite.
    Read about the technique here:
    https://mini.gmshaders.com/p/turbulence


    See my other 2D examples here:
    https://www.shadertoy.com/view/wffXDr
    https://www.shadertoy.com/view/WXX3RH
    https://www.shadertoy.com/view/tf2SWc

    Thanks!
*/
void mainImage(out vec4 O, vec2 I) {
  // Initialize output color
  O = vec4(0.0);
  // Time for animation
  float t = iTime;
  // Raymarched depth
  float z = 0.0;
  // Raymarch step size and "Turbulence" frequency
  float d = 0.0;

  // Raymarching loop with 50 iterations
  for (int i = 0; i < 50; i++) {
    // Compute raymarch sample point
    vec3 p = z * normalize(vec3(I + I, 0) - iResolution.xyy);
    // Shift back and animate
    p.z += 5. + cos(t);
    // Twist and rotate
    p.xz *= mat2(cos(p.y * .5 + vec4(0, 33, 11, 0)))
            // Expand upward
            / max(p.y * .1 + 1., .1);
    // Turbulence loop (increase frequency)
    d = 2.0;
    for (int octave = 0; octave < 4; octave++) {
      // Add a turbulence wave
      p += cos((p.yzx - vec3(t / .1, t, d)) * d) / d;
      d /= 0.6;
    }
    // Sample approximate distance to hollow cone
    z += d = .01 + abs(length(p.xz) + p.y * .3 - .5) / 7.;
    // Add color and glow attenuation
    O += (sin(z / 3. + vec4(7, 2, 3, 0)) + 1.1) / d;
  }
  // Tanh tonemapping
  // https://www.shadertoy.com/view/ms3BD7
  O = tanh(O / 1e3);
}

#include <../common/main_shadertoy.frag>
