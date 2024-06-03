#include <common/common_header.frag>

#include <Chrome Dino game Common.frag>
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
float velocity(float R) {
    return INITIAL_VELOCITY - 2. * INITIAL_VELOCITY * R;
}

float hash(float n) {
    return fract(sin(n) * 43758.5453123);
}

// Get the y position of the dino
float position(float R) {
    return (R - R * R) * 2. * INITIAL_VELOCITY * INITIAL_VELOCITY / GRAVITY;
}

// Helper function to draw a pixel art sprite
bool drawRect(vec2 uv, vec2 rectPos, vec2 rectSize, vec2 spriteOrigin, vec2 pixelSize) {
    vec2 pixelMin = spriteOrigin + rectPos * pixelSize;
    vec2 pixelMax = pixelMin + pixelSize * rectSize;

    return (uv.x >= pixelMin.x && uv.x <= pixelMax.x && uv.y >= pixelMin.y && uv.y <= pixelMax.y);
}

// Function to draw the dino sprite
float drawDino(vec2 uv, vec2 dinoPos, bool grounded, bool isCrouching, float A, float time) {
    vec4 dino[] = vec4[](vec4(0, 5, 11, 1), vec4(0, 6, 1, 1), vec4(0, 10, 20, 1), vec4(0, 11, 1, 1), vec4(2, 6, 10, 1), vec4(3, 7, 9, 1), vec4(3, 9, 11, 1), vec4(4, 4, 6, 1), vec4(4, 8, 9, 1), vec4(5, 3, 5, 1), vec4(5, 11, 16, 1), vec4(6, 2, 5, 1), vec4(6, 12, 13, 1), vec4(7, 1, 5, 1), vec4(7, 13, 14, 1), vec4(8, 0, 6, 1), vec4(10, 15, 2, 1), vec4(11, 14, 1, 1), vec4(14, 14, 7, 1), vec4(14, 15, 1, 3), vec4(16, 15, 5, 4), vec4(16, 19, 4, 1), vec4(20, 12, 1, 1));

    vec4 dinoRun1[] = vec4[](vec4(0, 5, 11, 1), vec4(0, 6, 1, 1), vec4(2, 6, 10, 1), vec4(3, 7, 9, 1), vec4(3, 10, 17, 1), vec4(3, 11, 1, 2), vec4(4, 4, 6, 1), vec4(4, 8, 9, 2), vec4(5, 3, 5, 1), vec4(5, 11, 16, 1), vec4(6, 2, 5, 1), vec4(6, 12, 13, 1), vec4(7, 1, 5, 1), vec4(7, 13, 14, 1), vec4(8, 0, 6, 1), vec4(10, 15, 2, 1), vec4(11, 14, 1, 1), vec4(13, 9, 1, 1), vec4(14, 14, 7, 1), vec4(14, 15, 1, 3), vec4(16, 15, 5, 4), vec4(16, 19, 4, 1), vec4(20, 12, 1, 1));

    vec4 dinoRun2[] = vec4[](vec4(0, 10, 20, 1), vec4(0, 11, 1, 1), vec4(2, 6, 10, 1), vec4(2, 7, 1, 1), vec4(3, 5, 8, 1), vec4(3, 9, 11, 1), vec4(4, 4, 6, 1), vec4(4, 7, 8, 2), vec4(5, 3, 5, 1), vec4(5, 11, 16, 1), vec4(6, 2, 5, 1), vec4(6, 12, 13, 1), vec4(7, 1, 5, 1), vec4(7, 13, 14, 1), vec4(8, 0, 6, 1), vec4(10, 15, 2, 1), vec4(11, 14, 1, 1), vec4(12, 8, 1, 1), vec4(14, 14, 7, 1), vec4(14, 15, 1, 3), vec4(16, 15, 5, 4), vec4(16, 19, 4, 1), vec4(20, 12, 1, 1));

    vec4 crouch1[] = vec4[](vec4(0, 11, 8, 2), vec4(0, 13, 2, 2), vec4(4, 13, 18, 2), vec4(5, 29, 19, 2), vec4(5, 31, 2, 2), vec4(6, 15, 18, 2), vec4(6, 21, 18, 3), vec4(6, 24, 2, 2), vec4(8, 12, 14, 1), vec4(8, 17, 16, 4), vec4(9, 24, 15, 5), vec4(9, 31, 13, 2), vec4(10, 10, 12, 2), vec4(10, 37, 15, 2), vec4(10, 39, 10, 6), vec4(10, 45, 2, 6), vec4(12, 8, 10, 2), vec4(12, 33, 10, 4), vec4(14, 6, 8, 2), vec4(14, 45, 11, 8), vec4(14, 53, 9, 2), vec4(16, 4, 8, 2), vec4(18, 2, 6, 2), vec4(20, 0, 6, 2), vec4(20, 41, 5, 4), vec4(22, 14, 2, 1), vec4(22, 35, 1, 2), vec4(22, 39, 3, 2));

    vec4 crouch2[] = vec4[](vec4(0, 17, 24, 2), vec4(0, 19, 2, 2), vec4(4, 11, 4, 2), vec4(4, 13, 2, 2), vec4(4, 19, 20, 2), vec4(5, 29, 19, 2), vec4(5, 31, 2, 2), vec4(6, 21, 18, 2), vec4(8, 12, 14, 5), vec4(8, 23, 16, 1), vec4(9, 24, 15, 5), vec4(9, 31, 13, 2), vec4(10, 10, 12, 2), vec4(10, 37, 15, 2), vec4(10, 39, 10, 6), vec4(10, 45, 2, 6), vec4(12, 8, 10, 2), vec4(12, 33, 10, 4), vec4(14, 6, 8, 2), vec4(14, 45, 11, 8), vec4(14, 53, 9, 2), vec4(16, 4, 8, 2), vec4(18, 2, 6, 2), vec4(20, 0, 6, 2), vec4(20, 41, 5, 4), vec4(22, 14, 2, 3), vec4(22, 35, 1, 2), vec4(22, 39, 3, 2));

    vec4 dead[] = vec4[](vec4(0, 10, 22, 2), vec4(0, 12, 2, 2), vec4(0, 20, 41, 2), vec4(0, 22, 2, 2), vec4(4, 12, 20, 2), vec4(6, 14, 18, 2), vec4(6, 18, 22, 2), vec4(8, 8, 12, 2), vec4(8, 16, 18, 2), vec4(10, 6, 10, 2), vec4(10, 22, 33, 2), vec4(12, 4, 10, 2), vec4(12, 24, 24, 2), vec4(14, 2, 10, 2), vec4(15, 26, 21, 2), vec4(16, 0, 12, 2), vec4(20, 30, 4, 2), vec4(22, 28, 2, 2), vec4(24, 15, 2, 1), vec4(28, 28, 15, 8), vec4(30, 36, 13, 2), vec4(30, 38, 11, 2), vec4(37, 25, 2, 2), vec4(40, 24, 3, 4));

    vec2 pixelSize = vec2(0.01);

    float dinoColor = 1.0;

    for(int i = 0; i < dino.length(); i++) {
        if(drawRect(uv, dino[i].yx, dino[i].wz, dinoPos, pixelSize)) {
            dinoColor = 0.32156;
        }
    }

    float dinoRun1Color = 1.0;

    for(int i = 0; i < dinoRun1.length(); i++) {
        if(drawRect(uv, dinoRun1[i].yx, dinoRun1[i].wz, dinoPos, pixelSize)) {
            dinoRun1Color = 0.32156;
        }
    }

    float dinoRun2Color = 1.0;

    for(int i = 0; i < dinoRun2.length(); i++) {
        if(drawRect(uv, dinoRun2[i].yx, dinoRun2[i].wz, dinoPos, pixelSize)) {
            dinoRun2Color = 0.32156;
        }
    }

    float dinoCrouch1 = 1.0;

    for(int i = 0; i < crouch1.length(); i++) {
        if(drawRect(uv, crouch1[i].yx, crouch1[i].wz, dinoPos, pixelSize * 0.5)) {
            dinoCrouch1 = 0.32156;
        }
    }

    float dinoCrouch2 = 1.0;

    for(int i = 0; i < crouch2.length(); i++) {
        if(drawRect(uv, crouch2[i].yx, crouch2[i].wz, dinoPos, pixelSize * 0.5)) {
            dinoCrouch2 = 0.32156;
        }
    }

    float deadCol = 1.0;

    for(int i = 0; i < dead.length(); i++) {
        if(drawRect(uv, dead[i].yx, dead[i].wz, dinoPos, pixelSize * 0.5)) {
            deadCol = 0.32156;
        }
    }

    if((!grounded || time <= 0.) && A < 0.5) {
        return dinoColor;
    }

    float col = mix(dinoRun1Color, dinoRun2Color, step(0.5, fract(time * 5.)));
    float crouch = mix(dinoCrouch1, dinoCrouch2, step(0.5, fract(time * 5.)));

    if(grounded && isCrouching) {
        col = crouch;
    }

    col = mix(col, deadCol, step(0.5, A));

    return col;
}

