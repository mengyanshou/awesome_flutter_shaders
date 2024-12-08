#version 330 core
out vec4 FragColor;

uniform mat4 view;
uniform mat4 projection;
uniform vec2 resolution;

void main()
{
    vec3 rayStart = vec3(0.0, 0.0, 0.0);
    vec3 rayEnd = vec3(1.0, 1.0, 1.0);
    vec3 rayDir = normalize(rayEnd - rayStart);

    vec2 uv = gl_FragCoord.xy / resolution;
    vec4 clipSpacePos = vec4(uv * 2.0 - 1.0, 0.0, 1.0);
    vec4 viewSpacePos = inverse(projection) * clipSpacePos;
    viewSpacePos /= viewSpacePos.w;
    vec3 worldSpacePos = (inverse(view) * viewSpacePos).xyz;

    float dist = length(cross(rayDir, worldSpacePos - rayStart)) / length(rayDir);

    float threshold = 0.01;
    if (dist < threshold) {
        FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    } else {
        discard;
    }
}