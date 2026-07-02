import type { MetadataRoute } from "next";
import { blogPosts } from "../src/lib/blog-posts";

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
  { path: "/blog", priority: 0.9, changeFreq: "weekly" },
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
  { path: "/servicem8-alternative", priority: 0.7, changeFreq: "monthly" },
  { path: "/bigchange-alternative", priority: 0.7, changeFreq: "monthly" },
  { path: "/powered-now-alternative", priority: 0.7, changeFreq: "monthly" },
  { path: "/commusoft-alternative", priority: 0.7, changeFreq: "monthly" },
  { path: "/simpro-alternative", priority: 0.7, changeFreq: "monthly" },
  { path: "/fieldedge-alternative", priority: 0.7, changeFreq: "monthly" },
  { path: "/workiz-alternative", priority: 0.7, changeFreq: "monthly" },
  { path: "/joblogic-alternative", priority: 0.7, changeFreq: "monthly" },
];

const pillars: Route[] = [
  { path: "/leads-for-tradespeople", priority: 0.9, changeFreq: "weekly" },
  { path: "/quoting-guide-for-tradespeople", priority: 0.9, changeFreq: "weekly" },
  { path: "/grow-trade-business", priority: 0.9, changeFreq: "weekly" },
  { path: "/trade-business-administration", priority: 0.9, changeFreq: "weekly" },
];

const overlap: Route[] = [
  { path: "/electrician-lead-management-software", priority: 0.8, changeFreq: "monthly" },
  { path: "/plumbing-crm-uk", priority: 0.8, changeFreq: "monthly" },
  { path: "/trade-business-management-app", priority: 0.8, changeFreq: "monthly" },
];

const commercialAlternatives: Route[] = [
  { path: "/servicem8-alternative", priority: 0.7, changeFreq: "monthly" },
  { path: "/bigchange-alternative", priority: 0.7, changeFreq: "monthly" },
  { path: "/powered-now-alternative", priority: 0.7, changeFreq: "monthly" },
  { path: "/commusoft-alternative", priority: 0.7, changeFreq: "monthly" },
  { path: "/simpro-alternative", priority: 0.7, changeFreq: "monthly" },
  { path: "/fieldedge-alternative", priority: 0.7, changeFreq: "monthly" },
  { path: "/workiz-alternative", priority: 0.7, changeFreq: "monthly" },
  { path: "/joblogic-alternative", priority: 0.7, changeFreq: "monthly" },
];

const bestOfTrade: Route[] = [
  { path: "/best-crm-for-electricians", priority: 0.8, changeFreq: "monthly" },
  { path: "/best-crm-for-plumbers", priority: 0.8, changeFreq: "monthly" },
  { path: "/best-crm-for-builders", priority: 0.8, changeFreq: "monthly" },
  { path: "/best-crm-for-contractors", priority: 0.8, changeFreq: "monthly" },
  { path: "/best-crm-for-landscapers", priority: 0.8, changeFreq: "monthly" },
  { path: "/best-crm-for-roofers", priority: 0.8, changeFreq: "monthly" },
  { path: "/best-software-for-tradespeople", priority: 0.8, changeFreq: "monthly" },
];

const freeAndCheap: Route[] = [
  { path: "/free-crm-for-electricians", priority: 0.8, changeFreq: "monthly" },
  { path: "/free-crm-for-tradespeople", priority: 0.8, changeFreq: "monthly" },
  { path: "/free-quote-software", priority: 0.8, changeFreq: "monthly" },
  { path: "/free-job-management-software", priority: 0.8, changeFreq: "monthly" },
  { path: "/cheap-crm-for-tradespeople", priority: 0.8, changeFreq: "monthly" },
];

const tradeCombo: Route[] = [
  { path: "/electrician-quote-software", priority: 0.8, changeFreq: "monthly" },
  { path: "/plumber-quote-software", priority: 0.8, changeFreq: "monthly" },
  { path: "/builder-quote-software", priority: 0.8, changeFreq: "monthly" },
  { path: "/electrician-invoice-software", priority: 0.8, changeFreq: "monthly" },
  { path: "/plumber-invoice-software", priority: 0.8, changeFreq: "monthly" },
  { path: "/electrician-job-management", priority: 0.8, changeFreq: "monthly" },
  { path: "/plumber-job-management", priority: 0.8, changeFreq: "monthly" },
  { path: "/builder-job-management", priority: 0.8, changeFreq: "monthly" },
  { path: "/electrician-scheduling-software", priority: 0.8, changeFreq: "monthly" },
  { path: "/plumber-scheduling-software", priority: 0.8, changeFreq: "monthly" },
  { path: "/landscaper-quote-software", priority: 0.8, changeFreq: "monthly" },
];

const ukPages: Route[] = [
  { path: "/uk-trade-crm", priority: 0.8, changeFreq: "monthly" },
  { path: "/uk-electrician-software", priority: 0.8, changeFreq: "monthly" },
  { path: "/uk-plumber-software", priority: 0.8, changeFreq: "monthly" },
  { path: "/uk-builder-software", priority: 0.8, changeFreq: "monthly" },
  { path: "/uk-contractor-software", priority: 0.8, changeFreq: "monthly" },
  { path: "/uk-field-service-software", priority: 0.8, changeFreq: "monthly" },
];

const headToHead: Route[] = [
  { path: "/jobber-vs-tradify", priority: 0.7, changeFreq: "monthly" },
  { path: "/tradify-vs-servicem8", priority: 0.7, changeFreq: "monthly" },
  { path: "/housecall-pro-vs-jobber", priority: 0.7, changeFreq: "monthly" },
  { path: "/jobber-vs-servicem8", priority: 0.7, changeFreq: "monthly" },
  { path: "/best-field-service-software-uk", priority: 0.7, changeFreq: "monthly" },
  { path: "/best-quoting-software-uk", priority: 0.7, changeFreq: "monthly" },
  { path: "/best-job-management-software-uk", priority: 0.7, changeFreq: "monthly" },
  { path: "/best-crm-for-small-trade-business", priority: 0.7, changeFreq: "monthly" },
];

const appFeatures: Route[] = [
  { path: "/trade-lead-tracking", priority: 0.8, changeFreq: "monthly" },
  { path: "/trade-follow-up-software", priority: 0.8, changeFreq: "monthly" },
  { path: "/trade-customer-database", priority: 0.8, changeFreq: "monthly" },
  { path: "/trade-quote-tracker", priority: 0.8, changeFreq: "monthly" },
  { path: "/trade-business-app", priority: 0.8, changeFreq: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const blogRoutes: Route[] = blogPosts.map((post) => ({
    path: `/blog/${post.slug}`,
    priority: 0.7,
    changeFreq: "monthly" as const,
  }));

  return [...core, ...features, ...trades, ...comparisons, ...commercialAlternatives, ...bestOfTrade, ...freeAndCheap, ...tradeCombo, ...ukPages, ...headToHead, ...appFeatures, ...pillars, ...overlap, ...blogRoutes].map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFreq,
    priority: route.priority,
  }));
}