float drawFloor(vec2 uv, float time) {
    // Draw the little dots and lines below the main ground line.
    float pixelSize = 0.005;
    float runPos = RUN_SPEED * time;
    float index = floor((uv.x + runPos) * 13.);
    float row = floor(6. * hash(index));
    float len = floor(5. * hash(index * 42.4242));

    vec2 pos = vec2(index / 13. - runPos, 0.2 + (5. - row) * pixelSize);
    vec2 rectSize = vec2(len, 1.);

    float col = 1.0;
    if(drawRect(uv, vec2(0.), rectSize, pos, vec2(pixelSize))) {
        col = 0.32156;
    }

    // Draw the main ground line.
    float bumpLength = 280. * pixelSize;

    float indexBump = floor((uv.x + runPos) / bumpLength);
    float type = floor(3. * hash(indexBump));

    vec4 bump[] = vec4[](vec4(0, 147, 2, 1), vec4(0, 148, 1, 10), vec4(1, 146, 2, 1), vec4(1, 157, 1, 2), vec4(2, 0, 1, 121), vec4(2, 132, 2, 1), vec4(2, 133, 1, 13), vec4(2, 158, 1, 122), vec4(3, 120, 1, 2), vec4(3, 131, 2, 1), vec4(4, 121, 1, 3), vec4(4, 130, 2, 1), vec4(5, 123, 1, 2), vec4(5, 129, 2, 1), vec4(6, 124, 1, 5));

    if(type < 0.4) {
        for(int i = 0; i < bump.length(); i++) {
            if(drawRect(uv, bump[i].yx, bump[i].wz, vec2(indexBump * bumpLength - runPos, 0.2 + 5. * pixelSize), vec2(pixelSize))) {
                col = 0.32156;
            }
        }
    } else if(drawRect(uv, vec2(0.), vec2(280, 1.), vec2(indexBump * bumpLength - runPos, 0.2 + 7. * pixelSize), vec2(pixelSize))) {
        col = 0.32156;
    }

    return col;
}

