// --- Migrate Log ---
// 初始化局部变量，避免未定义行为：初始化 t,s,d,e,c，使用 int 计数器替代浮点 i
// 重命名函数参数为 Shadertoy 约定 (fragColor, fragCoord)，并将 fragCoord 明确归一化为 uv
//
// Initialize local variables to avoid undefined behavior: init t,s,d,e,c and use int loop counter
// Rename function parameters to (fragColor, fragCoord) and normalize fragCoord to uv

#include <../common/common_header.frag>

// low tech tunnel
// 28 steps

/*
    @FabriceNeyret2 -40 chars
    → 611 (from 651)!
    
    Further golfing below shader code
    
*/

#define T        iTime*4. + 5. + 5.*sin(iTime*.3)         //
#define P(z)     vec3( 12.* cos( (z)*vec2(.1,.12) ) , z)  //
#define A(F,H,K) abs(dot( sin(F*p*K), H +p-p )) / K 

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // Explicit initialization to avoid undefined behaviour
    float t = 0.0, s = 1.0, d = 0.0, e = 0.0;
    int step = 0;
    vec3 c = vec3(0.0);
    vec3 r = vec3(iResolution, 1.0);
    fragColor = vec4(0.0);

    // scaled coords (do not override fragCoord)
    vec2 uv = (fragCoord - r.xy/2.0) / r.y;
    if (abs(uv.y) > .375) { fragColor = vec4(0.0); return; } // cinema bars

    // setup ray origin, direction, and look-at
    vec3 p = P(T),
         Z = normalize(P(T+4.0) - p),
         X = normalize(vec3(Z.z, 0.0, -Z)),
         D = vec3(uv, 1.0) * mat3(-X, cross(X, Z), Z);

    for (step = 0; step < 28 && d < 30.0; step++) {
        // march
        p += D * s;

        // get path
        X = P(p.z);

        // store sine of iTime (not T)
        t = sin(iTime);

        // orb (sphere with xyz offset by t)
        e = length(p - vec3(
            X.x + t,
            X.y + t*2.0,
            6.0 + T + t*2.0
        )) - 0.01;

        // tunnel with modulating radius
        s = cos(p.z*0.6)*2.0 + 4.0
          - min(length(p.xy - X.x - 6.0), length((p - X).xy))
          + A(4.0, .25, .1)
          + A(T+8.0, .22, 2.0);

        // accumulate distance
        d += (s = min(e, .01 + .3 * abs(s)));

        // accumulate color (use current s and e)
        c += 1.0 / s + 10.0 * vec3(1.0, 2.0, 5.0) / max(e, 0.6);
    }

    fragColor.rgb = c * c / 1e6; // adjust brightness and saturation
}



/*
    @FabriceNeyret2 -40 chars (42 total, see below)
    → 611 (from 651)!
    
    --
    
    @bug -27 chars
    → 584 (from 611)!
    
    --
    
    @HexaPhoenix -6 chars
    → 578 (from 584)!

    --
    
    @GregRostami, -40 chars
    → 550 (from 578)!
    → 546 (from 548)!
    → 536 (from 546)!
    --
    
    @FabriceNeyret2, -2 chars
    → 548 (from 550)!
    
    --
    
    @OldEclipse -3 chars
        diatribes lost track of char count on scoreboard at some point /o\
        sorry
        
    ty!!   :D
    
*/


/*
#define V vec3//
#define P(z) V( 12.* cos( (z)*vec2(.1,.12) ) , z)//
#define A(F,H,K) abs(dot( sin(F*p*K), H+p-p )) / K
void mainImage(out vec4 o, vec2 u) {
    float t=iTime,s,i,d,e,
          T = t*4. + 5. + 5.*sin(t*.3);
    o *= i;                            // Initialize o to 0
    V r = iResolution;

    u = ( u - r.xy/2. ) / r.y;          // scaled coords
    if (u.y*u.y < .14)                  // cinema bars

    for (V p = P(T),                   // setup ray origin, direction, and look-at
              Z = normalize( P(T+4.) - p),
              X = normalize(V(-Z.z,0,Z)),
              D = V(u,1) * mat3( X,cross(Z,X),Z );
        i++ < 28.;
        o.rgb += .1/s + V(1,2,5)/max(e, .6)
    )
        p += D * s,                      // march
        X = P(p.z),                      // get path
        t = sin(t),                  // store sine of iTime (not T)
        s = cos(p.z*.6)*2.+ 4.           // tunnel with modulating radius
          - min( length(p.xy - X.x - 6.)
               , length(p-X) )
          + A(  4., .25, .1)             // noise, large scoops
          + A(T+8., .22, 2.),            // noise, detail texture 
                                         // (remove "T+" if you don't like the texture moving)
        d += s = min( e = length(p - V(X.x,X.y + t,6.+T + t)-t)-.01,
                     .01+.3*abs(s));   // accumulate distance
    o *= o/1e4;                   // adjust brightness and saturation
}

*/












