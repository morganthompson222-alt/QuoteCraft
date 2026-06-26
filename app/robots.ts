import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/customers/", "/quotes/", "/jobs/", "/calendar/", "/finance/", "/revenue/", "/settings/"],
    },
    sitemap: "https://jobstacker.app/sitemap.xml",
  };
}
