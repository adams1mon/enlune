import { BrandBadge } from "@/components/ui/brand-badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { NavChip } from "@/components/ui/nav-chip";
import { ValueCarousel } from "@/components/ui/value-carousel";

const navItems: Array<{ label: string; active?: boolean }> = [
  { label: "Services" },
  { label: "Pricing", active: true },
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

export default function Home() {
  return (
    <main className="min-h-screen bg-page">
      <Container className="px-4 pb-16 sm:px-6 sm:pb-20">
        <header className="sticky top-0 z-30 py-4 sm:py-6">
          <div className="flex flex-col items-center gap-4 md:grid md:grid-cols-[1fr_auto_1fr] md:items-start md:gap-0">
            <div className="w-full md:w-auto md:justify-self-start">
              <BrandBadge />
            </div>

            <nav
              aria-label="Primary"
              className="nav-cluster md:justify-self-center"
            >
              {navItems.map((item) => (
                <NavChip
                  key={item.label}
                  active={item.active}
                  ariaCurrent={item.active ? "page" : undefined}
                >
                  {item.label}
                </NavChip>
              ))}
              <Button
                href="#"
                size="sm"
                variant="surface"
              >
                Book a call
              </Button>
            </nav>

            <div className="hidden md:block" aria-hidden="true" />
          </div>
        </header>

        <section className="flex min-h-[calc(100svh-5.5rem)] items-center justify-center py-10 sm:min-h-[calc(100svh-6.5rem)] sm:py-16">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <h1 className="max-w-[20ch] text-balance font-display font-regular text-4xl tracking-tight text-ink sm:text-5xl md:text-6xl">
              Intelligent software <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              for <span className="text-accent font-bold">everyone.</span>
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-base font-normal text-muted sm:text-lg">
              Save time. Remove busywork. Operate smoother.
            </p>

            <Button
              className="mt-8"
              href=""
            >
              Book a 30-min call
            </Button>
          </div>
        </section>

        <section className="py-16 sm:py-20 md:py-24">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <h2 className="font-display text-4xl tracking-tight text-ink sm:text-5xl md:text-[3.5rem] md:leading-[1.02]">
              Simple, easy process
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
      </Container>
    </main>
  );
}