float drawObstacles(vec2 uv, float time) {

    vec4 cactus1[] = vec4[](vec4(0, 5, 32, 5), vec4(11, 2, 13, 1), vec4(11, 3, 3, 2), vec4(12, 1, 13, 1), vec4(13, 0, 11, 1), vec4(15, 10, 3, 3), vec4(16, 13, 13, 1), vec4(17, 14, 11, 1), vec4(18, 12, 10, 1), vec4(32, 6, 1, 3));

    vec4 cactus2[] = vec4[](vec4(0, 5, 32, 5), vec4(13, 10, 3, 3), vec4(14, 13, 15, 1), vec4(15, 14, 13, 1), vec4(16, 12, 12, 1), vec4(17, 2, 12, 1), vec4(17, 3, 11, 1), vec4(17, 4, 4, 1), vec4(18, 1, 11, 1), vec4(19, 0, 9, 1), vec4(32, 6, 1, 3));

    vec4 cactus3[] = vec4[](vec4(0, 5, 32, 5), vec4(8, 10, 3, 3), vec4(9, 13, 17, 1), vec4(10, 3, 3, 2), vec4(10, 14, 15, 1), vec4(11, 2, 18, 1), vec4(11, 12, 14, 1), vec4(12, 1, 18, 1), vec4(13, 0, 16, 1), vec4(32, 6, 1, 3));

    vec4 cactus4[] = vec4[](vec4(0, 5, 32, 5), vec4(13, 10, 3, 3), vec4(14, 13, 15, 1), vec4(15, 2, 14, 1), vec4(15, 3, 3, 2), vec4(15, 14, 13, 1), vec4(16, 1, 14, 1), vec4(16, 12, 12, 1), vec4(17, 0, 12, 1), vec4(32, 6, 1, 3));

    vec4 cactus5[] = vec4[](vec4(0, 15, 1, 1), vec4(2, 4, 1, 1), vec4(2, 6, 1, 9), vec4(3, 8, 44, 7), vec4(3, 18, 1, 1), vec4(17, 3, 19, 1), vec4(17, 4, 18, 1), vec4(17, 5, 5, 3), vec4(18, 2, 18, 1), vec4(18, 15, 4, 4), vec4(19, 1, 17, 1), vec4(19, 19, 19, 1), vec4(20, 0, 15, 1), vec4(20, 20, 18, 1), vec4(21, 21, 17, 1), vec4(22, 18, 15, 1), vec4(22, 22, 15, 1), vec4(47, 9, 1, 5));

    vec4 cactus6[] = vec4[](vec4(0, 15, 1, 1), vec4(2, 4, 1, 1), vec4(2, 6, 1, 9), vec4(3, 8, 44, 7), vec4(3, 18, 1, 1), vec4(18, 15, 4, 4), vec4(19, 19, 19, 1), vec4(20, 20, 18, 1), vec4(21, 21, 17, 1), vec4(22, 18, 15, 1), vec4(22, 22, 15, 1), vec4(23, 4, 19, 1), vec4(23, 5, 5, 3), vec4(24, 3, 19, 1), vec4(25, 2, 18, 1), vec4(26, 1, 17, 1), vec4(27, 0, 15, 1), vec4(47, 9, 1, 5));

    vec4 cactus7[] = vec4[](vec4(0, 0, 1, 1), vec4(0, 7, 44, 5), vec4(14, 4, 16, 1), vec4(14, 5, 4, 2), vec4(15, 3, 16, 1), vec4(16, 2, 15, 1), vec4(17, 1, 13, 1), vec4(27, 12, 3, 4), vec4(28, 16, 12, 1), vec4(29, 17, 10, 1), vec4(30, 15, 9, 1), vec4(44, 8, 1, 3));

    vec4 cactus8[] = vec4[](vec4(0, 1, 1, 1), vec4(1, 5, 27, 3), vec4(11, 3, 3, 2), vec4(12, 2, 11, 1), vec4(12, 8, 2, 3), vec4(13, 1, 11, 1), vec4(13, 11, 11, 1), vec4(14, 0, 9, 1), vec4(14, 10, 9, 1), vec4(14, 12, 9, 1), vec4(28, 6, 1, 1));

    vec4 bird1[] = vec4[](vec4(0, 8, 11, 1), vec4(1, 9, 10, 1), vec4(3, 10, 8, 1), vec4(4, 11, 7, 1), vec4(5, 12, 6, 2), vec4(5, 14, 5, 1), vec4(5, 15, 4, 2), vec4(6, 17, 3, 1), vec4(6, 18, 1, 2), vec4(8, 7, 3, 1), vec4(8, 18, 1, 3), vec4(9, 6, 4, 1), vec4(10, 0, 1, 6), vec4(11, 1, 1, 5), vec4(12, 2, 1, 4), vec4(13, 3, 1, 3), vec4(14, 4, 1, 2));

    vec4 bird2[] = vec4[](vec4(0, 10, 10, 1), vec4(0, 11, 9, 1), vec4(0, 12, 8, 1), vec4(0, 13, 7, 1), vec4(0, 14, 5, 1), vec4(0, 15, 4, 2), vec4(1, 9, 10, 1), vec4(1, 17, 3, 1), vec4(1, 18, 1, 2), vec4(2, 8, 10, 1), vec4(3, 7, 3, 1), vec4(3, 18, 1, 3), vec4(4, 6, 4, 1), vec4(5, 0, 1, 6), vec4(6, 1, 1, 5), vec4(7, 2, 1, 4), vec4(8, 3, 1, 3), vec4(9, 4, 1, 2), vec4(10, 7, 3, 1));

    float runPos = RUN_SPEED * time;
    float frequency = 0.6;
    float index = floor((uv.x + runPos) * frequency);
    int type = int(7. * hash(index));
    float pixelSize = 0.005;

    if(index / frequency - runPos < iResolution.x / iResolution.y - time * RUN_SPEED) {
        return 1.;
    }

    float col = 1.;
    if(type == 0) {
        for(int i = 0; i < cactus1.length(); i++) {
            if(drawRect(uv, cactus1[i].yx, cactus1[i].wz, vec2(index / frequency - runPos, 0.2), vec2(pixelSize))) {
                col = 0.32156;
            }
        }
    } else if(type == 1) {
        for(int i = 0; i < cactus1.length(); i++) {
            if(drawRect(uv, cactus1[i].yx, cactus1[i].wz, vec2(index / frequency - runPos, 0.2), vec2(pixelSize))) {
                col = 0.32156;
            }
        }
        for(int i = 0; i < cactus2.length(); i++) {
            if(drawRect(uv, cactus2[i].yx, cactus2[i].wz, vec2(index / frequency - runPos + pixelSize * 17., 0.2 + 0. * pixelSize), vec2(pixelSize))) {
                col = 0.32156;
            }
        }
    } else if(type == 2) {
        for(int i = 0; i < cactus1.length(); i++) {
            if(drawRect(uv, cactus1[i].yx, cactus1[i].wz, vec2(index / frequency - runPos, 0.2 + 0. * pixelSize), vec2(pixelSize))) {
                col = 0.32156;
            }
        }
        for(int i = 0; i < cactus3.length(); i++) {
            if(drawRect(uv, cactus3[i].yx, cactus3[i].wz, vec2(index / frequency - runPos + pixelSize * 17., 0.2 + 0. * pixelSize), vec2(pixelSize))) {
                col = 0.32156;
            }
        }
        for(int i = 0; i < cactus4.length(); i++) {
            if(drawRect(uv, cactus4[i].yx, cactus4[i].wz, vec2(index / frequency - runPos + pixelSize * 34., 0.2 + 0. * pixelSize), vec2(pixelSize))) {
                col = 0.32156;
            }
        }
    } else if(type == 3) {
        for(int i = 0; i < cactus5.length(); i++) {
            if(drawRect(uv, cactus5[i].yx, cactus5[i].wz, vec2(index / frequency - runPos, 0.2 + 0. * pixelSize), vec2(pixelSize))) {
                col = 0.32156;
            }
        }
    } else if(type == 4) {
        for(int i = 0; i < cactus5.length(); i++) {
            if(drawRect(uv, cactus5[i].yx, cactus5[i].wz, vec2(index / frequency - runPos, 0.2 + 0. * pixelSize), vec2(pixelSize))) {
                col = 0.32156;
            }
        }
        for(int i = 0; i < cactus6.length(); i++) {
            if(drawRect(uv, cactus6[i].yx, cactus6[i].wz, vec2(index / frequency - runPos + 26. * pixelSize, 0.2 + 0. * pixelSize), vec2(pixelSize))) {
                col = 0.32156;
            }
        }

    } else if(type == 5) {
        for(int i = 0; i < cactus5.length(); i++) {
            if(drawRect(uv, cactus5[i].yx, cactus5[i].wz, vec2(index / frequency - runPos, 0.2 + 0. * pixelSize), vec2(pixelSize))) {
                col = 0.32156;
            }
        }
        for(int i = 0; i < cactus7.length(); i++) {
            if(drawRect(uv, cactus7[i].yx, cactus7[i].wz, vec2(index / frequency - runPos + 26. * pixelSize, 0.2 + 0. * pixelSize), vec2(pixelSize))) {
                col = 0.32156;
            }
        }
        for(int i = 0; i < cactus8.length(); i++) {
            if(drawRect(uv, cactus8[i].yx, cactus8[i].wz, vec2(index / frequency - runPos + 41. * pixelSize, 0.2 + 0. * pixelSize), vec2(pixelSize))) {
                col = 0.32156;
            }
        }
        for(int i = 0; i < cactus6.length(); i++) {
            if(drawRect(uv, cactus6[i].yx, cactus6[i].wz, vec2(index / frequency - runPos + 53. * pixelSize, 0.2 + 0. * pixelSize), vec2(pixelSize))) {
                col = 0.32156;
            }
        }
    } else {
        float birdCol1 = 1.;
        float birdCol2 = 1.;
        vec2 pos = vec2(index / frequency - runPos, 0.2 + 30. * pixelSize);
        for(int i = 0; i < bird1.length(); i++) {
            if(drawRect(uv, bird1[i].yx, bird1[i].wz, pos, vec2(2. * pixelSize))) {
                birdCol1 = 0.32156;
            }
        }
        for(int i = 0; i < bird2.length(); i++) {
            if(drawRect(uv, bird2[i].yx, bird2[i].wz, pos + 10. * vec2(0, pixelSize), vec2(2. * pixelSize))) {
                birdCol2 = 0.32156;
            }
        }
        col = mix(birdCol1, birdCol2, step(0.5, fract(time * 3.)));
    }
    return col;
}

