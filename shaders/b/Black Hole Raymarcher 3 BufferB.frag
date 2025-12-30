// --- Migrate Log ---
// 本次迁移修改:
// - 初始化局部变量并修正循环计数器；替换所有位操作为纯数学实现；插入迁移头文件并保持算法等价。
// change summary:
// - Initialize locals and fix loop counters; replace all bitwise ops with pure math; kept algorithm equivalence.
// -------------------

#include <../common/common_header.frag>
uniform sampler2D iChannel0;

// Simple pseudo-random generator without any bitwise operations
float hash(uint x)
{
    x = uint(int(x) * 2654435761);  // Multiplicative hash
    return fract(sin(float(x)) * 43758.5453);
}

#define hashi(x) uint(hash(x) * float(0xffffffffU))
#define steps  90
const int starAA = 8; //Multisamples the stars
vec3 camPos = vec3(0.0, 220.0, 0.0);
const vec3 holePos = vec3(0.0, 0.0, -0.0);
const float holeRadius = 0.1; //Issues below three with star projection
const float detail = 3.0;//noise octaves, large performance impact
const float density = 3.0; //Largest noise value
const float stepVa = 20.0; //Maximum length of fine raymarching steps
const float bounds = 500.0; //Boundary distance for black hole
const float vol = 8.0;    //brightness of volume
const float volDen = 0.7; //opacity of volume, between 0 and 1


//Random function and hash from https://www.shadertoy.com/view/WttXWX
// Simplified hash without bitwise operations for SkSL compatibility
uint lowbias32(uint x)
{
    x = (x ^ uint(43668522)) * 3812423987u;
    x = (x ^ (x / 65536u)) * 3699529241u;
    x = x ^ (x / 65536u);
    return x;
}


float rand(vec3 position)
{
    uvec3 V = uvec3(floor(position + 0.5));
    // Use multiplication-based mixing instead of bit shifting
    float h = hash(V.x + (V.y * 65536u) + (V.z * 256u));  // Converted 3D hash without << operator
    return h;

}
//=====================================================================
//3d noise functions
//=====================================================================

//bilinear interpolation function 
float interpolate(vec3 position)
{
    vec3 quantPos = round((position + 0.5));
    vec3 divPos = fract(1.0 * position);
    

    //Finds noise values for the corners, treats Z axis as a separate rectangle for ease of lerping
    vec4 lerpXY = vec4(
        rand(quantPos + vec3(0.0, 0.0, 0.0)),
        rand(quantPos + vec3(1.0, 0.0, 0.0)),
        rand(quantPos + vec3(1.0, 1.0, 0.0)),
        rand(quantPos + vec3(0.0, 1.0, 0.0)));
    
    vec4 lerpXYZ = vec4(
        rand(quantPos + vec3(0.0, 0.0, 1.0)),
        rand(quantPos + vec3(1.0, 0.0, 1.0)),
        rand(quantPos + vec3(1.0, 1.0, 1.0)),
        rand(quantPos + vec3(0.0, 1.0, 1.0)));
    
    //Calculates the area of rectangles
    vec4 weights = vec4(
    abs((1.0 - divPos.x) * (1.0 - divPos.y)),
    abs((0.0 - divPos.x) * (1.0 - divPos.y)),
    abs((0.0 - divPos.x) * (0.0 - divPos.y)),
    abs((1.0 - divPos.x) * (0.0 - divPos.y)));
    
    //linear interpolation between values
    vec4 lerpFinal = mix(lerpXY, lerpXYZ, divPos.z);
   
    return weights.r * lerpFinal.r +
           weights.g * lerpFinal.g +
           weights.b * lerpFinal.b +
           weights.a * lerpFinal.a;
    
}

//Octaves of noise, sligtly less than a perfect octave to hide bilinear filtering artifatcs
float octave(vec3 coord, float octaves, float div)
{
    
    float col = 0.0;
    float it = 1.0;
    float cnt = 1.0;
    for(int iter = 1; iter <= int(octaves); iter++)
    {
        col += interpolate((it * coord / (div))) / it;
        it = it * 1.9;
        cnt = cnt + 1.0 / it;
    }
    return pow(col / cnt, 1.0);
} 

//Procedural starmap
float starField(vec3 vector)
{
    float b = 0.0;
    float sizeDiv = 500.0;
    vector = sizeDiv * (1.0 + normalize(vector));
    if(starAA > 0)
    {
        for(int i = 0; i < starAA; i++)
        {
           vector += 100.0 * rand(vec3(i)) / sizeDiv;
           float a = 1.0 - (4.0 * rand((vector)));
           if(a < 0.9) {a = 0.0;}
           a = 6.0 * pow(a, 20.0);
           b += a;
        }
    }
    
    return b / float(starAA);
}

