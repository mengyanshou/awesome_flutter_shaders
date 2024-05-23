// You can change these
float angle = 4.; // In radians
int dotSize = 1; // Logarithmic scale (base 2)

vec2 cyanOffset = vec2(0,1); // Color offsets are proportional to dot size
vec2 magentaOffset = vec2(-0.58,-0.5);
vec2 yellowOffset = vec2(0.58,0.5);


// Don't change these unless you know what you are doing
mat2 invHexMat = mat2(1.1547,-0.57735,0.,1.);
mat2 hexMat = mat2(0.866,0.5,0.,1.);
vec2 offsets[7] = vec2[7](
    vec2(-1, 1),
    vec2(-1, 0),
    vec2( 0, 1),
    vec2( 0, 0),
    vec2( 0,-1),
    vec2( 1, 0),
    vec2( 1,-1)
);
