// Pudi by Pudi
// Email: krems.pudi@gmail.com
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

#include <../common/common_header.frag>
#define AA 2.0

const uint BODY = 1u;
const uint PLATE = 2u;
const uint ICING = 3u;
const uint TOPPING = 4u;
const uint STRAWBERRY = 5u;

void mouth(in vec3 p, inout Hit res, uint type) {
    switch(type) {
        case 0u: {
            vec3 pm = p + vec3(0., 0.38, 0.38);
        // float tooth = sd_cone(pm * vec3(1., -1., 1.) + vec3(0.2, 0.15, 0.0) +
        //                           vec3(-0.13, 0.0, 0.09),
        //                       vec2(0.2, 0.1), 0.05);

            vec4 umuer = sdBezier(pm + vec3(-0.02, -0.18, 0.089999974), vec3(0.01, -0.12, 0.55), vec3(0.06, 0.19, 0.), vec3(0.01, 0.01, -0.04));
            umuer.x -= 0.06 + (1. - umuer.y) * 0.04;
            umuer += noise(umuer.yzx * 100.) * 0.01 * pow(umuer.y, 3.);

            float noiseier = noise(umuer.yzx * 900.) * 0.0003;

            float exterrior = sd_ellipsoid(pm, vec3(0.19000003, 0.24000011, 0.24000005));
            exterrior = length(pm - vec3(0., -0.03, 0.)) - 0.24;
            exterrior = smax(exterrior, -(p.y + 0.424), 0.01);

            vec4 tongue = sdBezier(pm * vec3(.7, 1., 1.) + vec3(0.0, 0.0, -0.03), vec3(0.0, -0.1, 0.1), vec3(0.01, 0.20, -0.00), vec3(0.03, 0.04, -0.18));
            tongue.x += -0.18 * (1. - tongue.y) - 0.033 * pow(tongue.y, 2.);
            float bending_plane = max((pm.y + 0.0438), (length(pm + vec3(0., 0., -0.2)) - .373));
            tongue.x = max(tongue.x, -(p.y + 0.45));
        // tongue.x = smin(tongue.x, bending_plane, 0.057);
        // tongue += noiseier; // * pow(umuer.y, 3);

            exterrior = smax(exterrior, -umuer.x, 0.08);
        // tongue = max(tongue, exterrior);

            res.t = max(res.t, -exterrior);
        // res = smin(res, tongue.x, 0.03);
            res = hit_min(res, Hit(tongue.x, pm, 7u));
        // res = min(res, tooth); // fake
            break;
        };
        case 1u: {
            float wiggl = cos(iTime * 11. + PI) * 0.01;
            vec3 pb = vec3(abs(p.x), p.yz);
            pb += vec3(0., 0.23 + wiggl, 0.5);
            pb = erot(pb, vec3(0.0, 0.0, 1.0), -PI / 4.);
            pb = abs(pb) - vec3(0.1, 0.01, 0.0001);
            float box = length(max(pb, vec3(0.)));
            res = hit_min(res, Hit(box, pb, 6u));
            break;
        };
    }
}

float topping(vec3 p) {
    float ring = sd_torus(p + vec3(0., 0.34, 0.0), vec2(0.38, 0.1));

    vec3 q = erot(p, normalize(vec3(-0.2, 1., 0.1)), 3.);
    float arg = q.x * q.z * 100. + iTime;
    float bumps = cos(q.y * 100.);
    bumps = bumps * 0.5 + 0.5;
    bumps *= 0.01;
    ring += bumps;

    p = erot(p, vec3(0., 1., 0.), p.y * 3.);
    float rect = sd_rect(p.xz, vec2(0.5));

    p = erot(p, vec3(0., 1., 0.), PI / 4.);
    float neigh = sd_rect(p.xz, vec2(0.4));

    float res = opSU(rect, neigh, 0.1);
    res += p.y + 0.2;
    res = -opSU(-res * 0.5, -sd_sphere(p, 0.5), 0.1);
    res = smin(ring, res, 0.01);

    return res;
}

