#define NORMAL_STRENGTH 2.0
#define NORMAL_TWEAK 0.6
#define NORMAL_OFFSET 0.002
#define SCALE 5.0

//Simplex Noise from https://www.shadertoy.com/view/Msf3WH
vec2 hash( vec2 p ) 
{
	p = vec2( dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)) );
	return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

//Simplex Noise from https://www.shadertoy.com/view/Msf3WH
float simplexNoise( in vec2 p )
{
    const float K1 = 0.366025404; // (sqrt(3)-1)/2;
    const float K2 = 0.211324865; // (3-sqrt(3))/6;

	vec2  i = floor( p + (p.x+p.y)*K1 );
    vec2  a = p - i + (i.x+i.y)*K2;
    float m = step(a.y,a.x); 
    vec2  o = vec2(m,1.0-m);
    vec2  b = a - o + K2;
	vec2  c = a - 1.0 + 2.0*K2;
    vec3  h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );
	vec3  n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
    return dot( n, vec3(70.0) );
}

//Color Variant A
vec3 sampleGreatSpotASmoothstepFilter(vec2 uv)
{
    vec2 imageSize = vec2(20, 11);
    const vec3 image[220] = vec3[](
    vec3(0.725,0.671, 0.718),vec3(0.694,0.482, 0.427),vec3(0.910,0.812, 0.784),vec3(0.686,0.502, 0.396),vec3(0.733,0.580, 0.447),vec3(0.655,0.482, 0.329),vec3(0.769,0.576, 0.451),vec3(0.643,0.463, 0.349),vec3(0.627,0.498, 0.431),vec3(0.816,0.753, 0.765),vec3(0.643,0.490, 0.408),vec3(0.561,0.424, 0.349),vec3(0.663,0.471, 0.365),vec3(0.655,0.514, 0.463),vec3(0.706,0.584, 0.533),vec3(0.690,0.545, 0.478),vec3(0.631,0.529, 0.486),vec3(0.659,0.506, 0.341),vec3(0.859,0.769, 0.831),vec3(0.490,0.365, 0.267),
    vec3(0.808,0.608, 0.482),vec3(0.706,0.612, 0.627),vec3(0.702,0.549, 0.420),vec3(0.667,0.525, 0.384),vec3(0.690,0.565, 0.502),vec3(0.796,0.565, 0.435),vec3(0.502,0.380, 0.282),vec3(0.631,0.502, 0.435),vec3(0.529,0.400, 0.251),vec3(0.631,0.494, 0.471),vec3(0.675,0.569, 0.580),vec3(0.612,0.510, 0.510),vec3(0.631,0.522, 0.447),vec3(0.671,0.475, 0.314),vec3(0.737,0.525, 0.400),vec3(0.659,0.510, 0.408),vec3(0.647,0.482, 0.380),vec3(0.620,0.447, 0.310),vec3(0.498,0.380, 0.294),vec3(1.000,0.882, 0.824),
    vec3(0.490,0.314, 0.204),vec3(0.910,0.918, 1.000),vec3(0.690,0.553, 0.439),vec3(0.867,0.792, 0.898),vec3(0.859,0.863, 1.000),vec3(0.659,0.529, 0.518),vec3(0.773,0.722, 0.761),vec3(0.659,0.510, 0.439),vec3(0.745,0.714, 0.898),vec3(0.675,0.529, 0.451),vec3(0.706,0.694, 0.855),vec3(0.639,0.525, 0.522),vec3(0.702,0.486, 0.306),vec3(0.671,0.455, 0.192),vec3(0.675,0.588, 0.635),vec3(0.635,0.431, 0.173),vec3(0.678,0.612, 0.710),vec3(0.737,0.478, 0.247),vec3(0.667,0.494, 0.357),vec3(0.620,0.443, 0.235),
    vec3(0.835,0.533, 0.271),vec3(0.835,0.533, 0.271),vec3(1.000,0.973, 0.949),vec3(1.000,0.973, 0.949),vec3(0.663,0.416, 0.106),vec3(0.980,1.000, 1.000),vec3(0.769,0.639, 0.455),vec3(0.980,1.000, 1.000),vec3(0.643,0.400, 0.122),vec3(0.980,1.000, 1.000),vec3(0.776,0.522, 0.173),vec3(0.737,0.467, 0.106),vec3(0.773,0.373, 0.051),vec3(0.690,0.329, 0.051),vec3(1.000,0.973, 0.949),vec3(0.400,0.086, 0.008),vec3(0.400,0.086, 0.008),vec3(0.729,0.478, 0.271),vec3(0.616,0.561, 0.651),vec3(0.561,0.392, 0.243),
    vec3(0.980,1.000, 1.000),vec3(0.796,0.325, 0.035),vec3(0.929,0.831, 0.749),vec3(0.753,0.498, 0.188),vec3(0.706,0.243, 0.000),vec3(0.827,0.675, 0.573),vec3(0.533,0.173, 0.000),vec3(0.690,0.467, 0.118),vec3(0.671,0.490, 0.345),vec3(0.886,0.686, 0.408),vec3(0.980,1.000, 1.000),vec3(0.980,1.000, 1.000),vec3(0.510,0.392, 0.220),vec3(0.788,0.616, 0.357),vec3(0.616,0.282, 0.020),vec3(1.000,0.973, 0.949),vec3(0.667,0.408, 0.086),vec3(0.886,0.686, 0.408),vec3(0.682,0.427, 0.251),vec3(0.600,0.424, 0.275),
    vec3(0.718,0.502, 0.294),vec3(0.682,0.506, 0.424),vec3(0.486,0.227, 0.027),vec3(0.776,0.596, 0.510),vec3(0.753,0.651, 0.557),vec3(0.537,0.192, 0.031),vec3(0.804,0.612, 0.471),vec3(0.631,0.416, 0.259),vec3(0.886,0.686, 0.408),vec3(0.886,0.686, 0.408),vec3(0.757,0.651, 0.620),vec3(0.749,0.545, 0.294),vec3(0.706,0.514, 0.282),vec3(0.878,0.667, 0.388),vec3(0.773,0.490, 0.188),vec3(0.804,0.631, 0.376),vec3(0.784,0.557, 0.314),vec3(0.490,0.318, 0.129),vec3(0.627,0.506, 0.282),vec3(0.400,0.086, 0.008),
    vec3(0.400,0.157, 0.035),vec3(0.804,0.667, 0.682),vec3(1.000,1.000, 0.722),vec3(0.894,0.776, 0.761),vec3(1.000,1.000, 1.000),vec3(0.776,0.600, 0.471),vec3(0.718,0.529, 0.408),vec3(0.812,0.675, 0.561),vec3(0.686,0.475, 0.329),vec3(0.675,0.463, 0.271),vec3(1.000,0.973, 0.949),vec3(0.784,0.706, 0.631),vec3(0.980,1.000, 1.000),vec3(0.655,0.494, 0.373),vec3(0.737,0.549, 0.302),vec3(0.792,0.675, 0.627),vec3(0.937,0.686, 0.388),vec3(0.588,0.235, 0.075),vec3(0.400,0.086, 0.008),vec3(0.541,0.239, 0.082),
    vec3(0.851,0.698, 0.561),vec3(0.902,0.710, 0.569),vec3(0.780,0.592, 0.459),vec3(0.851,0.698, 0.796),vec3(0.843,0.663, 0.643),vec3(0.651,0.490, 0.380),vec3(0.941,0.792, 0.627),vec3(0.710,0.545, 0.518),vec3(0.714,0.537, 0.369),vec3(0.835,0.533, 0.271),vec3(0.800,0.737, 0.796),vec3(0.435,0.204, 0.110),vec3(0.553,0.318, 0.180),vec3(0.667,0.396, 0.216),vec3(0.400,0.086, 0.008),vec3(0.400,0.086, 0.008),vec3(0.702,0.471, 0.251),vec3(0.792,0.545, 0.349),vec3(0.451,0.110, 0.004),vec3(0.698,0.569, 0.345),
    vec3(0.831,0.729, 0.882),vec3(0.686,0.447, 0.227),vec3(0.859,0.702, 0.576),vec3(0.725,0.353, 0.090),vec3(0.725,0.506, 0.298),vec3(1.000,0.886, 0.859),vec3(0.616,0.373, 0.169),vec3(0.796,0.600, 0.424),vec3(0.569,0.255, 0.071),vec3(0.655,0.486, 0.396),vec3(0.682,0.510, 0.306),vec3(0.725,0.529, 0.345),vec3(0.863,0.612, 0.286),vec3(0.729,0.435, 0.184),vec3(0.667,0.353, 0.184),vec3(0.808,0.549, 0.376),vec3(0.800,0.522, 0.302),vec3(0.690,0.537, 0.416),vec3(0.659,0.365, 0.161),vec3(0.565,0.451, 0.365),
    vec3(0.522,0.306, 0.133),vec3(0.714,0.620, 0.592),vec3(0.800,0.612, 0.420),vec3(0.835,0.612, 0.298),vec3(0.969,0.765, 0.639),vec3(0.678,0.424, 0.192),vec3(0.725,0.455, 0.227),vec3(0.698,0.522, 0.412),vec3(0.682,0.561, 0.518),vec3(0.620,0.431, 0.192),vec3(0.729,0.612, 0.549),vec3(0.780,0.659, 0.541),vec3(0.741,0.475, 0.110),vec3(0.737,0.565, 0.443),vec3(0.741,0.486, 0.204),vec3(0.804,0.604, 0.357),vec3(0.808,0.686, 0.604),vec3(0.820,0.675, 0.529),vec3(0.698,0.451, 0.286),vec3(0.694,0.584, 0.502),
    vec3(0.831,0.588, 0.310),vec3(0.769,0.635, 0.537),vec3(0.898,0.710, 0.455),vec3(0.863,0.796, 0.973),vec3(0.627,0.443, 0.310),vec3(0.722,0.482, 0.235),vec3(0.980,1.000, 1.000),vec3(0.639,0.471, 0.290),vec3(0.659,0.506, 0.443),vec3(0.651,0.384, 0.114),vec3(0.706,0.608, 0.600),vec3(0.725,0.514, 0.294),vec3(0.820,0.753, 0.773),vec3(0.631,0.533, 0.502),vec3(0.859,0.655, 0.467),vec3(0.980,1.000, 1.000),vec3(0.835,0.671, 0.533),vec3(0.482,0.365, 0.298),vec3(0.573,0.384, 0.153),vec3(0.737,0.588, 0.537));
    int xIndex = int(floor(uv.x * imageSize.x - 0.5));
    int yIndex = int(floor(uv.y * imageSize.y - 0.5));
    vec3 sample00 = image[clamp(yIndex, 0, 10) * 20 + clamp(xIndex, 0, 19)];
    vec3 sample10 = image[clamp(yIndex, 0, 10) * 20 + clamp(xIndex + 1, 0, 19)];
    vec3 sample01 = image[clamp(yIndex + 1, 0, 10) * 20 + clamp(xIndex, 0, 19)];
    vec3 sample11 = image[clamp(yIndex + 1, 0, 10) * 20 + clamp(xIndex + 1, 0, 19)];
    float xFactor = smoothstep(0.0, 1.0, fract(uv.x * imageSize.x - 0.5));
    float yFactor = smoothstep(0.0, 1.0, fract(uv.y * imageSize.y - 0.5));
    vec3 interpolated = mix(mix(sample00, sample10, xFactor), mix(sample01, sample11, xFactor), yFactor);
    return interpolated;
}

