import type { MetadataRoute } from "next";

const baseUrl = "https://jobstacker.app";
const lastModified = new Date();

type Route = { path: string; priority: number; changeFreq: "weekly" | "monthly" | "yearly" };

const core: Route[] = [
  { path: "", priority: 1.0, changeFreq: "weekly" },
  { path: "/login", priority: 0.6, changeFreq: "monthly" },
  { path: "/signup", priority: 0.8, changeFreq: "monthly" },
  { path: "/install", priority: 0.7, changeFreq: "monthly" },
  { path: "/privacy", priority: 0.3, changeFreq: "yearly" },
  { path: "/terms", priority: 0.3, changeFreq: "yearly" },
];

const features: Route[] = [
  { path: "/quote-software", priority: 0.9, changeFreq: "monthly" },
  { path: "/invoice-software", priority: 0.9, changeFreq: "monthly" },
  { path: "/job-management-software", priority: 0.9, changeFreq: "monthly" },
  { path: "/crm-software", priority: 0.9, changeFreq: "monthly" },
  { path: "/scheduling-software", priority: 0.9, changeFreq: "monthly" },
  { path: "/client-management-software", priority: 0.8, changeFreq: "monthly" },
  { path: "/customer-management-software", priority: 0.8, changeFreq: "monthly" },
  { path: "/lead-management-software", priority: 0.8, changeFreq: "monthly" },
  { path: "/trade-crm", priority: 0.8, changeFreq: "monthly" },
  { path: "/business-management-software", priority: 0.8, changeFreq: "monthly" },
  { path: "/field-service-management", priority: 0.8, changeFreq: "monthly" },
  { path: "/work-order-software", priority: 0.8, changeFreq: "monthly" },
  { path: "/job-tracking-software", priority: 0.8, changeFreq: "monthly" },
];

const trades: Route[] = [
  { path: "/crm-for-electricians", priority: 0.8, changeFreq: "monthly" },
  { path: "/crm-for-plumbers", priority: 0.8, changeFreq: "monthly" },
  { path: "/crm-for-builders", priority: 0.8, changeFreq: "monthly" },
  { path: "/crm-for-landscapers", priority: 0.8, changeFreq: "monthly" },
  { path: "/crm-for-gardeners", priority: 0.8, changeFreq: "monthly" },
  { path: "/crm-for-roofers", priority: 0.8, changeFreq: "monthly" },
  { path: "/crm-for-painters", priority: 0.8, changeFreq: "monthly" },
  { path: "/crm-for-contractors", priority: 0.8, changeFreq: "monthly" },
  { path: "/crm-for-handymen", priority: 0.8, changeFreq: "monthly" },
  { path: "/crm-for-carpenters", priority: 0.8, changeFreq: "monthly" },
  { path: "/crm-for-window-cleaners", priority: 0.8, changeFreq: "monthly" },
  { path: "/crm-for-pressure-washing", priority: 0.8, changeFreq: "monthly" },
  { path: "/crm-for-tree-surgeons", priority: 0.8, changeFreq: "monthly" },
  { path: "/crm-for-cleaners", priority: 0.8, changeFreq: "monthly" },
  { path: "/crm-for-driveway-cleaners", priority: 0.8, changeFreq: "monthly" },
  { path: "/crm-for-fencing-contractors", priority: 0.8, changeFreq: "monthly" },
  { path: "/crm-for-property-maintenance", priority: 0.8, changeFreq: "monthly" },
  { path: "/crm-for-decorators", priority: 0.8, changeFreq: "monthly" },
  { path: "/crm-for-hvac", priority: 0.8, changeFreq: "monthly" },
  { path: "/crm-for-pest-control", priority: 0.8, changeFreq: "monthly" },
  { path: "/crm-for-pool-maintenance", priority: 0.8, changeFreq: "monthly" },
];

const comparisons: Route[] = [
  { path: "/jobber-alternative", priority: 0.7, changeFreq: "monthly" },
  { path: "/tradify-alternative", priority: 0.7, changeFreq: "monthly" },
  { path: "/housecall-pro-alternative", priority: 0.7, changeFreq: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [...core, ...features, ...trades, ...comparisons].map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFreq,
    priority: route.priority,
  }));
}
