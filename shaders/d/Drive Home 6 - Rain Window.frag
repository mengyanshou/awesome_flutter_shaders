// https://www.shadertoy.com/view/tlfBDS
// --- Migrate Log ---
// 初始化局部变量（如 `rainDestort`）并把浮点 `for` 循环改成 int 计数器以提高兼容性
// Initialize local variables (e.g., `rainDestort`) and convert float `for` loops to int counters for compatibility
//
#include <../common/common_header.frag>
#define S( a , b , t ) smoothstep( a , b , t )

struct Ray {
	vec3 ro;		// Ray Origin
    vec3 rd;		// Ray Direction
};

    

// Noise
float Noise(float t) {
    float n = fract( sin( t * 3456.) * 4547. ) ;
    return n;
}

// Noise 1 Input and 4 Output
vec4 Noise14(float t ) {
    vec4 n = fract( sin( t * vec4(123. , 1024. , 3456. , 9564. ) ) * vec4( 6547., 345., 8799., 1564. ) );    
    return n;
}


// RAY
Ray GetRay( vec2 uv , vec3 camPos , float camZoom , vec3 lookAt ) {
 
    Ray ray;
     
    ray.ro = camPos;
    
    vec3 F = normalize( lookAt - camPos );
    vec3 R = normalize( cross( vec3( 0 , 1 , 0 ) , F ) );
    vec3 U = cross( F , R );
    
    vec3 center  = camPos + F * camZoom;
    vec3 intersectionPoint = center + uv.x * R  + uv.y * U;
    
    // rd have to do normalized.
    // because where GetClosestPoint() , dot ( target - ro , rd ) * rd.
    ray.rd = normalize( intersectionPoint - camPos );
    
    return ray;
}


// 
vec3 GetClosestPoint( Ray ray , vec3 targetPos ) {
   
    // 이때 반드시, rd가 노멀라이즈 되어 있어야,
    // dot( targetPos - ray.ro , ray.rd )가 정확하게 계산이 된다.
    return ray.ro + max( 0.0f , dot( targetPos - ray.ro , ray.rd ) ) * ray.rd;
}


// 
float GetDistance( Ray ray , vec3 targetPos ) {
	float d = length( targetPos - GetClosestPoint( ray , targetPos ) );
    return d;
}


// BOKE
float Boke(  Ray ray , vec3 targetPos ,  float lightDiameter , float blur ) {
    
    //vec3 targetPos = vec3( -1.0f , 0.15f , z );
    float d = GetDistance( ray , targetPos );
    float expandLight = lightDiameter * length( targetPos );
    //c += Boke( d , expandLight , bokeBlur ) * fade;
         
	float c = S( expandLight , expandLight * ( 1.0f - blur ) , d );
    c *= mix( 0.7f , 1.0f , S( expandLight * 0.8f , expandLight , d ) );
    return c;
}




// Street Light
vec3 StreetLight( Ray ray , float lightDiameter, float bokeBlur , float time ) {
    float c = 0.0f;
    
    float t = time * 0.1f;
    float s = 1.0f / 10.0f; // in 1 sec, 100 count.
    float side = step( ray.rd.x , 0.0f );
    ray.rd.x = abs( ray.rd.x ); // reflect ray x
    const int STREET_STEPS = 10;
    for (int ii = 0; ii < STREET_STEPS; ii++) {
        float i = float(ii) * s;
        float ti = fract(t + i + side * s * 0.5f );
        vec3 targetPos = vec3( 2.0f , 2.0f , 100.0f - ti * 100.0f );
        c += Boke( ray , targetPos , lightDiameter , bokeBlur ) * ti * ti * ti;
    }
         
    vec3 col = vec3( 1.0f , 0.7f , 0.3f) * c;
    return col;
}


