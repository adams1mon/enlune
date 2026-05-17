import { BrandBadge } from "@/components/ui/brand-badge";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { NavChip } from "@/components/ui/nav-chip";
import { ValueCarousel } from "@/components/ui/value-carousel";
import Image from "next/image";
import Booker from "@/components/ui/booker";
import { Starfield } from "@/components/ui/starfield";

// TODO: unify design system, use tailwind-provided tokens and add ones for brand color etc.

const navItems: Array<{ label: string; active?: boolean, href: string }> = [
  { label: "Services", href: "#services" },
];

const processSteps = [
  {
    title: "Discover",
    description:
      "We look at the problem, find the best first win, and define a clear scope.",
    cardClassName: "process-card--left",
  },
  {
    title: "Implement",
    description:
      "We build the software according to scope and benefits.",
    cardClassName: "process-card--center",
  },
  {
    title: "Deliver",
    description:
      "You get the finished system, documentation, and a clear next step.",
    cardClassName: "process-card--right",
  },
] as const;

const valueCards = [
  {
    title: "Start small",
    description:
      "No months of planning. We pick one painful workflow and improve it first.",
    iconSrc: "/mdi_puzzle.svg",
    hue: 250,
    starsPosition: "0% 0%",
  },
  {
    title: "Clear scope",
    description:
      "You'll know exactly what's being built before the work starts.",
    iconSrc: "/solar_telescope-linear.svg",
    hue: 260,
    starsPosition: "31% 42%",
  },
  {
    title: "Real outcome",
    description:
      "You get working software that moves your business forward.",
    iconSrc: "/mage_gem-stone.svg",
    hue: 270,
    starsPosition: "0 0",
  },
  {
    title: "Low risk",
    description:
      "Test the idea with a limited pilot before you commit to a larger build.",
    iconSrc: "/icon-park-outline_protection.svg",
    hue: 280,
    starsPosition: "55% 0",
  },
  {
    title: "Room to grow",
    description:
      "If the pilot works, we can keep building from there.",
    iconSrc: "/hugeicons_workflow-square-07.svg",
    hue: 290,
    starsPosition: "10% 70%",
  },
] as const;

const pricingExamples = [
  "Customer-facing Apps",
  "Operations",
  "Customer Support",
  "Internal Tools",
  "Dashboards",
  "Marketing",
  "Content & SEO",
  "Knowledge Base",
  "RAG",
  "Backend",
  "Frontend",
  "APIs",
  "Distributed Systems",
  "A page like this?"
] as const;

const pilotFeatures = [
  "One workflow selected for the pilot",
  "Clear scope, timeline, and success criteria",
  "Custom software built around your business",
  "Backend, frontend, AI automation as needed",
  "Working pilot your team can test and use",
  // "Review session with recommendations for what to build next",
  "80% money-back guarantee if we can't deliver the scoped build",
] as const;

const faqItems = [
  {
    id: "faq-what-does-enlune-build",
    title: "What does Enlune build?",
    content:
      "Enlune builds practical software for real business needs: internal tools, workflows, integrations, web features, and useful AI features.",
  },
  {
    id: "faq-who-is-this-for",
    title: "Who is this for?",
    content:
      "Usually founders and small teams that need better software but do not want a huge project or an in-house team.",
  },
  {
    id: "faq-ai-projects",
    title: "Is this only for AI projects?",
    content:
      "No. AI is one part of the work. Enlune also builds web, backend, workflow, and integration projects.",
  },
  {
    id: "faq-dont-know-what-to-build",
    title: "What if I do not know what to build first?",
    content:
      "That is what the first call is for. We help find the best small win to start with.",
  },
  {
    id: "faq-not-technical",
    title: "What if I am not technical?",
    content:
      "That is fine. You explain the problem. We handle the technical side.",
  },
  {
    id: "faq-how-long-does-a-pilot-take",
    title: "How long does a pilot take?",
    content:
      "It depends on scope, but the goal is to keep it short and focused. An ideal pilot build shouldn't last more than 4 weeks.",
  },
  {
    id: "faq-what-happens-after-the-pilot",
    title: "What happens after the pilot?",
    content:
      "You can stop there, improve the pilot, or expand into a larger project.",
  },
  {
    id: "faq-do-you-guarantee-results",
    title: "Do you guarantee results?",
    content:
      "We guarantee the agreed scope will be delivered. We do not guarantee revenue or ROI.",
  },
  {
    id: "faq-off-the-shelf-tools",
    title: "Why not just use off the shelf tools?",
    content:
      "Sometimes you should. But when your business outgrows those tools, custom software can save time and reduce friction.",
  },
  {
    id: "faq-freelancer-or-agency",
    title: "Is Enlune a freelancer or an agency?",
    content:
      "Enlune is a founder-led software agency with a focused, hands-on process.",
  },
] as const;