/* 548

#define V vec3//
#define P(z) V( 12.* cos( (z)*vec2(.1,.12) ) , z)//
#define A(F,H,K) abs(dot( sin(F*p*K), H+p-p )) / K
void mainImage(out vec4 o, vec2 u) {
    float t=iTime,s,i,d,e,
          T = t*4. + 5. + 5.*sin(t*.3);
    o *= i;                            // Initialize o to 0
    V r = iResolution;

    u = ( u - r.xy/2. ) / r.y;          // scaled coords
    if (u.y*u.y < .14)                  // cinema bars

    for (V p = P(T),                   // setup ray origin, direction, and look-at
              Z = normalize( P(T+4.) - p),
              X = normalize(V(-Z.z,0,Z)),
              D = V(u,1) * mat3( X,cross(Z,X),Z );
        i++ < 28.;
        o.rgb += .1/s + V(1,2,5)/max(e, .6)
    )
        p += D * s,                      // march
        X = P(p.z),                      // get path
        t = sin(t),                  // store sine of iTime (not T)
        e = length(p - V(             // orb (sphere with xyz offset by t)
                   X.x,
                   X.y + t,
                   6.+T + t)-t)-.01,
        s = cos(p.z*.6)*2.+ 4.           // tunnel with modulating radius
          - min( length(p.xy - X.x - 6.)
               , length(p-X) )
          + A(  4., .25, .1)             // noise, large scoops
          + A(T+8., .22, 2.),            // noise, detail texture 
                                         // (remove "T+" if you don't like the texture moving)
        d += s = min(e,.01+.3*abs(s));   // accumulate distance
    o *= o/1e4;                   // adjust brightness and saturation
}
*/

/*
#define V vec3
#define P(z)     V( 12.* cos( (z)*vec2(.1,.12) ) , z)  //
#define A(F,H,K) abs(dot( sin(F*p*K), H +p-p )) / K 

void mainImage(out vec4 o, vec2 u) {
    float t=iTime,s,i,d,e,
          T = t*4. + 5. + 5.*sin(t*.3);
    V  c,r = iResolution;

    u = ( u - r.xy/2. ) / r.y;            // scaled coords
    if (abs(u.y) < .37)                   // cinema bars

    for (V p = P(T),                      // setup ray origin, direction, and look-at
              Z = normalize( P(T+4.) - p),
              X = normalize(V(Z.z,0,-Z)),
              D = V(u, 1) * mat3(-X, cross(X, Z), Z);

        i++ < 28.;

        c += 1./s + V(10,20,50)/max(e, .6)
    )
        p += D * s,                       // march
        X = P(p.z),                       // get path
        t = sin(t),                       // store sine of iTime (not T)
        e = length(p - V(                 // orb (sphere with xyz offset by t)
                   X.x,
                   X.y + t,
                   6.+T + t)-t)-.01,
        s = cos(p.z*.6)*2.+ 4.            // tunnel with modulating radius
          - min( length(p.xy - X.x - 6.)
               , length((p-X).xy) )
          + A(  4., .25, .1)              // noise, large scoops
          + A(T+8., .22, 2.),             // noise, detail texture 
                                          // (remove "T+" if you don't like the texture moving)
        d += s = min(e,.01+.3*abs(s));    // accumulate distance

    o.rgb = c*c/1e6;                      // adjust brightness and saturation
}
*/