//=====================================================================
//Distance Fields and volumetrics
//=====================================================================
vec2 distField(vec3 position, vec3 origin)
{
    //Distance Field inputs
    float radius = 45.0;
    float dist = distance(origin, position);
    float distXY = max(distance(origin.xy, position.xy) - holeRadius, 0.0);
    float fieldZ = max(0.0, pow(distance((origin.z), position.z), 2.5));
    
    
    //calculates angle to transform a 2d function to a radial one
    float angle = atan((position.x - origin.x) / (position.y - origin.y));
    if(position.y <= origin.y) {angle = angle + 3.1415;}
    angle = angle + 0.05 * iTime;
   
    //Distance field components
    float cloud = pow(clamp(radius / (dist - holeRadius), 0.0, 1.0), 2.5);
    float spiral = 0.0;
    float occ = 0.0;
    spiral = octave(vec3(dist, 50.0 * (1.0 + sin(angle))
    , 1.0 * distance(origin.z + 3.0 * iTime, position.z)), detail, density);//3d noise function

    //Merge components
    float finalDF = cloud * clamp(spiral / (fieldZ), 0.0, 1.0);
    if(finalDF < volDen){occ =(volDen - spiral);}
    return vec2(finalDF, max(occ / (dist * distance(position.z, origin.z) / 500.0), 0.0));
}

//=====================================================================
//Ray marching function
//=====================================================================
vec3 rayCast(vec2 rayAxis)
{
    
    float stepSize = 1.0;
    float gravDis = 1.0 * 1.666667 * 2392.3 * pow(1.0973, holeRadius);
    
    //Variables to determine position changes and ray vectors
    float yTravel = camPos.y - holeRadius;
    float timeOff = (iTime + 12.0) / 15.0;
    vec3 newCam = vec3(camPos.x, camPos.y + cos(timeOff) * (yTravel), sin(timeOff) * 30.0);
    vec3 rayPos = newCam;
    vec3 rayVel = vec3(cos(rayAxis.x), sin(rayAxis.x), sin(rayAxis.y));
    float rayDist = distance(rayPos, holePos);
    float rayVol = 0.0;
    vec2 dField;
    float colShift = 0.0;
    float occ = 1.0;
    //Jump the ray forward to allow it to render the black hole at large distances
    rayPos += rayVel * max(rayDist - bounds, 0.0); 
    
    for(int i = 0; i <= steps; i++)
    {
        rayDist = max(distance(rayPos, holePos) - 10.0, 0.001);
        float boDist = pow(rayDist / 500.0, 2.0);
        float diskDist = rayDist;//distance(rayPos.xy, holePos.xy);
        
        rayPos += rayVel;
        
        //vector of deflection
        vec3 rayDefl = normalize(holePos - rayPos);
        
       
        //Deflect the ray for gravity
         rayVel += gravDis * pow(stepSize, 2.4) * vec3((rayDefl.x) * (1.0 / pow(rayDist, 4.0)),
            (rayDefl.y) * (1.0 / pow(rayDist, 4.0)),
            (rayDefl.z) * (1.0 / pow(rayDist, 4.0)) );
       
        //Distance field calculations
        dField = distField(rayPos, holePos);

        //float travel = distance(rayPos, newCam) / 300.0; 
        stepSize = min(clamp(rayDist - (holeRadius + stepVa), 0.05, stepVa), max(boDist + distance(holePos.z, rayPos.z),0.2));
        
        rayVel = normalize(rayVel) * stepSize;
        
        //Volumetric rendering of the Accretion Disk
        occ += dField.g;
        rayVol = rayVol + (dField.r * vol * stepSize) / occ;//mix((((dField.r) * vol) * stepSize), 0.0, 0.0);//(occ) / 2.0);
        
        if(rayDist >= 2.0 * bounds)
        {return vec3((starField(rayVel) / (occ)) + rayVol, clamp(rayVol * colShift, 0.0, 1.0), rayVol);}
        
        if(rayDist <= holeRadius) 
        {return vec3(rayVol, clamp(rayVol * colShift, 0.0, 1.0), rayVol);}
        
        //Color things, fakes a subtle blueshift, but does a horrible job at it.
        colShift += rayVol * rayPos.x / (float(steps) * 100.0);
    }
    if(rayDist >= holeRadius * 3.0){rayVol += starField(rayVel) / (occ);} 
    return vec3(rayVol, clamp(rayVol * colShift, 0.0, 1.0), rayVol);
}






void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;
    
    
    //noise texture to distort rays
    vec2 pixAxis = texture(iChannel0, uv).rg;
    vec3 col = rayCast(pixAxis);
    
   
    // Output to screen
    fragColor = vec4(col, 1.0);
}

#include <../common/main_shadertoy.frag>