float drawClouds(vec2 uv, float time) {
    vec4 cloud[] = vec4[](vec4(0, 0, 1, 2), vec4(0, 11, 1, 37), vec4(1, 1, 1, 2), vec4(1, 4, 1, 2), vec4(1, 10, 1, 1), vec4(1, 47, 1, 1), vec4(2, 5, 3, 1), vec4(2, 46, 2, 1), vec4(3, 44, 3, 1), vec4(3, 45, 1, 1), vec4(4, 6, 2, 1), vec4(5, 7, 1, 8), vec4(5, 41, 3, 1), vec4(5, 42, 1, 2), vec4(6, 14, 1, 2), vec4(6, 32, 1, 1), vec4(7, 15, 1, 4), vec4(7, 33, 4, 1), vec4(7, 36, 2, 1), vec4(7, 37, 1, 4), vec4(8, 18, 3, 1), vec4(8, 34, 1, 2), vec4(10, 19, 1, 2), vec4(10, 32, 3, 1), vec4(11, 20, 1, 2), vec4(12, 21, 1, 6), vec4(12, 30, 2, 1), vec4(12, 31, 1, 1), vec4(13, 26, 1, 4));
    float runPos = RUN_SPEED * time * 0.5;
    float index = floor((uv.x + runPos) * 3.);
    float cloudY = hash(index) / 3.;
    float type = hash(index * 42.4242);
    float pixelSize = 0.005;

    float col = 1.;

    if(type < 0.2) {
        for(int i = 0; i < cloud.length(); i++) {
            if(drawRect(uv, cloud[i].yx, cloud[i].wz, vec2(index / 3. - runPos, 0.5 + cloudY), vec2(pixelSize))) {
                col = 0.788;
            }
        }
    }

    return col;
}

