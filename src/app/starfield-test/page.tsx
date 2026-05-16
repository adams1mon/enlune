import { Starfield } from "@/components/ui/starfield";

export default function StarfieldTestPage() {
  return (
    <main className="min-h-screen bg-page px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="max-w-3xl">
          <h1 className="font-display text-4xl tracking-tight text-ink sm:text-5xl">
            Starfield Test
          </h1>
          <p className="mt-4 text-base leading-7 text-muted sm:text-lg">
            Isolated playground for the animated star background. Each panel
            uses the same component with different density zones or background
            values.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[1.75rem] border border-black/8 bg-white/70 p-4 shadow-[0_18px_48px_rgba(18,18,18,0.08)]">
            <p className="mb-4 text-sm font-medium text-muted">
              Default density
            </p>
            <Starfield
              className="h-[24rem] w-full rounded-[1.25rem]"
              background="#6c67a8"
            />
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-black/8 bg-white/70 p-4 shadow-[0_18px_48px_rgba(18,18,18,0.08)]">
            <p className="mb-4 text-sm font-medium text-muted">
              Scroll warp enabled
            </p>
            <Starfield
              className="h-[24rem] w-full rounded-[1.25rem]"
              background="#6660a5"
              baseSpawnRate={24}
              warpOnScroll
              warpStrength={0.18}
            />
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-black/8 bg-white/70 p-4 shadow-[0_18px_48px_rgba(18,18,18,0.08)]">
            <p className="mb-4 text-sm font-medium text-muted">
              Denser top-left and lower-right clusters
            </p>
            <Starfield
              className="h-[24rem] w-full rounded-[1.25rem]"
              background="#625d9e"
              baseSpawnRate={28}
              densityZones={[
                { x: 0.18, y: 0.18, radius: 0.2, weight: 2.2 },
                { x: 0.32, y: 0.72, radius: 0.18, weight: 1.4 },
                { x: 0.82, y: 0.64, radius: 0.16, weight: 2 },
              ]}
            />
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-black/8 bg-white/70 p-4 shadow-[0_18px_48px_rgba(18,18,18,0.08)] lg:col-span-2">
            <p className="mb-4 text-sm font-medium text-muted">
              Wide banner variant
            </p>
            <Starfield
              className="h-[18rem] w-full rounded-[1.25rem]"
              background="#746dac"
              baseSpawnRate={20}
              densityZones={[
                { x: 0.1, y: 0.32, radius: 0.12, weight: 1.8 },
                { x: 0.48, y: 0.2, radius: 0.1, weight: 1.1 },
                { x: 0.78, y: 0.38, radius: 0.14, weight: 1.7 },
                { x: 0.62, y: 0.8, radius: 0.16, weight: 1.3 },
              ]}
            />
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-black/8 bg-white/70 p-4 shadow-[0_18px_48px_rgba(18,18,18,0.08)] lg:col-span-2">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-muted">
                  Weighted star colors
                </p>
                <p className="mt-1 text-sm leading-6 text-muted">
                  Mostly white stars, with some cool blue and a smaller warm gold accent.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 text-xs text-muted">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-white" />
                  70% white
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d2e1ff]" />
                  20% blue
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ffe4b4]" />
                  10% gold
                </span>
              </div>
            </div>

            <Starfield
              className="h-[22rem] w-full rounded-[1.25rem]"
              background="rgba(5, 10, 20, 0.9)"
              baseSpawnRate={24}
              starColors={[
                {
                  color: "rgba(255,255,255,0.98)",
                  glowColor: "rgba(255,255,255,0.95)",
                  weight: 0.7,
                },
                {
                  color: "rgba(210,225,255,0.98)",
                  glowColor: "rgba(210,225,255,0.92)",
                  weight: 0.2,
                },
                {
                  color: "rgba(255,228,180,0.98)",
                  glowColor: "rgba(255,228,180,0.9)",
                  weight: 0.1,
                },
              ]}
              densityZones={[
                { x: 0.18, y: 0.24, radius: 0.16, weight: 1.5 },
                { x: 0.68, y: 0.36, radius: 0.14, weight: 1.3 },
                { x: 0.28, y: 0.78, radius: 0.2, weight: 1.9 },
                { x: 0.84, y: 0.74, radius: 0.12, weight: 1.1 },
              ]}
            />
          </div>

          <div className="col-span-2 overflow-hidden rounded-[1.75rem] border border-black/8 bg-white/70 p-4 shadow-[0_18px_48px_rgba(18,18,18,0.08)]">
            <p className="mb-4 text-sm font-medium text-muted">
              Scroll warp enabled large
            </p>
            <Starfield
              className="h-[100rem] w-full rounded-[1.25rem]"
              background="#6660a5"
              baseSpawnRate={25}
              warpOnScroll
              warpStrength={0.5}
              useStarShadowBlur={false}
              densityZones={[
                { x: 0.1, y: 0.32, radius: 0.12, weight: 1.8 },
                { x: 0.48, y: 0.2, radius: 0.1, weight: 1.1 },
                { x: 0.78, y: 0.38, radius: 0.14, weight: 1.7 },
                { x: 0.62, y: 0.8, radius: 0.16, weight: 1.3 },
              ]}
            />
          </div>

        </section>
      </div>
    </main>
  );
}