/*
#define V vec3
#define T        iTime*4. + 5. + 5.*sin(iTime*.3)         //
#define P(z)     V( 12.* cos( (z)*vec2(.1,.12) ) , z)  //
#define A(F,H,K) abs(dot( sin(F*p*K), H +p-p )) / K 

void mainImage(out vec4 o, vec2 u) {
    float t,s,i,d,e;
    V  c,r = iResolution;

    u = ( u - r.xy/2. ) / r.y;            // scaled coords
    if (abs(u.y) < .375)                  // cinema bars

    for (V p = P(T),                   // setup ray origin, direction, and look-at
              Z = normalize( P(T+4.) - p),
              X = normalize(V(Z.z,0,-Z)),
              D = V(u, 1) * mat3(-X, cross(X, Z), Z);

        i++ < 28. && d < 3e1;

        c += 1./s + V(10,20,50)/max(e, .6)
    )
        p += D * s,                      // march
        X = P(p.z),                      // get path
        t = sin(iTime),                  // store sine of iTime (not T)
        e = length(p - V(             // orb (sphere with xyz offset by t)
                   X.x,
                   X.y + t,
                   6.+T + t)-t)-.01,
        s = cos(p.z*.6)*2.+ 4.           // tunnel with modulating radius
          - min( length(p.xy - X.x - 6.)
               , length((p-X).xy) )
          + A(  4., .25, .1)             // noise, large scoops
          + A(T+8., .22, 2.),            // noise, detail texture 
                                         // (remove "T+" if you don't like the texture moving)
        d += s = min(e,.01+.3*abs(s));   // accumulate distance

    o.rgb = c*c/1e6;                   // adjust brightness and saturation
}
*/



/*

#define T        iTime*4. + 5. + 5.*sin(iTime*.3)         //
#define P(z)     vec3( 12.* cos( (z)*vec2(.1,.12) ) , z)  //
#define A(F,H,K) abs(dot( sin(F*p*K), H +p-p )) / K 

void mainImage(out vec4 o, in vec2 u) {
   
    float t,s,i,d,e;
    vec3  c,r = iResolution;

    u = ( u - r.xy/2. ) / r.y;            // scaled coords
    if (abs(u.y) > .375) { o*= i; return;}// cinema bars
    
    
    vec3  p = P(T),                       // setup ray origin, direction, and look-at
          Z = normalize( P(T+4.) - p),
          X = normalize(vec3(Z.z,0,-Z)),
          D = vec3(u, 1) * mat3(-X, cross(X, Z), Z);
              
    for(; i++ < 28. && d < 3e1 ;
        c += 1./s + 1e1*vec3(1,2,5)/max(e, .6)
    )
        p += D * s,                      // march
        X = P(p.z),                      // get path
        t = sin(iTime),                  // store sine of iTime (not T)
        e = length(p - vec3(             // orb (sphere with xyz offset by t)
                    X.x + t,
                    X.y + t*2.,
                    6.+T + t*2.))-.01,
        s = cos(p.z*.6)*2.+ 4.           // tunnel with modulating radius
          - min( length(p.xy - X.x - 6.)
               , length((p-X).xy) )
          + A(  4., .25, .1)             // noise, large scoops
          + A(T+8., .22, 2.),            // noise, detail texture 
                                         // (remove "T+" if you don't like the texture moving)
        d += s = min(e,.01+.3*abs(s));   // accumulate distance
          
    o.rgb = (c*c/1e6);                   // adjust brightness and saturation
}

*/








/*
#define T (iTime*4.+5.+sin(iTime*.3)*5.)
#define N normalize
#define P(z) vec3(cos((z)*.1)* 12., \
                  cos((z) *  .12) * 12., (z))
#define A(F, H, K) abs(dot(sin(F*p*K), H+p-p )) / K 

void mainImage(out vec4 o, in vec2 u) {
   
    float st,s,i,d,e;
    vec3  c,r = iResolution;
    
    // scaled coords
    u = (u-r.xy/2.)/r.y;
 
     // cinema bars
    if (abs(u.y) > .375) { o = vec4(0); return;}
    
    // setup ray origin, direction, and look-at
    vec3  p = P(T),ro=p,
          Z = N( P(T+4.) - p),
          X = N(vec3(Z.z,0,-Z)),
          D = vec3(u, 1) * mat3(-X, cross(X, Z), Z);
              
    for(;i++ < 28. && d < 3e1;
        c += 1./s + 1e1*vec3(1,2,5)/max(e, .6)
    )
        // march
        p = ro + D * d,
        
        // get path
        X = P(p.z),
        
        // store sine of iTime (not T)
        st = sin(iTime),
        
        // orb (sphere with xyz offset by st)
        e = length(p - vec3(
                    X.x + st,
                    X.y + st*2.,
                    6.+T + st*2.))-.01,
           
        // tunnel with modulating radius
        s = cos(p.z*.6)*2.+ 4. - 
            min(length(p.xy - X.x - 6.),
                length(p.xy - X.xy)),


        // noise, large scoops
        s += A(4., .25, .1),
        
        // noise, detail texture
        // remove "T+" if you don't like the texture moving
        s += A(T+8., .22, 2.),

        // accumulate distance
        d += s = min(e,.01+.3*abs(s));
        
    // adjust brightness and saturation,
    o.rgb = (c*c/1e6);

}
*/

#include <../common/main_shadertoy.frag>
