#include <common/common_header.frag>
#include <Streamlines Youtube Tutorial Common.frag>
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;


float drawPoint(vec2 uv, vec2 p) {
    return smoothstep(SIZE, SIZE * 0.5, length(uv - p));
    //return smoothstep(0.25/iResolution.y,0., length(uv-p) - SIZE);
}

vec3 drawAllPoints(vec2 uv, vec3 col) {

    for(int i = 0; i < NUMBER; i++) {
        vec4 txt = texelFetch(iChannel0, ivec2(0, i), 0);
        vec2 p = txt.rg;
        float angle = txt.b;
        vec3 palette = 0.5 + 0.5 * cos(vec3(1., 2., 4.) / 1. + angle * 1.5);
        col = mix(col, palette, drawPoint(uv, p) * float(angle > 0.));
    }

    return col;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = (fragCoord * 2. - iResolution.xy) / iResolution.y;
    vec2 p = vec2(0.5, 0.5);

    vec4 txt = texelFetch(iChannel0, ivec2(fragCoord), 0);
    //txt = texture(iChannel0,fragCoord.xy/iResolution.xy); 
    // Time varying pixel color
    //p = txt.rg;
    vec3 col = vec3(0.);
    col = drawAllPoints(uv, col);//txt.rgb;//vec3(drawPoint(uv,p));
    vec3 prev = texture(iChannel1, fragCoord.xy / iResolution.xy).rgb;
    col = max(col, prev * MIX_FACTOR);
    //col = mix(col, prev, 0.99);
    //float noise = noise(vec3(uv,iTime*0.2));
    // Output to screen
    fragColor = vec4(col, .0);
}
#include <common/main_shadertoy.frag>