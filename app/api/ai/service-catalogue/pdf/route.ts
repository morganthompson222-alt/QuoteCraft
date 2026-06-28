import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import { createClient } from "@supabase/supabase-js";

const COLOURS: Record<string, [number, number, number]> = {
  "1F6B4F": [0.12,0.42,0.31], "0E9F6E": [0.05,0.62,0.43], "6B8F71": [0.42,0.56,0.44], "556B2F": [0.33,0.42,0.18],
  "163B65": [0.09,0.23,0.40], "2457D6": [0.14,0.34,0.84], "3B82F6": [0.23,0.51,0.96], "355C7D": [0.21,0.36,0.49],
  "0F766E": [0.06,0.46,0.43], "0891B2": [0.03,0.57,0.70],
  "1E1E1E": [0.12,0.12,0.12], "4B5563": [0.29,0.33,0.39], "374151": [0.22,0.25,0.32],
  "7A1F2A": [0.48,0.12,0.16], "8B2635": [0.55,0.15,0.21], "B91C1C": [0.73,0.11,0.11],
  "A05621": [0.63,0.34,0.13], "C2410C": [0.76,0.25,0.05], "B8860B": [0.72,0.53,0.04],
  "5B2C83": [0.36,0.17,0.51], "7E3F98": [0.49,0.25,0.60],
  "5D4037": [0.36,0.25,0.22], "8D6E63": [0.55,0.43,0.39],
  "0F172A": [0.06,0.09,0.16], "4338CA": [0.26,0.22,0.79],
};

const TEMPLATES = ["modern","tradesperson","luxury","construction","landscaping","corporate","priceguide","magazine","portfolio","aifuture","minimalist","sales"] as const;
type TemplateId = typeof TEMPLATES[number];
const WATERMARK_TIERS = ["solo","business"];

async function generateCatalogueText(userId: string, supabase: any): Promise<string> {
  const { data: items } = await supabase.from("quote_items")
    .select("description, unit_price, quantity, quotes!inner(created_at)")
    .eq("quotes.user_id", userId).order("quotes(created_at)",{ascending:false}).limit(200);
  const { data: profile } = await supabase.from("profiles").select("custom_ai_instructions").eq("id",userId).single();
  const instructions = (profile as any)?.custom_ai_instructions ?? "";
  const map = new Map<string,{prices:number[];count:number}>();
  for (const row of items??[]) {
    const item = row as {description:string;unit_price:number;quantity:number};
    const d = (item.description??"").toLowerCase().trim();
    if(!d||d.length<2)continue;
    const e = map.get(d);
    if(e){e.prices.push(Number(item.unit_price??0));e.count++;}
    else map.set(d,{prices:[Number(item.unit_price??0)],count:1});
  }
  const summaries = Array.from(map.entries()).map(([d,v])=>{
    const avg = v.prices.reduce((a,b)=>a+b,0)/v.prices.length;
    return `- "${d}" used ${v.count}× at avg £${avg.toFixed(2)}`;
  }).join("\n");
  try{
    const {default:OpenAI}=await import("openai");
    const k=process.env.GROQ_API_KEY??process.env.OPENAI_API_KEY??"";
    const ai=new OpenAI({apiKey:k,baseURL:process.env.GROQ_API_KEY?"https://api.groq.com/openai/v1":undefined});
    const r=await ai.chat.completions.create({model:process.env.AI_MODEL??"llama-3.3-70b-versatile",
      messages:[{role:"system",content:"Merge similar services into categories. Output as '## Category\\\\nService = £X per unit'. No explanations."},{role:"user",content:`${instructions?`PRICING:\\n${instructions}\\n\\n`:""}HISTORY:\\n${summaries}\\n\\nBuild a service catalogue.`}],
      temperature:0.2,max_tokens:600});
    return r.choices[0]?.message?.content?.trim()??"No services found.";
  }catch{return "AI generation unavailable.";}
}

function addWatermark(page:any,bold:any,w:number,h:number){
  const t="SAMPLE";const s=44;const ww=bold.widthOfTextAtSize(t,s);const o=ww*0.35355;const sp=ww*1.2;
  for(let R=-1;R*sp<h+sp;R++)for(let C=-1;C*sp<w+sp;C++)
    page.drawText(t,{x:C*sp-o,y:R*sp-o,size:s,font:bold,color:rgb(0.95,0.95,0.95),rotate:degrees(45)});
}

