"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { blogPosts, type BlogCategory } from "../../src/lib/blog-posts";

const categories: { label: string; value: BlogCategory | "All" }[] = [
  { label: "All articles", value: "All" },
  { label: "Leads", value: "Leads" },
  { label: "Quoting", value: "Quoting" },
  { label: "Business Growth", value: "Business Growth" },
  { label: "Administration", value: "Administration" },
];

const sortOptions = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "A-Z", value: "az" },
];

export default function BlogPage() {
  const [category, setCategory] = useState<BlogCategory | "All">("All");
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = [...blogPosts];

    if (category !== "All") {
      result = result.filter((p) => p.category === category);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }

    switch (sort) {
      case "newest":
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case "az":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return result;
  }, [category, sort, search]);

  return (
    <section className="workspace-page" style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px" }}>
      <p className="hero__eyebrow" style={{ marginBottom: 8 }}>Articles</p>
      <h1 style={{ fontSize: 34, fontWeight: 800, color: "var(--text)", margin: "0 0 8px" }}>
        Advice for tradespeople
      </h1>
      <p style={{ fontSize: 16, color: "var(--text-muted)", marginBottom: 32, maxWidth: 500 }}>
        Practical guides on running a better trade business — from getting more leads to managing your finances.
      </p>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 32,
          padding: 16,
          background: "var(--surface)",
          borderRadius: 12,
          border: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value as BlogCategory | "All")}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                border: "none",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                background: category === c.value ? "#047857" : "var(--surface-muted)",
                color: category === c.value ? "#fff" : "var(--text-muted)",
                transition: "background 0.15s",
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--text)",
            fontSize: 13,
            width: 200,
            maxWidth: "100%",
          }}
        />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--text)",
            fontSize: 13,
          }}
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 48,
            color: "var(--text-muted)",
            fontSize: 15,
          }}
        >
          No articles found matching your search. Try a different category or search term.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {filtered.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              style={{
                display: "block",
                padding: "24px",
                background: "var(--surface)",
                borderRadius: 12,
                border: "1px solid var(--border)",
                textDecoration: "none",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#047857";
                e.currentTarget.style.boxShadow = "0 2px 12px rgba(4,120,87,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
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
                <span style={{ fontSize: 12, color: "var(--text-soft)" }}>
                  {post.date} · {post.readTime}
                </span>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: "0 0 8px" }}>
                {post.title}
              </h2>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
                {post.excerpt}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
