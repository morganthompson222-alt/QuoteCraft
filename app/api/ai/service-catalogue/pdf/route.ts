import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import { createClient } from "@supabase/supabase-js";

const COLOURS: Record<string, [number, number, number]> = {
  "1F6B4F": [0.12, 0.42, 0.31],
  "2563EB": [0.15, 0.39, 0.92],
  "DC2626": [0.86, 0.15, 0.15],
  "7C3AED": [0.49, 0.23, 0.93],
  "EA580C": [0.92, 0.35, 0.05],
  "0D9488": [0.05, 0.58, 0.53],
  "DB2777": [0.86, 0.15, 0.47],
  "1E3A5F": [0.12, 0.23, 0.37],
  "0891B2": [0.03, 0.57, 0.70],
  "D97706": [0.85, 0.47, 0.02],
  "059669": [0.02, 0.59, 0.41],
  "BE123C": [0.75, 0.07, 0.24],
  "6D28D9": [0.43, 0.16, 0.85],
  "0F766E": [0.06, 0.46, 0.43],
  "B45309": [0.71, 0.33, 0.04],
  "4338CA": [0.26, 0.22, 0.79],
  "166534": [0.09, 0.40, 0.20],
  "9D174D": [0.62, 0.09, 0.30],
  "92400E": [0.57, 0.25, 0.05],
  "3730A3": [0.22, 0.19, 0.64],
};

const TEMPLATES = ["classic", "modern", "professional", "creative", "minimal", "bold", "elegant", "natural"] as const;
type TemplateId = typeof TEMPLATES[number];

const WATERMARK_TIERS = ["solo", "business"]; // tiers that get watermark
const SINGLE_TEMPLATE_TIERS = ["solo"]; // tiers with only 1 template

async function generateCatalogueText(userId: string, supabase: any): Promise<string> {
  const { data: items } = await supabase
    .from("quote_items")
    .select("description, unit_price, quantity, quotes!inner(created_at)")
    .eq("quotes.user_id", userId)
    .order("quotes(created_at)", { ascending: false })
    .limit(200);

  const { data: profile } = await supabase
    .from("profiles")
    .select("custom_ai_instructions")
    .eq("id", userId)
    .single();

  const instructions = (profile as { custom_ai_instructions?: string } | null)?.custom_ai_instructions ?? "";
  const itemMap = new Map<string, { prices: number[]; count: number }>();
  for (const row of items ?? []) {
    const item = row as { description: string; unit_price: number; quantity: number };
    const desc = (item.description ?? "").toLowerCase().trim();
    if (!desc || desc.length < 2) continue;
    const key = desc;
    const existing = itemMap.get(key);
    if (existing) { existing.prices.push(Number(item.unit_price ?? 0)); existing.count++; }
    else { itemMap.set(key, { prices: [Number(item.unit_price ?? 0)], count: 1 }); }
  }

  const summaries = Array.from(itemMap.entries())
    .map(([desc, v]) => {
      const avg = v.prices.reduce((a, b) => a + b, 0) / v.prices.length;
      return `- "${desc}" used ${v.count}× at avg £${avg.toFixed(2)}`;
    }).join("\n");

  try {
    const { default: OpenAI } = await import("openai");
    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || "";
    const baseURL = process.env.GROQ_API_KEY ? "https://api.groq.com/openai/v1" : undefined;
    const openai = new OpenAI({ apiKey, baseURL });
    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL ?? (process.env.GROQ_API_KEY ? "llama-3.3-70b-versatile" : "gpt-4o-mini"),
      messages: [{ role: "system", content: "Merge similar services. Output as: \"Service name = £X per unit\" under category headings. No explanations." }, { role: "user", content: `${instructions ? `PRICING:\n${instructions}\n\n` : ""}HISTORY:\n${summaries}\n\nBuild a catalogue.` }],
      temperature: 0.2, max_tokens: 600,
    });
    return response.choices[0]?.message?.content?.trim() ?? "No services found.";
  } catch { return "AI generation unavailable."; }
}

