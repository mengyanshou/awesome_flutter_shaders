class ShaderAssets {
  // 初始化包路径
  static void initPackage() {
    package = 'packages/awesome_flutter_shaders/';
  }

  static String package = '';

  // 拼接路径的静态方法
  static String path(String shader) {
    return '$package$shader';
  }

  // 调整后的着色器和通道路径
  static String brokenTimePortal = path('shaders/Broken Time Portal.frag');
  static String brokenTimePortalChannel = path('assets/Noise Image Generator.png');
  static String cubular = path('shaders/cubular.frag');
  static String cubularChannel = path('assets/Cubular.png');
  static String monster = path('shaders/MONSTER.frag');
  static String starandblackhole = path('shaders/star and black hole.frag');
  static String colorfulKaleidoscope7 = path('shaders/colorful Kaleidoscope 7.frag');
  static String baseWarpFbm = path('shaders/Base warp fBM.frag');
  static String baseWarpFbmChannel = path('assets/Base warp fBM.png');
  static String phantomStarForCineShader = path('shaders/Phantom Star for CineShader.frag');
  static String blue = path('shaders/Blue.frag');
  static String mandelbulb = path('shaders/mandelbulb.frag');
  static String raymarchingBasic = path('shaders/Raymarching Basic.frag');
  static String rotateAndPointsCircle = path('shaders/rotate and points circle.frag');
  static String pinku = path('shaders/Pinku.frag');
  static String blackHolesAndCrosses = path('shaders/black holes and crosses.frag');
  static String studiogustoComGooeyCover = path('shaders/Studiogusto.com Gooey Cover.frag');
  static String pageCurl = path('shaders/page_curl.frag');
  static String wall = path('assets/Wall.jpg');
  static String bricks = path('assets/bricks.jpg');
  static String soundEclipseRpm = path('shaders/SoundEclipse rpm.frag');
  static String blackHoleOdeGeodesicSolver = path('assets/Black Hole ODE Geodesic Solver.png');
  static String blackHoleOdeGeodesicSolverFrag = path('shaders/Black Hole ODE Geodesic Solver.frag');
  static String simpleSuperSphericalShading = path('shaders/Simple super spherical shading.frag');
  static String mainSequenceStar = path('shaders/Main Sequence Star.frag');
  static String mainSequenceStarPng = path('assets/Main Sequence Star.png');
  static String wallJpg = path('assets/Wall.jpg');
  static String noiseLab3D = path('shaders/Noise Lab 3D.frag');
  static String fluidSolverBufferA = path('shaders/Fluid solver BufferA.frag');
  static String fluidSolver = path('shaders/Fluid solver.frag');
  static String expansiveReactionDiffusion = path('shaders/expansive reaction-diffusion.frag');
  static String expansiveReactionDiffusionBufferA = path('shaders/expansive reaction-diffusion BufferA.frag');
  static String expansiveReactionDiffusionBufferB = path('shaders/expansive reaction-diffusion BufferB.frag');
  static String expansiveReactionDiffusionBufferC = path('shaders/expansive reaction-diffusion BufferC.frag');
  static String expansiveReactionDiffusionBufferD = path('shaders/expansive reaction-diffusion BufferD.frag');
  static String nosiePng = path('assets/nosie.png');
  static String backPng = path('assets/back.png');
  static String protoplanetBufferA = path('shaders/Protoplanet BufferA.frag');
  static String protoplanet = path('shaders/Protoplanet.frag');
  static String starsAndCosmos8 = path('shaders/stars and cosmos 8.frag');
  static String marioWorld = path('shaders/Mario World.frag');
  static String clouds2D = path('shaders/Clouds-2D.frag');
  static String palaceOfMind = path('shaders/Palace of Mind.frag');
  static String wavyfire = path('shaders/wavyfire.frag');
  static String grayscale = path('shaders/grayscale.frag');
  static String seascape = path('shaders/Seascape.frag');
  static String six = path('shaders/6.frag');
  static String seven = path('shaders/7.frag');
  static String shaderArtCodingIntroduction = path('shaders/Shader Art Coding Introduction.frag');
  static String starleidoscope = path('shaders/Starleidoscope.frag');
  static String deathStar = path('shaders/DeathStar.frag');
  static String octagrams = path('shaders/Octagrams.frag');
  static String rayMarchingPart2 = path('shaders/Ray Marching Part 2.frag');
  static String rayMarchingPart3 = path('shaders/Ray Marching Part 3.frag');
  static String rayMarchingPart4 = path('shaders/Ray Marching Part 4.frag');
  static String warpingProcedural2 = path('shaders/Warping procedural 2.frag');
  static String discoteq2 = path('shaders/Discoteq 2.frag');
  static String devilGlass = path('shaders/Devil Glass.frag');
  static String warp = path('shaders/warp.frag');
  // 'shaders/Input Time.frag'
  static String inputTime = path('shaders/Input Time.frag');
  // 'shaders/electron.frag'
  static String electron = path('shaders/electron.frag');
  // 'shaders/Bubbles.frag'
  static String bubbles = path('shaders/Bubbles.frag');
  // 'shaders/Inverse Bilinear.frag'
  static String inverseBilinear = path('shaders/Inverse Bilinear.frag');
  // 'shaders/Galaxy of Universes.frag'
  static String galaxyOfUniverses = path('shaders/Galaxy of Universes.frag');
  // 'assets/Noise Image Generator.png'
  static String noiseImageGenerator = path('assets/Noise Image Generator.png');
  // 'shaders/Warp Speed 2.frag'
  static String warpSpeed2 = path('shaders/Warp Speed 2.frag');
  // 'shaders/Rainier mood.frag'
  static String rainierMood = path('shaders/Rainier mood.frag');
  // 'shaders/Menger Sponge.frag'
  static String mengerSponge = path('shaders/Menger Sponge.frag');
  // 'shaders/NotSoGreeeen - Chromatic Hole.frag'
  static String notSoGreeeenChromaticHole = path('shaders/NotSoGreeeen - Chromatic Hole.frag');
  // 'shaders/fractal pyramid.frag'
  static String fractalPyramid = path('shaders/fractal pyramid.frag');
  // 'shaders/Mandelbulb Deconstructed.frag'
  static String mandelbulbDeconstructed = path('shaders/Mandelbulb Deconstructed.frag');
  // 'shaders/Mandelbulb - derivative.frag'
  static String mandelbulbDerivative = path('shaders/Mandelbulb - derivative.frag');
  // 'shaders/FWA logo.frag'
  static String fwaLogo = path('shaders/FWA logo.frag');
  // 'shaders/Basic How To Use Buffer Demo BufferA.frag'
  static String basicHowToUseBufferDemoBufferA = path('shaders/Basic How To Use Buffer Demo BufferA.frag');
  // 'shaders/Basic How To Use Buffer Demo.frag'
  static String basicHowToUseBufferDemo = path('shaders/Basic How To Use Buffer Demo.frag');
}
