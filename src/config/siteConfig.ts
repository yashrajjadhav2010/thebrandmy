/**
 * Central Brand & Ecosystem Configuration
 *
 * To finalize or rename the parent company globally across the entire site,
 * update `BRAND.name` below. All navigation, hero, ecosystem visualization,
 * metadata, and footer references read directly from this file.
 */

export type AppTabId =
  | 'home'
  | 'ecosystem'
  | 'updates'
  | 'vision'
  | 'founder'
  | 'legal';

export type LegalDocId =
  | 'terms'
  | 'privacy'
  | 'cookies'
  | 'accessibility'
  | 'disclaimer'
  | 'security';

export interface ContactDraft {
  subject: string;
  message: string;
}

export interface NavItem {
  label: string;
  href: string;
  sectionId: AppTabId;
}

export interface EcosystemProject {
  id: string;
  index: string;
  name: string;
  category: string;
  focus: string;
  url: string;
  displayUrl: string;
  description: string;
  extendedContext: string;
  accentColor: string;
  image: string;
  imageAlt: string;
  /** Desktop spatial gallery grid prominence */
  featuredSpan: 'wide' | 'narrow';
  /** Orbital visualization angle in degrees (auto-distributed if omitted) */
  orbitAngleDeg: number;
  /** Relative orbit ring (1 = inner, 2 = outer) */
  orbitRing: 1 | 2;
}

export interface ExplorationArea {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  thesis: string;
  focusPoints: string[];
  diagramType: 'tools' | 'education' | 'creativity' | 'technology' | 'utility' | 'experiences';
}

export interface PhilosophyPillar {
  index: string;
  title: string;
  body: string;
}

export type UpdateCategoryId = 'all' | 'platform' | 'education' | 'creative';

export interface EcosystemUpdate {
  id: string;
  index: string;
  category: Exclude<UpdateCategoryId, 'all'>;
  tag: string;
  statusLabel: string;
  stageLabel: string;
  domainLabel: string;
  title: string;
  summary: string;
  detail: string;
  highlights: string[];
  accentColor: string;
  image: string;
  imageAlt: string;
  href: string;
  targetTab?: AppTabId;
  scrollToId?: string;
  ctaLabel: string;
  external?: boolean;
}

export const FOUNDER_PROFILE = {
  name: 'Yashraj Jadhav',
  role: 'Founder & Independent Builder',
  eyebrow: 'Founder · The Mind Behind the Ecosystem',
  headline: 'Building independent digital work that lasts.',
  intro:
    'Hi, I am Yashraj Jadhav — the founder, designer, and independent builder behind this evolving technology ecosystem.',
  storyParagraphs: [
    'Every platform in this universe started with a genuine curiosity and a real problem worth solving — from focused student learning platforms like JEE TAPASYA and BOARD TAPASYA to visual storytelling through YASHRAJ FRAMES and my personal digital home at YASHRAJ JADHAV.',
    'Rather than chasing short-lived hype, my goal is to steadily shape a globally respected technology ecosystem where education, creative visual arts, software tools, and experimental digital experiences live under one thoughtful, independent architecture.',
  ],
  focusAreas: [
    {
      index: '01',
      title: 'Education & Learning Systems',
      detail:
        'Crafting focused, distraction-free study platforms that help students stay consistent and clear-minded.',
    },
    {
      index: '02',
      title: 'Visual Craft & Photography',
      detail:
        'Exploring light, framing, and quiet editorial aesthetics across photography and interactive web design.',
    },
    {
      index: '03',
      title: 'Independent Web Architecture',
      detail:
        'Designing fast, installable, borderless web platforms engineered to evolve naturally over the long term.',
    },
  ],
  portraitImage: 'https://i.ibb.co/B5QMKYxx/founder.png',
  portraitAlt: 'Yashraj Jadhav — Founder & Independent Builder',
  email: 'yaashh.tech@gmail.com',
  links: [
    {
      label: 'Personal Website',
      displayUrl: 'yashrajjadhav.netlify.app',
      url: 'https://yashrajjadhav.netlify.app',
    },
    {
      label: 'Visual Archive',
      displayUrl: 'yashrajframes.netlify.app',
      url: 'https://yashrajframes.netlify.app',
    },
  ],
} as const;

