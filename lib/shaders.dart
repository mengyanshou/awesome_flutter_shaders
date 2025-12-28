// ShaderAssets
class SA {
  static void initPackage() {
    package = 'packages/awesome_flutter_shaders/';
  }

  static String package = '';

  static String path(String shader) {
    return '$package$shader';
  }

  // assets used by shader_widgets
  static String get wall => path('assets/Wall.jpg');
  static String get bricks => path('assets/bricks.jpg');
  static String get blackHoleOdeGeodesicSolver => path('assets/Black Hole ODE Geodesic Solver.png');

  // textures/cubemaps
  static String get textureAbstract1 => path('assets/texture/Abstract1.jpg');
  static String get textureOrganic2 => path('assets/texture/Organic2.jpg');
  static String get textureOrganic3 => path('assets/texture/Organic3.jpg');
  // Stars
  static String get textureStars => path('assets/texture/Stars.jpg');
  static String get textureLichen => path('assets/texture/Lichen.jpg');
  static String get textureRustyMetal => path('assets/texture/Rusty Metal.jpg');
  static String get textureLondon => path('assets/texture/London.jpg');
  static String get textureWood => path('assets/texture/Wood.jpg');
  // Perbbles
  static String get texturePebbles => path('assets/texture/Pebbles.png');
  // Rock Tiles
  static String get textureRockTiles => path('assets/texture/Rock Tiles.jpg');
  //
  static String get cubemapUffiziGallery => path('assets/cubemaps/Uffizi Gallery.png');
  static String get textureRgbaNoiseMedium => path('assets/texture/RGBA Noise Medium.png');
  static String get textureRgbaNoiseSmall => path('assets/texture/RGBA Noise Small.png');
  // Grey Noise Mediu
  static String get textureGreyNoiseMedium => path('assets/texture/Grey Noise Medium.png');

  // a
  // 'shaders/a/Alien ocean.frag'
  static String get v2aAlienOceanBufferA => path('shaders/a/Alien ocean BufferA.frag');
  static String get v2aAlienOcean => path('shaders/a/Alien ocean.frag');
  static String get v2aAlienSpaceJockey => path('shaders/a/Alien Space Jockey.frag');
  static String get v2aAStudyOfGlass => path('shaders/a/a study of glass.frag');
  // shaders/a/Artifact at Sea.frag
  static String get v2aArtifactAtSea => path('shaders/a/Artifact at Sea.frag');
  //

  static String get v2bBallsAreRubbing => path('shaders/b/balls are rubbing.frag');
  static String get v2bBaseWarpFbm => path('shaders/b/Base warp fBM.frag');
  static String get v2bBubbles => path('shaders/b/Bubbles.frag');
  static String get v2bByt3Daily013 => path('shaders/b/Byt3-daily-013.frag');

  static String get v2cColorfulUnderwaterBubblesIi => path('shaders/c/Colorful underwater bubbles II.frag');
  static String get v2cCubeLines => path('shaders/c/Cube lines.frag');
  static String get v2cCubular => path('shaders/c/cubular.frag');
  static String get v2cCineShaderLava => path('shaders/c/CineShader Lava.frag');
  static String get v2cClouds2D => path('shaders/c/Clouds-2D.frag');
  static String get v2cCobwebTest => path('shaders/c/cobweb test.frag');
  static String get v2cCold => path('shaders/c/Cold.frag');

  static String get v2dDevilGlass => path('shaders/d/Devil Glass.frag');
  static String get v2dDiveToCloud => path('shaders/d/Dive to Cloud.frag');
  static String get v2dDullSkullPrometheus => path('shaders/d/DULL SKULL - Prometheus.frag');
  static String get v2dDrifting => path('shaders/d/drifting.frag');

  static String get v2eEd209 => path('shaders/e/ED-209.frag');

  static String get v2fFire => path('shaders/f/Fire.frag');
  static String get v2fFlame => path('shaders/f/Flame.frag');
  static String get v2fFractalPyramid => path('shaders/f/fractal pyramid.frag');
  static String get v2fFullSpectrumCyber => path('shaders/f/Full Spectrum Cyber.frag');

  static String get v2gGradientFlow => path('shaders/g/Gradient Flow.frag');
  static String get v2gGoodbyeDreamClouds => path('shaders/g/Goodbye Dream Clouds.frag');
  static String get v2gGalaxyOfUniverses => path('shaders/g/Galaxy of Universes.frag');
  static String get v2gGhosts => path('shaders/g/Ghosts.frag');
  static String get v2gGalvanize => path('shaders/g/Galvanize.frag');

  static String get v2iInsideTheMandelbulbIiBufferA => path('shaders/i/Inside the mandelbulb II BufferA.frag');
  static String get v2iInsideTheMandelbulbIi => path('shaders/i/Inside the mandelbulb II.frag');
  static String get v2iInputTime => path('shaders/i/Input - Time.frag');
  static String get v2iInverseBilinear => path('shaders/i/Inverse Bilinear.frag');
  static String get v2iInerciaIntendedOne => path('shaders/i/inercia intended one.frag');

