#include <../common/common_header.frag>

uniform sampler2D image;

void main() {
    vec2 uv = (FlutterFragCoord().xy / iResolution.xy);
    vec3 imageColor = texture(image, uv).xyz;
    float luminance = imageColor.r * 0.299 + imageColor.g * 0.587 + imageColor.b * 0.114;
    fragColor = vec4(vec3(luminance), 1.0);
}