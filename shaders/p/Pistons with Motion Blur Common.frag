float getCamAngle(float initialAngle, float worldTime) {
    return initialAngle + worldTime * min(worldTime, 32.0) * 1.0;
}

vec3 erot(vec3 point, vec3 axis, float angle) {
    return mix(dot(axis, point) * axis, point, cos(angle))
        + sin(angle) * cross(axis, point);
}

// Thanks iq!
float opSmoothSubtraction(float a, float b, float k) {
    float h = clamp(0.5 - 0.5 * (b + a) / k, 0.0, 1.0);
    return mix(b, -a, h) + k * h * (1.0 - h);
}

float opSmoothUnion(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

float opSmoothIntersection(float a, float b, float k) {
    float h = clamp(0.5 - 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) + k * h * (1.0 - h);
}

float boxDistance(vec3 point, vec3 position, vec3 extents) {
    vec3 adjustedPoint = point - position;
    vec3 p = abs(adjustedPoint) - extents;
    return length(max(p, 0.0)) + min(max(p.x, max(p.y, p.z)), 0.0);
}

// From iq's bounding box suggestion.
vec2 boxIntersect(in vec3 ro, in vec3 rd, in vec3 rad) {
    vec3 m = 1.0/rd;
    vec3 n = m*ro;
    vec3 k = abs(m)*rad;
    vec3 t1 = -n - k;
    vec3 t2 = -n + k;
    return vec2( max(max(t1.x, t1.y), t1.z), 
                 min(min(t2.x, t2.y), t2.z) );
}

float segmentDistance(vec3 point, vec3 a, vec3 b) {
    vec3 aToPoint = point - a;
    vec3 aToB = b - a;

    float time = clamp(dot(aToPoint, aToB) / dot(aToB, aToB), 0.0, 1.0);
    return distance(point, a + time * aToB);
}

float cylinderDistance(vec3 point, float height, float radius) {
    vec2 d = abs(vec2(length(point.xz), point.y)) - vec2(radius, height);
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

float smoothCylinderDistance(vec3 point, float height, float radius, float smoothing) {
    return cylinderDistance(point, height - smoothing, radius - smoothing) - smoothing;
}

float roundConeDistance(vec3 point, float radiusA, float radiusB, float height) {
    vec2 q = vec2(length(point.xy), point.z);

    float b = (radiusA - radiusB) / height;
    float a = sqrt(1.0 - b * b);
    float k = dot(q, vec2(-b, a));

    if (k < 0.0) return length(q) - radiusA;
    if (k > a * height) return length(q - vec2(0.0, height)) - radiusB;

    return dot(q, vec2(a, b)) - radiusA;
}

// https://twitter.com/jimhejl/status/633777619998130176
vec3 hejl(vec3 color, float whitePoint) {
    vec4 vh = vec4(color, whitePoint);
    vec4 va = 1.425 * vh + 0.05;
    vec4 vf = (vh * va + 0.004) / (vh * (va + 0.55) + 0.0491) - 0.0821;
    return vf.rgb / vf.www;
}