export const BRAND = {
  /** Temporary placeholder name — change here to update globally */
  name: 'NEXUS',
  isPlaceholderName: true,
  contactEmail: 'yaashh.tech@gmail.com',
  heroEyebrow: "Independently building what's next",
  heroHeadlineLines: ['One vision.', 'Infinite possibilities.'] as const,
  heroSubheadline:
    'We build digital experiences, technology and platforms designed to make ideas move further.',
  primaryCta: {
    label: 'Explore our universe',
    href: '#ecosystem',
    tab: 'ecosystem' as AppTabId,
  },
  secondaryCta: {
    label: 'Discover our vision',
    href: '#vision',
    tab: 'vision' as AppTabId,
  },
  footerStatement:
    'An independent technology parent initiative building digital platforms, creative works, and future explorations designed to endure.',
  contactEmailNote:
    'Reach out directly at yaashh.tech@gmail.com or compose a pre-filled email below.',
} as const;

export const NAVIGATION: NavItem[] = [
  { label: 'Home', href: '#home', sectionId: 'home' },
  { label: 'Live Sites', href: '#ecosystem', sectionId: 'ecosystem' },
  { label: 'Updates', href: '#updates', sectionId: 'updates' },
  { label: 'Vision', href: '#vision', sectionId: 'vision' },
  { label: 'Founder', href: '#founder', sectionId: 'founder' },
];

/**
 * Ecosystem launch & platform updates — grounded strictly in real live projects
 * and active platform milestones (no fabricated metrics or unlaunched claims).
 */
