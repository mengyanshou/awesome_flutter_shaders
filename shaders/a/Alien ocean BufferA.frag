// --- Migrate Log ---
// 添加 common_header 引入并补充迁移日志；保持原始算法与行为不变
// --- Migrate Log (EN) ---
// Added common_header include and migration log; keep algorithm and behavior unchanged

#include <../common/common_header.frag>
#include <Alien ocean Common.frag>

float ray(vec3 ro, vec3 rd, float t) 
{
    vec3 p = ro+t*rd;
    float h = 0.;
    for (int i=0;i<100;i++) {
        float h = p.y-srf(p.xz,ITERS_RAY, iTime).x;
        if (h<t*EPS*4.) return t;
        t+=h;
        p+=rd*h;
    }
    return t;
}

void mainImage( out vec4 O, in vec2 u )
{
    vec2 R = iResolution.xy;
    if (all(lessThan(u*8.,R))) {
         vec2 uv  = (16.*u-R)/R.x,
              muv = (2.*iMouse.xy-R)/R.x*-float(iMouse.z>1.)*PI; 

        //Camera
        vec3 vo = vec3(iTime,1.01,iTime),
             vd = camera_ray(vo,uv,muv,iTime);
        
        float t = -vo.y/(vd.y-1.0+EPS*8.);
        if (t>0.) {
            //march to surface with high epsilon
            t = ray(vo,vd, t);
        }

        O = vec4(t);
    }
}

#include <../common/main_shadertoy.frag>