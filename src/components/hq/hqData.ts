export type HQTimeOfDay = 'day' | 'night';
export type HQViewMode = 'exterior' | 'interior';
export type HQInteriorLightingMode = 'architectural' | 'holo-focus';

export interface HQInteriorVantage {
  id: string;
  label: string;
  zoneId: string;
  cameraPos: [number, number, number];
  cameraTarget: [number, number, number];
}

export interface HQZone {
  id: string;
  number: string;
  name: string;
  architecturalLabel: string;
  shortDescription: string;
  architecturalFeature: string;
  interiorHighlight: string;
  /** World-space marker & highlight anchor */
  anchor: [number, number, number];
  /** Ideal camera position when inspecting this zone */
  cameraPos: [number, number, number];
  /** Camera look-at target when inspecting this zone */
  cameraTarget: [number, number, number];
  /** Subtle highlight ring radius in world units */
  highlightRadius: number;
}

export const HQ_ZONES: HQZone[] = [
  {
    id: 'shivaji-monument',
    number: '01',
    name: 'Chhatrapati Shivaji Maharaj Singhasan & Jiretop',
    architecturalLabel: 'Grand Ceremonial Axis · Symbol of Courage & Expansion',
    shortDescription:
      'Standing at the heart of the NEXUS arrival plaza, the Royal Maratha Singhasan, Bhagwa Saffron Jiretop, and Bhavani Talwar honor Chhatrapati Shivaji Maharaj as an eternal symbol of courage, sovereignty, vision, and fearless global expansion.',
    architecturalFeature:
      'Sculpted 24-petal antique-gold Lotus Prabhavali, crimson velvet Singhasan, brass Chaurang, Bhagwa & gold-zari Jiretop with jeweled Sirpech and Kavadyaanchi Maal, crimson-sheathed Bhavani Talwar, purple Shela, and golden Mojari atop the engraved "॥ छत्रपती शिवाजी महाराज ॥" pedestal.',
    interiorHighlight:
      'Open-air ceremonial monument court showcasing the Royal Maratha Singhasan, Bhagwa Jiretop, and Bhavani Talwar framed by illuminated water cascades and golden promenade steps.',
    anchor: [0, 8.6, 15.8],
    cameraPos: [3.2, 7.6, 23.2],
    cameraTarget: [0, 5.9, 15.8],
    highlightRadius: 6.4,
  },
  {
    id: 'innovation-centre',
    number: '02',
    name: 'NEXUS Cathedral Spire',
    architecturalLabel: 'Central Arched Crown Tower · Levels 01–18',
    shortDescription:
      'The soaring sculptural heart of the conceptual campus—crowned with the illuminated NEXUS emblem and a floating golden halo ring representing unified global ambition.',
    architecturalFeature:
      'Tapered curved glass cathedral spire framed by twin sweeping satin-silver arch fins, golden LED rib lighting, and a suspended mid-tower elliptical halo.',
    interiorHighlight:
      'Multi-floor stylized holographic desks and dual-monitor workstations, volumetric Innovation Hall globe table, mid-spire holographic boardroom projection, spiral stair, illuminated elevator light columns, and glass elevators.',
    anchor: [0, 20.5, 4.2],
    cameraPos: [16, 18.0, 28],
    cameraTarget: [0, 15.0, 0],
    highlightRadius: 6.4,
  },
  {
    id: 'research-development',
    number: '03',
    name: 'West Wing · Build & Innovate',
    architecturalLabel: 'West Curved Glass Pavilion · R&D Engineering',
    shortDescription:
      'A sweeping two-level curved glass pavilion emblazoned with "NEXUS · Build · Innovate · Inspire", envisioned for deep systems engineering, AI research, and hardware prototyping.',
    architecturalFeature:
      'Curved reflective glass drum wrapped by the continuous S-curve satin-silver fascia ribbon, golden rim illumination, rooftop botanical trees, and a sculptural roof fin.',
    interiorHighlight:
      'Stylized cyan holographic engineering desks, spatial holographic CAD collaboration table, 4 rear edge-compute server racks, articulated robotics bay, and suspended architectural ring light fixtures.',
    anchor: [-17.5, 8.4, 9.6],
    cameraPos: [-28, 12.2, 23.5],
    cameraTarget: [-17.5, 5.4, 4.2],
    highlightRadius: 7.4,
  },
  {
    id: 'creative-studio',
    number: '04',
    name: 'East Wing · Global Ecosystem',
    architecturalLabel: 'East Curved Glass Pavilion · Creative Studio',
    shortDescription:
      'Mirroring the western wing with "A Global Ecosystem for a Greater Tomorrow", this luminous glass pavilion houses visual design, storytelling, and creative collaboration.',
    architecturalFeature:
      'Symmetrical double-height curved glass facade crowned with rooftop gardens, diagonal champagne buttress struts, and warm architectural cornice lighting.',
    interiorHighlight:
      'Gold-accented holographic creative desks, spatial 3D holographic critique table on Level 2, illuminated gallery walls with linear picture lights, architectural ceiling light rings, softboxes, and espresso bar.',
    anchor: [17.5, 8.4, 9.6],
    cameraPos: [28, 12.2, 23.5],
    cameraTarget: [17.5, 5.4, 4.2],
    highlightRadius: 7.4,
  },
  {
    id: 'global-collaboration',
    number: '05',
    name: 'Elevated Skybridges',
    architecturalLabel: 'Symmetrical Twin Skywalk Spans · +32m',
    shortDescription:
      'Twin suspended glass skybridges linking the central NEXUS spire shoulders directly to both West and East wings so builders, designers, and researchers connect effortlessly.',
    architecturalFeature:
      'Glazed structural skywalk tubes accented with champagne ribs and continuous warm golden soffit light strips.',
    interiorHighlight:
      'Panoramic glazed walkways lined with cool-cyan architectural floor guide lighting bridging the central spire directly into the upper R&D and Creative Studio decks.',
    anchor: [-12.6, 12.2, 2.8],
    cameraPos: [-16, 15.2, 24],
    cameraTarget: [-11.5, 10.8, 2.5],
    highlightRadius: 3.8,
  },
  {
    id: 'learning-knowledge',
    number: '06',
    name: 'Grand Circular Atrium',
    architecturalLabel: 'Central Rotunda Lobby & Floating Canopy Ring',
    shortDescription:
      'A welcoming civic-scale arrival rotunda directly behind the monument steps—conceived for open study forums, mentorship, libraries, and public architectural dialogues.',
    architecturalFeature:
      'Wide cantilevered elliptical entrance halo canopy lined with double golden light rings and rooftop botanical greenery.',
    interiorHighlight:
      'Concierge reception desk topped with a floating holographic campus directory, multi-tier suspended architectural halo chandelier, recessed floor guide ring, illuminated timber library, and visitor lounges.',
    anchor: [0, 5.8, 8.8],
    cameraPos: [12, 8.6, 22],
    cameraTarget: [0, 3.2, 5.4],
    highlightRadius: 6.2,
  },
  {
    id: 'executive-strategy',
    number: '07',
    name: 'Crown Strategy Boardroom',
    architecturalLabel: 'Upper Spire Observatory · Summit',
    shortDescription:
      'A calm, horizon-facing strategic summit inside the upper NEXUS cathedral spire where multi-decade ecosystem stewardship and global expansion take shape.',
    architecturalFeature:
      'Twin soaring silver cathedral arch fins converging above a panoramic 360-degree glazed crown deck.',
    interiorHighlight:
      'Panoramic executive boardroom table projecting an animated 3D holographic strategy globe beneath a suspended architectural halo chandelier, flanked by 10 ergonomic chairs, laptops, and a live telemetry display.',
    anchor: [0, 26.2, 0],
    cameraPos: [18, 29.5, 22],
    cameraTarget: [0, 24.0, 0],
    highlightRadius: 5.4,
  },
  {
    id: 'sustainability-energy',
    number: '08',
    name: 'Fountains & Illuminated Gardens',
    architecturalLabel: 'Flanking Water Cascades, Banners & Gateway Arches',
    shortDescription:
      'High-arcing illuminated water fountains, sculptural champagne gateway rings, NEXUS promenade banners, and lush floral gardens framing the grand ceremonial approach.',
    architecturalFeature:
      'Four animated multi-jet mirror-pool fountains, glowing golden promenade paving strips, and an orbital kinetic tech sculpture on the south-east lawn.',
    interiorHighlight:
      'Open-air landscaped water sanctuary with recirculating mirror basins, fragrant marigold & lavender beds, and shaded granite walkways.',
    anchor: [9.8, 4.2, 14.2],
    cameraPos: [22, 10.5, 31],
    cameraTarget: [9.2, 2.8, 14.8],
    highlightRadius: 5.6,
  },
  {
    id: 'digital-operations',
    number: '09',
    name: 'Digital Operations Core',
    architecturalLabel: 'North Titanium Infrastructure Wing',
    shortDescription:
      'A precision-engineered operations wing tucked cleanly behind the spire, imagined for resilient web infrastructure, privacy-first systems, and high-availability global services.',
    architecturalFeature:
      'Chamfered dark titanium monolith with horizontal thermal-dissipation fins and an angled photovoltaic solar roof.',
    interiorHighlight:
      '12 multi-part blade server racks with smoked glass doors, illuminated cold-aisle floor channels, overhead fiber trays, diagnostic holo-terminal, and 4 Level 2 holographic mission-control desks beneath linear ceiling troffers.',
    anchor: [0, 6.8, -13.2],
    cameraPos: [-20, 14.0, -27],
    cameraTarget: [0, 4.8, -13.0],
    highlightRadius: 5.8,
  },
  {
    id: 'indian-flag-plaza',
    number: '10',
    name: 'Ceremonial Indian Flag Plaza',
    architecturalLabel: 'Tiranga Courtyard · South-West Forecourt',
    shortDescription:
      'A dignified ceremonial forecourt celebrating Indian heritage and global ambition, anchored by a monumental waving 3D Indian National Flag alongside the campus approach.',
    architecturalFeature:
      'Three-tier stepped travertine and basalt plinth, tapered satin-silver mast with champagne finial, and architectural night uplighting.',
    interiorHighlight:
      'Open ceremonial stone courtyard framed by manicured hedges, promenade lighting, and views across the grand NEXUS plaza.',
    anchor: [-20.4, 9.8, 21.6],
    cameraPos: [-31, 12.8, 36],
    cameraTarget: [-20.4, 7.2, 21.6],
    highlightRadius: 4.8,
  },
];