export const ECOSYSTEM_UPDATES: EcosystemUpdate[] = [
  {
    id: 'update-pwa-app',
    index: '01',
    category: 'platform',
    tag: 'Platform Release',
    statusLabel: 'Live Now',
    stageLabel: 'Core Portal',
    domainLabel: 'Installable PWA · Multi-Screen App',
    title: 'Installable Web App & Multi-Screen Mode',
    summary:
      'The ecosystem portal now runs as an installable Progressive Web App with dedicated app screens, offline asset caching, and native-style bottom navigation.',
    detail:
      'Install directly to your phone or desktop home screen for instant full-screen access across all live projects, interactive previews, planned explorations, and founder dispatches.',
    highlights: [
      'Dedicated multi-screen app flow with bottom dock navigation',
      'Offline-ready service worker caching & home-screen installation',
      'Interactive live iframe previews with desktop & mobile viewports',
    ],
    accentColor: '#4F7DF3',
    image: '/src/assets/images/philosophy_observatory_1795677181167.jpg',
    imageAlt:
      'Minimalist dark basalt and glass horizon observatory gallery reflecting twilight water',
    href: '#ecosystem',
    targetTab: 'ecosystem',
    ctaLabel: 'Open Live Sites',
    external: false,
  },
  {
    id: 'update-craft-themes-legal',
    index: '02',
    category: 'platform',
    tag: 'Experience Upgrade',
    statusLabel: 'Recently Shipped',
    stageLabel: 'UI & Craft',
    domainLabel: 'Themes · 3D Physics · Trust Center',
    title: 'Color Atmospheres, Photorealistic 3D & Trust Center',
    summary:
      'Introduced four curated light and dark color atmospheres, a botanical 3D Nimbu Mirchi with pendulum physics, and a full-screen Legal & Trust Center.',
    detail:
      'Every screen adapts seamlessly between Obsidian Dark, Glacier Sky, Daylight Ivory, and Soft Blossom while keeping interactive 3D stages crisp and responsive.',
    highlights: [
      '4 Color Atmospheres saved privately in browser storage',
      'Photorealistic 7-chili & lemon 3D Nimbu Mirchi across every screen',
      'Full-screen Legal & Trust Center with copy & print-ready views',
    ],
    accentColor: '#8B5CF6',
    image: '/src/assets/images/ecosystem_yashraj_jadhav_1795677178110.jpg',
    imageAlt:
      'Brushed titanium frame holding a faceted smoked indigo glass prism on a basalt plinth',
    href: '#legal',
    targetTab: 'legal',
    ctaLabel: 'Explore Trust Center',
    external: false,
  },
  {
    id: 'update-jee-tapasya',
    index: '03',
    category: 'education',
    tag: 'Education Live',
    statusLabel: 'Active Project',
    stageLabel: 'Student Platform',
    domainLabel: 'jeetapasya.vercel.app',
    title: 'JEE TAPASYA — Focused Exam Preparation',
    summary:
      'Independent educational platform live on the web, dedicated to disciplined JEE preparation and structured study workflows.',
    detail:
      'Hosted at jeetapasya.vercel.app as part of the learning branch of our growing ecosystem, designed to eliminate distraction during intensive study sessions.',
    highlights: [
      'Purpose-built around disciplined daily engineering entrance prep',
      'Clean, distraction-free web experience hosted on Vercel',
      'Previewable directly inside the Live Sites interactive theater',
    ],
    accentColor: '#E2E8F0',
    image: '/src/assets/images/ecosystem_jee_tapasya_1795677173640.jpg',
    imageAlt:
      'Architectural obsidian monoliths interlocking with luminous optical crystal prisms',
    href: 'https://jeetapasya.vercel.app',
    ctaLabel: 'Open JEE TAPASYA',
    external: true,
  },
  {
    id: 'update-board-tapasya',
    index: '04',
    category: 'education',
    tag: 'Education Live',
    statusLabel: 'Active Project',
    stageLabel: 'Student Platform',
    domainLabel: 'boardtapasya.netlify.app',
    title: 'BOARD TAPASYA — Academic Foundations',
    summary:
      'Dedicated board-level learning platform live on Netlify, designed for steady daily revision and conceptual clarity.',
    detail:
      'Hosted at boardtapasya.netlify.app alongside JEE TAPASYA to support students building strong academic fundamentals across key school milestones.',
    highlights: [
      'Focused structure tailored to board-level academic curricula',
      'Fast, lightweight web platform built for daily revision clarity',
      'Directly paired with JEE TAPASYA in our education ecosystem',
    ],
    accentColor: '#6366F1',
    image: '/src/assets/images/ecosystem_board_tapasya_1795677174678.jpg',
    imageAlt:
      'Ascending layered dark slate plates and translucent cosmic blue architectural glass planes',
    href: 'https://boardtapasya.netlify.app',
    ctaLabel: 'Open BOARD TAPASYA',
    external: true,
  },
  {
    id: 'update-yashraj-frames',
    index: '05',
    category: 'creative',
    tag: 'Visual Archive',
    statusLabel: 'Active Project',
    stageLabel: 'Photography',
    domainLabel: 'yashrajframes.netlify.app',
    title: 'YASHRAJ FRAMES — Photography & Framing',
    summary:
      'An independent visual archive live on the web exploring light, perspective, and intentional photographic storytelling.',
    detail:
      'Hosted at yashrajframes.netlify.app, bridging visual craft with quiet minimalist digital presentation so every photograph speaks on its own.',
    highlights: [
      'Curated independent photography & composition showcase',
      'Minimalist gallery presentation focused on light and framing',
      'Live interactive preview available inside the ecosystem viewer',
    ],
    accentColor: '#CBD5E1',
    image: '/src/assets/images/ecosystem_yashraj_frames_1795677176592.jpg',
    imageAlt:
      'Macro studio view of a matte black anodized optical camera lens barrel and precision aperture blades',
    href: 'https://yashrajframes.netlify.app',
    ctaLabel: 'Open YASHRAJ FRAMES',
    external: true,
  },
  {
    id: 'update-yashraj-jadhav',
    index: '06',
    category: 'creative',
    tag: 'Digital Identity',
    statusLabel: 'Active Project',
    stageLabel: 'Personal Home',
    domainLabel: 'yashrajjadhav.netlify.app',
    title: 'YASHRAJ JADHAV — Personal Platform',
    summary:
      'Independent personal web home connecting creative work, ongoing technical explorations, and future ecosystem ideas.',
    detail:
      'Hosted at yashrajjadhav.netlify.app as a direct window into the founder, builder, and creative philosophy driving every platform in this universe.',
    highlights: [
      'Central personal web presence for founder Yashraj Jadhav',
      'Connects ongoing software experiments, visuals, and writing',
      'Directly linked from the Founder profile & live showcase',
    ],
    accentColor: '#4F7DF3',
    image: '/src/assets/images/ecosystem_yashraj_jadhav_1795677178110.jpg',
    imageAlt:
      'Brushed dark titanium frame holding a faceted smoked indigo glass prism above a matte basalt plinth',
    href: 'https://yashrajjadhav.netlify.app',
    ctaLabel: 'Open YASHRAJ JADHAV',
    external: true,
  },
];

