import { useState, type FormEvent } from 'react';
import { ArrowUpRight, Check, Copy, Mail, RotateCcw, Send } from 'lucide-react';
import { BRAND } from '../config/siteConfig';

interface FormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const INITIAL_VALUES: FormValues = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

const SUBJECT_PRESETS = [
  'Collaboration Idea',
  'Project Feedback',
  'Ecosystem Inquiry',
  'General Note',
] as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateForm(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Please enter your name.';
  } else if (values.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  if (!values.email.trim()) {
    errors.email = 'Please enter your email address.';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!values.subject.trim()) {
    errors.subject = 'Please include a short subject.';
  }

  if (!values.message.trim()) {
    errors.message = 'Please share a brief note about your idea or inquiry.';
  } else if (values.message.trim().length < 15) {
    errors.message = 'Please write at least 15 characters so we have context.';
  }

  return errors;
}

export function Contact() {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<keyof FormValues, boolean>>({
    name: false,
    email: false,
    subject: false,
    message: false,
  });
  const [submittedPayload, setSubmittedPayload] = useState<FormValues | null>(
    null
  );
  const [copied, setCopied] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const buildMailtoHref = (payload: FormValues) => {
    const subject = encodeURIComponent(`[${BRAND.name}] ${payload.subject}`);
    const body = encodeURIComponent(
      `Name: ${payload.name}\nEmail: ${payload.email}\n\n${payload.message}`
    );
    return `mailto:${BRAND.contactEmail}?subject=${subject}&body=${body}`;
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(BRAND.contactEmail);
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 2200);
    } catch {
      setCopiedEmail(false);
    }
  };

  const handleChange = (field: keyof FormValues, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (touched[field]) {
      setErrors(validateForm(next));
    }
  };

  const handleBlur = (field: keyof FormValues) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validateForm(values));
  };

  const handlePresetClick = (preset: string) => {
    const next = { ...values, subject: preset };
    setValues(next);
    if (touched.subject) {
      setErrors(validateForm(next));
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched({ name: true, email: true, subject: true, message: true });
    const validationErrors = validateForm(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setSubmittedPayload({
        name: values.name.trim(),
        email: values.email.trim(),
        subject: values.subject.trim(),
        message: values.message.trim(),
      });
    }
  };

  const handleCopyPayload = async () => {
    if (!submittedPayload) return;
    const text = [
      `To: ${BRAND.name} <${BRAND.contactEmail}>`,
      `From: ${submittedPayload.name} <${submittedPayload.email}>`,
      `Subject: ${submittedPayload.subject}`,
      '',
      submittedPayload.message,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const handleReset = () => {
    setSubmittedPayload(null);
    setValues(INITIAL_VALUES);
    setErrors({});
    setTouched({ name: false, email: false, subject: false, message: false });
    setCopied(false);
  };

  const inputBaseClass =
    'mt-2 block w-full rounded-xl bg-[#050608] border px-4 py-3.5 text-sm text-[#F5F7FA] placeholder:text-[#969EAE]/50 transition-colors duration-200 focus:outline-none focus:border-[#4F7DF3]';

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative bg-[#080B12] py-24 sm:py-32 lg:py-44 hairline-t"
    >
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Editorial Column */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <p className="text-xs font-medium tracking-[0.14em] text-[#969EAE] mb-4">
                06 · Connect
              </p>
              <h2
                id="contact-heading"
                className="font-display text-[clamp(2.2rem,4.5vw,3.7rem)] font-semibold leading-[1.06] tracking-[-0.028em] text-[#F5F7FA]"
              >
                Have an idea worth building?
              </h2>
              <p className="mt-5 text-base sm:text-lg leading-[1.68] text-[#DCE2EE]">
                Let&apos;s explore what we can create.
              </p>
              <p className="mt-4 text-sm leading-[1.72] text-[#969EAE]">
                Whether you want to discuss one of the independent projects in
                this ecosystem, share thoughtful feedback, or explore a future
                collaboration, prepare a concise note here.
              </p>
            </div>

            {/* Direct Official Contact Email Card */}
            <div className="mt-10 rounded-2xl bg-[#050608] border border-white/[0.08] p-5 sm:p-6">
              <div className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#101521] border border-white/10 text-[#4F7DF3]">
                  <Mail className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[#969EAE]">
                    Direct Contact Email
                  </p>
                  <a
                    href={`mailto:${BRAND.contactEmail}`}
                    className="mt-1 inline-flex items-center gap-1.5 font-mono text-sm sm:text-base font-medium text-[#F5F7FA] hover:text-[#4F7DF3] transition-colors break-all"
                  >
                    <span>{BRAND.contactEmail}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#4F7DF3]" />
                  </a>
                  <p className="mt-2 text-xs leading-relaxed text-[#969EAE]">
                    Write directly anytime for collaborations, ecosystem
                    projects, or thoughtful feedback.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2.5">
                    <a
                      href={`mailto:${BRAND.contactEmail}`}
                      className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full bg-[#F5F7FA] px-4 py-1.5 text-xs font-semibold text-[#050608] transition-colors hover:bg-[#DCE7FF]"
                    >
                      <span>Email directly</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-white/12 px-4 py-1.5 text-xs font-medium text-[#F5F7FA] transition-colors hover:border-white/30 hover:bg-white/[0.04]"
                    >
                      {copiedEmail ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-[#4F7DF3]" />
                          <span>Email copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy address</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form / Validated Output Dossier */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-[#0F131C] border border-white/[0.08] p-6 sm:p-8 lg:p-10">
              {submittedPayload ? (
                <div role="status" aria-live="polite" className="space-y-6">
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4F7DF3]/15 text-[#4F7DF3]">
                      <Check className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-semibold text-[#F5F7FA]">
                        Message ready to send
                      </h3>
                      <p className="text-xs text-[#969EAE]">
                        Addressed to{' '}
                        <span className="font-mono text-[#F5F7FA]">
                          {BRAND.contactEmail}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#050608] border border-white/[0.08] p-5 space-y-3.5 text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3.5 hairline-b">
                      <div>
                        <span className="block text-xs text-[#969EAE]">
                          Sender
                        </span>
                        <span className="mt-0.5 block font-medium text-[#F5F7FA]">
                          {submittedPayload.name}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs text-[#969EAE]">
                          Reply Address
                        </span>
                        <span className="mt-0.5 block font-mono text-xs text-[#F5F7FA]">
                          {submittedPayload.email}
                        </span>
                      </div>
                    </div>

                    <div className="pb-3.5 hairline-b">
                      <span className="block text-xs text-[#969EAE]">
                        Subject
                      </span>
                      <span className="mt-0.5 block font-medium text-[#F5F7FA]">
                        {submittedPayload.subject}
                      </span>
                    </div>

                    <div>
                      <span className="block text-xs text-[#969EAE]">
                        Message
                      </span>
                      <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-[#F5F7FA]/90">
                        {submittedPayload.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <a
                      href={buildMailtoHref(submittedPayload)}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#F5F7FA] px-5 py-2.5 text-xs font-semibold text-[#050608] whitespace-nowrap transition-colors hover:bg-[#DCE7FF]"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      <span>Open in Mail App</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={handleCopyPayload}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-xs font-medium text-[#F5F7FA] whitespace-nowrap transition-colors hover:border-white/30 hover:bg-white/[0.04]"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy message</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/12 px-4 py-2.5 text-xs font-medium text-[#969EAE] whitespace-nowrap transition-colors hover:border-white/25 hover:text-[#F5F7FA]"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Compose another</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  {/* Functional Subject Quick-Select Presets */}
                  <div>
                    <p className="text-xs font-medium text-[#969EAE] mb-2.5">
                      Quick topic selection
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {SUBJECT_PRESETS.map((preset) => {
                        const active = values.subject === preset;
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handlePresetClick(preset)}
                            aria-pressed={active}
                            className={`min-h-[36px] rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors duration-200 ${
                              active
                                ? 'bg-[#F5F7FA] text-[#050608]'
                                : 'bg-[#050608] border border-white/10 text-[#969EAE] hover:border-white/25 hover:text-[#F5F7FA]'
                            }`}
                          >
                            {preset}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-xs font-medium text-[#F5F7FA]/90"
                      >
                        Name
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={values.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        onBlur={() => handleBlur('name')}
                        placeholder="Your full name"
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={
                          errors.name ? 'contact-name-error' : undefined
                        }
                        className={`${inputBaseClass} ${
                          errors.name ? 'border-rose-400/75' : 'border-white/12'
                        }`}
                      />
                      {errors.name && (
                        <p
                          id="contact-name-error"
                          role="alert"
                          className="mt-2 text-xs text-rose-300"
                        >
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-xs font-medium text-[#F5F7FA]/90"
                      >
                        Email
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={values.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        onBlur={() => handleBlur('email')}
                        placeholder="you@example.com"
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={
                          errors.email ? 'contact-email-error' : undefined
                        }
                        className={`${inputBaseClass} ${
                          errors.email
                            ? 'border-rose-400/75'
                            : 'border-white/12'
                        }`}
                      />
                      {errors.email && (
                        <p
                          id="contact-email-error"
                          role="alert"
                          className="mt-2 text-xs text-rose-300"
                        >
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-subject"
                      className="block text-xs font-medium text-[#F5F7FA]/90"
                    >
                      Subject
                    </label>
                    <input
                      id="contact-subject"
                      name="subject"
                      type="text"
                      required
                      value={values.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      onBlur={() => handleBlur('subject')}
                      placeholder="Collaboration, project feedback, or a new idea"
                      aria-invalid={Boolean(errors.subject)}
                      aria-describedby={
                        errors.subject ? 'contact-subject-error' : undefined
                      }
                      className={`${inputBaseClass} ${
                        errors.subject
                          ? 'border-rose-400/75'
                          : 'border-white/12'
                      }`}
                    />
                    {errors.subject && (
                      <p
                        id="contact-subject-error"
                        role="alert"
                        className="mt-2 text-xs text-rose-300"
                      >
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <label
                        htmlFor="contact-message"
                        className="block text-xs font-medium text-[#F5F7FA]/90"
                      >
                        Message
                      </label>
                      <span className="font-mono text-[11px] tabular-nums text-[#969EAE]/75">
                        {values.message.trim().length} chars
                      </span>
                    </div>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      required
                      value={values.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      onBlur={() => handleBlur('message')}
                      placeholder="Tell us about what you are thinking of building..."
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={
                        errors.message ? 'contact-message-error' : undefined
                      }
                      className={`${inputBaseClass} resize-y min-h-[136px] ${
                        errors.message
                          ? 'border-rose-400/75'
                          : 'border-white/12'
                      }`}
                    />
                    {errors.message && (
                      <p
                        id="contact-message-error"
                        role="alert"
                        className="mt-2 text-xs text-rose-300"
                      >
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <button
                      type="submit"
                      className="inline-flex min-h-[48px] items-center gap-2.5 rounded-full bg-[#F5F7FA] px-7 py-3 text-sm font-semibold text-[#050608] whitespace-nowrap transition-all duration-200 hover:bg-[#DCE7FF] active:scale-[0.98]"
                    >
                      <span>Prepare &amp; Send Email</span>
                      <Send className="h-4 w-4" />
                    </button>

                    <span className="text-xs text-[#969EAE]">
                      To{' '}
                      <span className="font-mono text-[#F5F7FA]">
                        {BRAND.contactEmail}
                      </span>
                    </span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