  static String get v2lLandmassZMorph => path('shaders/l/Landmass z-morph.frag');
  static String get v2lLetsSelfReflect => path("shaders/l/Let's self reflect.frag");

  static String get v2mMonster => path('shaders/m/MONSTER.frag');
  static String get v2mMandelbulb => path('shaders/m/mandelbulb.frag');
  static String get v2mMandelbulbDeconstructed => path('shaders/m/Mandelbulb Deconstructed.frag');
  static String get v2mMandelbulb3DFractal => path('shaders/m/Mandelbulb 3D Fractal.frag');
  static String get v2mMarioWorld11 => path('shaders/m/Mario World 1-1.frag');
  static String get v2mMoFromWallE => path('shaders/m/M-O (from Wall-E).frag');
  static String get v2mMacOsMonterey2BufferA => path('shaders/m/MacOS Monterey 2 BufferA.frag');
  static String get v2mMacOsMonterey2 => path('shaders/m/MacOS Monterey 2.frag');
  static String get v2mMontereyWannabe => path('shaders/m/Monterey wannabe.frag');
  static String get v2mMacOsMontereyWallpaperBufferA => path('shaders/m/MacOS Monterey wallpaper BufferA.frag');
  static String get v2mMacOsMontereyWallpaper => path('shaders/m/MacOS Monterey wallpaper.frag');

  static String get v2nNoiseLab3D => path('shaders/n/Noise Lab (3D).frag');

  static String get v2oOctagrams => path('shaders/o/Octagrams.frag');
  static String get v2oOrigami => path('shaders/o/Origami.frag');

  static String get v2pPulsarExplained => path('shaders/p/Pulsar Explained.frag');
  static String get v2pPlasmaGlobe => path('shaders/p/Plasma Globe.frag');
  static String get v2pPortal2BoxFlipRotation => path('shaders/p/Portal 2 Box Flip Rotation.frag');
  static String get v2pProteanClouds => path('shaders/p/Protean clouds.frag');
  static String get v2pPerspexWebLattice => path('shaders/p/Perspex Web Lattice.frag');
  static String get v2pPerlinSinSphere => path('shaders/p/Perlin sin sphere.frag');
  static String get v2pSimplePageCurlEffect => path('shaders/p/simple page curl effect.frag');
  static String get v2pParallaxTransitionWithMouse => path('shaders/p/Parallax transition with mouse.frag');
  static String get v2pPalaceOfMind => path('shaders/p/Palace of Mind.frag');
  static String get v2pPigSquad9YearAnniversary => path('shaders/p/Pig Squad 9 Year Anniversary.frag');
  static String get v2pPageCurlEffectOnBall => path('shaders/p/Page Curl Effect on Ball.frag');

  static String get v2rPortalIosAr => path('shaders/p/Portal - iOS AR.frag');
  static String get v2rPortalIosArBufferA => path('shaders/p/Portal - iOS AR BufferA.frag');
  static String get v2rReclaimTheStreets => path('shaders/r/Reclaim the streets.frag');

  static String get phantomStarForCineShader => path('shaders/p/Phantom_Star_for_CineShader.frag');
  static String get pinku => path('shaders/p/Pinku.frag');
  static String get pageCurl => path('shaders/p/page_curl.frag');
  static String get protoplanetBufferA => path('shaders/p/Protoplanet_BufferA.frag');
  static String get protoplanet => path('shaders/p/Protoplanet.frag');

  static String get noiseLab3D => path('shaders/n/Noise_Lab_3D.frag');
  static String get notSoGreeeenChromaticHole => path('shaders/n/NotSoGreeeen_Chromatic Hole.frag');
  static String get octagrams => path('shaders/o/Octagrams.frag');

  static String get shockWaveWithSaturation => path('shaders/s/Shock_Wave_with_Saturation.frag');
  static String get starry => path('shaders/s/Starry_planes.frag');
  static String get starandblackhole => path('shaders/s/star_and_black_hole.frag');
  static String get studiogustoComGooeyCover => path('shaders/s/Studiogusto.com Gooey Cover.frag');
  static String get soundEclipseRpm => path('shaders/s/SoundEclipse_rpm.frag');
  static String get simpleSuperSphericalShading => path('shaders/s/Simple_super_spherical_shading.frag');
  static String get starsAndCosmos8 => path('shaders/s/stars_and_cosmos_8.frag');
  static String get seascape => path('shaders/s/Seascape.frag');
  static String get shaderArtCodingIntroduction => path('shaders/s/Shader_Art_Coding_Introduction.frag');

  static String get wavyfire => path('shaders/w/wavyfire.frag');
  static String get warpingProcedural2 => path('shaders/w/Warping_procedural_2.frag');
}
