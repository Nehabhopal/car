/**
 * NOCTIS SCROLLYTELLING CONFIGURATION
 * All section heights, chapter ranges, frame counts, paths, and callout coordinates.
 */
window.NOCTIS_CONFIG = {
  // Pinned Section Heights
  heroHeight: '600vh',
  dismantleHeight: '350vh',

  // Real Frame counts from generated sequences
  heroFrameCount: 600,
  dismantleFrameCount: 200,

  // Frame Paths (WebP sequences with leading zeros)
  paths: {
    heroDesktop: 'assets/frames/hero/frame_',
    heroMobile: 'assets/frames/hero-mobile/frame_',
    dismantleDesktop: 'assets/frames/dismantle/frame_',
    dismantleMobile: 'assets/frames/dismantle-mobile/frame_',
    cars: 'assets/cars/'
  },

  // Hero Scrollytelling Chapters [startProgress, endProgress]
  heroChapters: [
    { id: 'ch1', start: 0.00, end: 0.12 },
    { id: 'ch2', start: 0.22, end: 0.40 },
    { id: 'ch3', start: 0.50, end: 0.68 },
    { id: 'ch4', start: 0.80, end: 1.00 }
  ],

  // Left HUD Telemetry
  hud: {
    maxSpeed: 118,      // 000 -> 118 KM/H
    maxDistance: 4.2    // 0.0 -> 4.2 KM
  },

  // Dismantle Callouts (appear sequentially after 70% progress)
  // Origin coordinates are percentage [x, y] of canvas stage
  dismantleCallouts: [
    {
      id: 'body',
      revealAt: 0.72,
      origin: { x: 52, y: 34 },
      label: 'BODY',
      desc: 'Carbon composite monocoque'
    },
    {
      id: 'battery',
      revealAt: 0.78,
      origin: { x: 44, y: 62 },
      label: 'BATTERY',
      desc: '110 kWh structural pack'
    },
    {
      id: 'drive',
      revealAt: 0.84,
      origin: { x: 74, y: 55 },
      label: 'DRIVE',
      desc: 'Dual axial-flux motors, 680 kW'
    },
    {
      id: 'light',
      revealAt: 0.90,
      origin: { x: 86, y: 40 },
      label: 'LIGHT',
      desc: 'Single-line LED signature'
    }
  ],

  // Lineup Models & Specs
  lineup: [
    {
      id: 'gt-e',
      num: '01',
      name: 'GT-E',
      tagline: 'The grand tourer.',
      specs: { range: '640 km', accel: '3.1 s', power: '680 kW' },
      colors: ['#121418', '#EDEAE4', '#1A2436', '#261214'],
      image: 'assets/cars/gt-e.webp'
    },
    {
      id: 's',
      num: '02',
      name: 'S',
      tagline: 'Four doors, no compromise.',
      specs: { range: '600 km', accel: '3.6 s', power: '520 kW' },
      colors: ['#EDEAE4', '#07080A', '#1F2833', '#393E46'],
      image: 'assets/cars/s.webp'
    },
    {
      id: 'x',
      num: '03',
      name: 'X',
      tagline: 'Higher, never heavier.',
      specs: { range: '560 km', accel: '4.2 s', power: '480 kW' },
      colors: ['#0A1128', '#121418', '#EDEAE4', '#2B2D42'],
      image: 'assets/cars/x.webp'
    },
    {
      id: 'r',
      num: '04',
      name: 'R',
      tagline: 'Built for the track.',
      specs: { range: '420 km', accel: '2.4 s', power: '900 kW' },
      colors: ['#0E0E10', '#E1251B', '#1E1E24', '#EDEAE4'],
      image: 'assets/cars/r.webp'
    },
    {
      id: 'one',
      num: '05',
      name: 'ONE',
      tagline: 'The future, early.',
      specs: { range: 'Concept', accel: 'Sub 2.0 s', power: 'All-Solid' },
      colors: ['#D0D5DD', '#121418', '#CFE3FF', '#475467'],
      image: 'assets/cars/one.webp'
    }
  ]
};