// Head Light
vec3 HeadLights( Ray ray , float lightDiameter, float bokeBlur , float time ) {
	
    float headLightDelta = -0.25f;
    float headLightDelta2 = headLightDelta* 1.2f;
    
    
    time = time * 2.0f;
    
    float c = 0.0f;
    float t = time * 0.1f;
    float s = 1.0f / 15.0f; // in 1 sec, 100 count.
    const int HEAD_STEPS = 15;
    for (int ii = 0; ii < HEAD_STEPS; ii++) {
        float i = float(ii) * s;
        float n = Noise( i );
        if ( n > 0.1f ) continue;
        
        float ti = fract(t + i);
        float z = 100.0f - ti * 100.0f;
        float fade = ti * ti * ti * ti * ti;
        float focus = S( 0.8f , 1.0f , ti );
        float size = mix( lightDiameter , lightDiameter * 0.5f , focus );
            
        c += Boke( ray , vec3( -headLightDelta + -1.0f , 0.15f , z ) , size , bokeBlur ) * fade;
        c += Boke( ray , vec3( +headLightDelta + -1.0f , 0.15f , z ) , size , bokeBlur ) * fade;

        c += Boke( ray , vec3( -headLightDelta2 + -1.0f , 0.15f , z ) , size , bokeBlur ) * fade;
        c += Boke( ray , vec3( +headLightDelta2 + -1.0f , 0.15f , z ) , size , bokeBlur ) * fade;
      
    
    	// refection
        float reflection = 0.0f;
        
        reflection += Boke( ray , vec3( -headLightDelta2 + -1.0f , -0.15f , z ) , size * 3.0f , 1.0f ) * fade;
        reflection += Boke( ray , vec3( +headLightDelta2 + -1.0f , -0.15f , z ) , size * 3.0f , 1.0f ) * fade;
        
        c += reflection * focus;
    }
         
    //vec3 col = vec3( 1.0f , 1.7f , 0.3f) * c;
    vec3 col = vec3( 0.9f , 0.9f , 1.0f) * c;
    
    return col;
}


// Tail Light
vec3 TailLights( Ray ray , float lightDiameter, float bokeBlur , float time ) {
	
    float headLightDelta = -0.25f;
    float headLightDelta2 = headLightDelta* 1.2f;
    
    
    time = time * 0.1f;
    
    float c = 0.0f;
    //float t = time * 0.1f;
    float t = time;
    
    float s = 1.0f / 15.0f; // in 1 sec, 100 count.
    //float side = step( ray.rd.x , 0.0f );
    //ray.rd.x = abs( ray.rd.x ); // reflect ray x
    const int TAIL_STEPS = 15;
    for (int ii = 0; ii < TAIL_STEPS; ii++) {
        float i = float(ii) * s;
        
        float n = Noise( i );			// 0 ~ 1
        if ( n > 0.5f ) continue; 		// 0 ~ 0.5
        
        float ti = fract(t + i);
        float z = 100.0f - ti * 100.0f;
        float fade = ti * ti * ti * ti * ti;
        float focus = S( 0.8f , 1.0f , ti );
        float size = mix( lightDiameter , lightDiameter * 0.5f , focus );
        
        float lane = step( 0.25f , n );	// 0 , 1
        float laneShift = S(0.99f, 0.96f , ti );
        float carPos = 1.5f - lane * laneShift;
            
        float blink = step( 0.0 , sin( t * 10000.0)) * 7.0f * lane * step( 0.9f , ti );
        
        c += Boke( ray , vec3( carPos -headLightDelta , 0.15f , z ) , size , bokeBlur ) * fade;
        c += Boke( ray , vec3( carPos +headLightDelta , 0.15f , z ) , size , bokeBlur ) * fade;

        c += Boke( ray , vec3( carPos -headLightDelta2 , 0.15f , z ) , size , bokeBlur ) * fade;
        c += Boke( ray , vec3( carPos +headLightDelta2 , 0.15f , z ) , size , bokeBlur ) * fade * (1.0f + blink);
      
    
    	// refection
        float reflection = 0.0f;
        
        reflection += Boke( ray , vec3( carPos -headLightDelta2 , -0.15f , z ) , size * 3.0f , 1.0f ) * fade;
        reflection += Boke( ray , vec3( carPos +headLightDelta2 , -0.15f , z ) , size * 3.0f , 1.0f ) * fade;
        
        c += reflection * focus;
    }
         
    
    vec3 col = vec3( 1.0f , 0.1f , 0.01f) * c;
    
    return col;
}



// Environment Light
vec3 EnvironmentLight( Ray ray , float lightDiameter, float bokeBlur , float time ) {
    vec3 c = vec3(0);
    
    float t = time * 0.1f;
    float s = 1.0f / 10.0f; // in 1 sec, 100 count.
    float side = step( ray.rd.x , 0.0f );
    ray.rd.x = abs( ray.rd.x ); // reflect ray x
    
    vec3 col = vec3(0.);
    
    const int ENV_STEPS = 10;
    for (int ii = 0; ii < ENV_STEPS; ii++) {
        float i = float(ii) * s;
        float ti = fract(t + i + side * s * 0.5f );
        
        vec4 n = Noise14( i + side * 100. );
        float x = mix( 2.5f , 10.f , n.x );
        float y = mix( 0.1f , 1.5f , n.y );
        
        float occulution = sin( ti * 6.28 * 10.0 ) * 0.5f + 0.5f; // 2 pie
        float fade = ti * ti * ti;
        fade = occulution;
        
        
        vec3 targetPos = vec3( x , y , 50.0f - ti * 50.0f );
        
        col = n.wzy;
        c += Boke( ray , targetPos , lightDiameter , bokeBlur ) * fade * col * 0.5f;
    }
         
    //vec3 col = vec3( 1.0f , 0.7f , 0.3f) * c;
    //return col;
    return c;
}

