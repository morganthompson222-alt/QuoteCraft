import { createClient } from "@supabase/supabase-js";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  console.log("🌱 Seeding demo account...");

  // Create demo user
  const DEMO_EMAIL = "demo@quotecraft.app";
  const DEMO_PASSWORD = "demo123456";
  let userId: string;

  // Check if demo user exists
  const existing = await admin.auth.admin.listUsers();
  const found = existing.data?.users?.find((u: any) => u.email === DEMO_EMAIL);
  
  if (found) {
    userId = found.id;
    console.log("ℹ️  Demo user exists, reusing:", userId);
    // Clean existing data
    await admin.from("jobs").delete().eq("user_id", userId);
    await admin.from("quote_items").delete().in("quote_id", (await admin.from("quotes").select("id").eq("user_id", userId)).data?.map((q: any) => q.id) ?? []);
    await admin.from("quotes").delete().eq("user_id", userId);
    await admin.from("customers").delete().eq("user_id", userId);
    await admin.from("notifications").delete().eq("user_id", userId);
  } else {
    const { data: newUser } = await admin.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
    });
    userId = newUser.user!.id;
    console.log("✅ Created demo user:", userId);
  }

  // Set profile
  await admin.from("profiles").upsert({
    id: userId,
    company_name: "Thompson's Landscaping & Maintenance",
    phone: "07700 900123",
    address: "42 Oak Lane",
    city: "Chester",
    state: "Cheshire",
    zip: "CH1 3AB",
    plan_tier: "enterprise",
    custom_ai_instructions: `Tree surgery = £80 per hour
Patio cleaning = £5 per sqm
Weed removal = £2 per sqm
Fencing = £60 per metre installed
Hedge trimming = £3 per metre
Waste removal = £40 per load
Skip hire = £180 per skip
General gardening labour = £45 per hour
Decking installation = £100 per sqm
Painting = £15 per sqm`,
    next_quote_number: 8,
  });

  // Create customers
  const customers: any[] = [];
  const custData = [
    { name: "James & Sarah Mitchell", email: "j.s.mitchell@email.co.uk", phone: "07700 111222", company: null, address: "12 Rose Avenue", city: "Chester", zip: "CH2 4PQ" },
    { name: "The Old Crown Pub", email: "manager@oldcrown.co.uk", phone: "01244 555666", company: "Old Crown Pub Ltd", address: "27 High Street", city: "Chester", zip: "CH1 1AA" },
    { name: "Bayside Renovations Ltd", email: "projects@baysidereno.co.uk", phone: "07700 333444", company: "Bayside Renovations Ltd", address: "Unit 3, Riverside Estate", city: "Chester", zip: "CH4 7EX" },
    { name: "Mrs. Patricia Williams", email: "pat.williams@icloud.com", phone: "01244 789012", company: null, address: "5 Elm Close", city: "Chester", zip: "CH3 5RT" },
    { name: "Oakwood Primary School", email: "facilities@oakwood.school.uk", phone: "01244 234567", company: "Oakwood Academy Trust", address: "Oakwood Road", city: "Chester", zip: "CH2 8NM" },
    { name: "Riverside Apartments", email: "management@riversideapts.co.uk", phone: "07700 555666", company: "Riverside Management Ltd", address: "Riverside Court, 50 Apartments", city: "Chester", zip: "CH1 2DE" },
    { name: "David Chen", email: "david.chen@gmail.com", phone: "07700 777888", company: null, address: "88 Mill Lane", city: "Chester", zip: "CH2 6JK" },
    { name: "Greenfield Estates", email: "maintenance@greenfieldestates.co.uk", phone: "01244 345678", company: "Greenfield Estates LLP", address: "14 Market Square", city: "Chester", zip: "CH1 3FG" },
    { name: "Cheshire Catering Co", email: "info@cheshirecatering.co.uk", phone: "01244 987654", company: "Cheshire Catering Ltd", address: "Unit 8, Chester Business Park", city: "Chester", zip: "CH4 9RF" },
    { name: "Mr. & Mrs. Harrison", email: "harrison.family@btinternet.com", phone: "07700 999000", company: null, address: "3 The Willows", city: "Chester", zip: "CH3 7LW" },
  ];

  for (const c of custData) {
    const { data } = await admin.from("customers").insert({ user_id: userId, ...c }).select().single();
    if (data) customers.push(data);
  }
  console.log(`✅ Created ${customers.length} customers`);

  // Create quotes with items
  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();
  const daysAgoDate = (d: number) => new Date(now.getTime() - d * 86400000).toISOString().slice(0, 10);
  const futureDays = (d: number) => new Date(now.getTime() + d * 86400000).toISOString().slice(0, 10);

  const quoteDefs = [
    // === PAST YEAR — ACCEPTED & PAID (Revenue history) ===
    // Jun 2025
    { customer: 0, status: "accepted", items: [{ d: "Full garden clearance", q: 12, u: 45 }, { d: "Waste removal", q: 2, u: 40 }], notes: "Overgrown garden clearance", created: daysAgo(330), paid: true, paidAt: daysAgo(328), job: { title: "Garden clearance — Mitchell residence", date: daysAgoDate(325), start: "08:00", end: "16:00" } },
    { customer: 3, status: "accepted", items: [{ d: "Hedge trimming — front & back", q: 35, u: 3 }, { d: "Green waste removal", q: 1, u: 40 }], notes: "Annual hedge trim", created: daysAgo(320), paid: true, paidAt: daysAgo(318), job: { title: "Hedge trimming — Mrs Williams", date: daysAgoDate(315), start: "09:00", end: "12:00" } },
    // Jul 2025
    { customer: 2, status: "accepted", items: [{ d: "Site clearance — Plot B", q: 22, u: 45 }, { d: "Skip hire", q: 1, u: 180 }], notes: "Development site clearance", created: daysAgo(295), paid: true, paidAt: daysAgo(293), job: { title: "Site clearance — Bayside Plot B", date: daysAgoDate(290), start: "07:00", end: "17:00" } },
    { customer: 4, status: "accepted", items: [{ d: "Summer holiday grounds maintenance", q: 30, u: 45 }, { d: "Weed removal (full site)", q: 200, u: 2 }, { d: "Waste removal", q: 5, u: 40 }], notes: "Summer holiday maintenance week", created: daysAgo(280), paid: true, paidAt: daysAgo(277), job: { title: "Summer maintenance — Oakwood School", date: daysAgoDate(275), start: "07:00", end: "16:00" } },
    // Aug 2025
    { customer: 1, status: "accepted", items: [{ d: "Beer garden renovation", q: 50, u: 5 }, { d: "Patio resanding", q: 50, u: 3.5 }, { d: "Skip hire", q: 1, u: 180 }, { d: "New planters × 4", q: 4, u: 120 }], notes: "Full beer garden refurbishment", created: daysAgo(250), paid: true, paidAt: daysAgo(248), job: { title: "Beer garden refurb — The Old Crown", date: daysAgoDate(245), start: "06:00", end: "18:00" } },
    { customer: 6, status: "accepted", items: [{ d: "Fencing — rear boundary", q: 22, u: 60 }, { d: "Skip hire", q: 1, u: 180 }], notes: "6ft feather edge fence, concrete posts & gravel boards", created: daysAgo(240), paid: true, paidAt: daysAgo(237), job: { title: "Fence installation — Chen residence", date: daysAgoDate(235), start: "08:00", end: "17:00" } },
    // Sep 2025
    { customer: 9, status: "accepted", items: [{ d: "Garden tidy-up & planting", q: 8, u: 45 }, { d: "Hedge trimming", q: 30, u: 3 }, { d: "Waste removal", q: 1, u: 40 }], notes: "End of summer tidy", created: daysAgo(220), paid: true, paidAt: daysAgo(218), job: { title: "Garden maintenance — Harrisons", date: daysAgoDate(215), start: "09:00", end: "15:00" } },
    { customer: 5, status: "accepted", items: [{ d: "Communal area jet wash", q: 120, u: 4.5 }, { d: "Weed removal", q: 120, u: 2 }, { d: "Waste removal", q: 3, u: 40 }], notes: "Annual block maintenance", created: daysAgo(210), paid: true, paidAt: daysAgo(207), job: { title: "Block maintenance — Riverside Apartments", date: daysAgoDate(205), start: "07:30", end: "15:30" } },
    // Oct 2025
    { customer: 7, status: "accepted", items: [{ d: "Autumn garden clearance × 2", q: 16, u: 45 }, { d: "Leaf clearance", q: 4, u: 35 }, { d: "Waste removal", q: 3, u: 40 }], notes: "Pre-winter clearance for two properties", created: daysAgo(180), paid: true, paidAt: daysAgo(177), job: { title: "Autumn clearance — Greenfield Estates", date: daysAgoDate(175), start: "08:00", end: "16:00" } },
    { customer: 3, status: "accepted", items: [{ d: "Pruning — fruit trees & shrubs", q: 6, u: 45 }, { d: "Waste removal", q: 1, u: 40 }], notes: "Autumn prune and tidy", created: daysAgo(165), paid: true, paidAt: daysAgo(163), job: { title: "Autumn pruning — Mrs Williams", date: daysAgoDate(160), start: "10:00", end: "14:00" } },
    // Nov 2025
    { customer: 0, status: "accepted", items: [{ d: "Tree surgery — dead ash removal", q: 5, u: 80 }, { d: "Stump grinding", q: 1, u: 150 }, { d: "Waste removal", q: 3, u: 40 }], notes: "Dead ash tree removal with stump grinding", created: daysAgo(140), paid: true, paidAt: daysAgo(137), job: { title: "Tree removal — Mitchell residence", date: daysAgoDate(135), start: "08:00", end: "16:00" } },
    { customer: 4, status: "accepted", items: [{ d: "Winter grounds preparation", q: 24, u: 45 }, { d: "Drainage clearance", q: 4, u: 55 }, { d: "Waste removal", q: 3, u: 40 }], notes: "Pre-winter grounds maintenance", created: daysAgo(120), paid: true, paidAt: daysAgo(118), job: { title: "Winter prep — Oakwood School", date: daysAgoDate(115), start: "07:30", end: "15:00" } },
    // Dec 2025
    { customer: 8, status: "accepted", items: [{ d: "Car park jet wash & line repaint", q: 200, u: 3 }, { d: "Waste removal", q: 2, u: 40 }], notes: "Annual car park clean", created: daysAgo(100), paid: true, paidAt: daysAgo(97), job: { title: "Car park clean — Cheshire Catering Co", date: daysAgoDate(95), start: "07:00", end: "15:00" } },
    { customer: 2, status: "accepted", items: [{ d: "Site maintenance — Plot C", q: 18, u: 45 }, { d: "Skip hire", q: 1, u: 180 }], notes: "Ongoing site maintenance", created: daysAgo(85), paid: true, paidAt: daysAgo(82), job: { title: "Site maintenance — Bayside Plot C", date: daysAgoDate(80), start: "07:30", end: "16:00" } },
    // Jan 2026
    { customer: 1, status: "accepted", items: [{ d: "Kitchen extraction duct clean", q: 1, u: 350 }, { d: "Waste disposal", q: 1, u: 40 }], notes: "Annual compliance clean", created: daysAgo(60), paid: true, paidAt: daysAgo(58), job: { title: "Duct cleaning — The Old Crown", date: daysAgoDate(55), start: "06:00", end: "12:00" } },
    { customer: 6, status: "accepted", items: [{ d: "Garden wall rebuild", q: 12, u: 80 }, { d: "Skip hire", q: 1, u: 180 }, { d: "Waste removal", q: 2, u: 40 }], notes: "Rebuild collapsed garden wall", created: daysAgo(50), paid: true, paidAt: daysAgo(47), job: { title: "Wall rebuild — Chen residence", date: daysAgoDate(45), start: "08:00", end: "17:00" } },
    // Feb 2026
    { customer: 9, status: "accepted", items: [{ d: "Patio cleaning & sealing", q: 35, u: 5 }, { d: "Weed removal", q: 35, u: 2 }], notes: "Pre-spring patio refresh", created: daysAgo(40), paid: true, paidAt: daysAgo(38), job: { title: "Patio clean — Harrisons", date: daysAgoDate(35), start: "09:00", end: "14:00" } },
    // Mar 2026
    { customer: 0, status: "accepted", items: [{ d: "Spring garden prep & planting", q: 10, u: 45 }, { d: "Lawn treatment", q: 1, u: 85 }, { d: "Waste removal", q: 1, u: 40 }], notes: "Full spring garden service", created: daysAgo(25), paid: true, paidAt: daysAgo(22), job: { title: "Spring garden — Mitchell residence", date: daysAgoDate(20), start: "08:00", end: "15:00" } },
    { customer: 7, status: "accepted", items: [{ d: "Spring garden clearance × 5", q: 40, u: 45 }, { d: "Skip hire × 2", q: 2, u: 180 }, { d: "Waste removal", q: 8, u: 40 }], notes: "Spring clearance for 5 properties", created: daysAgo(18), paid: true, paidAt: daysAgo(15), job: { title: "Spring clearance — Greenfield Estates", date: daysAgoDate(12), start: "07:00", end: "17:00" } },

    // === RECENT — MIXED STATUSES ===
    // Last 30 days — ACCEPTED
    { customer: 2, status: "accepted", items: [{ d: "Site clearance — Plot D", q: 20, u: 45 }, { d: "Skip hire", q: 1, u: 180 }], notes: "New plot clearance", created: daysAgo(21), paid: true, paidAt: daysAgo(18), job: { title: "Site clearance — Bayside Plot D", date: daysAgoDate(16), start: "07:00", end: "16:00" } },
    { customer: 4, status: "accepted", items: [{ d: "Playing field maintenance", q: 20, u: 45 }, { d: "Weed removal (boundaries)", q: 150, u: 2 }, { d: "Waste removal", q: 4, u: 40 }], notes: "Half-term maintenance week", created: daysAgo(14), paid: true, paidAt: daysAgo(11), job: { title: "Playing field maintenance — Oakwood School", date: daysAgoDate(7), start: "07:30", end: "15:00" } },
    { customer: 0, status: "accepted", items: [{ d: "Tree surgery — oak crown reduction", q: 4, u: 80 }, { d: "Waste removal", q: 2, u: 40 }], notes: null, created: daysAgo(10), paid: false, paidAt: null, job: { title: "Tree surgery — Mitchell residence", date: daysAgoDate(5), start: "08:00", end: "14:00" } },
    { customer: 1, status: "accepted", items: [{ d: "Patio power wash and seal", q: 60, u: 5 }, { d: "Resanding", q: 60, u: 3.5 }], notes: null, created: daysAgo(7), paid: false, paidAt: null, job: { title: "Patio restoration — The Old Crown", date: daysAgoDate(2), start: "07:00", end: "13:00" } },
    { customer: 7, status: "accepted", items: [{ d: "Garden clearance × 3", q: 24, u: 45 }, { d: "Waste removal", q: 6, u: 40 }], notes: "Rush job — going on market Monday", created: daysAgo(5), paid: false, paidAt: null, job: { title: "Garden clearance — Greenfield Estates", date: daysAgoDate(0), start: "08:00", end: "17:00" } },

    // Next 7 days — SCHEDULED JOBS
    { customer: 6, status: "accepted", items: [{ d: "Decking repair & treatment", q: 8, u: 55 }, { d: "Waste removal", q: 1, u: 40 }], notes: null, created: daysAgo(4), paid: false, paidAt: null, job: { title: "Deck repair — Chen residence", date: futureDays(1), start: "09:00", end: "15:00" } },
    { customer: 3, status: "accepted", items: [{ d: "Summer garden prep", q: 6, u: 45 }, { d: "Planting", q: 1, u: 95 }], notes: "New flower beds", created: daysAgo(3), paid: false, paidAt: null, job: { title: "Garden prep — Mrs Williams", date: futureDays(2), start: "10:00", end: "15:00" } },
    { customer: 9, status: "accepted", items: [{ d: "Fence repair — 3 panels", q: 3, u: 40 }, { d: "Waste removal", q: 1, u: 40 }], notes: null, created: daysAgo(2), paid: false, paidAt: null, job: { title: "Fence repair — Harrisons", date: futureDays(3), start: "08:30", end: "13:00" } },
    { customer: 5, status: "accepted", items: [{ d: "Bin store jet wash", q: 20, u: 4.5 }], notes: null, created: daysAgo(1), paid: false, paidAt: null, job: { title: "Bin store clean — Riverside Apts", date: futureDays(4), start: "09:00", end: "12:00" } },

    // SENT
    { customer: 1, status: "sent", items: [{ d: "Beer garden jet wash", q: 45, u: 5 }, { d: "Patio resanding", q: 45, u: 3.5 }], notes: "Quote valid 30 days", created: daysAgo(9) },
    { customer: 3, status: "sent", items: [{ d: "Quarterly maintenance package", q: 12, u: 45 }, { d: "Hedge trimming", q: 30, u: 3 }], notes: "Quarterly contract", created: daysAgo(6) },
    { customer: 6, status: "sent", items: [{ d: "New fence — side boundary", q: 15, u: 60 }, { d: "Skip hire", q: 1, u: 180 }], notes: null, created: daysAgo(4) },
    { customer: 8, status: "sent", items: [{ d: "External window cleaning", q: 45, u: 5 }], notes: "All external windows", created: daysAgo(3) },
    { customer: 9, status: "sent", items: [{ d: "Patio cleaning and sealing", q: 30, u: 5 }], notes: null, created: daysAgo(1) },

    // DRAFTS
    { customer: 0, status: "draft", items: [{ d: "Summer house base preparation", q: 8, u: 80 }], notes: "Concrete base for 3×3m summer house", created: daysAgo(2) },
    { customer: 5, status: "draft", items: [{ d: "Communal garden redesign", q: 20, u: 45 }, { d: "Decking", q: 12, u: 100 }, { d: "Planting", q: 1, u: 250 }], notes: "Major redesign quote", created: daysAgo(1) },
    { customer: 2, status: "draft", items: [{ d: "Plot E clearance", q: 25, u: 45 }, { d: "Skip hire", q: 1, u: 180 }], notes: null, created: daysAgo(0) },

    // REJECTED
    { customer: 3, status: "rejected", items: [{ d: "Complete garden redesign", q: 40, u: 45 }, { d: "Decking installation", q: 15, u: 100 }], notes: "Customer went with cheaper competitor", created: daysAgo(45) },
    { customer: 8, status: "rejected", items: [{ d: "Commercial kitchen deep clean", q: 1, u: 350 }], notes: "Out of budget for this quarter", created: daysAgo(30) },
    { customer: 5, status: "rejected", items: [{ d: "Full external repaint", q: 500, u: 3 }], notes: "Postponed to next year", created: daysAgo(15) },
  ];

  // Create quotes and items
  for (let i = 0; i < quoteDefs.length; i++) {
    const qd = quoteDefs[i];
    const quoteNumber = `Q-${String(i + 1001).padStart(4, "0")}`;
    
    const items = qd.items.map((item, idx) => ({
      description: item.d,
      quantity: item.q,
      unit_price: item.u,
      sort_order: idx,
    }));
    const subtotal = items.reduce((s, it) => s + it.quantity * it.unit_price, 0);
    const total = subtotal; // assume 0% tax for simplicity

    const { data: quote } = await admin.from("quotes").insert({
      user_id: userId,
      customer_id: customers[qd.customer].id,
      quote_number: quoteNumber,
      status: qd.status,
      notes: qd.notes,
      subtotal, total,
      tax_rate: 0, tax_amount: 0,
      paid: qd.paid ?? false,
      paid_at: qd.paidAt ?? null,
      created_at: qd.created,
      updated_at: qd.created,
    }).select().single();

    if (quote) {
      await admin.from("quote_items").insert(
        items.map(it => ({ quote_id: quote.id, ...it }))
      );

      // Create job if accepted
      if (qd.job && qd.status === "accepted") {
        await admin.from("jobs").insert({
          user_id: userId,
          quote_id: quote.id,
          customer_id: customers[qd.customer].id,
          customer_name: customers[qd.customer].name,
          job_title: qd.job.title,
          job_date: qd.job.date,
          start_time: qd.job.start,
          end_time: qd.job.end,
          status: qd.job.date < new Date().toISOString().slice(0, 10) ? "completed" : "scheduled",
          location: customers[qd.customer].address + ", " + customers[qd.customer].city,
        });
      }
    }
  }
  console.log(`✅ Created ${quoteDefs.length} quotes with items and jobs`);

  // Create standalone jobs spread across the calendar
  await admin.from("jobs").insert([
    { user_id: userId, customer_id: customers[6].id, customer_name: customers[6].name, job_title: "Fence installation — Chen residence", job_date: futureDays(2), start_time: "08:00", end_time: "16:00", status: "scheduled" },
    { user_id: userId, customer_id: customers[9].id, customer_name: customers[9].name, job_title: "Garden maintenance — Harrisons", job_date: futureDays(1), start_time: "09:00", end_time: "11:00", status: "scheduled" },
    { user_id: userId, customer_id: customers[1].id, customer_name: customers[1].name, job_title: "Monthly maintenance visit — Old Crown", job_date: daysAgoDate(7), start_time: "08:00", end_time: "10:00", status: "completed" },
    { user_id: userId, customer_id: customers[3].id, customer_name: customers[3].name, job_title: "Hedge trimming — Mrs Williams", job_date: daysAgoDate(10), start_time: "10:00", end_time: "12:00", status: "completed" },
    { user_id: userId, customer_id: customers[4].id, customer_name: customers[4].name, job_title: "Grounds inspection — Oakwood School", job_date: daysAgoDate(14), start_time: "09:00", end_time: "10:30", status: "completed" },
    { user_id: userId, customer_id: customers[0].id, customer_name: customers[0].name, job_title: "Lawn treatment — Mitchells", job_date: futureDays(5), start_time: "14:00", end_time: "16:00", status: "scheduled" },
    { user_id: userId, customer_id: customers[8].id, customer_name: customers[8].name, job_title: "External cleaning — Cheshire Catering", job_date: futureDays(6), start_time: "07:00", end_time: "12:00", status: "scheduled" },
  ]);
  console.log("✅ Created 5 standalone jobs");

  // Create notifications spread across the year
  await admin.from("notifications").insert([
    { user_id: userId, type: "quote_accepted", quote_id: null, message: "James & Sarah Mitchell accepted your summer garden clearance quote", created_at: daysAgo(328) },
    { user_id: userId, type: "payment_received", quote_id: null, message: "Payment received from Oakwood School — £1,950 for summer maintenance", created_at: daysAgo(277) },
    { user_id: userId, type: "quote_accepted", quote_id: null, message: "The Old Crown accepted your beer garden refurbishment quote", created_at: daysAgo(248) },
    { user_id: userId, type: "payment_received", quote_id: null, message: "Payment received — Chen residence fence installation £1,500", created_at: daysAgo(237) },
    { user_id: userId, type: "quote_accepted", quote_id: null, message: "Riverside Apartments accepted your annual block maintenance quote", created_at: daysAgo(207) },
    { user_id: userId, type: "payment_received", quote_id: null, message: "Payment received from Mitchell residence — tree removal £700", created_at: daysAgo(137) },
    { user_id: userId, type: "quote_accepted", quote_id: null, message: "Cheshire Catering accepted your car park cleaning quote", created_at: daysAgo(97) },
    { user_id: userId, type: "quote_rejected", quote_id: null, message: "Mrs Williams rejected your garden redesign quote — went with cheaper option", created_at: daysAgo(45) },
    { user_id: userId, type: "payment_received", quote_id: null, message: "Payment received — Greenfield Estates spring clearance £2,800", created_at: daysAgo(15) },
    { user_id: userId, type: "quote_accepted", quote_id: null, message: "Bayside Renovations accepted your Plot D clearance quote", created_at: daysAgo(18) },
  ]);
  console.log("✅ Created 5 notifications");

  console.log("\n🎉 Demo account ready!");
  console.log(`   Email: ${DEMO_EMAIL}`);
  console.log(`   Password: ${DEMO_PASSWORD}`);
  console.log(`   URL: https://quotecraft026.vercel.app`);
}

main().catch(console.error);
