void XY (vec2 U, inout vec4 Q, vec4 q) {
    if (length(U-A(_21(q.x)).xy)<length(U-A(_21(Q.x)).xy)) Q.x = q.x;
}
void ZW (vec2 U, inout vec4 Q, vec4 q) {
    if (length(U-A(_21(q.y)).xy)<length(U-A(_21(Q.y)).xy)) Q.y = q.y;
}
Main
    Q = B(U);
    for (int x=-1;x<=1;x++)
    for (int y=-1;y<=1;y++) {
        XY(U,Q,B(U+vec2(x,y)));
    }
    XY(U,Q,vec4(Q.x-3.));
    XY(U,Q,vec4(Q.x+3.));
    XY(U,Q,vec4(Q.x-7.));
    XY(U,Q,vec4(Q.x+7.));
    if (I%12==0) 
        Q.y = _12(U);
    else
    {
        float k = exp2(float(11-(I%12)));
        ZW(U,Q,B(U+vec2(0,k)));
        ZW(U,Q,B(U+vec2(k,0)));
        ZW(U,Q,B(U-vec2(0,k)));
        ZW(U,Q,B(U-vec2(k,0)));
    }
    XY(U,Q,Q.yxzw);
    if (I<1) Q = vec4(_12(U));
    
    vec4 a1 = A(_21(Q.x));
    vec4 a2 = A(_21(Q.x+1.));
    vec4 a3 = A(_21(Q.x-1.));
    float l1 = sg(U,a1.xy,a2.xy);
    float l2 = sg(U,a1.xy,a3.xy);
    float l = min(l1,l2);
    Q.z = Q.w = smoothstep(2.,1.,l);
    Q.w -= .2*heart(U);
    
}