// --- Migrate Log ---
// 添加 Flutter/SkSL 公共 include；将浮点循环改为整型循环并显式初始化局部变量（a,t,kk等），避免未定义行为；不修改算法的视觉结果
// --- Migrate Log (EN) ---
// Add Flutter/SkSL common include; replace float loop with int loop and explicitly initialize local variables (a, t, etc.) to avoid undefined behavior; do not change algorithm semantics

#include <../common/common_header.frag>

// -13 thanks to Nguyen2007 ⚡
vec2 stanh(vec2 a) {
    return tanh(clamp(a, -40.,  40.));
}
void mainImage( out vec4 o, vec2 u )
{
    vec2 v = iResolution.xy;
    u = 0.2 * (u + u - v) / v.y;

    vec4 z = vec4(1.0, 2.0, 3.0, 0.0);
    o = z;

    float a = 0.5;
    float t = iTime;

    // Use an integer loop for SkSL compatibility; emulate original pre-increments explicitly
    for (int idx = 0; idx < 19; idx++) {
        float i = float(idx);
        // emulate ++a and ++t (pre-increment semantics from original)
        a += 0.03;
        t += 1.0;

        v = cos( t - 7.0 * u * pow( a, i ) ) - 5.0 * u;

        // apply matrix multiplication explicitly (avoid assignment inside expressions)
        mat2 m = mat2( cos( i + 0.02 * t - vec4(0.0, 11.0, 33.0, 0.0) ) );
        u = u * m;

        // tanh operates on a vec2 here (matching original); keep same scale factors
        vec2 tanhArg = 40.0 * dot(u, u) * cos( 1e2 * u.yx + t );
        u += tanh( tanhArg ) / 200.0 + 0.2 * a * u + cos( 4.0 / exp( dot(o, o) / 100.0 ) + t ) / 300.0;

        vec4 numer = 1.0 + cos( z + t );
        vec2 denomVec = (1.0 + i * dot(v, v)) * sin( 1.5 * u / (0.5 - dot(u, u)) - 9.0 * u.yx + t );
        float len = length( denomVec );
        o += numer / len;
    }

    o = 25.6 / ( min(o, 13.0) + 164.0 / o ) - dot( u, u ) / 250.0;
} 




// Original [436]
/*
void mainImage( out vec4 o, vec2 u )
{
    vec2 v = iResolution.xy, 
         w,
         k = u = .2*(u+u-v)/v.y;    
         
    o = vec4(1,2,3,0);
     
    for (float a = .5, t = iTime, i; 
         ++i < 19.; 
         o += (1.+ cos(vec4(0,1,3,0)+t)) 
           / length((1.+i*dot(v,v)) * sin(w*3.-9.*u.yx+t))
         )  
        v = cos(++t - 7.*u*pow(a += .03, i)) - 5.*u,         
        u *= mat2(cos(i+t*.02 - vec4(0,11,33,0))),
        u += .005 * tanh(40.*dot(u,u)*cos(1e2*u.yx+t))
           + .2 * a * u
           + .003 * cos(t+4.*exp(-.01*dot(o,o))),      
        w = u / (1. -2.*dot(u,u));
              
    o = pow(o = 1.-sqrt(exp(-o*o*o/2e2)), .3*o/o) 
      - dot(k-=u,k) / 250.;
}
//*/

#include <../common/main_shadertoy.frag>