bool boxesIntersect(vec4 box1, vec4 box2) {
    // Check if one box is to the left of the other
    if(box1.y < box2.x || box2.y < box1.x) {
        return false;
    }

    // Check if one box is above the other
    if(box1.w < box2.z || box2.w < box1.z) {
        return false;
    }

    // Otherwise, the boxes intersect
    return true;
}

bool checkCollision(vec2 dinoPos, bool crouch, float time) {
    vec4 dinoHitbox = vec4(dinoPos.x + 0.02, dinoPos.x + 0.18, dinoPos.y + 0.02, dinoPos.y + 0.2);

    if(crouch) {
        dinoHitbox.w = dinoPos.y + 0.1;
    }

    float runPos = RUN_SPEED * time;
    float frequency = 0.6;
    float index = floor((dinoHitbox.y + runPos) * frequency);
    int type = int(7. * hash(index));
    float pixelSize = 0.005;

    if(index / frequency - runPos < iResolution.x / iResolution.y - time * RUN_SPEED) {
        return false;
    }

    if(type == 0) {
        vec4 hitbox = vec4(index / frequency - runPos, index / frequency - runPos + 15. * pixelSize, 0.2, 0.2 + 33. * pixelSize);
        return boxesIntersect(hitbox, dinoHitbox);
    } else if(type == 1) {
        vec4 hitbox = vec4(index / frequency - runPos, index / frequency - runPos + 32. * pixelSize, 0.2, 0.2 + 33. * pixelSize);
        return boxesIntersect(hitbox, dinoHitbox);
    } else if(type == 2) {
        vec4 hitbox = vec4(index / frequency - runPos, index / frequency - runPos + 49. * pixelSize, 0.2, 0.2 + 33. * pixelSize);
        return boxesIntersect(hitbox, dinoHitbox);
    } else if(type == 3) {
        vec4 hitbox = vec4(index / frequency - runPos, index / frequency - runPos + 23. * pixelSize, 0.2, 0.2 + 48. * pixelSize);
        return boxesIntersect(hitbox, dinoHitbox);
    } else if(type == 4) {
        vec4 hitbox = vec4(index / frequency - runPos, index / frequency - runPos + 49. * pixelSize, 0.2, 0.2 + 48. * pixelSize);
        return boxesIntersect(hitbox, dinoHitbox);
    } else if(type == 5) {
        vec4 hitbox = vec4(index / frequency - runPos + 5. * pixelSize, index / frequency - runPos + 70. * pixelSize, 0.2, 0.2 + 48. * pixelSize);
        return boxesIntersect(hitbox, dinoHitbox);
    }
    vec4 hitbox = vec4(index / frequency - runPos + 5. * pixelSize, index / frequency - runPos + 21. * pixelSize, 0.2 + 30. * pixelSize, 0.2 + 45. * pixelSize);
    return boxesIntersect(hitbox, dinoHitbox);
    return false;
}

