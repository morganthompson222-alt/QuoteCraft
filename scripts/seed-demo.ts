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
  const futureDays = (d: number) => new Date(now.getTime() + d * 86400000).toISOString().slice(0, 10);

  const quoteDefs = [
    // DRAFTS
    { customer: 0, status: "draft", items: [{ d: "Hedge trimming — front & back", q: 40, u: 3 }], notes: "Customer wants a quote for next month", created: daysAgo(2) },
    { customer: 8, status: "draft", items: [{ d: "Full garden tidy-up", q: 6, u: 45 }, { d: "Waste removal (green waste)", q: 3, u: 40 }], notes: null, created: daysAgo(1) },
    { customer: 5, status: "draft", items: [{ d: "Communal area jet wash", q: 80, u: 5 }, { d: "Weed removal", q: 80, u: 2 }], notes: "Annual maintenance quote", created: daysAgo(0) },

    // SENT
    { customer: 1, status: "sent", items: [{ d: "Beer garden jet wash", q: 45, u: 5 }, { d: "Patio resanding", q: 45, u: 3.5 }, { d: "Waste removal", q: 1, u: 40 }], notes: "Quote valid 30 days", created: daysAgo(7) },
    { customer: 3, status: "sent", items: [{ d: "Garden maintenance — 3 visits", q: 9, u: 45 }, { d: "Hedge trimming", q: 25, u: 3 }], notes: "Quarterly maintenance package", created: daysAgo(5) },
    { customer: 6, status: "sent", items: [{ d: "New fence installation", q: 18, u: 60 }, { d: "Skip hire", q: 1, u: 180 }], notes: "6ft feather edge fence, concrete posts", created: daysAgo(4) },
    { customer: 9, status: "sent", items: [{ d: "Patio cleaning and sealing", q: 30, u: 5 }, { d: "Weed removal", q: 30, u: 2 }], notes: null, created: daysAgo(3) },

    // ACCEPTED (with jobs)
    { customer: 0, status: "accepted", items: [{ d: "Tree surgery — oak tree reduction", q: 4, u: 80 }, { d: "Waste removal (branches)", q: 2, u: 40 }], notes: "Crown reduction 25%, dead wood removal", created: daysAgo(14), paid: true, paidAt: daysAgo(10), job: { title: "Tree surgery — Mitchell residence", date: futureDays(0), start: "08:00", end: "14:00" } },
    { customer: 2, status: "accepted", items: [{ d: "Site clearance and preparation", q: 16, u: 45 }, { d: "Skip hire", q: 1, u: 180 }], notes: "Clearing overgrown plot before building work", created: daysAgo(21), paid: true, paidAt: daysAgo(18), job: { title: "Site clearance — Bayside Renovations", date: futureDays(-7), start: "07:00", end: "16:00" } },
    { customer: 4, status: "accepted", items: [{ d: "Playing field maintenance", q: 20, u: 45 }, { d: "Weed removal (boundaries)", q: 150, u: 2 }, { d: "Waste removal", q: 4, u: 40 }], notes: "Half-term maintenance week", created: daysAgo(30), paid: true, paidAt: daysAgo(25), job: { title: "Playing field maintenance — Oakwood School", date: futureDays(-14), start: "07:30", end: "15:00" } },
    { customer: 7, status: "accepted", items: [{ d: "Pre-sale garden clearance × 3 properties", q: 24, u: 45 }, { d: "Waste removal", q: 6, u: 40 }], notes: "Rush job — properties going on market Monday", created: daysAgo(10), paid: true, paidAt: daysAgo(8), job: { title: "Garden clearance — Greenfield Estates", date: futureDays(-1), start: "08:00", end: "17:00" } },
    { customer: 1, status: "accepted", items: [{ d: "Patio power wash and seal", q: 60, u: 5 }, { d: "Resanding", q: 60, u: 3.5 }], notes: "Quote includes biodegradable sealing treatment", created: daysAgo(14), paid: true, paidAt: daysAgo(11), job: { title: "Patio restoration — The Old Crown", date: futureDays(-3), start: "07:00", end: "13:00" } },

    // REJECTED
    { customer: 3, status: "rejected", items: [{ d: "Complete garden redesign", q: 40, u: 45 }, { d: "Decking installation", q: 15, u: 100 }], notes: "Customer went with cheaper quote", created: daysAgo(35) },
    { customer: 8, status: "rejected", items: [{ d: "Commercial kitchen deep clean", q: 1, u: 350 }], notes: "Out of budget", created: daysAgo(20) },
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

  // Create some standalone jobs (not linked to quotes)
  await admin.from("jobs").insert([
    { user_id: userId, customer_id: customers[6].id, customer_name: customers[6].name, job_title: "Fence installation — Chen residence", job_date: futureDays(2), start_time: "08:00", end_time: "16:00", status: "scheduled" },
    { user_id: userId, customer_id: customers[9].id, customer_name: customers[9].name, job_title: "Garden maintenance — Harrisons", job_date: futureDays(1), start_time: "09:00", end_time: "11:00", status: "scheduled" },
    { user_id: userId, customer_id: customers[3].id, customer_name: customers[3].name, job_title: "Hedge trimming — Mrs Williams", job_date: futureDays(-1), start_time: "10:00", end_time: "12:00", status: "completed" },
    { user_id: userId, customer_id: customers[4].id, customer_name: customers[4].name, job_title: "Grounds inspection — Oakwood School", job_date: futureDays(-5), start_time: "09:00", end_time: "10:30", status: "completed" },
    { user_id: userId, customer_id: customers[0].id, customer_name: customers[0].name, job_title: "Lawn treatment — Mitchells", job_date: futureDays(5), start_time: "14:00", end_time: "16:00", status: "scheduled" },
  ]);
  console.log("✅ Created 5 standalone jobs");

  // Create notifications
  await admin.from("notifications").insert([
    { user_id: userId, type: "quote_accepted", quote_id: null, message: "James & Sarah Mitchell accepted your tree surgery quote", created_at: daysAgo(10) },
    { user_id: userId, type: "quote_accepted", quote_id: null, message: "Bayside Renovations accepted your site clearance quote", created_at: daysAgo(18) },
    { user_id: userId, type: "payment_received", quote_id: null, message: "Payment received from Oakwood School — £1,080", created_at: daysAgo(25) },
    { user_id: userId, type: "quote_accepted", quote_id: null, message: "Greenfield Estates accepted your garden clearance quote", created_at: daysAgo(8) },
    { user_id: userId, type: "quote_rejected", quote_id: null, message: "Mrs. Patricia Williams rejected your garden redesign quote", created_at: daysAgo(30) },
  ]);
  console.log("✅ Created 5 notifications");

  console.log("\n🎉 Demo account ready!");
  console.log(`   Email: ${DEMO_EMAIL}`);
  console.log(`   Password: ${DEMO_PASSWORD}`);
  console.log(`   URL: https://quotecraft026.vercel.app`);
}

main().catch(console.error);