float sd_strawberry(vec3 p) {
    float d = 1e9;
    d = length(p) - 1.;
    d = sd_egg(p, 1., 0.2, 0.1);
    d = blend(d, -(p.z - -0.37), 15.1);
    d = blend(d, -sd_sphere(p - vec3(0., -0.11, -0.3), 0.5), 3.);

    return d;
}

vec3 RO = vec3(0.), RD = vec3(0.);
Hit map(vec3 p) {
    float t = iTime;
    float wiggl = cos(t * 11. + PI) * 0.01;
    float wiggle = cos((p.y + t) * 11.) * 0.01;
    float wigglee = cos((p.y + t + 0.05) * 11.) * 0.02;

    Hit res = default_hit();

    // body base
    float bod;
    {
        vec3 pa = vec3(0.0, -0.4, 0.0);
        float body = sd_capped_cone(p, pa, vec3(0., -0.01 + wigglee, 0.), 0.4, 0.3).z -
            0.1;
        body = body + wiggle * smoothstep(-0., -0.5, p.y) *
            smoothstep(0.2, .5, abs(p.x));
        res = hit_min(res, Hit(body, p - pa, BODY));
        bod = body;
    }

    vec2 bbox_bottom = ibox(RO - vec3(0., -0.4, 0.), RD, vec3(.8, 0.4, 0.8));
    if(bbox_bottom.x > 0. || bbox_bottom.y > 0.) {

        // plate
        {
            vec3 pa = p - vec3(0., -0.14, 0.);
            vec2 q = vec2(length(pa.xz) - .2, -pa.y);
            float plate = sd_joint2d(q, .8, 1.1, 0.02);
            res = hit_min(res, Hit(plate, pa, PLATE));
        }

        // { mouth(p, res, uint(step(0.5, mod(t * 0.6, 1.)))); }
        // { mouth(p, res, uint(step(0.5, 0))); }
        // { mouth(p, res, 1); }
    }

    vec2 bbox_up = ibox(RO - vec3(0., 0.2, 0.), RD, vec3(.5, 0.4, 0.7));
    if(bbox_up.x > 0. || bbox_up.y > 0.) {
        float top = 1e9;
        vec3 ptop;
        {
            vec3 pi = p + vec3(0., 0.12 + wiggl, 0.0);
            float d = length(pi.xz);
            float ang = atan(pi.z, pi.x) + PI / 2.;
            float off = PI / 4. + 0.0, range = 0.1;
            float amplifier = 1. - (smoothstep(-range, 0.5, ang + off) -
                smoothstep(-0.4, range, ang - off));
            vec3 dripping = sd_capped_cone(pi, vec3(0., 0., 0.0), vec3(0.0, 0.14, 0.0), 0.4, 0.303) +
                0.011 * (1. - amplifier);
            dripping.z += -0.113;
            float waveFactor = (d > 1. ? 0. : .5);
            float wave = sin(ang * 20. * waveFactor) * .067 +
                sin(ang * 40. * waveFactor + .7) * 0.038 +
                sin(ang * 25. * waveFactor + 0.6) * 0.027;
            wave *= amplifier * 0.6 * smoothstep(-0.35, 0.6, length(p.xz));

            vec3 icingWave = vec3(0, 0, pi.y - (wave + .03));
            vec3 icing = carve(dripping, icingWave, .2);

            top = min(top, icing.z);
            ptop = pi;
        }

        {
            vec3 po = p - vec3(0., 0.2 - wiggle, 0.);
            vec4 ahoge = sdBezier(po, vec3(0., -0.09, 0.), vec3(-0.03, 0.08, -0.01), vec3(-0.08, 0.01 - wigglee * 0.4, 0.));
            ahoge.x -= 0.027 * ahoge.y + (1. - ahoge.y) * 0.008;
            top = smin(top, ahoge.x + 0.003, 0.035);
        }
        res = hit_min(res, Hit(top, ptop, ICING));
        {
            vec3 po = p;
            po.y += wiggl;
            vec3 pt = vec3(abs(po.x), po.yz) + vec3(-0.20, -0.20, 0.14);
            float scale = .22;
            float topping = topping(pt / scale) * scale;
            // res = smin(res, topping, 0.03);
            res = hit_min(res, Hit(topping, pt, TOPPING));

            pt -= vec3(0., -0.02, 0.01);
            pt.yz *= rot(0.2);
            pt.yx *= rot(-0.3);
            float s = 0.09;
            float strawberry = sd_strawberry(pt / s) * s;
            res = hit_min(res, Hit(strawberry, pt, STRAWBERRY));
        }
    }

    return res;
}

