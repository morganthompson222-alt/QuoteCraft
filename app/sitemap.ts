import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://jobstacker.app";
  const lastModified = new Date();

  const publicRoutes = [
    { path: "", priority: 1.0, changeFreq: "weekly" as const },
    { path: "/login", priority: 0.6, changeFreq: "monthly" as const },
    { path: "/signup", priority: 0.8, changeFreq: "monthly" as const },
    { path: "/install", priority: 0.7, changeFreq: "monthly" as const },
    { path: "/privacy", priority: 0.3, changeFreq: "yearly" as const },
    { path: "/terms", priority: 0.3, changeFreq: "yearly" as const },
  ];

  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFreq,
    priority: route.priority,
  }));
}
