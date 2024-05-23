#define keyClick(a)   ( texelFetch(iChannel2,ivec2(a,0),0).x > 0.)

#define  k ( .02 * R.x*R.y )
Main 
    float i = _12(U);
    Q = A(U);
    
    vec2 f = vec2(0);
    
    if ( i < k ) {
    for (float j = -20.; j <= 20.; j++) 
        if (j!=0.) {//  && j+i>=0. && j+i<R.x*R.y) {
        vec4 a = A(_21(mod(i+j,k)));
        //if (j!=0. && j+i>=0. && j+i<R.x*R.y) {
        //vec4 a = A(_21(i+j));
        vec2 r = a.xy-Q.xy;
        float l = length(r);
        f += 50.*r/sqrt(l)*(l-abs(j))*(G1(j,10.)+2.*G1(j,5.));
    }
    for (float x = -2.; x <= 2.; x++)
    for (float y = -2.; y <= 2.; y++) {
        vec2 u = vec2(x,y);
        vec4 d = D(Q.xy+u);
        f -= 100.*d.w*u;
    }
    if (length(f)>.1) f = .1*normalize(f);
    Q.zw += f-.03*Q.zw;
    Q.xy += f+1.5*Q.zw*inversesqrt(1.+dot(Q.zw,Q.zw));
    
    vec4 m = .5*( A(_21(i-1.)) + A(_21(i+1.)) );
    Q.zw = mix(Q.zw,m.zw,0.1);
    Q.xy = mix(Q.xy,m.xy,0.01);
    if (Q.x>R.x)Q.y=.5*R.y,Q.z=-10.;
    if (Q.x<0.)Q.y=.5*R.y,Q.z=10.;
    }
     if (iFrame < 1 || keyClick(32)) {
        if ( i > k ) 
          Q = vec4(R+i,0,0); 
        else
          Q = vec4(.5*R + .25*R.y* cos( 6.28*i/k + vec2(0,1.57)), 0,0 );
    //  Q = vec4(i-.5*R.x*R.y,.5*R.y,0,0);
    }
    

}