//Color Variant B
vec3 sampleGreatSpotBSmoothstepFilter(vec2 uv)
{
    vec2 imageSize = vec2(20, 11);
    const vec3 image[220] = vec3[](
    vec3(0.933,0.745, 0.580),vec3(0.749,0.627, 0.643),vec3(0.902,0.765, 0.616),vec3(0.827,0.694, 0.557),vec3(0.682,0.506, 0.373),vec3(0.624,0.439, 0.259),vec3(0.718,0.545, 0.373),vec3(0.502,0.369, 0.263),vec3(0.592,0.471, 0.365),vec3(0.635,0.502, 0.471),vec3(0.659,0.518, 0.541),vec3(0.647,0.506, 0.529),vec3(0.655,0.518, 0.459),vec3(0.718,0.553, 0.510),vec3(0.710,0.612, 0.631),vec3(0.600,0.478, 0.392),vec3(0.671,0.525, 0.455),vec3(0.608,0.471, 0.400),vec3(0.533,0.416, 0.325),vec3(0.463,0.341, 0.263),
    vec3(1.000,0.639, 0.286),vec3(0.827,0.573, 0.490),vec3(0.424,0.294, 0.231),vec3(0.545,0.416, 0.361),vec3(0.714,0.580, 0.541),vec3(0.471,0.349, 0.306),vec3(0.718,0.588, 0.522),vec3(0.675,0.549, 0.482),vec3(0.729,0.584, 0.482),vec3(0.655,0.537, 0.455),vec3(0.584,0.420, 0.376),vec3(0.647,0.478, 0.384),vec3(0.573,0.435, 0.376),vec3(0.475,0.388, 0.322),vec3(0.522,0.439, 0.345),vec3(0.663,0.498, 0.380),vec3(0.663,0.494, 0.400),vec3(0.702,0.525, 0.388),vec3(0.624,0.455, 0.384),vec3(0.553,0.361, 0.220),
    vec3(0.875,0.792, 0.659),vec3(0.702,0.647, 0.592),vec3(0.776,0.671, 0.667),vec3(0.776,0.663, 0.580),vec3(0.851,0.663, 0.565),vec3(0.753,0.620, 0.537),vec3(0.718,0.588, 0.502),vec3(0.573,0.443, 0.353),vec3(0.698,0.553, 0.486),vec3(0.635,0.490, 0.380),vec3(0.675,0.569, 0.545),vec3(0.702,0.675, 0.753),vec3(0.698,0.518, 0.376),vec3(0.659,0.447, 0.290),vec3(0.671,0.502, 0.341),vec3(0.651,0.459, 0.302),vec3(0.624,0.482, 0.369),vec3(0.639,0.604, 0.588),vec3(0.651,0.490, 0.412),vec3(0.580,0.439, 0.337),
    vec3(0.941,0.973, 1.000),vec3(1.000,1.000, 1.000),vec3(0.925,0.906, 1.000),vec3(0.894,0.906, 1.000),vec3(0.863,0.894, 1.000),vec3(1.000,1.000, 1.000),vec3(1.000,1.000, 1.000),vec3(0.945,0.745, 0.412),vec3(0.945,0.745, 0.412),vec3(0.745,0.627, 0.541),vec3(0.667,0.467, 0.216),vec3(0.733,0.498, 0.165),vec3(0.663,0.435, 0.149),vec3(0.769,0.502, 0.216),vec3(0.745,0.494, 0.259),vec3(0.722,0.486, 0.239),vec3(0.824,0.533, 0.278),vec3(0.710,0.467, 0.278),vec3(0.580,0.400, 0.275),vec3(0.627,0.471, 0.408),
    vec3(0.714,0.541, 0.310),vec3(0.714,0.482, 0.247),vec3(0.878,0.698, 0.580),vec3(0.910,0.702, 0.584),vec3(0.729,0.471, 0.165),vec3(0.569,0.278, 0.000),vec3(0.494,0.255, 0.039),vec3(0.486,0.247, 0.039),vec3(0.580,0.365, 0.133),vec3(0.678,0.533, 0.475),vec3(0.710,0.475, 0.133),vec3(0.698,0.510, 0.325),vec3(0.737,0.412, 0.094),vec3(0.792,0.443, 0.125),vec3(0.671,0.333, 0.075),vec3(0.690,0.412, 0.067),vec3(0.722,0.502, 0.267),vec3(0.765,0.541, 0.310),vec3(0.655,0.459, 0.302),vec3(0.643,0.478, 0.325),
    vec3(1.000,0.780, 0.600),vec3(0.847,0.486, 0.153),vec3(0.878,0.706, 0.537),vec3(0.808,0.553, 0.306),vec3(0.620,0.243, 0.000),vec3(0.949,0.835, 0.671),vec3(0.557,0.224, 0.047),vec3(0.667,0.306, 0.055),vec3(0.643,0.435, 0.239),vec3(0.725,0.643, 0.573),vec3(0.718,0.580, 0.404),vec3(0.643,0.459, 0.294),vec3(0.788,0.604, 0.369),vec3(0.663,0.471, 0.263),vec3(0.792,0.545, 0.243),vec3(0.878,0.686, 0.353),vec3(0.914,0.675, 0.380),vec3(0.788,0.620, 0.412),vec3(0.627,0.471, 0.306),vec3(0.400,0.282, 0.133),
    vec3(0.557,0.435, 0.420),vec3(0.859,0.773, 0.761),vec3(0.937,0.831, 0.812),vec3(0.518,0.333, 0.286),vec3(0.765,0.596, 0.494),vec3(0.627,0.467, 0.345),vec3(0.682,0.482, 0.392),vec3(0.639,0.416, 0.208),vec3(0.447,0.137, 0.000),vec3(0.639,0.463, 0.325),vec3(0.643,0.463, 0.329),vec3(0.635,0.525, 0.439),vec3(0.886,0.737, 0.475),vec3(0.812,0.678, 0.439),vec3(0.933,0.639, 0.376),vec3(0.847,0.714, 0.518),vec3(0.800,0.671, 0.553),vec3(0.643,0.431, 0.231),vec3(0.459,0.200, 0.071),vec3(0.424,0.169, 0.055),
    vec3(0.600,0.451, 0.400),vec3(1.000,1.000, 1.000),vec3(0.569,0.447, 0.400),vec3(1.000,1.000, 1.000),vec3(0.694,0.545, 0.412),vec3(0.847,0.714, 0.675),vec3(0.725,0.537, 0.369),vec3(0.714,0.541, 0.420),vec3(0.431,0.349, 0.384),vec3(0.945,0.745, 0.412),vec3(0.678,0.443, 0.204),vec3(0.510,0.161, 0.016),vec3(0.945,0.745, 0.412),vec3(0.945,0.745, 0.412),vec3(0.392,0.110, 0.012),vec3(0.392,0.110, 0.012),vec3(0.392,0.110, 0.012),vec3(0.686,0.204, 0.055),vec3(0.604,0.318, 0.114),vec3(0.502,0.259, 0.145),
    vec3(0.906,0.616, 0.290),vec3(0.918,0.847, 0.757),vec3(0.863,0.616, 0.482),vec3(1.000,0.824, 0.682),vec3(0.847,0.639, 0.455),vec3(0.902,0.714, 0.655),vec3(0.643,0.471, 0.349),vec3(0.976,0.859, 0.835),vec3(0.620,0.471, 0.322),vec3(0.733,0.631, 0.624),vec3(0.702,0.600, 0.529),vec3(0.588,0.447, 0.369),vec3(0.745,0.557, 0.439),vec3(0.780,0.533, 0.302),vec3(0.843,0.522, 0.318),vec3(0.824,0.522, 0.322),vec3(0.765,0.553, 0.341),vec3(0.749,0.565, 0.361),vec3(0.737,0.522, 0.286),vec3(0.643,0.427, 0.286),
    vec3(0.816,0.494, 0.306),vec3(0.859,0.624, 0.365),vec3(0.800,0.541, 0.282),vec3(0.824,0.600, 0.369),vec3(0.796,0.541, 0.278),vec3(0.753,0.463, 0.231),vec3(0.380,0.196, 0.047),vec3(0.576,0.294, 0.141),vec3(0.490,0.231, 0.071),vec3(0.592,0.216, 0.043),vec3(0.694,0.341, 0.125),vec3(0.682,0.510, 0.341),vec3(0.698,0.502, 0.259),vec3(0.698,0.435, 0.220),vec3(0.631,0.290, 0.157),vec3(0.600,0.337, 0.161),vec3(0.710,0.455, 0.263),vec3(0.733,0.490, 0.380),vec3(0.549,0.357, 0.125),vec3(0.561,0.412, 0.275),
    vec3(0.859,0.765, 0.686),vec3(0.933,0.820, 0.843),vec3(0.549,0.549, 0.537),vec3(0.886,0.761, 0.698),vec3(0.612,0.545, 0.467),vec3(0.816,0.671, 0.643),vec3(0.776,0.624, 0.431),vec3(0.557,0.533, 0.498),vec3(0.765,0.690, 0.718),vec3(0.686,0.604, 0.557),vec3(0.722,0.612, 0.498),vec3(0.773,0.659, 0.584),vec3(0.843,0.714, 0.592),vec3(0.824,0.706, 0.553),vec3(0.835,0.706, 0.573),vec3(0.580,0.522, 0.490),vec3(0.694,0.624, 0.549),vec3(0.506,0.498, 0.467),vec3(0.624,0.522, 0.506),vec3(0.667,0.592, 0.561));
    int xIndex = int(floor(uv.x * imageSize.x - 0.5));
    int yIndex = int(floor(uv.y * imageSize.y - 0.5));
    vec3 sample00 = image[clamp(yIndex, 0, 10) * 20 + clamp(xIndex, 0, 19)];
    vec3 sample10 = image[clamp(yIndex, 0, 10) * 20 + clamp(xIndex + 1, 0, 19)];
    vec3 sample01 = image[clamp(yIndex + 1, 0, 10) * 20 + clamp(xIndex, 0, 19)];
    vec3 sample11 = image[clamp(yIndex + 1, 0, 10) * 20 + clamp(xIndex + 1, 0, 19)];
    float xFactor = smoothstep(0.0, 1.0, fract(uv.x * imageSize.x - 0.5));
    float yFactor = smoothstep(0.0, 1.0, fract(uv.y * imageSize.y - 0.5));
    vec3 interpolated = mix(mix(sample00, sample10, xFactor), mix(sample01, sample11, xFactor), yFactor);
    return interpolated;
}

