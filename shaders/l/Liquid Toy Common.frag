
// shortcut to sample texture
#define TEX(uv) texture(iChannel0, uv).r
#define TEX1(uv) texture(iChannel1, uv).r
#define TEX2(uv) texture(iChannel2, uv).r
#define TEX3(uv) texture(iChannel3, uv).r

// shorcut for smoothstep uses
#define trace(edge, thin) smoothstep(thin,.0,edge)
#define ss(a,b,t) smoothstep(a,b,t)