export const HQ_INTERIOR_VANTAGES: HQInteriorVantage[] = [
  {
    id: 'server-core',
    label: 'Server Core',
    zoneId: 'digital-operations',
    cameraPos: [-9.2, 6.4, -19.8],
    cameraTarget: [0, 3.8, -13.2],
  },
  {
    id: 'west-rd-holo',
    label: 'R&D Holo-Lab',
    zoneId: 'research-development',
    cameraPos: [-23.4, 7.6, 12.6],
    cameraTarget: [-17.5, 4.3, 4.2],
  },
  {
    id: 'spire-holo',
    label: 'Spire Holo-Decks',
    zoneId: 'innovation-centre',
    cameraPos: [8.8, 15.2, 12.6],
    cameraTarget: [0, 11.6, 0.4],
  },
  {
    id: 'east-studio',
    label: 'Design Studio',
    zoneId: 'creative-studio',
    cameraPos: [23.4, 7.6, 12.6],
    cameraTarget: [17.5, 4.3, 4.2],
  },
  {
    id: 'holo-atrium',
    label: 'Holo Atrium',
    zoneId: 'learning-knowledge',
    cameraPos: [7.8, 4.8, 12.6],
    cameraTarget: [0, 2.4, 5.4],
  },
];

export const HQ_CAMERA_PRESETS = {
  /** Wide dramatic aerial opening camera before smooth cinematic glide */
  introStart: {
    pos: [24, 24, 62] as [number, number, number],
    target: [0, 8.6, 5.5] as [number, number, number],
  },
  /** Iconic Symmetrical Hero Vista (Desktop) — frames Chhatrapati Shivaji Maharaj Statue front-center with full NEXUS HQ behind */
  heroDesktop: {
    pos: [0, 11.2, 46.5] as [number, number, number],
    target: [0, 9.2, 4.2] as [number, number, number],
  },
  /** Slightly wider symmetrical framing for mobile viewports */
  heroMobile: {
    pos: [0, 14.5, 58.0] as [number, number, number],
    target: [0, 9.4, 4.2] as [number, number, number],
  },
};