int getDigit(int number, int i) {
    float divisor = pow(10.0, float(i));
    int digit = int(float(number) / divisor) % 10;
    return digit;
}

float drawScore(vec2 uv, float time) {
    vec4 num0[] = vec4[](vec4(0, 3, 4, 2), vec4(0, 5, 2, 3), vec4(2, 1, 9, 2), vec4(2, 7, 11, 1), vec4(2, 8, 9, 1), vec4(4, 0, 5, 1), vec4(4, 9, 5, 2), vec4(9, 6, 4, 1), vec4(11, 3, 2, 3));
    vec4 num1[] = vec4[](vec4(0, 0, 2, 11), vec4(2, 4, 11, 3), vec4(9, 2, 2, 2));
    vec4 num2[] = vec4[](vec4(0, 0, 4, 5), vec4(0, 5, 2, 6), vec4(4, 1, 2, 7), vec4(6, 3, 1, 6), vec4(7, 6, 2, 3), vec4(8, 9, 3, 2), vec4(9, 0, 2, 3), vec4(9, 7, 4, 2), vec4(11, 1, 2, 6));
    vec4 num3[] = vec4[](vec4(0, 1, 4, 2), vec4(0, 3, 2, 6), vec4(2, 0, 2, 1), vec4(2, 7, 11, 1), vec4(2, 8, 6, 1), vec4(2, 9, 4, 2), vec4(6, 3, 2, 4), vec4(8, 4, 1, 3), vec4(9, 6, 4, 1), vec4(9, 8, 4, 1), vec4(11, 1, 2, 5), vec4(11, 9, 2, 2));
    vec4 num4[] = vec4[](vec4(0, 6, 13, 3), vec4(4, 0, 3, 3), vec4(4, 3, 2, 3), vec4(4, 9, 2, 2), vec4(7, 1, 2, 2), vec4(8, 3, 3, 2), vec4(10, 5, 3, 1), vec4(11, 4, 2, 1));
    vec4 num5[] = vec4[](vec4(0, 1, 4, 2), vec4(0, 3, 2, 6), vec4(2, 0, 2, 1), vec4(2, 7, 7, 2), vec4(2, 9, 5, 2), vec4(7, 0, 6, 3), vec4(7, 3, 2, 4), vec4(11, 3, 2, 6));
    vec4 num6[] = vec4[](vec4(0, 1, 11, 2), vec4(0, 3, 2, 6), vec4(2, 0, 7, 1), vec4(2, 7, 5, 2), vec4(2, 9, 3, 2), vec4(5, 3, 2, 4), vec4(9, 3, 4, 2), vec4(11, 5, 2, 4));
    vec4 num7[] = vec4[](vec4(0, 3, 5, 3), vec4(5, 4, 2, 4), vec4(7, 6, 2, 3), vec4(9, 0, 4, 3), vec4(9, 7, 4, 4), vec4(11, 3, 2, 4));
    vec4 num8[] = vec4[](vec4(0, 1, 13, 1), vec4(0, 2, 2, 7), vec4(2, 0, 4, 1), vec4(2, 7, 11, 1), vec4(2, 8, 3, 3), vec4(4, 4, 5, 1), vec4(4, 5, 3, 2), vec4(6, 2, 7, 1), vec4(6, 3, 3, 1), vec4(7, 8, 4, 1), vec4(8, 0, 3, 1), vec4(11, 3, 2, 4));
    vec4 num9[] = vec4[](vec4(0, 1, 2, 7), vec4(2, 6, 2, 3), vec4(4, 7, 9, 2), vec4(4, 9, 7, 2), vec4(6, 1, 7, 2), vec4(6, 3, 2, 4), vec4(8, 0, 3, 1), vec4(11, 3, 2, 4));

    vec2 scorePos = vec2(1.6, 0.85);

    float offsetBetweenNumbers = 14. * 0.005;

    int currentScore = min(int(time * 10.), 99999);

    float col = 1.;

    for(int i = 0; i < 5; i++) {
        int digit = getDigit(currentScore, i);
        vec2 pos = scorePos + vec2(-offsetBetweenNumbers * float(i), 0.);
        if(digit == 0) {
            for(int i = 0; i < num0.length(); i++) {
                if(drawRect(uv, num0[i].yx, num0[i].wz, pos, vec2(0.005))) {
                    col = 0.32156;
                }
            }
        } else if(digit == 1) {
            for(int i = 0; i < num1.length(); i++) {
                if(drawRect(uv, num1[i].yx, num1[i].wz, pos, vec2(0.005))) {
                    col = 0.32156;
                }
            }
        } else if(digit == 2) {
            for(int i = 0; i < num2.length(); i++) {
                if(drawRect(uv, num2[i].yx, num2[i].wz, pos, vec2(0.005))) {
                    col = 0.32156;
                }
            }
        } else if(digit == 3) {
            for(int i = 0; i < num3.length(); i++) {
                if(drawRect(uv, num3[i].yx, num3[i].wz, pos, vec2(0.005))) {
                    col = 0.32156;
                }
            }
        } else if(digit == 4) {
            for(int i = 0; i < num4.length(); i++) {
                if(drawRect(uv, num4[i].yx, num4[i].wz, pos, vec2(0.005))) {
                    col = 0.32156;
                }
            }
        } else if(digit == 5) {
            for(int i = 0; i < num5.length(); i++) {
                if(drawRect(uv, num5[i].yx, num5[i].wz, pos, vec2(0.005))) {
                    col = 0.32156;
                }
            }
        } else if(digit == 6) {
            for(int i = 0; i < num6.length(); i++) {
                if(drawRect(uv, num6[i].yx, num6[i].wz, pos, vec2(0.005))) {
                    col = 0.32156;
                }
            }
        } else if(digit == 7) {
            for(int i = 0; i < num7.length(); i++) {
                if(drawRect(uv, num7[i].yx, num7[i].wz, pos, vec2(0.005))) {
                    col = 0.32156;
                }
            }
        } else if(digit == 8) {
            for(int i = 0; i < num8.length(); i++) {
                if(drawRect(uv, num8[i].yx, num8[i].wz, pos, vec2(0.005))) {
                    col = 0.32156;
                }
            }
        } else if(digit == 9) {
            for(int i = 0; i < num9.length(); i++) {
                if(drawRect(uv, num9[i].yx, num9[i].wz, pos, vec2(0.005))) {
                    col = 0.32156;
                }
            }
        }
    }
    return col;
}

