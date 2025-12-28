// --- Migrate Log ---
// 按工程规范补齐 common_header/main_shadertoy include
// 补充 iChannel0/1/2 声明；将 iChannel0 的 vec3 方向采样改为等距柱状图(equirect)采样
// 初始化全局/局部变量与输出 alpha，修复 SkSL 更严格的类型与未初始化问题
// --- Migrate Log (EN) ---
// Add required common_header/main_shadertoy includes
// Declare iChannel0/1/2; replace iChannel0 vec3 direction sampling with equirectangular sampling
// Initialize globals/locals and output alpha; fix stricter SkSL typing/uninitialized cases

#include <../common/common_header.frag>

uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;

// Created by Stephane Cuillerdier - Aiekick/2015
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

/////////////////////////////////////////////////////////
// page curl effect from my shader https://www.shadertoy.com/view/XlX3RS
float curlExtent = 0.0;
    
const float minAmount = -0.16;
const float maxAmount = 1.3;
const float PI = 3.14159;
const float scale = 512.0;
const float sharpness = 3.0;
vec4 bgColor = vec4(0.0);

float amount = 0.0;
float cylinderCenter = 0.0;
float cylinderAngle = 0.0;
const float cylinderRadius = 1.0 / PI / 2.0;

vec2 equirectangularMap(vec3 d) {
    float x = atan(d.y, d.x);
    float y = acos(clamp(d.z, -1.0, 1.0));
    return vec2(x / (2.0 * PI) + 0.5, y / PI);
}

vec3 sampleEnv(vec3 direction) {
    vec2 uv = equirectangularMap(normalize(direction));
    return texture(iChannel0, uv).rgb;
}

vec3 hitPoint(float hitAngle, float yc, vec3 point, mat3 rrotation)
{
    float hitPointY = hitAngle / (2.0 * PI);
    point.y = hitPointY;
    return rrotation * point;
}

vec4 antiAlias(vec4 color1, vec4 color2, float dis)
{
    dis *= scale;
    if (dis < 0.0) return color2;
    if (dis > 2.0) return color1;
    float dd = pow(1.0 - dis / 2.0, sharpness);
    return ((color2 - color1) * dd) + color1;
}

float distanceToEdge(vec3 point)
{
    float dx = abs(point.x > 0.5 ? 1.0 - point.x : point.x);
    float dy = abs(point.y > 0.5 ? 1.0 - point.y : point.y);
    if (point.x < 0.0) dx = -point.x;
    if (point.x > 1.0) dx = point.x - 1.0;
    if (point.y < 0.0) dy = -point.y;
    if (point.y > 1.0) dy = point.y - 1.0;
    if ((point.x < 0.0 || point.x > 1.0) && (point.y < 0.0 || point.y > 1.0)) return sqrt(dx * dx + dy * dy);
    return min(dx, dy);
}

vec4 seeThrough(float yc, vec2 p, mat3 rotation, mat3 rrotation)
{
    float hitAngle = PI - (acos(yc / cylinderRadius) - cylinderAngle);
    vec3 point = hitPoint(hitAngle, yc, rotation * vec3(p, 1.0), rrotation);
    if (yc <= 0.0 && (point.x < 0.0 || point.y < 0.0 || point.x > 1.0 || point.y > 1.0))
        return bgColor;
    if (yc > 0.0)
        return texture(iChannel1, p);
    vec4 color = texture(iChannel1, point.xy);
    vec4 tcolor = vec4(0.0);
    return antiAlias(color, tcolor, distanceToEdge(point));
}

vec4 seeThroughWithShadow(float yc, vec2 p, vec3 point, mat3 rotation, mat3 rrotation)
{
    float shadow = distanceToEdge(point) * 30.0;
    shadow = (1.0 - shadow) / 3.0;
    if (shadow < 0.0)
        shadow = 0.0;
    else
        shadow *= amount;
    vec4 shadowColor = seeThrough(yc, p, rotation, rrotation);
    shadowColor.r -= shadow;
    shadowColor.g -= shadow;
    shadowColor.b -= shadow;
    return shadowColor;
}

vec4 backside(float yc, vec3 point)
{
    vec4 color = texture(iChannel1, point.xy);
    float gray = (color.r + color.b + color.g) / 15.0;
    gray += (8.0 / 10.0) * (pow(1.0 - abs(yc / cylinderRadius), 2.0 / 10.0) / 2.0 + (5.0 / 10.0));
    color.rgb = vec3(gray);
    return color;
}

/////////////////////////////////////////////

