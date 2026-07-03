import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://jobstacker.app";

  const pages = [
    "", "/login", "/signup", "/setup", "/dashboard", "/customers", "/quotes", "/quotes/new",
    "/jobs", "/jobs/completed", "/calendar", "/finance", "/revenue", "/settings",
    "/terms", "/privacy", "/install", "/blog",
    "/crm-software", "/quote-software", "/invoice-software", "/job-management-software",
    "/scheduling-software", "/customer-management-software", "/lead-management-software",
    "/work-order-software", "/field-service-management", "/trade-crm",
    "/jobber-alternative", "/tradify-alternative", "/servicem8-alternative",
    "/housecall-pro-alternative", "/bigchange-alternative",
    "/free-crm-for-tradespeople", "/free-job-management-software", "/free-quote-software",
  ];

  return pages.map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: p === "" ? "weekly" as const : "monthly" as const,
    priority: p === "" ? 1 : p === "/login" || p === "/signup" ? 0.8 : 0.6,
  }));
}
