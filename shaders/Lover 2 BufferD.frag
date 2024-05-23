Main 
    Q = vec4(0);
    for (float y = -30.; y <= 30.; y++)
        Q += G1(y,10.)*C(U+vec2(0,y)).w;
        
    Q = mix(Q,D(U),.5);
}