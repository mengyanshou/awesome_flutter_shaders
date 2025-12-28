// --- Migrate Log ---
// - 将全局数组 verts[] 替换为 getVerts() 函数以兼容 SkSL
// - 初始化所有局部变量以避免未定义行为
// - 修复 shd_polygonal 中的逻辑以正确处理所有点都在平面下方的情况
// --- Migrate Log (EN) ---
// - Replaced global array verts[] with getVerts() function for SkSL compatibility
// - Initialized all local variables to avoid undefined behavior
// - Fixed logic in shd_polygonal to correctly handle case where all points are below the plane

#define PI 3.14159265359
#define PORTAL_POS vec3(0.05,0.9, 0.02)
#define PORTAL_SIZE vec3(0.45,0.75, 0.)
#define START_OFFSET vec3(0.,0.4,1.2)
#define PORTAL_BORDER vec3(0.15,0.15, 0.)
#define PILLAR_WIDTH_HALF .15
#define PILLAR_SPACING 2.1
#define CEILING_HEIGHT 2.5

const int N = 30;

#define NUM_VERTS 4

vec3 getVerts(int index) {
    if (index == 0) return vec3(PORTAL_SIZE.x, -PORTAL_SIZE.y, 0.) + PORTAL_POS;
    if (index == 1) return vec3(-PORTAL_SIZE.x, -PORTAL_SIZE.y, 0.) + PORTAL_POS;
    if (index == 2) return vec3(-PORTAL_SIZE.x, PORTAL_SIZE.y, 0.) + PORTAL_POS;
    if (index == 3) return vec3(PORTAL_SIZE.x, PORTAL_SIZE.y, 0.) + PORTAL_POS;
    return vec3(0.0);
}

float cosine_sine_power_integral_sum(float theta, float cos_theta, float sin_theta,
	int n, float a, float b) {
	float f = a*a + b*b;
	float g = a*cos_theta + b*sin_theta;
	float gsq = g*g;
	float asq = a*a;
	float h = a*sin_theta - b*cos_theta;
	float T = theta;
	float Tsum = 0.0;
	float l = g*h, l2 = b*a;
	int start = 0;

	Tsum = T;
	for (int i = 2; i <= N - 1; i += 2) {
		T = (l + l2 + f*(float(i) - 1.)*T) * (1. / float(i));
		l *= gsq;
		l2 *= asq;
		Tsum += T;
	}
	return Tsum;
}

float P(float theta, float a) {
	return 1.0 / (1.0 + a * theta * theta);
}

float I_org(float theta, float c, float n) {
	float cCos = c * cos(theta);
	return (pow(cCos, n + 2.) - 1.0) / (cCos * cCos - 1.);
}

float evaluateXW(float c, float n) {
	return PI / 4. * pow(1. - pow(c - c / (n - 1.), 2.5), 0.45);
}

float shd_edge_contribution(vec3 v0, vec3 v1, vec3 n, int e) {
	float f = 0.0;
	float cos_theta = 0.0, sin_theta = 0.0;
	vec3 q = cross(v0, v1); //ni
	sin_theta = length(q);
	q = normalize(q);
	cos_theta = dot(v0, v1);

	if (e == 1) {
		f = acos(cos_theta);
	} else {
		vec3 w = vec3(0.0);
		float theta = 0.0;
		theta = acos(cos_theta);
		w = cross(q, v0);
		f = cosine_sine_power_integral_sum(theta, cos_theta, sin_theta, e - 1, dot(v0, n), dot(w, n));
	}
	return f * dot(q, n);
}


void seg_plane_intersection(vec3 v0, vec3 v1, vec3 n, out vec3 q) {
	vec3 vd = v1 - v0;
    float d = dot(vd, n);
    if (abs(d) < 1e-6) {
        q = v0;
        return;
    }
	float t = -dot(v0, n) / d;
	q = v0 + t * vd;
}

float shd_polygonal(vec3 p, vec3 n, bool spc) {
	int i1 = 0;
	int J = NUM_VERTS;
	float sum = 0.;
	vec3 ui0 = vec3(0.0), ui1 = vec3(0.0);
	vec3 vi0 = vec3(0.0), vi1 = vec3(0.0);
	int belowi0 = 1, belowi1 = 1;
    
	for (int j = 0; j < NUM_VERTS; j++) {
		vec3 u = getVerts(j) - p;
		if (dot(u, n) >= 0.0) {
			ui0 = u;
			vi0 = normalize(u);
			belowi0 = 0;
			J = j;
			break;
		}
	}

    if (J >= NUM_VERTS) {
        return 0.;
    }
    
    i1 = J;
    for (int i = 0; i < NUM_VERTS; i++) {
        i1++;
        if (i1 >= NUM_VERTS) i1 = 0;

        ui1 = getVerts(i1) - p;
        belowi1 = int(dot(ui1, n) < 0.);

        if (belowi1 == 0) {
            vi1 = normalize(ui1);
        }

        if (belowi0 != 0 && belowi1 == 0) {
            vec3 vinter = vec3(0.0);
            seg_plane_intersection(ui0, ui1, n, vinter);
            vinter = normalize(vinter + 0.01);
            sum += shd_edge_contribution(vi0, vinter, n, 1);
            vi0 = vinter;
        }
        else if (belowi0 == 0 && belowi1 != 0) {
            seg_plane_intersection(ui0, ui1, n, vi1);
            vi1 = normalize(vi1);
        }
        int K = spc ? N : 1;

        if (belowi0 == 0 || belowi1 == 0) sum += shd_edge_contribution(vi0, vi1, n, K);


        ui0 = ui1;
        vi0 = vi1;
        belowi0 = belowi1;
    }

	return abs(sum) / (2. * PI);
}