// Rain Destort
vec2 RainDestort(vec2 uv , float t) {
    
    t *= 1.0;
    //uv *= 3.0;
    vec2 aspectRatio = vec2( 3 , 1 );
    
    vec2 st = uv * aspectRatio;
    st.y += t* 0.22f;
    
    vec2 id = floor(st);						// offset
    float n = fract( sin ( id.x * 716.34 ) * 768.34);
    st.y += n;// offset
    uv.y += n;
	id = floor(st);
    
    st = fract( st ) - 0.5f;	// Center of cell => 0.0f reset
    
	//id = floor(st);
    t += fract( sin( id.x * 76.34 + id.y * 1453.7 ) *768.34) * 6.283f;
    
    // Draw Dot
    float y = -sin( t + sin( t +  sin(t) * 0.5f )) * 0.43f;
    vec2 p = vec2( 0. , y );
    
    vec2 offset1 = vec2( st - p ) / aspectRatio;
    
	float d = length( offset1 );
    float mask1 = S( 0.07f , 0.00f , d );
    
    
    vec2 offset2 = vec2( (fract( uv * aspectRatio.x * vec2(1.0 , 2.0 ) ) - 0.5f)/vec2(1.0,2.0) );
    d = length( offset2 );	// Local UV in Local UV
    
    
    //float mask2 = S( 0.2f , 0.06f , d ) * S( -0.1f , 0.1f ,st.y - p.y  ); // 이게 크다.
    float mask2 = S( 0.3 *(0.5f - st.y) , 0.0f , d ) * S( -0.1f , 0.1f ,st.y - p.y  ); // 이게 크다.
    
    // Draw Line
    //if ( st.x > 0.46f || st.y > 0.49f ) mask1 = 1.0;
    
    // every pixel has slightly different direction. 
    // So It can reflect background.
    // It is important
    return vec2( mask1 * 30. * offset1 + mask2 * 30. * offset2 );
}


// MAIN
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    
    vec2 uv = (fragCoord - 0.5f * iResolution.xy) / min( iResolution.x, iResolution.y);

    vec2 mouseUv = iMouse.xy / iResolution.xy;
    //float m = length( mouseUv );
    

	vec3 camPos = vec3( 0.5f , 0.2f , 0.0f );
    vec3 lookAt = vec3( 0.5f , 0.2f , 1.0f );
    float camZoom = 2.0f;
    
    
    
    float streetLightDiameter = 0.05f;
    float headLightDiameter = 0.05f;
    float bokeBlur = 0.1f;
    
    vec2 rainDestort = vec2(0.0); // initialized to avoid undefined behaviour
    rainDestort += RainDestort( uv * 5.0f , iTime ) *0.5f;	// Rain layer 1
    rainDestort += RainDestort( uv * 7.0f , iTime ) * 0.5f;	// Rain layer 2

    // destort uv
    uv.x += sin(uv.y * sin(iTime) * 50.) * 0.005f;
    uv.y += sin(uv.x * sin(iTime ) * 30. ) * 0.003f;
    
    
    Ray ray = GetRay( uv - rainDestort , camPos , camZoom , lookAt );
    

	vec3 col = StreetLight( ray , streetLightDiameter , bokeBlur, iTime + mouseUv.x );
    col+= HeadLights(ray , headLightDiameter , bokeBlur, iTime + mouseUv.x );
    col+= TailLights(ray , headLightDiameter , bokeBlur, iTime + mouseUv.x );
    col+= EnvironmentLight( ray , streetLightDiameter , bokeBlur, iTime + mouseUv.x );
    
    
    // Back ground Gradient color
    col+= ( ray.rd.y + 0.25f ) * vec3( 0.2f , 0.1f, 0.5f );
    
    //col = vec3(rainDestort , 0.0f );
    
    fragColor = vec4( col ,1.0);
}

#include <../common/main_shadertoy.frag>