// https://www.shadertoy.com/view/lcSBDh
// --- Migrate Log ---
// 本次迁移修改:
// 添加迁移日志和 include，移除 precision，初始化 mat 矩阵，添加底部 include
// change summary:
// Add migration log and includes, remove precision, initialize mat matrix, add bottom include
// -------------------

#include <../common/common_header.frag>

uniform sampler2D iChannel0;

float decompress(float x, float rate, float fovea, float focal) {
  // The polynomial coefficients should be calculated on the CPU side. I am
  // writing it down here mostly for demo purposes.
  highp mat3 mat = mat3(0.0);
  mat[0][1] = 2.0 * rate / (-fovea * rate + fovea + rate + 1.0);
  mat[0][2] = (rate - 1.0) /
              ((focal - 0.5 * fovea) * (fovea * rate - fovea - rate - 1.0));
  mat[1][0] = -((focal - 0.5 * fovea) * (rate - 1.0) /
                (fovea * rate - fovea - rate - 1.0));
  mat[1][1] = 2.0 / (2.0 * fovea - (fovea - 1.0) * (rate + 1.0));
  mat[2][0] =
      ((rate - 1.0) *
       (focal * fovea + focal + 0.5 * fovea * fovea - 0.5 * fovea) /
       ((focal + 0.5 * fovea - 1.0) * (fovea * rate - fovea - rate - 1.0)));
  mat[2][1] =
      (-2.0 * (focal * rate + 0.5 * fovea * rate - 1.0) /
       ((focal + 0.5 * fovea - 1.0) * (fovea * rate - fovea - rate - 1.0)));
  mat[2][2] = (rate - 1.0) / ((focal + 0.5 * fovea - 1.0) *
                              (fovea * rate - fovea - rate - 1.0));

  if (x < focal - 0.5 * fovea) {
    return mat[0][2] * x * x + mat[0][1] * x;
  } else if (x < focal + 0.5 * fovea) {
    return mat[1][1] * x + mat[1][0];
  } else {
    return mat[2][2] * x * x + mat[2][1] * x + mat[2][0];
  }
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord/iResolution.xy;
    
    float focalX = 0.5;
    float focalY = 0.5;
    float rate = 2.0;

    focalX = 0.5 + sin(iTime) * 0.2;
    focalY = 0.5 + cos(iTime) * 0.2;

    uv.x = decompress(uv.x, rate, 0.5, focalX);
    uv.y = decompress(uv.y, rate, 0.5, focalY);

    fragColor = texture(iChannel0, uv);
}

#include <../common/main_shadertoy.frag>