//////2D FUNC TO MODIFY////////////////////
vec3 effect(vec2 uv) 
{
    uv/=8.;
    uv+=0.5;
    
    bgColor = texture(iChannel2, uv).rgga;
    
    curlExtent = (sin((iTime)*0.3)*0.5+0.5);
    
    if (iMouse.z>0.) curlExtent = 1.-iMouse.y/iResolution.y;
        
	amount = curlExtent * (maxAmount - minAmount) + minAmount;
	cylinderCenter = amount;
	cylinderAngle = 2.0 * PI * amount;

    const float angle = 30.0 * PI / 180.0;
    float c = cos(-angle);
    float s = sin(-angle);
    mat3 rotation = mat3(c, s, 0.0, -s, c, 0.0, 0.12, 0.258, 1.0);
    c = cos(angle);
    s = sin(angle);
    mat3 rrotation = mat3(c, s, 0.0, -s, c, 0.0, 0.15, -0.5, 1.0);
    vec3 point = rotation * vec3(uv, 1.0);
    float yc = point.y - cylinderCenter;
    vec4 color = vec4(1.0, 0.0, 0.0, 1.0);
    if (yc < -cylinderRadius) // See through to background
    {
        color = bgColor;
    } 
    else if (yc > cylinderRadius) // Flat surface
    {
        
        color = texture(iChannel1, uv);
    } 
    else 
    {
        float hitAngle = (acos(yc / cylinderRadius) + cylinderAngle) - PI;
        float hitAngleMod = mod(hitAngle, 2.0 * PI);
        if ((hitAngleMod > PI && amount < 0.5) || (hitAngleMod > PI/2.0 && amount < 0.0)) 
        {
            color = seeThrough(yc, uv, rotation, rrotation);
        } 
        else 
        {
            point = hitPoint(hitAngle, yc, point, rrotation);
            if (point.x < 0.0 || point.y < 0.0 || point.x > 1.0 || point.y > 1.0) 
            {
                color = seeThroughWithShadow(yc, uv, point, rotation, rrotation);
            } 
            else 
            {
                color = backside(yc, point);
                vec4 otherColor = vec4(0.0);
                if (yc < 0.0) 
                {
                    float shado = 1.0 - (sqrt(pow(point.x - 0.5, 2.0) + pow(point.y - 0.5, 2.0)) / 0.71);
                    shado *= pow(-yc / cylinderRadius, 3.0);
                    shado *= 0.5;
                    otherColor = vec4(0.0, 0.0, 0.0, shado);
                } 
                else 
                {
                    otherColor = texture(iChannel1, uv);
                }
                color = antiAlias(color, otherColor, cylinderRadius - abs(yc));
            }
        }
    }
    return color.rgb;
}

///////FRAMEWORK////////////////////////////////////
vec4 displacement(vec3 p)
{
    vec3 col = effect(p.xz);
    
    col = clamp(col, vec3(0.0), vec3(1.0));
    
    float dist = dot(col,vec3(0.1));
    
    return vec4(dist,col);
}

////////BASE OBJECTS///////////////////////
float obox( vec3 p, vec3 b ){ return length(max(abs(p)-b,0.0));}
float osphere( vec3 p, float r ){ return length(p)-r;}
////////MAP////////////////////////////////
vec4 map(vec3 p)
{
   	vec4 disp = displacement(p);
        
    float y = 1. - smoothstep(0., 1., disp.x);
    
    float dist = osphere(p, +5.-y);
    
    return vec4(dist, disp.yzw);
}

///////////////////////////////////////////
//FROM IQ Shader https://www.shadertoy.com/view/Xds3zN
float softshadow( in vec3 ro, in vec3 rd, in float mint, in float tmax )
{
	float res = 1.0;
    float t = mint;
    for( int i=0; i<16; i++ )
    {
		float h = map( ro + rd*t ).x;
        res = min( res, 8.0*h/t );
        t += clamp( h, 0.02, 0.10 );
        if( h<0.001 || t>tmax ) break;
    }
    return clamp( res, 0.0, 1.0 );
}

vec3 calcNormal( in vec3 pos )
{
	vec3 eps = vec3( 0.1, 0., 0. );
	vec3 nor = vec3(
	    map(pos+eps.xyy).x - map(pos-eps.xyy).x,
	    map(pos+eps.yxy).x - map(pos-eps.yxy).x,
	    map(pos+eps.yyx).x - map(pos-eps.yyx).x );
	return normalize(nor);
}

float calcAO( in vec3 pos, in vec3 nor )
{
	float occ = 0.0;
    float sca = 1.0;
    for( int i=0; i<5; i++ )
    {
        float hr = 0.01 + 0.12*float(i)/4.0;
        vec3 aopos =  nor * hr + pos;
        float dd = map( aopos ).x;
        occ += -(dd-hr)*sca;
        sca *= 0.95;
    }
    return clamp( 1.0 - 3.0*occ, 0.0, 1.0 );    
}

