import { useCallback, useEffect, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'motion/react';
import {
  BRAND,
  LEGAL_DOCUMENTS,
  type AppTabId,
  type ContactDraft,
  type LegalDocId,
} from './config/siteConfig';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { Introduction } from './components/Introduction';
import { InteractivePlayground } from './components/InteractivePlayground';
import { Ecosystem } from './components/Ecosystem';
import { EcosystemVisualization } from './components/EcosystemVisualization';
import { Updates } from './components/Updates';
import { Vision } from './components/Vision';
import { GlobalHQSection } from './components/GlobalHQSection';
import { Innovation } from './components/Innovation';
import { VisionMixer } from './components/VisionMixer';
import { About } from './components/About';
import { Founder } from './components/Founder';
import { Contact } from './components/Contact';
import { LegalCenter } from './components/LegalCenter';
import { Footer } from './components/Footer';
import { BottomAppNav } from './components/BottomAppNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { useTheme } from './hooks/useTheme';

type PrimaryTabId = Exclude<AppTabId, 'legal'>;

const TAB_TITLES: Record<PrimaryTabId, string> = {
  home: `${BRAND.name} — Global Technology Ecosystem`,
  ecosystem: `Live Sites · ${BRAND.name}`,
  updates: `Updates · ${BRAND.name}`,
  vision: `Vision & Planned · ${BRAND.name}`,
  founder: `Founder & Connect · ${BRAND.name}`,
};

function parseTabFromHash(hash: string): {
  tab: AppTabId;
  scrollToId?: string;
  legalDoc?: LegalDocId;
} {
  const clean = hash.replace(/^#/, '').toLowerCase();
  switch (clean) {
    case 'ecosystem':
    case 'live':
    case 'ecosystem-map':
      return {
        tab: 'ecosystem',
        scrollToId: clean === 'ecosystem-map' ? 'ecosystem-map' : undefined,
      };
    case 'updates':
      return { tab: 'updates' };
    case 'vision':
    case 'headquarters':
    case 'hq':
    case 'planned':
    case 'innovation':
    case 'vision-mixer':
    case 'mixer':
    case 'about':
      return {
        tab: 'vision',
        scrollToId:
          clean === 'headquarters' || clean === 'hq'
            ? 'headquarters'
            : clean === 'planned' || clean === 'innovation'
            ? 'innovation'
            : clean === 'vision-mixer' || clean === 'mixer'
            ? 'vision-mixer'
            : clean === 'about'
            ? 'about'
            : undefined,
      };
    case 'founder':
    case 'contact':
      return {
        tab: 'founder',
        scrollToId: clean === 'contact' ? 'contact' : undefined,
      };
    case 'terms':
    case 'privacy':
    case 'cookies':
    case 'accessibility':
    case 'disclaimer':
    case 'security':
      return {
        tab: 'legal',
        legalDoc: clean as LegalDocId,
      };
    case 'legal':
      return {
        tab: 'legal',
        legalDoc: 'terms',
      };
    case 'home':
    default:
      return { tab: 'home' };
  }
}

export default function App() {
  const initialRoute =
    typeof window === 'undefined'
      ? { tab: 'home' as AppTabId, legalDoc: undefined }
      : parseTabFromHash(window.location.hash);

  const [activeTab, setActiveTab] = useState<AppTabId>(initialRoute.tab);
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocId>(
    initialRoute.legalDoc ?? 'terms'
  );
  const [previousTab, setPreviousTab] = useState<PrimaryTabId>(
    initialRoute.tab === 'legal' ? 'home' : initialRoute.tab
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [contactDraft, setContactDraft] = useState<ContactDraft | null>(null);
  const clearContactDraft = useCallback(() => setContactDraft(null), []);
  const { theme, setTheme } = useTheme();
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 32,
    restDelta: 0.001,
  });

  // Synchronize document title with active app screen or active legal document
  useEffect(() => {
    if (activeTab === 'legal') {
      document.title = `${LEGAL_DOCUMENTS[activeLegalDoc].title} · ${BRAND.name}`;
    } else {
      document.title = TAB_TITLES[activeTab];
    }
  }, [activeTab, activeLegalDoc]);

  // Listen for browser back/forward hash navigation
  useEffect(() => {
    const onHashChange = () => {
      const parsed = parseTabFromHash(window.location.hash);
      if (parsed.tab === 'legal') {
        setActiveLegalDoc(parsed.legalDoc ?? 'terms');
        setActiveTab('legal');
        window.scrollTo({ top: 0, behavior: 'auto' });
        return;
      }

      setPreviousTab(parsed.tab);
      setActiveTab(parsed.tab);
      if (parsed.scrollToId) {
        window.setTimeout(() => {
          document
            .getElementById(parsed.scrollToId!)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 140);
      } else {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigateTo = useCallback(
    (tab: AppTabId, options?: { scrollToId?: string; draft?: ContactDraft }) => {
      if (options?.draft) {
        setContactDraft(options.draft);
      }

      if (tab === 'legal') {
        const targetHash = `#${activeLegalDoc}`;
        if (window.location.hash !== targetHash) {
          window.history.pushState(null, '', targetHash);
        }
        setActiveTab('legal');
        window.scrollTo({ top: 0, behavior: 'auto' });
        return;
      }

      const targetHash = options?.scrollToId
        ? `#${options.scrollToId}`
        : `#${tab}`;

      if (window.location.hash !== targetHash) {
        window.history.pushState(null, '', targetHash);
      }

      setPreviousTab(tab);
      setActiveTab(tab);

      if (options?.scrollToId) {
        window.setTimeout(() => {
          document
            .getElementById(options.scrollToId!)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 160);
      } else {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    },
    [activeLegalDoc]
  );

  const openLegal = useCallback(
    (doc: LegalDocId) => {
      if (activeTab !== 'legal') {
        setPreviousTab(activeTab);
      }

      const targetHash = `#${doc}`;
      if (window.location.hash !== targetHash) {
        window.history.pushState(null, '', targetHash);
      }

      setActiveLegalDoc(doc);
      setActiveTab('legal');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [activeTab]
  );

  const handleInspectProject = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
    const mapEl = document.getElementById('ecosystem-map');
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#050608] text-[#F5F7FA]">
      {/* Subtle Tactile Cinema Grain Overlay (GPU-neutral, zero pointer blocking) */}
      <div
        aria-hidden="true"
        className="cinema-grain pointer-events-none fixed inset-0 z-[55] opacity-[0.028]"
      />

      {/* Razor-Thin Horizon Scroll Progress Hairline */}
      {!prefersReducedMotion && (
        <motion.div
          aria-hidden="true"
          style={{ scaleX: smoothProgress }}
          className="pointer-events-none fixed top-0 inset-x-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-[#4F7DF3] via-[#DCE7FF] to-[#8B5CF6]"
        />
      )}

      <OfflineIndicator />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:rounded-full focus:bg-[#F5F7FA] focus:px-5 focus:py-2.5 focus:text-xs focus:font-semibold focus:text-[#050608]"
      >
        Skip to main content
      </a>

      <Navigation
        activeTab={activeTab}
        onNavigate={navigateTo}
        theme={theme}
        onThemeChange={setTheme}
      />

      {/* Dedicated Multi-Screen App Viewport */}
      <main id="main-content" className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'home' && (
              <>
                <Hero onNavigate={navigateTo} />
                <Introduction onNavigate={navigateTo} />
                <InteractivePlayground />
              </>
            )}

            {activeTab === 'ecosystem' && (
              <div className="pt-14 md:pt-16">
                <Ecosystem onInspectProject={handleInspectProject} />
                <EcosystemVisualization
                  selectedId={selectedProjectId}
                  onSelectId={setSelectedProjectId}
                />
              </div>
            )}

            {activeTab === 'updates' && (
              <div className="pt-14 md:pt-16">
                <Updates onNavigate={navigateTo} />
              </div>
            )}

            {activeTab === 'vision' && (
              <div className="pt-14 md:pt-20">
                <GlobalHQSection />
                <Vision onNavigate={navigateTo} />
                <Innovation onNavigate={navigateTo} />
                <VisionMixer onNavigate={navigateTo} />
                <About />
              </div>
            )}

            {activeTab === 'founder' && (
              <div className="pt-14 md:pt-16">
                <Founder onNavigate={navigateTo} />
                <Contact
                  draft={contactDraft}
                  onClearDraft={clearContactDraft}
                />
              </div>
            )}

            {activeTab === 'legal' && (
              <div className="pt-14 md:pt-16">
                <LegalCenter
                  activeDoc={activeLegalDoc}
                  onSelectDoc={openLegal}
                  onBack={() => navigateTo(previousTab)}
                  onNavigate={navigateTo}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Persistent Footer with Permanent Interactive 3D Nimbu Mirchi Across Every Screen */}
      <Footer
        onNavigate={navigateTo}
        onOpenLegal={openLegal}
        activeLegalDoc={activeTab === 'legal' ? activeLegalDoc : null}
      />

      <BottomAppNav activeTab={activeTab} onNavigate={navigateTo} />
    </div>
  );
}
