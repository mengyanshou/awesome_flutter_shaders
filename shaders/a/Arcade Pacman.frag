// --- Migrate Log ---
// 在文件顶部添加 common_header 以引入 iResolution/iTime 等 uniform，确保所有本地变量已明确初始化（无需改变算法）
// 在文件末尾添加 main_shadertoy include 以符合项目入口约定
// --- Migrate Log (EN) ---
// Insert common_header at top to provide iResolution/iTime uniforms and ensure locals are explicitly initialized (no algorithm changes)
// Add main_shadertoy include at EOF to match project entry conventions

#include <../common/common_header.frag>

// Pacman
// by Nikos Papadopoulos (4rknova)
// CC BY-NC-SA 3.0

#define PI           3.14159265359
#define SZ_PANE     30.0 // world half-height; Y spans ~[-30..+30]
#define SZ_DOTS      4.0 // pellet radius
#define SZ_PMAN     16.0 // Pac-Man radius
#define DS_DOTS     32.0 // pellet spacing along X
#define SP_SCROLL   70.0 // pellet scroll speed (world units/sec)

#define SZ_PMAN2    (SZ_PMAN*SZ_PMAN)  // pacman radius squared
#define SZ_DOTS2    (SZ_DOTS*SZ_DOTS)  // pellet radius squared
#define INV_DS_DOTS (1.0/DS_DOTS)      // reciprocal used for wrapping with fract()
#define EYE_RATIO   0.3                // ghost eye radius = ratio * SZ_PMAN

#define COL_DOT    vec3(1.0)           // pellets (white)
#define COL_PMAN   vec3(1.0, 1.0, 0.0) // pacman body (yellow)
#define COL_GHOST  vec3(1.0, 0.0, 0.0) // ghost body (red)
#define COL_EYE    vec3(1.0)           // ghost eyes (white)
#define COL_PUPIL  vec3(0.0, 0.0, 1.0) // ghost pupils (blue)

// 1.0 when squared distance d2 is inside radius^2 r2
// 0.0 when outside (branchless)
float insideCircle_d2(float d2, float r2) { return 1.0 - step(r2, d2); }

// Squared length (avoids sqrt); useful for circle tests
float len2(vec2 v) { return dot(v, v); }

// Cubic disk: test |p^3|^2 < r^2
float insideCubic(vec2 p, float r2) {
    vec2 q = p * p * p;               // component-wise cube: p^3
    return 1.0 - step(r2, dot(q, q)); // 1 inside, 0 outside
}

// 1.0 where a pellet exists, 0.0 elsewhere
float dotsMask(vec2 uv, float t)
{
    // Scroll pellets to +X and wrap to [0, DS_DOTS):
    // fract((x + speed*t)/DS_DOTS) * DS_DOTS. Cheaper than mod(x, DS_DOTS)
    float sx = fract((uv.x + t * SP_SCROLL) * INV_DS_DOTS) * DS_DOTS;

    // Center of the pellet in the wrapped strip
    vec2 c = vec2(2.5 * SZ_DOTS, 0.0);

    // Gate: only show pellets once original x > -SZ_DOTS
    float gate = step(-SZ_DOTS, uv.x);

    // Circle test in wrapped coordinates (1 inside pellet)
    float inside = insideCircle_d2(len2(vec2(sx, uv.y) - c), SZ_DOTS2);

    return gate * inside;
}