/**
 * Existing independent projects currently part of the ecosystem.
 * Append new entries here to expand both the spatial gallery and
 * the interactive orbital visualization automatically.
 */
export const ECOSYSTEM_PROJECTS: EcosystemProject[] = [
  {
    id: 'jee-tapasya',
    index: '01',
    name: 'JEE TAPASYA',
    category: 'Education',
    focus: 'Competitive Exam Preparation',
    url: 'https://jeetapasya.vercel.app',
    displayUrl: 'jeetapasya.vercel.app',
    description:
      'A digital platform focused on JEE preparation and educational support.',
    extendedContext:
      'Built to bring clarity, structure, and disciplined focus to students preparing for engineering entrance examinations.',
    accentColor: '#E2E8F0',
    image: '/src/assets/images/ecosystem_jee_tapasya_1795677173640.jpg',
    imageAlt:
      'Architectural obsidian monoliths interlocking with luminous optical crystal prisms',
    featuredSpan: 'wide',
    orbitAngleDeg: -38,
    orbitRing: 1,
  },
  {
    id: 'board-tapasya',
    index: '02',
    name: 'BOARD TAPASYA',
    category: 'Education',
    focus: 'Academic Foundations',
    url: 'https://boardtapasya.netlify.app',
    displayUrl: 'boardtapasya.netlify.app',
    description:
      'A platform built around board-level education and student learning.',
    extendedContext:
      'Designed around structured board-level curricula to support consistent daily study and strong conceptual fundamentals.',
    accentColor: '#4F7DF3',
    image: '/src/assets/images/ecosystem_board_tapasya_1795677174678.jpg',
    imageAlt:
      'Ascending layered dark slate plates and translucent cosmic blue architectural glass planes',
    featuredSpan: 'narrow',
    orbitAngleDeg: 36,
    orbitRing: 2,
  },
  {
    id: 'yashraj-frames',
    index: '03',
    name: 'YASHRAJ FRAMES',
    category: 'Visual Arts',
    focus: 'Photography & Composition',
    url: 'https://yashrajframes.netlify.app',
    displayUrl: 'yashrajframes.netlify.app',
    description: 'A photography and visual creative project.',
    extendedContext:
      'An independent visual archive dedicated to light, framing, perspective, and quiet photographic storytelling.',
    accentColor: '#CBD5E1',
    image: '/src/assets/images/ecosystem_yashraj_frames_1795677176592.jpg',
    imageAlt:
      'Macro studio view of a matte black anodized optical camera lens barrel and precision aperture blades',
    featuredSpan: 'narrow',
    orbitAngleDeg: 146,
    orbitRing: 1,
  },
  {
    id: 'yashraj-jadhav',
    index: '04',
    name: 'YASHRAJ JADHAV',
    category: 'Digital Identity',
    focus: 'Personal Digital Platform',
    url: 'https://yashrajjadhav.netlify.app',
    displayUrl: 'yashrajjadhav.netlify.app',
    description: 'A personal digital platform.',
    extendedContext:
      'An independent personal home on the web connecting creative work, ongoing ideas, and digital craftsmanship.',
    accentColor: '#8B5CF6',
    image: '/src/assets/images/ecosystem_yashraj_jadhav_1795677178110.jpg',
    imageAlt:
      'Brushed dark titanium frame holding a faceted smoked indigo glass prism above a matte basalt plinth',
    featuredSpan: 'wide',
    orbitAngleDeg: -144,
    orbitRing: 2,
  },
];

/**
 * Future exploration directions — explicitly conceptual areas under
 * exploration rather than launched commercial products.
 */
