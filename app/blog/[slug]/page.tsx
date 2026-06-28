import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts } from "../../../src/lib/blog-posts";
import { CTA } from "../../../components/seo/CTA";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: `${post.title} — JobStacker`,
    description: post.excerpt,
    alternates: { canonical: `https://jobstacker.app/blog/${slug}` },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const related = blogPosts
    .filter((p) => p.slug !== slug && p.category === post.category)
    .slice(0, 3);

  return (
    <section style={{ maxWidth: 780, margin: "0 auto", padding: "40px 20px" }}>
      <Link
        href="/blog"
        style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)", textDecoration: "none", display: "inline-block", marginBottom: 24 }}
      >
        &larr; All articles
      </Link>

      {post.pillarSlug ? (
        <div style={{ marginBottom: 24, padding: "12px 16px", background: "#d1fae5", borderRadius: 8, border: "1px solid #a7f3d0", fontSize: 14, color: "#065f46" }}>
          Part of the <Link href={`/${post.pillarSlug}`} style={{ fontWeight: 700, color: "#047857", textDecoration: "none" }}>{post.category} guide</Link> &rarr; read the full guide for a complete overview.
        </div>
      ) : null}

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#047857",
            background: "#d1fae5",
            padding: "4px 10px",
            borderRadius: 12,
            textTransform: "uppercase",
          }}
        >
          {post.category}
        </span>
        <span style={{ fontSize: 13, color: "var(--text-soft)" }}>
          {post.date} · {post.readTime}
        </span>
      </div>

      <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.2, color: "var(--text)", margin: "0 0 32px" }}>
        {post.title}
      </h1>

      <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8 }}>
        {post.content.map((paragraph, i) => (
          <p key={i} style={{ marginBottom: 16 }}>
            {paragraph}
          </p>
        ))}
      </div>

      <CTA />

      {related.length > 0 ? (
        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Related articles</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/blog/${r.slug}`}
                style={{
                  display: "block",
                  padding: "16px 20px",
                  background: "var(--surface)",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  textDecoration: "none",
                }}
              >
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>
                  {r.date} · {r.readTime}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>{r.title}</div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