//Flowfield - X Component, Y Component, Turbulence Intensity
vec3 sampleFlowfieldBilinearFilter(vec2 uv)
{
    vec2 imageSize = vec2(20, 11);
    const vec3 image[220] = vec3[](
    vec3(-0.020,-0.035, 0.839),vec3(-0.090,-0.082, 0.839),vec3(-0.106,0.027, 0.557),vec3(-0.059,0.106, 0.557),vec3(-0.051,0.004, 0.525),vec3(-0.122,-0.129, 0.525),vec3(-0.161,-0.043, 0.525),vec3(-0.075,0.137, 0.776),vec3(-0.020,0.129, 0.612),vec3(-0.035,-0.035, 0.612),vec3(-0.090,-0.035, 0.612),vec3(-0.098,0.067, 0.612),vec3(-0.106,0.043, 0.580),vec3(-0.090,0.012, 0.839),vec3(-0.090,0.004, 0.839),vec3(-0.059,-0.043, 0.839),vec3(-0.020,-0.075, 0.839),vec3(0.027,0.020, 0.839),vec3(0.020,0.051, 0.557),vec3(0.012,0.020, 0.557),
    vec3(-0.067,-0.004, 0.557),vec3(-0.114,-0.020, 0.557),vec3(-0.161,0.012, 0.278),vec3(-0.090,0.020, 0.278),vec3(-0.059,0.027, 0.278),vec3(-0.145,-0.004, 0.278),vec3(-0.231,0.004, 0.278),vec3(-0.184,0.059, 0.278),vec3(-0.090,0.043, 0.243),vec3(-0.090,0.004, 0.243),vec3(-0.137,0.027, 0.243),vec3(-0.176,0.059, 0.243),vec3(-0.200,0.043, 0.322),vec3(-0.192,0.051, 0.580),vec3(-0.208,0.020, 0.580),vec3(-0.192,-0.043, 0.839),vec3(-0.200,-0.067, 0.557),vec3(-0.153,0.043, 0.557),vec3(-0.122,0.059, 0.278),vec3(-0.067,0.020, 0.278),
    vec3(-0.051,0.012, 0.278),vec3(-0.067,0.035, 0.000),vec3(-0.075,-0.012, 0.000),vec3(-0.051,-0.004, 0.000),vec3(-0.082,0.043, 0.031),vec3(-0.169,0.106, 0.031),vec3(-0.263,0.027, 0.031),vec3(-0.208,-0.035, 0.031),vec3(-0.075,0.004, 0.063),vec3(-0.067,0.035, 0.063),vec3(-0.145,0.082, 0.063),vec3(-0.231,0.137, 0.063),vec3(-0.333,0.153, 0.063),vec3(-0.404,0.114, 0.063),vec3(-0.451,0.027, 0.322),vec3(-0.404,-0.043, 0.580),vec3(-0.341,-0.067, 0.278),vec3(-0.263,-0.012, 0.000),vec3(-0.161,-0.004, 0.000),vec3(-0.114,-0.020, 0.000),
    vec3(0.020,0.012, 0.000),vec3(0.043,0.020, 0.000),vec3(0.035,-0.043, 0.000),vec3(0.027,-0.027, 0.000),vec3(0.027,0.090, 0.031),vec3(-0.012,0.192, 0.031),vec3(-0.035,-0.035, 0.278),vec3(-0.004,-0.145, 0.278),vec3(-0.004,-0.020, 0.063),vec3(-0.051,0.098, 0.063),vec3(-0.122,0.200, 0.243),vec3(-0.216,0.263, 0.243),vec3(-0.341,0.286, 0.063),vec3(-0.451,0.161, 0.063),vec3(-0.467,-0.051, 0.322),vec3(-0.325,-0.169, 0.580),vec3(-0.208,-0.169, 0.000),vec3(-0.137,-0.137, 0.000),vec3(-0.075,-0.106, 0.000),vec3(-0.020,-0.075, 0.000),
    vec3(0.004,-0.012, 0.000),vec3(0.027,0.012, 0.000),vec3(0.051,-0.051, 0.000),vec3(0.114,-0.067, 0.322),vec3(0.145,0.106, 0.384),vec3(0.153,0.145, 0.094),vec3(0.200,-0.059, 0.384),vec3(0.169,-0.114, 0.384),vec3(0.098,0.027, 0.255),vec3(0.082,0.137, 0.031),vec3(-0.004,0.231, 0.031),vec3(0.043,0.302, 0.031),vec3(0.114,0.310, 0.063),vec3(0.176,0.106, 0.322),vec3(0.145,-0.255, 0.839),vec3(0.114,-0.310, 0.839),vec3(0.082,-0.255, 0.000),vec3(0.075,-0.169, 0.000),vec3(0.043,-0.137, 0.000),vec3(0.035,-0.090, 0.322),
    vec3(-0.004,-0.020, 0.322),vec3(-0.004,0.012, 0.322),vec3(-0.020,-0.067, 0.322),vec3(-0.051,-0.051, 0.643),vec3(0.043,0.122, 0.675),vec3(0.106,0.051, 0.384),vec3(0.098,-0.067, 0.675),vec3(0.137,-0.075, 0.969),vec3(0.129,0.043, 0.710),vec3(0.114,0.137, 0.710),vec3(0.169,0.208, 0.710),vec3(0.247,0.184, 0.710),vec3(0.396,0.137, 0.580),vec3(0.435,-0.043, 0.839),vec3(0.420,-0.184, 0.839),vec3(0.278,-0.231, 0.839),vec3(0.216,-0.216, 0.322),vec3(0.129,-0.161, 0.322),vec3(0.137,-0.090, 0.322),vec3(0.075,-0.035, 0.643),
    vec3(0.012,0.020, 0.643),vec3(0.004,0.004, 0.643),vec3(0.020,0.012, 0.643),vec3(-0.067,-0.004, 0.643),vec3(-0.035,0.035, 0.969),vec3(0.059,0.004, 0.675),vec3(0.035,-0.035, 0.969),vec3(-0.067,-0.075, 0.969),vec3(-0.075,0.098, 0.710),vec3(0.059,0.122, 0.710),vec3(0.106,0.114, 0.710),vec3(0.200,0.075, 0.482),vec3(0.325,0.012, 0.322),vec3(0.365,-0.082, 0.322),vec3(0.341,-0.122, 0.322),vec3(0.255,-0.129, 0.322),vec3(0.161,-0.106, 0.643),vec3(0.129,-0.122, 0.643),vec3(0.161,-0.090, 0.643),vec3(0.153,0.004, 0.643),
    vec3(0.027,0.020, 0.969),vec3(0.051,0.012, 0.969),vec3(0.035,-0.004, 0.969),vec3(0.035,-0.004, 0.969),vec3(0.027,0.004, 0.969),vec3(0.043,0.004, 0.969),vec3(0.035,0.004, 0.969),vec3(-0.082,0.035, 0.675),vec3(-0.129,0.059, 0.710),vec3(-0.067,0.027, 0.710),vec3(0.051,0.020, 0.710),vec3(0.129,-0.012, 0.255),vec3(0.224,-0.075, 0.063),vec3(0.286,-0.090, 0.063),vec3(0.271,-0.043, 0.322),vec3(0.161,-0.012, 0.322),vec3(0.090,-0.020, 0.969),vec3(0.027,-0.090, 0.969),vec3(-0.067,-0.075, 0.969),vec3(-0.075,0.098, 0.969),
    vec3(-0.020,0.004, 0.839),vec3(0.004,0.012, 0.839),vec3(-0.004,-0.004, 0.557),vec3(-0.012,0.020, 0.557),vec3(-0.012,0.004, 0.525),vec3(0.043,-0.004, 0.525),vec3(0.035,0.043, 0.525),vec3(-0.098,0.184, 0.776),vec3(-0.294,0.114, 0.612),vec3(-0.255,-0.098, 0.612),vec3(-0.043,-0.122, 0.612),vec3(0.059,-0.090, 0.612),vec3(0.192,-0.145, 0.580),vec3(0.239,-0.098, 0.839),vec3(0.161,0.027, 0.839),vec3(0.114,0.106, 0.839),vec3(0.043,0.051, 0.839),vec3(-0.043,0.004, 0.839),vec3(-0.129,0.012, 0.557),vec3(-0.114,0.051, 0.557),
    vec3(-0.208,0.043, 0.557),vec3(-0.216,0.027, 0.557),vec3(-0.247,0.051, 0.278),vec3(-0.224,0.027, 0.278),vec3(-0.137,-0.043, 0.278),vec3(-0.012,-0.043, 0.278),vec3(0.027,0.067, 0.278),vec3(-0.004,0.294, 0.278),vec3(-0.012,0.114, 0.243),vec3(-0.059,-0.216, 0.243),vec3(-0.020,-0.224, 0.243),vec3(0.035,-0.145, 0.243),vec3(-0.059,-0.161, 0.322),vec3(-0.090,0.020, 0.580),vec3(-0.090,0.106, 0.580),vec3(-0.027,0.114, 0.839),vec3(-0.012,0.098, 0.557),vec3(-0.137,0.106, 0.557),vec3(-0.231,0.051, 0.278),vec3(-0.200,0.043, 0.278),
    vec3(-0.208,0.051, 0.278),vec3(-0.231,0.098, 0.000),vec3(-0.263,0.027, 0.000),vec3(-0.247,-0.043, 0.000),vec3(-0.169,-0.129, 0.031),vec3(-0.082,-0.106, 0.031),vec3(-0.035,0.090, 0.031),vec3(0.027,0.184, 0.031),vec3(0.129,0.012, 0.063),vec3(0.106,-0.184, 0.063),vec3(0.075,-0.192, 0.063),vec3(-0.004,-0.098, 0.063),vec3(-0.106,-0.051, 0.063),vec3(-0.153,0.043, 0.063),vec3(-0.075,0.067, 0.322),vec3(0.051,0.067, 0.580),vec3(-0.012,0.153, 0.278),vec3(-0.122,0.216, 0.000),vec3(-0.192,0.090, 0.000),vec3(-0.216,0.012, 0.000));
    int xIndex = int(floor(uv.x * imageSize.x - 0.5));
    int yIndex = int(floor(uv.y * imageSize.y - 0.5));
    vec3 sample00 = image[clamp(yIndex, 0, 10) * 20 + clamp(xIndex, 0, 19)];
    vec3 sample10 = image[clamp(yIndex, 0, 10) * 20 + clamp(xIndex + 1, 0, 19)];
    vec3 sample01 = image[clamp(yIndex + 1, 0, 10) * 20 + clamp(xIndex, 0, 19)];
    vec3 sample11 = image[clamp(yIndex + 1, 0, 10) * 20 + clamp(xIndex + 1, 0, 19)];
    float xFactor = fract(uv.x * imageSize.x - 0.5);
    float yFactor = fract(uv.y * imageSize.y - 0.5);
    vec3 interpolated = mix(mix(sample00, sample10, xFactor), mix(sample01, sample11, xFactor), yFactor);
    return interpolated;
}

