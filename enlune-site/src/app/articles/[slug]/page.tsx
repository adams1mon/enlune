import Link from 'next/link';
import { notFound } from 'next/navigation';

const articleMap = {
  'youtube-channel-analyzer-opportunities': {
    title: 'Using YouTube analysis to make better growth decisions',
    subhead:
      'A channel analyzer helps you see what is working, spot the ideas worth repeating, and decide what to make next with more confidence.',
    intro: [
      'Most people research a YouTube channel the same way. They open a few videos, scan the view counts, and try to build a mental model from scattered impressions.',
      'That approach can work, but it is slow. It also leaves a lot unresolved once the first pattern seems obvious.',
      'You can tell that a video did well. It is harder to tell whether it was a real outlier, what promise it made, who it was really speaking to, and whether its success is something you can learn from or just admire from a distance.',
    ],
    sections: [
      {
        title: 'The problem is rarely data. It is synthesis.',
        paragraphs: [
          'YouTube does not suffer from a lack of visible signals. Titles, thumbnails, view counts, upload dates, lengths, comments, and adjacent recommendations are all right there.',
          'The harder part comes later. Once you have opened enough tabs, you still need to turn that pile of signals into a useful read on the channel. What is normal here? What is genuinely exceptional? Which videos are winning because the topic was right, and which ones are winning because the packaging and delivery were tighter?',
          'That is the job the analyzer is meant to do. Instead of treating a channel like a pile of unrelated uploads, it turns the recent catalog into a pattern map.',
          'You get a faster channel snapshot, a baseline for what normal performance looks like, and a clearer path to the videos that deserve a closer read. Better content strategy usually starts with better pattern recognition, not with more tabs open.',
        ],
        image: {
          src: '/images/tools/youtube-analyzer/channel-snapshot-dashboard.png',
          alt: 'The Enlune YouTube analyzer showing a saved channel snapshot with summary metrics, findings, and recent video cards.',
          caption:
            'A saved channel snapshot makes the shape of a channel easier to read at a glance, with baseline metrics, standout signals, and the recent video set in one place.',
        },
      },
      {
        title: 'A good channel snapshot changes what you notice',
        paragraphs: [
          'When the important signals live together, you stop overreacting to one big hit or one disappointing upload. The channel becomes easier to read as a whole.',
          'You can see whether views are concentrated in a few breakout videos or spread more evenly across the catalog. You can see whether recent uploads are climbing, flattening, or leaning on the same format too often.',
          'That changes the quality of the decisions that come next. Instead of asking, "What should we post?" in the abstract, you can ask what is already earning attention here and what seems to have more room to expand.',
        ],
      },
      {
        title: 'Outliers are useful, but only if you can interpret them',
        paragraphs: [
          'The highest-viewed videos on a channel are usually where people start. That makes sense, but a top performer is not automatically a strategy.',
          'Sometimes a video wins because the topic had built-in demand. Sometimes it wins because the title made a sharper promise. Sometimes the format was more specific, the guest was stronger, or the packaging was simply better than usual.',
          'A useful analyzer helps narrow the field before you do the deeper work. It shows you what deserves a closer look, so you can spend your time interpreting the right examples instead of browsing at random.',
          'That is where better ideas come from. Not from copying the biggest number on the page, but from understanding what made that number possible.',
        ],
      },
      {
        title: 'Transcript analysis gets you closer to why a video worked',
        paragraphs: [
          'Surface-level metrics can tell you what won attention. They cannot fully explain how the video held it or how the argument unfolded once the viewer clicked.',
          'Transcript-level analysis helps with that next layer. You can inspect the structure, the repeated themes, and the way the creator frames the value of the video.',
          'That makes idea mining more practical. You move from "this topic seems to work" to a more useful read: this is how the creator opened the loop, how they kept momentum, and how they translated a broad topic into a concrete promise.',
          'For anyone trying to make better videos, briefs, or research notes, that is a much more actionable starting point than raw view counts alone.',
        ],
      },
      {
        title: 'This is useful for more than creators',
        paragraphs: [
          'Creators can use this kind of analysis to plan a stronger editorial calendar. It helps them see which themes are repeating, which formats are drifting, and where a channel may be underexploring a promising angle.',
          'Agencies can use it to benchmark a client against their own history, not just against generic advice. It also gives them a faster way to audit adjacent channels before recommending a content direction.',
          'Operators, researchers, and niche businesses can use the same workflow to understand what audiences in a space keep responding to. In that sense, it is not only a YouTube tool. It is also a lightweight research tool for demand, framing, and message clarity.',
        ],
      },
      {
        title: 'The deeper benefit is repeatable research',
        paragraphs: [
          'The real value is not saving twenty minutes once. It is being able to run the same analysis repeatedly across channels, topics, and time periods without starting from zero every time.',
          'That matters if content is part of your growth strategy. You need a way to revisit the same niche, compare patterns, save what you learned, and turn scattered observations into a process the team can actually use.',
          'That is what a good channel analyzer should help with. It should make research easier to revisit, easier to explain, and easier to turn into better bets.',
        ],
      },
    ],
    cta: {
      title: 'Want help turning channel research into a clearer content strategy?',
      body: [
        'Enlune builds practical analysis and automation systems for teams that want better visibility into what is working and what to do next.',
        'If you want help turning this kind of research into a usable workflow for your business, get in touch or book a short intro call.',
      ],
      emailHref: 'mailto:contact@enlune.com',
      emailLabel: 'Write us on email',
      callHref: 'https://cal.com/adam-simon-dmvxgy/30min',
      callLabel: 'Let\'s have a chat',
    },
  },
} as const;

