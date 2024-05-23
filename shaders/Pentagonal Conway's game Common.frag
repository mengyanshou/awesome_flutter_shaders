#define r3 1.73205080757

vec2 uvmap(vec2 coord, vec2 res){
    return coord/res.y*15.0;
}

//gets texture coords + index of a pixel
ivec3 coordtopenta(vec2 uv){
    uv = mat2(1,-1,1,1)*uv;
    vec2 cuv = floor(uv);
    uv = fract(uv) - 0.5;
    
    vec2 puv = cuv;
    int idx = 0;
    if (mod(cuv.x,2.0) == mod(cuv.y,2.0)){
        vec2 ruv = mat2(-r3,-1,1,-r3)*uv;
        idx = int(ruv.x < 0.0) + 2*int(ruv.y < 0.0);
    } else {
        vec2 ruv = mat2(r3,1,1,-r3)*uv;
        bool a = ruv.x < 0.0;
        bool b = ruv.y < 0.0;
        idx = 2*int(a) + int(b);
        puv += sign(ruv.x)*vec2(a == b, a != b);
    }
    puv = mat2(1,1,-1,1)*puv/2.0;
    
    return ivec3(puv, idx);
}

float sdLine(vec2 a, vec2 b, vec2 p){
    vec2 ab = b - a;
    float t = dot(p - a, ab)/dot(ab, ab);
    vec2 p2 = a + clamp(t,0.0,1.0)*ab;
    return length(p - p2);
}

//draws the lines between the pentagons
float pentagrid(vec2 uv){
    uv = mat2(1,-1,1,1)*uv*r3;
    vec2 cuv = floor(uv/r3);
    uv = fract(uv/r3)*r3;
    float d = 1e20;
    if (mod(cuv.x,2.0) == mod(cuv.y,2.0)){
        d = min(d, sdLine(vec2(r3/2.0 - 0.5, 0),vec2(r3/2.0 + 0.5, r3),uv));
        d = min(d, sdLine(vec2(0, r3/2.0 + 0.5),vec2(r3, r3/2.0 - 0.5),uv));
        d = min(d, sdLine(vec2(0, 0),vec2(r3/2.0 - 0.5, 0),uv));
        d = min(d, sdLine(vec2(r3, r3),vec2(r3/2.0 + 0.5, r3),uv));
        d = min(d, sdLine(vec2(0, r3),vec2(0, r3/2.0 + 0.5),uv));
        d = min(d, sdLine(vec2(r3, 0),vec2(r3, r3/2.0 - 0.5),uv));
    } else {
        d = min(d, sdLine(vec2(0, r3/2.0 - 0.5),vec2(r3, r3/2.0 + 0.5),uv));
        d = min(d, sdLine(vec2(r3/2.0 + 0.5, 0),vec2(r3/2.0 - 0.5, r3),uv));
        d = min(d, sdLine(vec2(0, 0),vec2(0, r3/2.0 - 0.5),uv));
        d = min(d, sdLine(vec2(r3, r3),vec2(r3, r3/2.0 + 0.5),uv));
        d = min(d, sdLine(vec2(r3, 0),vec2(r3/2.0 + 0.5, 0),uv));
        d = min(d, sdLine(vec2(0, r3),vec2(r3/2.0 - 0.5, r3),uv));
    }
    return d;
}