void pacman(vec2 uv, float t, inout vec3 col, inout float a)
{
    // Pacman disc coverage (1 inside body circle)
    float inDisc = insideCircle_d2(len2(uv), SZ_PMAN2);

    // Time scaling
    float tScaled = t * PI * 0.25 * (SP_SCROLL * SZ_DOTS / DS_DOTS);

    // Mouth open phase in [0..1] using |sin|
    float phase = abs(sin(tScaled));

    // Only need normalized x component toward +X to open the mouth
    // Compute n.x = u.x / |u| using inversesqrt for speed
    vec2  u    = uv + vec2(SZ_PMAN * 0.4, 0.0); // shift avoids u ~ 0 at center
    float invL = inversesqrt(max(dot(u, u), 1e-8));
    float nx   = u.x * invL;

    // Mouth is open when nx * phase >= 0.75 
    // points roughly to +X and phase high
    float mouthOpen = step(0.75, nx * phase);

    // Body coverage excludes the mouth; the mouth becomes fully transparent
    float kBody = inDisc * (1.0 - mouthOpen);

    // Paint body color where kBody=1
    // Blend when kBody in (0,1)
    col = mix(col, COL_PMAN, kBody);

    // Alpha only comes from the body (mouth doesn't add alpha)
    a = max(a, kBody);
}

void ghost(vec2 uv, float t, inout vec3 col, inout float a)
{
    // Ghost local coords: centered a bit left of origin
    vec2  center = vec2(-SZ_PMAN * 3.0, 0.0);
    vec2  d      = uv - center;
    float r2     = len2(d);

    // Cache |x| and |y| for skirt tests
    float ax = abs(d.x), ay = abs(d.y);

    // Eye radius and r^2 (precompute once)
    float szEye  = SZ_PMAN * EYE_RATIO;
    float szEye2 = szEye * szEye;

    // Eye centers
    vec2 dl = d - szEye * vec2(-0.2, 0.7);
    vec2 dr = d - szEye * vec2( 2.1, 0.7);

    // Pupil centers, using cubic disk shape
    vec2 pl = d - szEye * vec2(0.4,  0.7);
    vec2 pr = d - szEye * vec2(2.7,  0.7);

    // Wavy skirt with a single cos() call; toggle phase between two offsets
    float kx    = PI * 0.3 * d.x;
    float phase = step(0.5, fract(t * 3.0)); // toggles 0/1 around 3 Hz
    float wave  = cos(kx + PI * 0.85 * phase);

    // Head: top semicircle (y >= 0) within SZ_PMAN
    float head  = insideCircle_d2(r2, SZ_PMAN2) * step(0.0, d.y);

    // Skirt: y <= 0, |x| < SZ_PMAN, and |y| below a wavy limit
    float limit = SZ_PMAN * 0.9 - SZ_PMAN * 0.15 * wave;
    float skirt = step(d.y, 0.0) * (1.0 - step(SZ_PMAN, ax)) * (1.0 - step(limit, ay));

    // Ghost silhouette is head / skirt union
    float body = max(head, skirt);

    // Paint body and mark alpha opaque where body is present
    col = mix(col, COL_GHOST, body);
    a   = max(a, body);

    // Eyes on top
    float eyes = max(insideCircle_d2(len2(dl), szEye2), insideCircle_d2(len2(dr), szEye2));
    col = mix(col, COL_EYE, eyes);
    a   = max(a, eyes);

    // Pupils on top
    float pups = max(insideCubic(pl, szEye2), insideCubic(pr, szEye2));
    col = mix(col, COL_PUPIL, pups);
    a   = max(a, pups);
}

vec4 draw(vec2 uv, float t)
{
    // Slight pixelation
    uv = floor(uv * 2.0);

    // Start with empty buffers: color doesn't matter where alpha=0
    vec3 col = vec3(0.0);
    float a  = 0.0;

    // Pellets layer
    float mDots = dotsMask(uv, t);
    col = mix(col, COL_DOT, mDots);
    a   = max(a,  mDots);

    // Characters: Pac-Man with transparent mouth, then ghost
    pacman(uv, t, col, a);
    ghost(uv, t, col, a);

    // Return RGBA; alpha==0 for background and mouth wedge
    return vec4(col, a);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    // Map pixel coords → normalized [-1,1] → world units, aspect-correct on X
    float a  = iResolution.x / iResolution.y;
    vec2  uv = (fragCoord.xy / iResolution.xy * 2.0 - 1.0) * vec2(a, 1.0) * SZ_PANE;

    fragColor = draw(uv, iTime);
}

#include <../common/main_shadertoy.frag>