Hit trace(in vec3 ro, in vec3 rd) {
    vec2 bbox = ibox(ro, rd, vec3(.80, .8, 0.8));
    if(bbox.x < 0. && bbox.y < 0.) {
        return default_hit();
    }
    RO = ro, RD = rd;
    float t = bbox.x;
    for(int i = min(0, iFrame); i < 100; ++i) {
        vec3 p = ro + rd * t;
        Hit d = map(p);
        if(abs(d.t) < 0.0001) {
            return Hit(t, d.pos, d.id);
        }
        t += d.t;
        if(t > bbox.y) {
            break;
        }
    }
    return default_hit();
}

vec3 get_norm(vec3 p) {
    mat3 k = mat3(p, p, p) - mat3(0.0001);
    return normalize(map(p).t - vec3(map(k[0]).t, map(k[1]).t, map(k[2]).t));
}

mat3 get_cam(vec3 eye, vec3 target) {
    vec3 zaxis = normalize(target - eye);
    vec3 xaxis = normalize(cross(vec3(0., 1., 0.), zaxis));
    vec3 yaxis = cross(zaxis, xaxis);
    return mat3(xaxis, yaxis, zaxis);
}

float ambientOcclusion(vec3 p, vec3 n) {
    const int steps = 4;
    const float delta = 0.15;

    float a = 0.0;
    float weight = 4.;
    for(int i = min(1, iFrame + 1); i <= steps; i++) {
        float d = (float(i) / float(steps)) * delta;
        a += weight * (d - map(p + n * d).t);
        weight *= 0.5;
    }
    return clamp(1.0 - a, 0.0, 1.0);
}

// https://iquilezles.org/articles/rmshadows/
float softshadow(in vec3 ro, in vec3 rd, float mint, float maxt, float w) {
    float res = 1.0;
    float t = mint;
    for(int i = min(0, iFrame); i < 25 && t < maxt; i++) {
        float h = map(ro + t * rd).t;
        res = min(res, h / (w * t));
        t += clamp(h, 0.005, 0.50);
        if(res < -1.0 || t > maxt)
            break;
    }
    res = max(res, -1.0);
    return 0.25 * (1.0 + res) * (1.0 + res) * (2.0 - res);
}

// https://www.shadertoy.com/view/dltGWl
vec3 lighting(
    int type,
    vec3 nor,
    vec3 ldir,
    vec3 rd,
    vec3 lcol,
    vec3 albedo,
    vec3 sscolor,
    vec3 ssradius,
    float roughness,
    float ior
) {
    float ndl = dot(nor, ldir);
    float pndl = clamp(ndl, 0., 1.);
    float nndl = clamp(-ndl, 0., 1.);

    // subsurface scattering
    vec3 sss = .2 * exp(-3. * (nndl + pndl) / (ssradius + .001));

    vec3 h = normalize(ldir - rd); // half vector
    float ndh = dot(nor, h);       // N⋅H

    // ggx / Trowbridge and Reitz specular model approximation
    float g = ndh * ndh * (roughness * roughness - 1.) + 1.;
    float ggx = roughness * roughness / (PI * g * g);

    float fre = 1. + dot(rd, nor);
    float f0 = (ior - 1.) / (ior + 1.);
    f0 = f0 * f0;
    float refl = f0 + (1. - f0) * (1. - roughness) * (1. - roughness) *
        pow(fre, 5.); // reflectivity

    pndl = mix(pndl * 0.5 + 0.5, max(pndl, 0.), 0.35);
    return lcol *
        (pndl * (albedo + refl * ggx) + albedo * sscolor * ssradius * sss);
}