vec2 getColor(float R, float time, float A, vec2 fragCoord) {
    vec2 uv = fragCoord.xy / iResolution.xy;

    uv.x *= iResolution.x / iResolution.y;

    // Calculate dino position in normalized device coordinates
    float pos = position(R);
    vec2 dinoPos = vec2(0.2, 0.19 + pos);  // Dino position with some base offset

    bool crouch = texelFetch(iChannel1, ivec2(KEY_DOWN, 0), 0).r > 0.0;
    bool grounded = pos < 0.001;

    // Draw the dino sprite

    float color = drawDino(uv, dinoPos, grounded, crouch, A, time);
    float floorCol = drawFloor(uv, time);
    float cloudCol = drawClouds(uv, time);
    float obstacleCol = drawObstacles(uv, time);
    float scoreCol = drawScore(uv, time);

    float hit = 0.;
    float col = min(color, obstacleCol);
    col = min(col, cloudCol);
    col = min(col, floorCol);
    col = min(col, scoreCol);

    if(checkCollision(dinoPos, crouch, time)) {
        hit = 1.;
    }

    return vec2(col, hit);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // Previous state from the buffer
    vec4 prevState = texture(iChannel0, vec2(0.5, 0.5));
    float R = prevState.r;  // vertical position component (0 to 1)
    float G = prevState.g;  // time
    float A = prevState.w;  // deathTime

    // Time step
    float dt = iTime;

    if(A > 0.5) { // Dino died
        A += dt;
    }

    if(A > 2.5) { // Death pause finished after 1.5 sec
        A = 0.;
        R = 0.;
        G = 0.;
    }

    if(A <= 0.5) {
        G += dt;
    }

    // Check for jump start
    int startJump = 0;

    float upKey = texelFetch(iChannel1, ivec2(KEY_UP, 0), 0).r;

    if((iMouse.z > 0.0 || upKey > 0.0) && R == 0.0 && A < 0.5) {
        startJump = 1;
    }

    // Update position
    if(A < 0.5 && R > 0. || startJump == 1) {
        R += GRAVITY * dt / (2. * INITIAL_VELOCITY);
    }

    // Clamp to ground level
    if(R < 0.0 || R > 1.) {
        R = 0.0;
    }

    vec2 result = getColor(R, G, A, fragCoord);

    if(A < 0.5 && result.y > 0.5) {
        A = 1.;
    }

    // Output new state
    fragColor = vec4(R, G, result.x, A);
}
#include <common/main_shadertoy.frag>