export const EXPLORATION_AREAS: ExplorationArea[] = [
  {
    id: 'digital-tools',
    index: '01',
    title: 'Digital Tools',
    subtitle: 'Quiet software for focused work',
    thesis:
      'Exploring lightweight, distraction-free instruments designed to remove friction from thinking, organizing, and daily execution.',
    focusPoints: ['Focused interfaces', 'Speed and clarity', 'Respect for user attention'],
    diagramType: 'tools',
  },
  {
    id: 'education',
    index: '02',
    title: 'Education',
    subtitle: 'Structured systems for deeper learning',
    thesis:
      'Continuing to explore how clear design and thoughtful pacing can make complex academic subjects more approachable for learners.',
    focusPoints: ['Conceptual mastery', 'Self-paced structure', 'Accessible learning paths'],
    diagramType: 'education',
  },
  {
    id: 'creativity',
    index: '03',
    title: 'Creativity',
    subtitle: 'Spaces for visual expression and craft',
    thesis:
      'Investigating digital canvases, visual archives, and storytelling formats where photography, design, and code intersect naturally.',
    focusPoints: ['Editorial presentation', 'Visual precision', 'Original artistic direction'],
    diagramType: 'creativity',
  },
  {
    id: 'technology',
    index: '04',
    title: 'Technology',
    subtitle: 'Foundational web architecture',
    thesis:
      'Building resilient software foundations with modern web engineering, performance discipline, and systems that can evolve gracefully.',
    focusPoints: ['Composable systems', 'Enduring standards', 'Thoughtful engineering'],
    diagramType: 'technology',
  },
  {
    id: 'utility-platforms',
    index: '05',
    title: 'Utility Platforms',
    subtitle: 'Practical digital infrastructure',
    thesis:
      'Researching everyday digital utilities that solve concrete problems reliably without unnecessary complexity or noise.',
    focusPoints: ['Everyday usefulness', 'Zero clutter', 'Dependable interaction'],
    diagramType: 'utility',
  },
  {
    id: 'new-experiences',
    index: '06',
    title: 'New Digital Experiences',
    subtitle: 'Experimental interfaces and spatial web',
    thesis:
      'Pushing how people experience ideas on the web through intentional motion, spatial depth, and interactive visual storytelling.',
    focusPoints: ['Interactive depth', 'Controlled motion', 'Memorable digital presence'],
    diagramType: 'experiences',
  },
];

export const PHILOSOPHY_PILLARS: PhilosophyPillar[] = [
  {
    index: '01',
    title: 'Curiosity as a Compass',
    body: 'Every project begins with a real question rather than a trend. We explore disciplines across education, visual arts, and software because interesting breakthroughs rarely stay inside a single boundary.',
  },
  {
    index: '02',
    title: 'Independent Thinking',
    body: 'Building independently allows ideas to mature on their own terms. Instead of rushing for noise or vanity scale, each project is shaped with patience, clarity, and direct accountability to the people using it.',
  },
  {
    index: '03',
    title: 'Long-Term Craft',
    body: 'Good digital work respects the person on the other side of the screen. We care about typography, speed, structure, and restraint—treating every detail as part of a durable foundation.',
  },
  {
    index: '04',
    title: 'Responsible Technology',
    body: 'Technology should expand capability without exhausting attention. Our aim is to create genuinely useful digital platforms that feel calm, transparent, and purposeful over time.',
  },
];

export const OBSERVATORY_IMAGE = {
  src: '/src/assets/images/philosophy_observatory_1795677181167.jpg',
  alt: 'Minimalist dark basalt and glass horizon gallery overlooking twilight light reflected on still water',
} as const;