void render(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord / iResolution.xy - .5) * vec2(iResolution.x / iResolution.y, 1.);

    vec3 ro = vec3(0., .4, -3);
    vec3 lo = ro + vec3(0, 0, 1);

    vec2 m = vec2(0., 0.);
    if(iMouse.z > 0.) {
        m = (iMouse.xy / iResolution.xy - .5) * vec2(iResolution.x / iResolution.y, 1.);

        m.x += m.x * PI * 0.5;
        m.y += m.y * PI * 0.7;
    }
    m.x = clamp(m.x, -PI / 3., PI / 3.);
    m.y = clamp(m.y, -PI / 4., 0.2);
    ro.xz *= rot(-m.x);
    ro.zy *= rot(m.y);

    float focal_dist = 1.6;
    mat3 cmat = get_cam(ro, vec3(0., -0.15, 0.));
    vec3 rd = normalize(cmat * vec3(uv, focal_dist));

    vec3 col = vec3(.13);
    vec4 emit = vec4(vec3(0.), 1e9);
    Hit hit = trace(ro, rd);
    vec3 nplane = vec3(0, 1., 0.);
    float plane = -(dot(ro, nplane) + 0.53) / dot(rd, nplane);
    if(plane < hit.t && plane > 0.) {
        hit = Hit(plane, ro + rd * plane, 0u);
    }
    if(hit.t < 1e9) {
        vec3 pos = ro + rd * hit.t;
        vec3 nor = get_norm(pos);
        float shad = dot(nor, normalize(vec3(1., 1., -1.)));
        vec3 albedo = vec3(1.);

        vec3 lpos = vec3(1.1, -0.12, -1.4);
        lpos = vec3(2., 1., -2.6);
        vec3 ldir = normalize(lpos - pos);

        float rou = 1.3, ior = 1.5;
        if(hit.id == BODY) {
            albedo = vec3(1., 0.7, 0.1) * 1.5;
            rou = 0.3;
            ior = 1.3;

            float wiggl = cos(iTime * 11. + PI) * 0.01;

            vec2 p = hit.pos.xy;
            vec2 pp = vec2(abs(p.x), p.y - 0.2) - vec2(0.13, 0.08) + vec2(0., wiggl);
            vec2 ppr = pp;
            if(p.x > 0.) {
                pp.x *= -1.;
            }

            float t = easeInBack(stepNoise(iTime * .5, 2.));
            float shift = t * -0.022;

            vec2 blp = vec2(-pp.y, pp.x) - vec2(0.07, -0.02) - vec2(shift, 0.);
            blp *= rot(-0.4);
            float blink = sd_joint2d(blp, 0.041, 0.4, 0.018);

            vec3 brown = vec3(0.04, 0.015, 0.01) * 1.2;
            float eye = sd_egg2d(pp + vec2(0., -shift), 0.05, 0.07);
            eye = blend(eye, -(pp.y + 0.1), 29.);
            eye = blend(eye, -blink, 80.);
            col = mix(col, brown, step(eye, 0.));
            emit.rgb = mix(emit.rgb, brown, AAstep(eye));
            emit.w = min(emit.w, eye);

            vec2 bp = ppr - vec2(0.03, 0.02) + vec2(0., -shift);
            bp *= rot(1.1);
            float brows = sd_line(bp, 0.023, 0.019);
            brows = blend(brows, -(bp.x + 0.01), 250.);
            brows = blend(brows, eye, -200.);
            brows = blend(brows, -blink, 100.);
            emit.rgb = mix(emit.rgb, brown, AAstep(brows));
            emit.w = min(emit.w, brows);

            float downlight = sd_egg2d(pp - vec2(0., -0.04 + shift), 0.030, 0.02);
            downlight = blend(downlight, eye + 0.01, 330.);
            col = mix(col, brown * 3.0, step(downlight, 0.));
            emit.rgb = mix(emit.rgb, brown * 3.0, AAstep(downlight));

            float highlight = sd_sphere(pp - vec2(-0.02, 0.02), 0.01);
            highlight = blend(highlight, eye + 0.005, 250.);
            emit.rgb = mix(emit.rgb, brown * 10.0, AAstep(highlight));

            vec2 sp = p - vec2(-0.02, 0.15 - wiggl);
            sp *= rot(-0.40);
            float smirk = sd_joint2d(sp.yx, 0.04, -0.40, 0.01);
            sp = vec2(abs(p.x), p.y) - vec2(0.10, 0.151) + vec2(0., wiggl);
            sp *= rot(-2.05);
            float sides = sd_joint2d(sp, .07, 0.41, 0.01);
            smirk = smin(smirk, sides, 0.0002);
            emit.rgb = mix(emit.rgb, brown, AAstep(smirk));
            emit.w = min(emit.w, smirk);

            vec2 pb = vec2(abs(p.x) - 0.13, p.y - 0.02) - vec2(0.11, 0.17) +
                vec2(0., wiggl);
            pb *= vec2(0.6, 1.);
            float blush = sd_sphere(pb, 0.03);
            albedo = mix(albedo, vec3(0.8, 0.2, 0.2), smoothstep(0.11, -0.15, blush));
        }
        if(hit.id == PLATE) {
            albedo = vec3(1.);
        }
        if(hit.id == ICING) {
            albedo = vec3(0.04, 0.015, 0.01) * 1.3;
            rou = 0.02;
            ior = 0.3;
        }
        if(hit.id == TOPPING) {
            albedo = vec3(1.3);
        }
        if(hit.id == STRAWBERRY) {
            albedo = vec3(0.9, 0.0, 0.0);
        }
        vec3 ssr = vec3(1., 0.9, 0.6);
        col = lighting(1, nor, ldir, rd, vec3(1.), albedo, albedo * 0.75, ssr, rou, ior);

        col *= ambientOcclusion(pos, nor);

        float shadow = softshadow(pos + nor * 0.01, normalize(lpos - pos), 0.01, 0.35, 0.40);
        col *= smoothstep(-0.5, 1.0, shadow);
    }
    if(hit.id == 0u) {
        float wiggl = cos(iTime * 11. + PI) * 0.01;
        col = vec3(.4, 0.7, 0.2);
        col *= smoothstep(0.5, 1.2, length(hit.pos.xz));
        col *= smoothstep(-0.5, 1.5, clamp(length(hit.pos.xz - vec2(-0.5, 0.36) - wiggl) - 0.24, 0.2, 1.));
    }

    vec3 background = vec3(1.15, .8, .36) * .9;
    col = mix(col, background, smoothstep(4., 12., hit.t));

    // col = ACESFilm(col);
    col = color2agx(col);
    // col = smoothstep(0., 1., col);

    if(emit.w < 1e9 && hit.pos.z < 0.) {
        col = mix(col, emit.rgb, step(emit.w, 0.));
    }

    // vignette
    vec2 in_uv = fragCoord / iResolution.xy;
    col *= smoothstep(-0.02, .01, in_uv.x * in_uv.y * (1. - in_uv.x) * (1. - in_uv.y));

    col = pow(col, vec3(0.4545));

    fragColor = vec4(col, 1.0);
}

void mainImage(out vec4 O, vec2 C) {
    float px = 1. / AA, i, j;
    vec4 cl2, cl;
    if(AA == 1.) {
        render(cl, C);
        O = cl;
        return;
    }
    for(i = 0.; i < AA + min(iTime, 0.0); i++) {
        for(j = 0.; j < AA; j++) {
            vec2 C2 = vec2(C.x + px * i, C.y + px * j);
            render(cl2, C2);
            cl += cl2;
        }
    }
    cl /= AA * AA;
    O = cl;
}
#include <../common/main_shadertoy.frag>