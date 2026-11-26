import { useState, type ComponentType } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Accessibility,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Cookie,
  Copy,
  FileText,
  Info,
  Lock,
  Mail,
  Printer,
  Shield,
} from 'lucide-react';
import {
  BRAND,
  LEGAL_DOCUMENTS,
  type AppTabId,
  type LegalDocId,
} from '../config/siteConfig';

interface LegalCenterProps {
  activeDoc: LegalDocId;
  onSelectDoc: (doc: LegalDocId) => void;
  onBack: () => void;
  onNavigate: (tab: AppTabId, options?: { scrollToId?: string }) => void;
}

const LEGAL_ORDER: LegalDocId[] = [
  'terms',
  'privacy',
  'cookies',
  'accessibility',
  'disclaimer',
  'security',
];

const DOC_ICONS: Record<LegalDocId, ComponentType<{ className?: string }>> = {
  terms: FileText,
  privacy: Shield,
  cookies: Cookie,
  accessibility: Accessibility,
  disclaimer: Info,
  security: Lock,
};

export function LegalCenter({
  activeDoc,
  onSelectDoc,
  onBack,
  onNavigate,
}: LegalCenterProps) {
  const [copied, setCopied] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const currentDoc = LEGAL_DOCUMENTS[activeDoc];
  const currentIndex = LEGAL_ORDER.indexOf(activeDoc);
  const prevDocId = currentIndex > 0 ? LEGAL_ORDER[currentIndex - 1] : null;
  const nextDocId =
    currentIndex < LEGAL_ORDER.length - 1
      ? LEGAL_ORDER[currentIndex + 1]
      : null;

  const CurrentIcon = DOC_ICONS[activeDoc];

  const handleCopyPolicy = async () => {
    const plainText = [
      `${BRAND.name} — ${currentDoc.title}`,
      `${currentDoc.updated}`,
      '',
      currentDoc.summary,
      '',
      ...currentDoc.sections.map(
        (s, idx) =>
          `${String(idx + 1).padStart(2, '0')}. ${s.heading}\n${s.body}\n`
      ),
      `Contact: ${BRAND.contactEmail}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const handleSelect = (doc: LegalDocId) => {
    onSelectDoc(doc);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section
      id="legal-center"
      aria-labelledby="legal-center-heading"
      className="relative bg-[#050608] pt-10 pb-20 sm:pt-14 sm:pb-28 lg:pt-16 lg:pb-32"
    >
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
        {/* Top Utility Bar: Back to App + Copy / Print */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 pb-6 hairline-b">
          <button
            type="button"
            onClick={onBack}
            className="group inline-flex min-h-[42px] items-center gap-2 rounded-full border border-white/12 bg-[#0A0D14] px-4 py-2 text-xs font-medium text-[#F5F7FA] transition-colors duration-200 hover:border-white/30 hover:bg-[#10141D]"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>Back to app</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline font-mono text-xs tabular-nums text-[#969EAE] mr-2">
              Document {currentDoc.index} / 0{LEGAL_ORDER.length}
            </span>

            <button
              type="button"
              onClick={handleCopyPolicy}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-white/12 bg-[#0A0D14] px-3.5 py-2 text-xs font-medium text-[#F5F7FA] transition-colors hover:border-white/30 hover:bg-[#10141D]"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#4F7DF3]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-[#969EAE]" />
                  <span>Copy text</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-white/12 bg-[#0A0D14] px-3.5 py-2 text-xs font-medium text-[#F5F7FA] transition-colors hover:border-white/30 hover:bg-[#10141D]"
            >
              <Printer className="h-3.5 w-3.5 text-[#969EAE]" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Document Switcher Strip */}
        <div
          role="tablist"
          aria-label="Legal and trust documents"
          className="mb-8 flex gap-2.5 overflow-x-auto pb-2 snap-x snap-mandatory lg:hidden"
        >
          {LEGAL_ORDER.map((docId) => {
            const doc = LEGAL_DOCUMENTS[docId];
            const Icon = DOC_ICONS[docId];
            const isSelected = docId === activeDoc;
            return (
              <button
                key={docId}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleSelect(docId)}
                className={`inline-flex min-h-[44px] shrink-0 snap-start items-center gap-2 rounded-xl border px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'border-[#4F7DF3] bg-[#101521] text-[#F5F7FA]'
                    : 'border-white/[0.08] bg-[#0A0D14] text-[#969EAE] hover:border-white/25 hover:text-[#F5F7FA]'
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${
                    isSelected ? 'text-[#4F7DF3]' : 'text-current'
                  }`}
                />
                <span>{doc.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Institutional Two-Column Reader Layout */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
          {/* Left Sticky Directory Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:col-span-4 lg:sticky lg:top-28 space-y-6">
            <div>
              <p className="text-xs font-medium tracking-[0.16em] uppercase text-[#969EAE] mb-2">
                {BRAND.name} · Governance
              </p>
              <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-[#F5F7FA]">
                Legal &amp; Trust Center
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-[#969EAE]">
                Clear, human-readable policies governing this portal, privacy
                standards, and independent ecosystem links.
              </p>
            </div>

            <nav
              aria-label="Policy directory"
              className="rounded-2xl border border-white/[0.08] bg-[#080B12] p-2 space-y-1"
            >
              {LEGAL_ORDER.map((docId) => {
                const doc = LEGAL_DOCUMENTS[docId];
                const Icon = DOC_ICONS[docId];
                const isSelected = docId === activeDoc;
                return (
                  <button
                    key={docId}
                    type="button"
                    aria-current={isSelected ? 'page' : undefined}
                    onClick={() => handleSelect(docId)}
                    className={`group flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 text-left transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#101521] border border-white/[0.1] text-[#F5F7FA]'
                        : 'border border-transparent text-[#969EAE] hover:bg-white/[0.04] hover:text-[#F5F7FA]'
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                        isSelected
                          ? 'border-[#4F7DF3]/50 bg-[#4F7DF3]/12 text-[#4F7DF3]'
                          : 'border-white/[0.08] bg-[#050608] text-[#969EAE] group-hover:text-[#F5F7FA]'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display text-sm font-medium truncate">
                          {doc.shortLabel}
                        </span>
                        <span className="font-mono text-[10px] tabular-nums opacity-65">
                          {doc.index}
                        </span>
                      </div>
                      <span className="block text-[11px] text-[#969EAE] truncate mt-0.5">
                        {doc.updated}
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Direct Policy Support Card */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0A0D14] p-5 space-y-3.5">
              <div className="flex items-center gap-2.5 text-xs font-medium text-[#F5F7FA]">
                <Mail className="h-4 w-4 text-[#4F7DF3]" />
                <span>Questions or disclosures?</span>
              </div>
              <p className="text-xs leading-relaxed text-[#969EAE]">
                Reach the founder directly for policy questions, accessibility
                feedback, or security notices.
              </p>
              <a
                href={`mailto:${BRAND.contactEmail}`}
                className="inline-flex items-center gap-1.5 font-mono text-xs text-[#F5F7FA] hover:text-[#4F7DF3] transition-colors break-all"
              >
                <span>{BRAND.contactEmail}</span>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#4F7DF3]" />
              </a>
              <button
                type="button"
                onClick={() => onNavigate('founder', { scrollToId: 'contact' })}
                className="inline-flex w-full min-h-[42px] items-center justify-center gap-2 rounded-full bg-[#F5F7FA] px-4 py-2 text-xs font-semibold text-[#050608] transition-colors hover:bg-[#DCE7FF]"
              >
                <span>Open Connect Form</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </aside>

          {/* Right Spacious Editorial Reading Pane */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.article
                key={activeDoc}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl border border-white/[0.08] bg-[#080B12] overflow-hidden"
              >
                {/* Document Masthead */}
                <div className="p-6 sm:p-9 lg:p-11 hairline-b bg-[#0A0D14]">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#969EAE]">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[#4F7DF3]">
                      <CurrentIcon className="h-3.5 w-3.5" />
                      <span>{currentDoc.index}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{currentDoc.updated}</span>
                    <span aria-hidden="true">·</span>
                    <span>{currentDoc.sections.length} Sections</span>
                  </div>

                  <h1
                    id="legal-center-heading"
                    className="mt-4 font-display text-[clamp(2rem,4.2vw,3.1rem)] font-semibold leading-[1.08] tracking-[-0.028em] text-[#F5F7FA]"
                  >
                    {currentDoc.title}
                  </h1>

                  <p className="mt-4 max-w-2xl text-sm sm:text-base leading-[1.72] text-[#DCE2EE]">
                    {currentDoc.summary}
                  </p>

                  {/* Plain-English "At a Glance" Highlights */}
                  <div className="mt-7 rounded-xl border border-white/[0.08] bg-[#050608] p-5">
                    <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-[#4F7DF3] mb-3">
                      At a Glance · Plain-Language Summary
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs leading-relaxed text-[#DCE2EE]">
                      {currentDoc.keyHighlights.map((highlight, idx) => (
                        <li
                          key={highlight}
                          className="flex items-start gap-2.5"
                        >
                          <span className="font-mono text-[11px] text-[#4F7DF3] pt-0.5 shrink-0">
                            0{idx + 1}
                          </span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Numbered Editorial Clauses */}
                <div className="p-6 sm:p-9 lg:p-11 divide-y divide-white/[0.08]">
                  {currentDoc.sections.map((section, idx) => (
                    <div
                      key={section.heading}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-6 py-7 first:pt-0 last:pb-0"
                    >
                      <div className="sm:col-span-2">
                        <span className="font-mono text-xs tabular-nums text-[#4F7DF3]">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="sm:col-span-10">
                        <h2 className="font-display text-lg sm:text-xl font-semibold tracking-[-0.015em] text-[#F5F7FA]">
                          {section.heading}
                        </h2>
                        <p className="mt-3 text-sm sm:text-[15px] leading-[1.82] text-[#969EAE]">
                          {section.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sequential Previous / Next Policy Footer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-5 sm:px-9 sm:py-6 hairline-t bg-[#0A0D14]">
                  <div>
                    {prevDocId ? (
                      <button
                        type="button"
                        onClick={() => handleSelect(prevDocId)}
                        className="group flex w-full items-center gap-3 rounded-xl border border-white/[0.08] bg-[#050608] p-4 text-left transition-colors hover:border-white/25"
                      >
                        <ArrowLeft className="h-4 w-4 shrink-0 text-[#969EAE] transition-transform group-hover:-translate-x-0.5 group-hover:text-[#F5F7FA]" />
                        <div className="min-w-0">
                          <span className="block text-[11px] text-[#969EAE]">
                            Previous policy
                          </span>
                          <span className="block font-display text-sm font-medium text-[#F5F7FA] truncate">
                            {LEGAL_DOCUMENTS[prevDocId].shortLabel}
                          </span>
                        </div>
                      </button>
                    ) : (
                      <div />
                    )}
                  </div>

                  <div>
                    {nextDocId ? (
                      <button
                        type="button"
                        onClick={() => handleSelect(nextDocId)}
                        className="group flex w-full items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#050608] p-4 text-left transition-colors hover:border-white/25"
                      >
                        <div className="min-w-0">
                          <span className="block text-[11px] text-[#969EAE]">
                            Next policy
                          </span>
                          <span className="block font-display text-sm font-medium text-[#F5F7FA] truncate">
                            {LEGAL_DOCUMENTS[nextDocId].shortLabel}
                          </span>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-[#969EAE] transition-transform group-hover:translate-x-0.5 group-hover:text-[#F5F7FA]" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          onNavigate('founder', { scrollToId: 'contact' })
                        }
                        className="group flex w-full items-center justify-between gap-3 rounded-xl bg-[#F5F7FA] p-4 text-left text-[#050608] transition-colors hover:bg-[#DCE7FF]"
                      >
                        <div className="min-w-0">
                          <span className="block text-[11px] opacity-70">
                            Need assistance?
                          </span>
                          <span className="block font-display text-sm font-semibold truncate">
                            Connect with Founder
                          </span>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.article>
            </AnimatePresence>

            {/* Mobile Support Card */}
            <div className="mt-6 rounded-2xl border border-white/[0.08] bg-[#0A0D14] p-5 lg:hidden">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-[#F5F7FA]">
                    Policy or security inquiries
                  </p>
                  <a
                    href={`mailto:${BRAND.contactEmail}`}
                    className="mt-1 inline-flex items-center gap-1 font-mono text-xs text-[#4F7DF3]"
                  >
                    <span>{BRAND.contactEmail}</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('founder', { scrollToId: 'contact' })}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-[#F5F7FA] px-4 py-2 text-xs font-semibold text-[#050608]"
                >
                  <span>Connect</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