export const LEGAL_DOCUMENTS = {
  terms: {
    id: 'terms' as LegalDocId,
    index: '01',
    shortLabel: 'Terms of Service',
    title: 'Terms of Service',
    updated: 'Effective · Ecosystem Portal',
    summary:
      'Governing your access to this portal, interactive previews, and independent ecosystem links.',
    keyHighlights: [
      'Free informational gateway to independent live projects',
      'Embedded live previews belong to their respective hosts',
      'Original design, 3D work, and code belong to Yashraj Jadhav',
    ],
    sections: [
      {
        heading: 'Acceptance & Scope',
        body: `By accessing or using this web application operated under the working initiative name ${BRAND.name} (founded by Yashraj Jadhav), you agree to these Terms of Service. This portal serves as an informational and interactive gateway to independent digital projects and conceptual explorations.`,
      },
      {
        heading: 'Independent Ecosystem Platforms',
        body: 'The live sites showcased here—including JEE TAPASYA, BOARD TAPASYA, YASHRAJ FRAMES, and YASHRAJ JADHAV—are independent existing digital projects. Each live platform is hosted separately and may maintain its own features, availability, and usage terms.',
      },
      {
        heading: 'Interactive Live Previews & External Links',
        body: 'This portal embeds interactive live previews (iframes) and outbound links to external domains for convenience. Your interaction within an embedded site or external link is subject to that destination’s own policies and technical constraints.',
      },
      {
        heading: 'Acceptable Use',
        body: 'You agree not to misuse this portal, attempt unauthorized access to underlying infrastructure, scrape or republish original artwork or source architecture as your own, or interfere with the normal operation of the web application.',
      },
      {
        heading: 'Intellectual Property & Brand Evolution',
        body: 'All original interface design, 3D interactive elements, editorial copy, bespoke artwork, and software code presented on this site remain the intellectual property of Yashraj Jadhav unless otherwise noted. The working name and identity may evolve as future ventures are formalized.',
      },
      {
        heading: 'Disclaimers & Limitation of Liability',
        body: 'This portal and its interactive previews are provided on an "as is" and "as available" basis without warranties of any kind. We are not liable for temporary downtime, third-party hosting interruptions, or indirect damages arising from use of this site.',
      },
      {
        heading: 'Updates to These Terms',
        body: 'These Terms of Service may be updated periodically as new platforms, backend services, or ecosystem capabilities launch. Continued use of the portal constitutes acceptance of the revised terms.',
      },
    ],
  },
  privacy: {
    id: 'privacy' as LegalDocId,
    index: '02',
    shortLabel: 'Privacy Policy',
    title: 'Privacy Policy',
    updated: 'Effective · Client-First Architecture',
    summary:
      'Transparent overview of how your browser preferences, offline cache, and inquiries are handled.',
    keyHighlights: [
      'Zero personal data tracking, ad pixels, or data resale',
      'Theme preference stays strictly on your own device',
      'Contact emails open directly in your mail app to yaashh.tech@gmail.com',
    ],
    sections: [
      {
        heading: 'No Personal Data Collection or Sale',
        body: `This ${BRAND.name} portal is architected with privacy first. It currently operates on the client side and does not track visitors across the web, run third-party advertising pixels, or sell personal information.`,
      },
      {
        heading: 'Local Browser Preferences',
        body: 'When you choose a Color Atmosphere theme (Obsidian, Glacier Sky, Daylight Ivory, or Soft Blossom), your preference is stored solely in your browser’s localStorage so the interface remembers your chosen look on return visits.',
      },
      {
        heading: 'Progressive Web App (PWA) Offline Cache',
        body: 'If you install this app or browse online, the built-in service worker caches static assets (styles, scripts, icons, and fonts) locally on your device to enable faster loading and offline availability. You can clear this cache anytime via your browser settings.',
      },
      {
        heading: 'Contact & Inquiry Form',
        body: 'Details entered into the Connect form on the Founder screen are validated locally and opened in your email client addressed to yaashh.tech@gmail.com. No form data is stored on intermediate tracking servers.',
      },
      {
        heading: 'Embedded Previews & External Sites',
        body: 'Viewing live previews or opening linked ecosystem sites (hosted on Vercel or Netlify) connects directly to those hosts, which process standard technical request logs independently under their own privacy practices.',
      },
    ],
  },
  cookies: {
    id: 'cookies' as LegalDocId,
    index: '03',
    shortLabel: 'Cookie Policy',
    title: 'Cookie & Local Storage Policy',
    updated: 'Zero Tracking Cookies',
    summary:
      'Details on browser storage technologies used to power themes and offline app resilience.',
    keyHighlights: [
      'Zero marketing or cross-site advertising cookies',
      'One essential localStorage key for your chosen color theme',
      'Offline PWA asset cache clearable anytime in browser settings',
    ],
    sections: [
      {
        heading: 'Zero Advertising or Analytics Cookies',
        body: `This ${BRAND.name} portal does not set marketing cookies, cross-site tracking identifiers, or behavioral advertising scripts.`,
      },
      {
        heading: 'Essential Local Storage',
        body: 'We use a single localStorage key (nexus-ui-theme) solely to remember your selected visual color theme across sessions. No personal identifiers are stored.',
      },
      {
        heading: 'Service Worker Cache Storage',
        body: 'To function as an installable Progressive Web App, your browser stores static application files in Cache Storage. You may remove this data at any time through your browser’s site data controls.',
      },
      {
        heading: 'Third-Party Embedded Content',
        body: 'When interacting with embedded live site previews in the Live Sites showcase, those independently hosted platforms may apply their own functional browser storage.',
      },
    ],
  },
  accessibility: {
    id: 'accessibility' as LegalDocId,
    index: '04',
    shortLabel: 'Accessibility',
    title: 'Accessibility Statement',
    updated: 'WCAG AA Craft Standard',
    summary:
      'Our commitment to inclusive, keyboard-friendly, readable, and motion-respectful web experiences.',
    keyHighlights: [
      'WCAG AA contrast across Obsidian Dark and all 3 Light Atmospheres',
      'Automatic pause of carousels & motion when reduced motion is enabled',
      'Full keyboard navigation, ARIA landmarks, and visible focus rings',
    ],
    sections: [
      {
        heading: 'Visual Contrast & Theme Options',
        body: 'We design both our flagship Obsidian Dark theme and our three Light Color Atmospheres (Glacier Sky, Daylight Ivory, Soft Blossom) to preserve crisp WCAG AA text legibility and clear focus indicators.',
      },
      {
        heading: 'Motion & Animation Preferences',
        body: 'This application respects the operating system prefers-reduced-motion setting—automatically disabling auto-sliding carousel timers, scroll-driven parallax transforms, and kinetic transitions when reduced motion is preferred.',
      },
      {
        heading: 'Keyboard & Screen-Reader Navigation',
        body: 'Interactive controls, tab bars, carousels, dialogs, and form fields include semantic landmarks, ARIA attributes, keyboard escape handlers, and visible focus rings for assistive technology users.',
      },
      {
        heading: 'Feedback & Improvements',
        body: 'If you encounter any accessibility barrier on this portal or any linked independent project, please write to yaashh.tech@gmail.com or reach out via the Founder & Connect screen so we can address it promptly.',
      },
    ],
  },
  disclaimer: {
    id: 'disclaimer' as LegalDocId,
    index: '05',
    shortLabel: 'Disclaimer',
    title: 'Disclaimer & Brand Notice',
    updated: 'Transparency Notice',
    summary:
      'Clear distinction between working brand identity, live independent projects, and planned explorations.',
    keyHighlights: [
      'NEXUS is a temporary working placeholder brand name',
      'Live sites are clearly separated from planned conceptual areas',
      'Educational sites are independent student study platforms',
    ],
    sections: [
      {
        heading: 'Working Brand Placeholder',
        body: `The name "${BRAND.name}" is currently used as a centrally configured temporary placeholder while the long-term parent brand identity is being finalized. It is not affiliated with third-party corporations using similar names.`,
      },
      {
        heading: 'Live Projects vs. Planned Explorations',
        body: 'Only the projects explicitly featured in the Live Sites screen (JEE TAPASYA, BOARD TAPASYA, YASHRAJ FRAMES, and YASHRAJ JADHAV) are active live sites. Areas presented under Planned Projects & Future Explorations inside the Vision screen are conceptual directions rather than launched commercial products.',
      },
      {
        heading: 'Educational Content Note',
        body: 'Independent educational platforms such as JEE TAPASYA and BOARD TAPASYA are built to support student preparation and study discipline and are not officially affiliated with national examination boards or testing agencies.',
      },
    ],
  },
  security: {
    id: 'security' as LegalDocId,
    index: '06',
    shortLabel: 'Security',
    title: 'Security & Responsible Disclosure',
    updated: 'Trust & Safety',
    summary:
      'How we safeguard this web application and welcome responsible security reports.',
    keyHighlights: [
      'Embedded live previews isolated with explicit iframe sandboxing',
      'Zero passwords, payment details, or private keys stored in browser code',
      'Direct security reporting channel at yaashh.tech@gmail.com',
    ],
    sections: [
      {
        heading: 'Sandboxed Live Previews',
        body: 'Embedded live previews in the Live Sites theater are isolated using explicit iframe sandbox policies and strict referrer controls so you can explore live platforms safely.',
      },
      {
        heading: 'Zero Exposed Credentials',
        body: 'This application stores no user passwords, payment data, or private API keys in browser code. Static assets are served cleanly over HTTPS.',
      },
      {
        heading: 'Reporting a Vulnerability',
        body: 'If you discover a technical issue, broken security header, or vulnerability on this portal or any linked project, please email yaashh.tech@gmail.com directly with clear reproduction steps.',
      },
    ],
  },
} as const;