function drawLine(page:any,{x1,y1,x2,y2,thickness=0.5,c=rgb(0.85,0.85,0.85)}:any){
  page.drawLine({start:{x:x1,y:y1},end:{x:x2,y:y2},thickness,color:c});
}

function drawCard(page:any,x:number,y:number,w:number,h:number,c:any,bg=false){
  if(bg)page.drawRectangle({x,y:y-h,width:w,height:h,color:c});
  else{drawLine(page,{x1:x,y1:y,x2:x+w,y2:y,thickness:1,c});drawLine(page,{x1:x,y1:y-h,x2:x,y2:y-h,thickness:1,c});drawLine(page,{x1:x,y1:y-h,x2:x,y2:y,thickness:1,c});drawLine(page,{x1:x+w,y1:y-h,x2:x+w,y2:y,thickness:1,c});}
}

type PageCtx = {page:any;w:number;h:number;font:any;bold:any;cr:number;cg:number;cb:number;colour:any;light:any;y:number;m:number};

function newPage(pdfDoc:any,ctx:PageCtx,needsWatermark:boolean):PageCtx{
  const p=pdfDoc.addPage([595.28,841.89]);
  if(needsWatermark)addWatermark(p,ctx.bold,ctx.w,ctx.h);
  return{...ctx,page:p,y:ctx.h-50};
}