export default function Home() {
  return (
    <main className="min-h-screen">
      <Container className="px-4 sm:px-6">
        <header className="py-2 sm:py-6">
          <div className="flex flex-col items-center gap-2 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-start gap-0">
            <BrandBadge />

            <nav
              aria-label="Primary"
              className="nav-cluster"
            >
              {navItems.map((item) => (
                <NavChip
                  href={item.href}
                  key={item.label}
                  active={item.active}
                  ariaCurrent={item.active ? "page" : undefined}
                >
                  {item.label}
                </NavChip>
              ))}
              <Button
                href="#book"
                size="sm"
                variant="surface"
              >
                Book a call
              </Button>
            </nav>

            <div className="hidden md:block" aria-hidden="true" />
          </div>
        </header>

        {/* hero background


          <div className="absolute inset-0 bg-[linear-gradient(#6357e8_30%,white_100%)] z-[-999]" />

          6863e7c

          linear-gradient(#181446 80%, #fff 100%)

          <div className="absolute inset-0 bg-[linear-gradient(#4368c1_50%,white_100%)] z-[-999]" />
          <div className="absolute inset-0 bg-[linear-gradient(#4368c1_55%,white_100%)] z-[-999]" />
          */ }
        <div className="">
          <div className="absolute inset-0 bg-[linear-gradient(#181446_80%,white_100%)] z-[-999]" />

          <Starfield
            className="h-full w-full absolute top-0 left-0 z-[-999]"
            background="transparent"
            baseSpawnRate={25}
            warpOnScroll
            warpStrength={0.5}
            useStarShadowBlur={true}
            densityZones={[
              { x: 0.1, y: 0.32, radius: 0.52, weight: 1.8 },
              { x: 0.48, y: 0.2, radius: 0.1, weight: 1.1 },
              { x: 0.78, y: 0.38, radius: 0.14, weight: 1.7 },
              { x: 0.62, y: 0.8, radius: 0.16, weight: 1.3 },
            ]}
            starColors={[
              {
                color: "#fff",
                weight: 1,
              },
            ]}
          />
        </div>

        <section className="overflow-hidden">

          <div className="relative z-[4] flex min-h-[calc(100svh-5.5rem)] items-center justify-center px-6 pb-10 sm:pb-16">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <h1 className="max-w-[20ch] top-[-50px] text-balance font-display font-regular text-4xl tracking-tight text-white/85 drop-shadow-[0_12px_32px_rgba(70,70,70,0.56)] sm:text-5xl md:text-6xl">
                Intelligent software <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                for <span className="font-bold text-white">everyone</span>
              </h1>

              <p className="mt-6 max-w-xl text-pretty text-base font-normal text-white/80 sm:text-lg drop-shadow[0_12px_32px_rgba(30,30,30,0.8)]">
                Save time. Remove busywork. Operate smoother.
              </p>

              <Button
                className="mt-8 surf"
                href="#book"
              >
                Book a 30-min call
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 md:py-24">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <h2 className="font-display text-4xl tracking-tight text-ink sm:text-5xl md:text-[3.5rem] md:leading-[1.02]">
              <span className="font-bold">Simple</span>, easy process
            </h2>

            <p className="mt-6 max-w-2xl text-pretty text-lg font-normal leading-8 text-muted">
              We analyze the problem, define a clear outcome, then ship in
              increments until the system works as expected.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:mt-16 md:grid-cols-3">
            {processSteps.map((step) => (
              <article
                key={step.title}
                className={`process-card ${step.cardClassName}`}
              >
                <div className="process-card__content">
                  <h3 className="text-[1.65rem] font-medium tracking-tight text-inverse">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-muted-inverse">
                    {step.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="py-16 sm:py-20 md:py-24">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <h2 className="max-w-[20ch] text-balance font-display text-4xl font-regular tracking-tight text-ink sm:text-5xl md:text-[3.5rem] md:leading-[1.05]">
              A <span className="font-bold">safer</span> way to build custom software
            </h2>

            <p className="mt-6 max-w-3xl text-pretty text-lg font-normal leading-8 text-muted">
              Custom software should not feel like a gamble. Start with a
              focused pilot, solve one real bottleneck, and decide what comes
              next based on working software, not promises, slides, or vague
              timelines.
            </p>
          </div>

          <div className="mt-12 md:mt-16">
            <ValueCarousel cards={valueCards} />
          </div>
        </section>

        <section className="pricing-stage" id="services">
          <div className="pricing-stage__sticky">
            <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
              <h2 className="max-w-[16ch] text-balance font-display text-4xl tracking-tight text-ink sm:text-5xl md:text-[3.5rem] md:leading-[1.02]">
                Build <span className="font-bold">amazing</span> things
              </h2>

              <p className="mt-6 max-w-3xl text-pretty text-lg font-normal leading-8 text-muted">
                Your best ideas should not be trapped in spreadsheets, docs, or manual processes.
                <br/>
                Let’s turn them into working software.
              </p>
            </div>

            <div className="pricing-ribbon mt-12">
              <div className="pricing-ribbon__track">
                {[...pricingExamples, ...pricingExamples].map((label, index) => (
                  <span key={`${label}-${index}`} className="pricing-ribbon__pill">
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="pricing-stage__panel-wrap" id="book">
              <article className="pricing-panel">
                <div className="pricing-panel__content">
                  <h3 className="font-display text-3xl font-medium tracking-tight text-inverse sm:text-[2.25rem]">
                    Start a pilot today
                  </h3>

                  <ul className="pricing-panel__list">
                    {pilotFeatures.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </div>

              </article>

              <div className="pricing-panel__moon" aria-hidden="true">
                <Image
                  src="/moon.png"
                  alt=""
                  width={600}
                  height={600}
                  className="pricing-panel__moon-image"
                />
              </div>

              <div className="mt-8 flex w-full flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-between">

                <section className="order-2 w-full my-8 max-w-[34rem] p-6 text-inverse lg:order-1 lg:w-[45%] lg:mt-0 ">
                  <div className="mb-5">
                    <h4 className="text-2xl text-inverse">
                      <span className="italic">Frequently</span> asked questions
                    </h4>
                    <p className="mt-3  text-sm leading-7 text-muted-inverse">
                      Quick answers before you book. If you still need context,
                      schedule a call or send an email. Happy to help!
                    </p>
                  </div>

                  <Accordion
                    items={faqItems}
                    defaultOpenItemId={faqItems[0].id}
                  />
                </section>

                {/* booking */}
                <div className="pricing-booker-shell order-1 w-full max-w-[600px] rounded-lg border-1 border-[var(--border-glass-soft)] bg-[var(--color-accent)]/20 p-6 lg:order-2 lg:w-[50%]">
                  <div className="pricing-booker__intro mb-4">
                    <h4 className="pricing-booker__title mb-2 font-display font-medium">
                      Book a 30-minute intro call
                    </h4>
                    <p className="pricing-booker__body">
                      Tell us your ideas, and we'll see if we can make it a reality.
                    </p>
                  <a
                    href="mailto:contact@enlune.com"
                    className="email-contact p-2 hover:bg-[rgba(255,255,255,0.1)] w-fit"
                  >
                    <span className="pricing-contact__icon-wrap">
                      <Image
                        src="/send_email.svg"
                        alt=""
                        width={30}
                        height={30}
                        aria-hidden="true"
                      />
                    </span>
                    <span className="pricing-contact__text">
                      <span className="pricing-contact__label">Prefer to email?</span>
                      <span className="pricing-contact__email">contact@enlune.com</span>
                    </span>
                    <span className="pricing-contact__arrow-wrap">
                      <Image
                        src="/arrow.svg"
                        alt=""
                        width={30}
                        height={30}
                        aria-hidden="true"
                      />
                    </span>
                  </a>
                  </div>
                  <Booker />
                </div>
              </div>

            </div>
          </div>
        </section>

      </Container>
    </main>
  );
}
