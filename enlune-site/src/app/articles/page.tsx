import Link from 'next/link';

const articles = [
  {
    slug: 'youtube-channel-analyzer-opportunities',
    title: 'Using YouTube channel analysis to make better growth decisions',
    description:
      'A practical look at how clearer channel analysis leads to better content bets, faster research, and more confidence in what to make next.',
  },
];

export default function ArticlesIndexPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16 text-zinc-950 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-black/72">Innovate.</h1>
        { /* <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black/70">Our builds tell a story.</h1> */ }
        <p className="mt-4 max-w-2xl text-base leading-6 text-zinc-600">
          Read on to see how builds open new possibilities, save time, and make it easier for people to do their work.
        </p>

        <div className="mt-10 grid gap-4">
          {articles.map((article) => (
            <article
              className="rounded-3xl border border-zinc-200 p-6 transition hover:border-zinc-300 hover:bg-zinc-50/60 shadow-[0_10px_80px_rgba(0,0,0,0.08)]"
              key={article.slug}
            >
              <Link className="block" href={`/articles/${article.slug}`}>
                <h2 className="text-2xl font-semibold tracking-tight">{article.title}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600">{article.description}</p>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
