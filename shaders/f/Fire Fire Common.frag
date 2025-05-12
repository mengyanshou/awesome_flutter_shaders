vec2 EncodeForce(vec2 force)
{
    force = clamp(force, -1.0, 1.0);
    return force * 0.5 + 0.5;
}

vec2 DecodeForce(vec2 force)
{
    force = force * 2.0 - 1.0;
    return force;
}

const float pi = 3.14159265359;
const float tau = 6.28318530718;

mat2 rot(float a)
{
    vec2 s = sin(vec2(a, a + pi / 2.0));
    return mat2(s.y, s.x, -s.x, s.y);
}

float linearStep(float a, float b, float x)
{
    return clamp((x - a) / (b - a), 0.0, 1.0);
}