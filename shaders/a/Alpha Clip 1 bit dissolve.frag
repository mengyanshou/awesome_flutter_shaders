// --- Migrate Log ---
// 添加 common_header 以确保 uniforms (iResolution, iTime 等) 可用；声明 iChannel0/iChannel1 sampler；添加 filter 适配：将 texture(iChannel0/1, ...) 替换为 SG_TEX0/1(...) 以支持可控 wrap/filter（最小修改）
// --- Migrate Log (EN) ---
// Insert common_header to provide uniforms (iResolution, iTime, ...); declare iChannel0/iChannel1 samplers; add filter adaptation: replace texture(iChannel0/1, ...) with SG_TEX0/1(...) to enable controllable wrap/filter (minimal changes)

#include <../common/common_header.frag>
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;

// background grid from https://www.shadertoy.com/view/XtBfzz

const float N = 2.0; // grid ratio
float gridTexture( in vec2 p )
{
    // coordinates
    vec2 i = step( fract(p), vec2(1.0/N) );
    //pattern
    //return (1.0-i.x)*(1.0-i.y);   // grid (N=10)
    
    // other possible patterns are these
    //return 1.0-i.x*i.y;           // squares (N=4)
    return 1.0-i.x-i.y+2.0*i.x*i.y; // checker (N=2)
}

#define mask_tile 0.3

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {

    // UVs of the main Color texture
	vec2 uv = fragCoord.xy/iResolution.xy;

    // color textures
    vec4 clrA = SG_TEX0(iChannel0, uv);
    
    // background grid
    vec4 clrBG = 0.2 * vec4(1., 1., 1., 1.) * gridTexture(fragCoord.xy/iResolution.xx * vec2(5., 5.)) + 0.6;
    
    // set this to fade the alpha (0-1)
    float t = (sin(iTime) + 1.) / 2.;
    
	// set these to increase/decrease the edge width
    float edge_width_start = 0.15; // width at the start of the dissolve (alpha = 1)
    float edge_width_end = 0.05; // width at the end of the dissolve (alpha = 0)
    
    float edge_width = mix(edge_width_start, edge_width_end, smoothstep(0., 1., t)); // 
    
    // increase the alpha range by the edge width so we are not left with only glowy edges 
    float myAlpha = mix(0. - edge_width, 1., t); 
    
    // fade mask uv
    vec2 uv_mask = fragCoord.xy/iResolution.xy;
    
    // fade mask texture
    // use a linear texture that has values between 0-1
    vec4 alphaTex = SG_TEX1(iChannel1, uv_mask * mask_tile);

    // alpha mask (1-bit)
    float a = step(alphaTex.r, myAlpha);

    // edge mask which is a slightly progressed version of the alpha
    // this mask doesn't need to be 1 bit as it will just be added to the color
    float edge = smoothstep(alphaTex.r - edge_width, alphaTex.r, myAlpha);

    vec4 edgeColor = vec4(0., 0.1, 1.0, 1.0);
    edgeColor *= edge * 10.;
    
    // add edge color to the color
    clrA += edgeColor;

    fragColor = mix(clrA, clrBG, a);
}

#include <../common/main_shadertoy.frag>