function catalogueToSections(text:string):{heading:string;items:{service:string;price:string}[]}[]{
  const lines=text.split("\n").filter(l=>l.trim());
  const cats:{heading:string;items:{service:string;price:string}[]}[]=[];
  let cur:typeof cats[0]|null=null;
  for(const l of lines){
    if(l.startsWith("##")||l.startsWith("#")){cur={heading:l.replace(/^#+\s*/,"").trim(),items:[]};cats.push(cur);}
    else if(l.includes("£")||l.includes("=")){
      const m=l.match(/(.+)=\s*£?([\d.]+)(.*)/)||l.match(/(.+)=(.+)/);
      if(m&&cur)cur.items.push({service:(m[1]||l).replace(/^[-*]\s*/,"").trim(),price:m[2]?`£${m[2]}${m[3]||""}`:m[2]});
      else if(cur)cur.items.push({service:l.replace(/^[-*]\s*/,"").trim(),price:""});
    }
  }
  if(cats.length===0)cats.push({heading:"Services",items:lines.map(l=>({service:l.replace(/^[-*]\s*/,""),price:""}))});
  return cats;
}

export async function GET(request: NextRequest) {
  return handleRequest(request, false);
}

export async function POST(request: NextRequest) {
  return handleRequest(request, true);
}

async function handleRequest(request: NextRequest, isPost: boolean) {
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
    const rawTier = ((profile as any)?.plan_tier ?? "solo") as string;
    const company = ((profile as any)?.company_name ?? "Your Business") as string;
    let tier = rawTier;
    if (rawTier === "free") tier = "solo";
    if (rawTier === "unlimited") tier = "enterprise";

    const { searchParams } = new URL(request.url);
    let template = (searchParams.get("template") ?? "modern") as TemplateId;
    let colour = searchParams.get("colour") ?? "1F6B4F";
    let providedText = searchParams.get("text") ?? "";

    // If POST, read params from JSON body
    if (isPost) {
      try {
        const body = await request.clone().json();
        template = (body.template ?? template) as TemplateId;
        colour = body.colour ?? colour;
        providedText = body.text ?? providedText;
      } catch { /* fall back to GET params */ }
    }
    if (!TEMPLATES.includes(template)) template = "modern";
    if (tier === "solo" && template !== "modern") {
      return NextResponse.json({ error: { message: "Only the Modern template is available on your plan. Upgrade for more.", statusCode: 403 } }, { status: 403 });
    }

    const needsWatermark = WATERMARK_TIERS.includes(tier);
    const [cr, cg, cb] = COLOURS[colour] ?? COLOURS["1F6B4F"];

    // Use user-provided text, or generate from history
    const catalogueText = providedText || await generateCatalogueText(userData.user.id, supabase);
    const sections = catalogueToSections(catalogueText);

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const w = 595.28, h = 841.89, m = 50;
    const col = (t:number)=>rgb((cr*0.3+0.7)*(1-t)+(cr*t),(cg*0.3+0.7)*(1-t)+(cg*t),(cb*0.3+0.7)*(1-t)+(cb*t));
    const colourRGB = rgb(cr,cg,cb);
    const lightRGB = rgb(cr*0.1+0.9,cg*0.1+0.9,cb*0.1+0.9);
    const darkRGB = rgb(cr*0.6,cg*0.6,cb*0.6);

    // COVER PAGE
    const cover = pdfDoc.addPage([w,h]);
    if(needsWatermark)addWatermark(cover,bold,w,h);

    if(template==="modern"||template==="aifuture"||template==="sales"){
      cover.drawRectangle({x:0,y:h-320,width:w,height:320,color:colourRGB});
      cover.drawText(company,{x:m,y:h-160,size:32,font:bold,color:rgb(1,1,1)});
      cover.drawText("Service & Pricing Catalogue",{x:m,y:h-195,size:14,font,color:rgb(1,1,1)});
      cover.drawText(new Date().toLocaleDateString("en-GB"),{x:m,y:h-215,size:10,font,color:col(0.15)});
    }else if(template==="tradesperson"||template==="landscaping"){
      cover.drawRectangle({x:0,y:h-140,width:w,height:140,color:lightRGB});
      cover.drawText(company,{x:m,y:h-50,size:28,font:bold,color:rgb(0.1,0.1,0.1)});
      cover.drawText("Service Catalogue",{x:m,y:h-85,size:14,font,color:colourRGB});
      drawLine(cover,{x1:m,y1:h-100,x2:w-m,y2:h-100,c:colourRGB});
    }else if(template==="luxury"||template==="magazine"){
      cover.drawRectangle({x:0,y:h,width:w,height:h,color:rgb(0.02,0.02,0.02)});
      cover.drawText(company.toUpperCase(),{x:m,y:h-120,size:36,font:bold,color:colourRGB});
      cover.drawText("SERVICE CATALOGUE",{x:m,y:h-160,size:11,font,color:rgb(0.8,0.8,0.8)});
      drawLine(cover,{x1:m,y1:h-170,x2:w/3,y2:h-170,c:colourRGB});
    }else{
      cover.drawText(company,{x:w/2-100,y:h/2+20,size:30,font:bold,color:rgb(0.1,0.1,0.1)});
      cover.drawText("Service Catalogue",{x:w/2-80,y:h/2-10,size:14,font,color:colourRGB});
      drawLine(cover,{x1:w/2-80,y1:h/2-20,x2:w/2+80,y2:h/2-20,c:colourRGB});
    }

    // PAGES
    let ctx:PageCtx = {page:pdfDoc.getPages()[0],w,h,font,bold,cr,cg,cb,colour:colourRGB,light:lightRGB,y:h-50,m};
    let firstSection = true;

    for(const sec of sections){
      // Start section on new page with header
      if(firstSection){
        ctx = newPage(pdfDoc,ctx,needsWatermark);
        firstSection = false;
      }else if(ctx.y < 150){
        ctx = newPage(pdfDoc,ctx,needsWatermark);
      }

      const isTemplate = (t:string)=>template===t;

      // Section header varies by template
      if(isTemplate("modern")||isTemplate("aifuture")){
        drawLine(ctx.page,{x1:ctx.m,y1:ctx.y-4,x2:ctx.m+60,y2:ctx.y-4,thickness:3,c:colourRGB});
        ctx.page.drawText(sec.heading,{x:ctx.m,y:ctx.y-14,size:16,font:bold,color:colourRGB});
        ctx.y-=36;
      }else if(isTemplate("luxury")||isTemplate("magazine")){
        ctx.page.drawRectangle({x:0,y:ctx.y-30,width:ctx.w,height:30,color:rgb(0.04,0.04,0.04)});
        ctx.page.drawText(sec.heading,{x:ctx.m,y:ctx.y-12,size:14,font:bold,color:colourRGB});
        ctx.y-=48;
      }else if(isTemplate("sales")||isTemplate("priceguide")){
        ctx.page.drawRectangle({x:ctx.m-8,y:ctx.y-30,width:ctx.w-ctx.m*2+16,height:30,color:colourRGB});
        ctx.page.drawText(sec.heading,{x:ctx.m,y:ctx.y-12,size:14,font:bold,color:rgb(1,1,1)});
        ctx.y-=48;
      }else if(isTemplate("minimalist")){
        ctx.page.drawText(sec.heading.toUpperCase(),{x:ctx.m,y:ctx.y-8,size:10,font:bold,color:darkRGB});
        ctx.y-=30;
      }else{
        ctx.page.drawText(sec.heading,{x:ctx.m,y:ctx.y-8,size:15,font:bold,color:colourRGB});
        ctx.y-=30;
      }

      if(isTemplate("corporate")||template==="construction"){
        drawLine(ctx.page,{x1:ctx.m,y1:ctx.y,x2:ctx.w-ctx.m,y2:ctx.y,c:rgb(cr,cg,cb)});
        ctx.y-=4;
      }

      // Items
      const colW = ctx.w - ctx.m * 2;
      const leftW = colW * 0.65;
      const rightW = colW * 0.35;

      if(isTemplate("priceguide")||isTemplate("corporate")){
        ctx.page.drawText("Service",{x:ctx.m,y:ctx.y-4,size:8,font:bold,color:rgb(0.4,0.4,0.4)});
        ctx.page.drawText("Price",{x:ctx.m+leftW,y:ctx.y-4,size:8,font:bold,color:rgb(0.4,0.4,0.4)});
        ctx.y-=4;
        drawLine(ctx.page,{x1:ctx.m,y1:ctx.y-2,x2:ctx.w-ctx.m,y2:ctx.y-2,thickness:0.5,c:colourRGB});
        ctx.y-=8;
      }

      for(const item of sec.items){
        if(ctx.y < 80){ctx = newPage(pdfDoc,ctx,needsWatermark);}

        if(isTemplate("modern")||isTemplate("luxury")||isTemplate("aifuture")||isTemplate("magazine")){
          drawLine(ctx.page,{x1:ctx.m,y1:ctx.y+2,x2:ctx.w-ctx.m,y2:ctx.y+2,thickness:0.3,c:rgb(0.92,0.92,0.92)});
          ctx.page.drawText(item.service.substring(0, Math.min(item.service.length, 45)),{x:ctx.m,y:ctx.y-8,size:10,font,color:rgb(0.2,0.2,0.2)});
          ctx.page.drawText(item.price,{x:ctx.m+leftW,y:ctx.y-8,size:10,font:bold,color:rgb(0.3,0.3,0.3)});
          ctx.y-=22;
        }else if(isTemplate("sales")||isTemplate("priceguide")){
          ctx.page.drawText(item.service.substring(0, Math.min(item.service.length, 45)),{x:ctx.m,y:ctx.y-10,size:11,font:bold,color:rgb(0.15,0.15,0.15)});
          ctx.page.drawText(item.price,{x:ctx.m+leftW,y:ctx.y-10,size:11,font:bold,color:colourRGB});
          ctx.y-=24;
        }else if(isTemplate("minimalist")){
          ctx.page.drawText(item.service.substring(0, Math.min(item.service.length, 50)),{x:ctx.m,y:ctx.y-6,size:9,font,color:rgb(0.3,0.3,0.3)});
          ctx.page.drawText(item.price,{x:ctx.m+leftW,y:ctx.y-6,size:9,font,color:rgb(0.5,0.5,0.5)});
          ctx.y-=18;
        }else{
          ctx.page.drawText(item.service.substring(0, Math.min(item.service.length, 45)),{x:ctx.m,y:ctx.y-8,size:10,font,color:rgb(0.2,0.2,0.2)});
          ctx.page.drawText(item.price,{x:ctx.m+leftW,y:ctx.y-8,size:10,font:bold,color:rgb(0.3,0.3,0.3)});
          ctx.y-=18;
          if(template==="construction"||isTemplate("corporate"))
            drawLine(ctx.page,{x1:ctx.m,y1:ctx.y+6,x2:ctx.w-ctx.m,y2:ctx.y+6,thickness:0.2,c:rgb(0.95,0.95,0.95)});
        }
      }
    }

    // Footer
    ctx.y = Math.max(ctx.y - 10, 70);
    drawLine(ctx.page,{x1:ctx.m,y1:ctx.y,x2:ctx.w-ctx.m,y2:ctx.y,thickness:0.5,c:rgb(0.85,0.85,0.85)});
    ctx.y-=14;
    ctx.page.drawText(`Generated by ${company} • ${new Date().toLocaleDateString("en-GB")}`,{x:ctx.m,y:ctx.y,size:7,font,color:rgb(0.6,0.6,0.6)});
    if(needsWatermark)ctx.page.drawText("Upgrade to remove watermark.",{x:ctx.m,y:ctx.y-10,size:6,font,color:rgb(0.7,0.7,0.7)});

    const pdfBytes = await pdfDoc.save();
    return new NextResponse(pdfBytes as BodyInit,{
      headers:{"Content-Type":"application/pdf","Content-Disposition":`attachment; filename="catalogue-${company.replace(/\\s+/g,"-").toLowerCase()}.pdf"`},
    });
  }catch(error){return NextResponse.json({error:{message:"Failed to generate PDF",statusCode:500}},{status:500});}
}