//Pseudo height used in normalmapping
float FauxHeightFromColor(vec3 color)
{
    return max(min(color.x, color.y), color.z);
}

//3-component version of pow used in tonemapping
vec3 powRGB(vec3 color, vec3 exponents)
{
    return vec3(pow(color.x, exponents.x), pow(color.y, exponents.y), pow(color.z, exponents.z));
}

//Recreation of Quake lava/water/portal distortion effect
vec2 QuakeLavaUV(vec2 coords, float amplitude, float speed, float frequency, float time)
{
    float scaledTime = time * speed;
    vec2 scaledCoords = coords * frequency;
    float x = sin(scaledTime + scaledCoords.x) * amplitude;
    float y = sin(scaledTime + scaledCoords.y) * amplitude;
    return coords + vec2(y, x);
}

//Seed used to chech if resolution was changed
float SeedFromResolution(vec3 resolution) {
    return resolution.x-resolution.y;
}

vec2 LandscapeUV(vec2 fragCoord, vec3 resolution)
{
    return resolution.x>resolution.y ? fragCoord.xy/resolution.xy : vec2(1.0 - fragCoord.y/resolution.y, fragCoord.x/resolution.x);
}

//UV proportional to the window size but maintaining aspect ratio
vec2 CenteredSquareUV(vec2 fragCoord, vec3 resolution)
{
    float shorterSide = min(resolution.x, resolution.y);
    float longerSide = max(resolution.x, resolution.y);
    float eccentricity = ((longerSide - shorterSide) / shorterSide) *0.5;
    vec2 offset = vec2(-eccentricity, 0.0);
    if(resolution.x < resolution.y)
    {
        offset = vec2( 0.0, -eccentricity);
    }
       
    return fragCoord / shorterSide + offset;
}