export async function GET(request: NextRequest) {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/^["']|["']$/g, "").replace(/\n|\r/g, "");
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim().replace(/^["']|["']$/g, "").replace(/\n|\r/g, "");

  try {
    const authHeader = request.headers.get("Authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: { message: "Unauthorized", statusCode: 401 } }, { status: 401 });

    const supabase = createClient(supabaseUrl, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) return NextResponse.json({ error: { message: "Unauthorized", statusCode: 401 } }, { status: 401 });
    await supabase.auth.setSession({ access_token: token, refresh_token: token });

    const { data: profile } = await supabase.from("profiles").select("plan_tier, company_name").eq("id", userData.user.id).single();
    const rawTier = (profile as { plan_tier?: string } | null)?.plan_tier ?? "solo";
    const companyName = (profile as { company_name?: string } | null)?.company_name ?? "Your Business";
    let tier = rawTier;
    if (rawTier === "free") tier = "solo";
    if (rawTier === "unlimited") tier = "enterprise";

    const { searchParams } = new URL(request.url);
    let template = (searchParams.get("template") ?? "classic") as TemplateId;
    const colour = searchParams.get("colour") ?? "1F6B4F";

    if (SINGLE_TEMPLATE_TIERS.includes(tier) && template !== "classic") {
      return NextResponse.json({ error: { message: "Only the Classic template is available on your plan. Upgrade for more.", statusCode: 403 } }, { status: 403 });
    }
    if (!TEMPLATES.includes(template)) template = "classic";

    const needsWatermark = WATERMARK_TIERS.includes(tier);
    const [cr, cg, cb] = COLOURS[colour] ?? COLOURS["1F6B4F"];

    const catalogueText = await generateCatalogueText(userData.user.id, supabase);
    const lines = catalogueText.split("\n").filter(l => l.trim());
    const categories: { heading: string; items: { service: string; price: string }[] }[] = [];
    let currentCategory: typeof categories[0] | null = null;
    for (const line of lines) {
      if (line.startsWith("##") || line.startsWith("#")) {
        currentCategory = { heading: line.replace(/^#+\s*/, "").trim(), items: [] };
        categories.push(currentCategory);
      } else if (line.startsWith("-") || line.startsWith("*") || line.includes("£")) {
        const match = line.match(/(.+)=\s*£([\d.]+)(.*)/) || line.match(/(.+)=(.+)/);
        if (match && currentCategory) {
          currentCategory.items.push({ service: (match[1] || line).replace(/^[-*]\s*/, "").trim(), price: match[2] ? `£${match[2]}${match[3] || ""}` : match[2] });
        } else if (currentCategory) {
          currentCategory.items.push({ service: line.replace(/^[-*]\s*/, "").trim(), price: "" });
        }
      }
    }
    if (categories.length === 0) {
      categories.push({ heading: "Services", items: lines.map(l => ({ service: l.replace(/^[-*]\s*/, ""), price: "" })) });
    }

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();

    // Watermark
    if (needsWatermark) {
      const wText = "SAMPLE";
      const wSize = 44;
      const wWidth = bold.widthOfTextAtSize(wText, wSize);
      const wOffset = wWidth * 0.35355;
      const wSpacing = wWidth * 1.2;
      for (let row = -1; row * wSpacing < height + wSpacing; row++) {
        for (let col = -1; col * wSpacing < width + wSpacing; col++) {
          page.drawText(wText, {
            x: col * wSpacing - wOffset, y: row * wSpacing - wOffset,
            size: wSize, font: bold, color: rgb(0.95, 0.95, 0.95),
            rotate: degrees(45),
          });
        }
      }
    }

    let y = height - 50;
    const margin = 50;
    const pageWidth = width - margin * 2;

    // Template-specific header + layout
    const templateConfigs: Record<TemplateId, { headerBg: boolean; headerBar: boolean; tableLines: boolean; accentBlock: boolean; thickHeader: boolean; subtitle: string }> = {
      classic: { headerBg: true, headerBar: false, tableLines: false, accentBlock: false, thickHeader: false, subtitle: "Service & Pricing Catalogue" },
      modern: { headerBg: false, headerBar: true, tableLines: false, accentBlock: true, thickHeader: true, subtitle: "Service Catalogue" },
      professional: { headerBg: false, headerBar: false, tableLines: true, accentBlock: false, thickHeader: false, subtitle: "Official Price List" },
      creative: { headerBg: true, headerBar: true, tableLines: false, accentBlock: true, thickHeader: true, subtitle: "What We Offer" },
      minimal: { headerBg: false, headerBar: false, tableLines: false, accentBlock: false, thickHeader: false, subtitle: "Services" },
      bold: { headerBg: true, headerBar: true, tableLines: true, accentBlock: false, thickHeader: true, subtitle: "PRICE LIST" },
      elegant: { headerBg: false, headerBar: true, tableLines: true, accentBlock: false, thickHeader: false, subtitle: "Our Services" },
      natural: { headerBg: true, headerBar: false, tableLines: false, accentBlock: true, thickHeader: false, subtitle: "Service Guide" },
    };

    const cfg = templateConfigs[template];

    // Header background block
    if (cfg.headerBg) {
      page.drawRectangle({ x: 0, y: height - 110, width, height: 110, color: rgb(cr * 0.3 + 0.7, cg * 0.3 + 0.7, cb * 0.3 + 0.7) });
    }

    // Header bar line
    if (cfg.headerBar) {
      page.drawRectangle({ x: 0, y: height - 4, width, height: 4, color: rgb(cr, cg, cb) });
    }

    // Company name
    page.drawText(companyName, { x: margin, y, size: 22, font: bold, color: rgb(0.1, 0.1, 0.1) });
    y -= 22;
    page.drawText(cfg.subtitle, { x: margin, y, size: 11, font, color: rgb(cr, cg, cb) });
    y -= 20;

    // Accent block (small coloured rectangle)
    if (cfg.accentBlock) {
      page.drawRectangle({ x: margin, y: y - 4, width: 40, height: 3, color: rgb(cr, cg, cb) });
      y -= 12;
    }

    y -= 8;

    // Date
    page.drawText(new Date().toLocaleDateString("en-GB"), { x: width - margin - 80, y: height - 40, size: 9, font, color: rgb(0.5, 0.5, 0.5) });

    // Divider
    page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: rgb(0.85, 0.85, 0.85) });
    y -= 16;

    // Service categories
    for (const cat of categories) {
      if (y < 100) {
        y = height - 50;
        const np = pdfDoc.addPage([595.28, 841.89]);
        if (needsWatermark) {
          const wText2 = "SAMPLE";
          const wSize2 = 44;
          const wWidth2 = bold.widthOfTextAtSize(wText2, wSize2);
          const wOffset2 = wWidth2 * 0.35355;
          const wSpacing2 = wWidth2 * 1.2;
          for (let row = -1; row * wSpacing2 < height + wSpacing2; row++) {
            for (let col = -1; col * wSpacing2 < width + wSpacing2; col++) {
              np.drawText(wText2, {
                x: col * wSpacing2 - wOffset2, y: row * wSpacing2 - wOffset2,
                size: wSize2, font: bold, color: rgb(0.95, 0.95, 0.95),
                rotate: degrees(45),
              });
            }
          }
        }
      }

      // Category heading
      const headingSize = 14;
      page.drawText(cat.heading, { x: margin, y, size: headingSize, font: bold, color: rgb(cr, cg, cb) });
      y -= headingSize + 8;

      // Table header
      if (cfg.tableLines) {
        page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: rgb(cr, cg, cb) });
        y -= 4;
      }
      page.drawText("Service", { x: margin, y, size: 9, font: bold, color: rgb(0.4, 0.4, 0.4) });
      page.drawText("Price", { x: width - margin - 80, y, size: 9, font: bold, color: rgb(0.4, 0.4, 0.4) });
      y -= 4;
      page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) });
      y -= 10;

      for (const item of cat.items) {
        if (y < 60) {
          y = height - 50;
          pdfDoc.addPage([595.28, 841.89]);
        }
        page.drawText(item.service.substring(0, 45), { x: margin, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
        page.drawText(item.price, { x: width - margin - 80, y, size: 10, font: bold, color: rgb(0.3, 0.3, 0.3) });
        y -= 16;
        if (cfg.tableLines) {
          page.drawLine({ start: { x: margin, y: y + 6 }, end: { x: width - margin, y: y + 6 }, thickness: 0.3, color: rgb(0.95, 0.95, 0.95) });
        }
      }

      if (cfg.tableLines) {
          page.drawLine({ start: { x: margin, y: y + 8 }, end: { x: width - margin, y: y + 8 }, thickness: 1, color: rgb(cr, cg, cb) });
      }
      y -= 16;
    }

    // Footer
    y = Math.max(y, 50);
    page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 0.5, color: rgb(0.85, 0.85, 0.85) });
    y -= 14;
    page.drawText(`Generated by ${companyName} on ${new Date().toLocaleDateString("en-GB")}`, { x: margin, y, size: 8, font, color: rgb(0.6, 0.6, 0.6) });
    if (needsWatermark) {
      page.drawText("This is a sample document. Upgrade to remove watermark.", { x: margin, y: y - 12, size: 7, font, color: rgb(0.7, 0.7, 0.7) });
    }

    const pdfBytes = await pdfDoc.save();
    return new NextResponse(pdfBytes as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="service-catalogue-${companyName.replace(/\s+/g, "-").toLowerCase()}.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: { message: "Failed to generate PDF", statusCode: 500 } }, { status: 500 });
  }
}