type ArticleSlug = keyof typeof articleMap;

function ArticleSection({
  title,
  paragraphs,
  image,
}: {
  title: string;
  paragraphs: readonly string[];
  image?: {
    src: string;
    alt: string;
    caption: string;
  };
}) {
  return (
    <section className="mt-20 border-t border-zinc-200 pt-16 first:mt-0 first:border-t-0 first:pt-0">
      <h2 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-[2rem]">
        {title}
      </h2>

      <div className="mt-8 space-y-6 text-[1.06rem] leading-8 text-zinc-700">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      {image ? (
        <figure className="mt-12 overflow-hidden rounded-[2rem] border border-zinc-200 bg-zinc-950 shadow-[0_25px_80px_rgba(0,0,0,0.08)]">
          <img alt={image.alt} className="block h-auto w-full" src={image.src} />
          <figcaption className="border-t border-white/10 bg-white px-5 py-4 text-sm leading-6 text-zinc-600 sm:px-6">
            {image.caption}
          </figcaption>
        </figure>
      ) : null}
    </section>
  );
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articleMap[slug as ArticleSlug];

  if (!article) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white px-6 py-16 text-zinc-950 lg:px-8">
      <article className="mx-auto max-w-3xl">
        <div className="xl:col-start-5 xl:col-span-4">
          <header className="pb-16">
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl sm:leading-[1.05]">
              {article.title}
            </h1>
            <p className="mt-5 text-lg leading-8 text-zinc-600">{article.subhead}</p>

            <div className="mt-10 space-y-6 text-[1.08rem] leading-8 text-zinc-700">
              {article.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </header>

          {article.sections.map((section) => (
            <ArticleSection key={section.title} {...section} />
          ))}

          <section className="mt-20 rounded-[2rem] border border-zinc-200 bg-zinc-50 px-6 py-7 sm:px-8">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">
              {article.cta.title}
            </h2>

            <div className="mt-5 space-y-5 text-base leading-7 text-zinc-700">
              {article.cta.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                className="inline-flex items-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
                href={article.cta.callHref}
              >
                {article.cta.callLabel}
              </a>
              <a
                className="inline-flex items-center rounded-full border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
                href={article.cta.emailHref}
                rel="noreferrer"
                target="_blank"
              >
                {article.cta.emailLabel}
              </a>
            </div>
          </section>

          <div className="mt-10">
            <Link
              className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50"
              href="/articles"
            >
              Back to articles
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
