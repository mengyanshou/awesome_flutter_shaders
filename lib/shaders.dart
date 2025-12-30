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
  // Grey Noise Small
  static String get textureGreyNoiseSmall => path('assets/texture/Grey Noise Small.png');

  /// a
  static String get aLotOfSpheres => path('shaders/a/A lot of spheres.frag');
  static String get alienOceanBufferA => path('shaders/a/Alien ocean BufferA.frag');
  static String get alienOcean => path('shaders/a/Alien ocean.frag');
  static String get alienSpaceJockey => path('shaders/a/Alien Space Jockey.frag');
  static String get aStudyOfGlass => path('shaders/a/a study of glass.frag');
  static String get artifactAtSea => path('shaders/a/Artifact at Sea.frag');
  static String get alphaClip1BitDissolve => path('shaders/a/Alpha Clip 1 bit dissolve.frag');
  static String get angel => path('shaders/a/Angel.frag');
  static String get arcadePacman => path('shaders/a/Arcade Pacman.frag');
  static String get atmosphereSystemTest => path('shaders/a/Atmosphere system test.frag');

  /// b
  static String get ballsAreRubbing => path('shaders/b/balls are rubbing.frag');
  static String get baseWarpFbm => path('shaders/b/Base warp fBM.frag');
  static String get bubbles => path('shaders/b/Bubbles.frag');
  static String get byt3Daily013 => path('shaders/b/Byt3-daily-013.frag');
  static String get balaroBackgroundShaders => path('shaders/b/Balatro Background Shaders.frag');
  static String get blackHoleOdeGeodesicSolver => path('shaders/b/Black Hole ODE Geodesic Solver.frag');
  static String get brokenTimeGate => path('shaders/b/Broken Time Gate.frag');
  static String get bumpedSinusoidalWarp => path('shaders/b/Bumped Sinusoidal Warp.frag');
  static String get buoy => path('shaders/b/Buoy.frag');

  /// c
  static String get colorfulUnderwaterBubblesIi => path('shaders/c/Colorful underwater bubbles II.frag');
  static String get cubeLines => path('shaders/c/Cube lines.frag');
  static String get cubular => path('shaders/c/cubular.frag');
  static String get cineShaderLava => path('shaders/c/CineShader Lava.frag');
  static String get clouds2D => path('shaders/c/Clouds-2D.frag');
  static String get cobwebTest => path('shaders/c/cobweb test.frag');
  static String get cold => path('shaders/c/Cold.frag');
  static String get combustibleVoronoi => path('shaders/c/Combustible Voronoi.frag');
  static String get crosswarpTransition => path('shaders/c/Crosswarp transition.frag');
  static String get curlNoiseImageTransition => path('shaders/c/Curl noise Image transition.frag');

  // d
  static String get devilGlass => path('shaders/d/Devil Glass.frag');
  static String get diveToCloud => path('shaders/d/Dive to Cloud.frag');
  static String get dullSkullPrometheus => path('shaders/d/DULL SKULL - Prometheus.frag');
  static String get drifting => path('shaders/d/drifting.frag');
  static String get darkTransit => path('shaders/d/Dark Transit.frag');
  static String get desireCrystal => path('shaders/d/Desire Crystal.frag');
  static String get digitalBrain => path('shaders/d/Digital Brain.frag');
  static String get dodecahedronBufferA => path('shaders/d/dodecahedron͏ BufferA.frag');
  static String get dodecahedron => path('shaders/d/dodecahedron͏.frag');
  static String get driveHome6RainWindow => path('shaders/d/Drive Home 6 - Rain Window.frag');
  static String get dustyNebula4 => path('shaders/d/Dusty nebula 4.frag');

  static String get ed209 => path('shaders/e/ED-209.frag');
  static String get entryLevel => path('shaders/e/EntryLevel.frag');

  // f
  static String get fire => path('shaders/f/Fire.frag');
  static String get flame => path('shaders/f/Flame.frag');
  static String get fractalPyramid => path('shaders/f/fractal pyramid.frag');
  static String get fullSpectrumCyber => path('shaders/f/Full Spectrum Cyber.frag');
  static String get fracturedOrbBufferA => path('shaders/f/Fractured Orb BufferA.frag');
  static String get fracturedOrb => path('shaders/f/Fractured Orb.frag');

  static String get gradientFlow => path('shaders/g/Gradient Flow.frag');
  static String get goodbyeDreamClouds => path('shaders/g/Goodbye Dream Clouds.frag');
  static String get galaxyOfUniverses => path('shaders/g/Galaxy of Universes.frag');
  static String get ghosts => path('shaders/g/Ghosts.frag');
  static String get galvanize => path('shaders/g/Galvanize.frag');
  // h
  static String get hell => path('shaders/h/Hell.frag');

  // i(sorted)
  static String get inerciaIntendedOne => path('shaders/i/inercia intended one.frag');
  static String get inkBlotSpread => path('shaders/i/Ink Blot Spread.frag');
  static String get inputTime => path('shaders/i/Input - Time.frag');
  static String get insideTheMandelbulbIiBufferA => path('shaders/i/Inside the mandelbulb II BufferA.frag');
  static String get insideTheMandelbulbIi => path('shaders/i/Inside the mandelbulb II.frag');
  static String get inverseBilinear => path('shaders/i/Inverse Bilinear.frag');
  static String get ionize => path('shaders/i/Ionize.frag');

  // l
  static String get landmassZMorph => path('shaders/l/Landmass z-morph.frag');
  static String get letsSelfReflect => path("shaders/l/Let's self reflect.frag");
  // 'shaders/l/Lights in Smoke.frag'
  static String get lightInSmoke => path('shaders/l/Lights in Smoke.frag');

  // m
  static String get monster => path('shaders/m/MONSTER.frag');
  static String get mandelbulb => path('shaders/m/mandelbulb.frag');
  static String get mandelbulbDeconstructed => path('shaders/m/Mandelbulb Deconstructed.frag');
  static String get mandelbulb3DFractal => path('shaders/m/Mandelbulb 3D Fractal.frag');
  static String get marioWorld11 => path('shaders/m/Mario World 1-1.frag');
  static String get moFromWallE => path('shaders/m/M-O (from Wall-E).frag');
  static String get macOsMonterey2BufferA => path('shaders/m/MacOS Monterey 2 BufferA.frag');
  static String get macOsMonterey2 => path('shaders/m/MacOS Monterey 2.frag');
  static String get montereyWannabe => path('shaders/m/Monterey wannabe.frag');
  static String get macOsMontereyWallpaperBufferA => path('shaders/m/MacOS Monterey wallpaper BufferA.frag');
  static String get macOsMontereyWallpaper => path('shaders/m/MacOS Monterey wallpaper.frag');
  static String get metalVortex => path('shaders/m/Metal Vortex.frag');

  // n
  static String get noiseLab3D => path('shaders/n/Noise Lab (3D).frag');
  static String get notSoGreeeenChromaticHole => path('shaders/n/NotSoGreeeen_Chromatic Hole.frag');

  // o
  static String get octagrams => path('shaders/o/Octagrams.frag');
  static String get origami => path('shaders/o/Origami.frag');

  // p (sorted)
  static String get pageCurlEffectOnBall => path('shaders/p/Page Curl Effect on Ball.frag');
  static String get palaceOfMind => path('shaders/p/Palace of Mind.frag');
  static String get parallaxTransitionWithMouse => path('shaders/p/Parallax transition with mouse.frag');
  static String get perlinSinSphere => path('shaders/p/Perlin sin sphere.frag');
  static String get perspexWebLattice => path('shaders/p/Perspex Web Lattice.frag');
  static String get phantomStarForCineShader => path('shaders/p/Phantom Star for CineShader.frag');
  static String get pigSquad9YearAnniversary => path('shaders/p/Pig Squad 9 Year Anniversary.frag');
  static String get pistonsWithMotionBlur => path('shaders/p/Pistons with Motion Blur.frag');
  static String get plasmaGlobe => path('shaders/p/Plasma Globe.frag');
  static String get portalIosArBufferA => path('shaders/p/Portal - iOS AR BufferA.frag');
  static String get portalIosAr => path('shaders/p/Portal - iOS AR.frag');
  static String get portal2BoxFlipRotation => path('shaders/p/Portal 2 Box Flip Rotation.frag');
  static String get proteanClouds => path('shaders/p/Protean clouds.frag');
  static String get pulsarExplained => path('shaders/p/Pulsar Explained.frag');
  // 'shaders/p/Pistons with Motion Blur.frag'

  static String get reclaimTheStreets => path('shaders/r/Reclaim the streets.frag');
  static String get rotateAndPointsCircle => path('shaders/r/Rotate And Points Circle.frag');
  static String get redBlueSwirl => path('shaders/r/Red-Blue Swirl.frag');
  static String get raymarchingBasic => path('shaders/r/Raymarching Basic.frag');
  static String get rainierMood => path('shaders/r/Rainier mood.frag');
  static String get rainforestBufferA => path('shaders/r/Rainforest BufferA.frag');
  static String get rainforest => path('shaders/r/Rainforest.frag');

  static String get pinku => path('shaders/p/Pinku.frag');
  static String get pageCurl => path('shaders/p/page_curl.frag');
  static String get protoplanetBufferA => path('shaders/p/Protoplanet_BufferA.frag');
  static String get protoplanet => path('shaders/p/Protoplanet.frag');

  // s
  static String get simplePageCurlEffect => path('shaders/p/simple page curl effect.frag');
  static String get shockWaveWithSaturation => path('shaders/s/Shock Wave with Saturation.frag');
  static String get simpleRippleShader => path('shaders/s/Simple ripple shader.frag');
  static String get singularity => path('shaders/s/Singularity.frag');
  static String get spaceCurvature => path('shaders/s/Space Curvature.frag');
  static String get sphereGears => path('shaders/s/Sphere Gears.frag');
  static String get seascape => path('shaders/s/Seascape.frag');
  static String get serverRoom => path('shaders/s/Server Room.frag');
  static String get shaderArtCodingIntroduction => path('shaders/s/Shader Art Coding Introduction.frag');
  static String get simpleRefractionTest => path('shaders/s/simple refraction test.frag');
  static String get splitPrism => path('shaders/s/Split Prism.frag');
  static String get spreadingFrost => path('shaders/s/Spreading Frost.frag');
  static String get starfieldNew => path('shaders/s/starfield new.frag');

  static String get starry => path('shaders/s/Starry_planes.frag');
  static String get starandblackhole => path('shaders/s/star_and_black_hole.frag');
  static String get studiogustoComGooeyCover => path('shaders/s/Studiogusto.com Gooey Cover.frag');
  static String get soundEclipseRpm => path('shaders/s/SoundEclipse_rpm.frag');
  static String get simpleSuperSphericalShading => path('shaders/s/Simple_super_spherical_shading.frag');
  static String get starsAndCosmos8 => path('shaders/s/stars_and_cosmos_8.frag');

  // t
  static String get tmGyroids => path('shaders/t/tm gyroids.frag');
  static String get transitionBurning => path('shaders/t/Transition Burning.frag');
  static String get transitionSst => path('shaders/t/Transition SST.frag');
  static String get transitionWithImage => path('shaders/t/Transition with image.frag');
  static String get tunnelCable => path('shaders/t/Tunnel Cable.frag');
  static String get tissue => path('shaders/t/Tissue.frag');
  static String get tieFighters => path('shaders/t/TIE Fighters.frag');
  static String get theSunTheSkyAndTheClouds => path('shaders/t/The sun, the sky and the clouds.frag');

  // u
  static String get undergroundPassagewayBufferA => path('shaders/u/Underground Passageway BufferA.frag');
  static String get undergroundPassageway => path('shaders/u/Underground Passageway.frag');
  static String get undularSubstratum => path('shaders/u/Undular Substratum.frag');
  static String get uiNoiseHalo => path('shaders/u/UI noise halo.frag');

  // v
  static String get veryFastProceduralOcean => path('shaders/v/Very fast procedural ocean.frag');

  // w
  static String get warpedExtrudedSkewedGrid => path('shaders/w/Warped Extruded Skewed Grid.frag');
  static String get warpingProcedural2 => path('shaders/w/Warping - procedural 2.frag');
  static String get water2D => path('shaders/w/Water2D.frag');
  static String get wavyfire => path('shaders/w/wavyfire.frag');
  static String get whereTheRiverGoes => path('shaders/w/Where the River Goes.frag');

  // z
  static String get zippyZaps => path('shaders/z/Zippy Zaps.frag');
}