///////////////////////////////////////////
float march(vec3 ro, vec3 rd, float rmPrec, float maxd, float mapPrec)
{
    float s = rmPrec;
    float d = 0.0;
    float l = log(2.0);
    for(int i=0;i<60;i++)
    {      
        if (s<rmPrec||s>maxd) break;
        s = map(ro+rd*d).x * l;
        d += abs(s);
    }
    return d;
}

////////MAIN///////////////////////////////
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    //float time = iTime*0.3;
    float cam_a = 0.0; // angle z
    
    float cam_e = 5.52; // elevation
    float cam_d = 1.88; // distance to origin axis
   	
    vec3 camUp=vec3(0.0,1.0,0.0);//Change camere up vector here
    vec3 camView=vec3(0.0,0.0,0.0); //Change camere view here
  	float li = 0.6; // light intensity
    float prec = 0.00001; // ray marching precision
    float maxd = 50.; // ray marching distance max
    float refl_i = 0.45; // reflexion intensity
    float refr_a = 0.7; // refraction angle
    float refr_i = 0.8; // refraction intensity
    float bii = 0.35; // bright init intensity
    float marchPrecision = 0.8; // ray marching tolerance precision
    
    /////////////////////////////////////////////////////////
    //if ( iMouse.z>0.) cam_e = iMouse.x/iResolution.x * 10.; // mouse x axis 
    //if ( iMouse.z>0.) cam_d = iMouse.y/iResolution.y * 50.; // mouse y axis 
    /////////////////////////////////////////////////////////
    
	vec2 uv = fragCoord.xy / iResolution.xy * 2.0 - 1.0;
    uv.x*=iResolution.x/iResolution.y;
    
    vec3 col = vec3(0.0);
    
    vec3 ro = vec3(-sin(cam_a)*cam_d, cam_e+1.0, cos(cam_a)*cam_d); //
  	vec3 rov = normalize(camView-ro);
    vec3 u = normalize(cross(camUp,rov));
  	vec3 v = cross(rov,u);
  	vec3 rd = normalize(rov + uv.x*u + uv.y*v);
    
    float b = bii;
    
    float d = march(ro, rd, prec, maxd, marchPrecision);
    
    if (d<maxd)
    {
        vec2 e = vec2(-1., 1.)*0.005; 
    	vec3 p = ro+rd*d;
        vec3 n = calcNormal(p);
        
        b=li;
        
        vec3 reflRay = reflect(rd, n);
		vec3 refrRay = refract(rd, n, refr_a);
        
        vec3 cubeRefl = sampleEnv(reflRay) * refl_i;
        vec3 cubeRefr = sampleEnv(refrRay) * refr_i;
        
        col = cubeRefl + cubeRefr + pow(b, 15.);
        
       	float occ = calcAO( p, n );
		vec3  lig = normalize( vec3(-0.6, 0.7, -0.5) );
		float amb = clamp( 0.5+0.5*n.y, 0.0, 1.0 );
        float dif = clamp( dot( n, lig ), 0.0, 1.0 );
        float bac = clamp( dot( n, normalize(vec3(-lig.x,0.0,-lig.z))), 0.0, 1.0 )*clamp( 1.0-p.y,0.0,1.0);
        float dom = smoothstep( -0.1, 0.1, reflRay.y );
        float fre = pow( clamp(1.0+dot(n,rd),0.0,1.0), 2.0 );
		float spe = pow(clamp( dot( reflRay, lig ), 0.0, 1.0 ),16.0);
        
        dif *= softshadow( p, lig, 0.02, 2.5 );
       	dom *= softshadow( p, reflRay, 0.02, 2.5 );

		vec3 brdf = vec3(0.0);
        brdf += 1.20*dif*vec3(1.00,0.90,0.60);
		brdf += 1.20*spe*vec3(1.00,0.90,0.60)*dif;
        brdf += 0.30*amb*vec3(0.50,0.70,1.00)*occ;
        brdf += 0.40*dom*vec3(0.50,0.70,1.00)*occ;
        brdf += 0.30*bac*vec3(0.25,0.25,0.25)*occ;
        brdf += 0.40*fre*vec3(1.00,1.00,1.00)*occ;
		brdf += 0.02;
		col *= brdf;

    	col = mix(col, map(p).yzw, 0.5);
    }
    else
    {
        col = sampleEnv(rd);
    }
    
	fragColor = vec4(col, 1.0);
}

#include <../common/main_shadertoy.frag>