import { createClient } from "@supabase/supabase-js";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  console.log("🌱 Seeding demo account...");

  const DEMO_EMAIL = "demo@jobstacker.app";
  const DEMO_PASSWORD = "demo123456";
  let userId: string;

  const existing = await admin.auth.admin.listUsers();
  const found = existing.data?.users?.find((u: any) => u.email === DEMO_EMAIL);
  
  if (found) {
    userId = found.id;
    console.log("ℹ️  Demo user exists, reusing:", userId);
    const quoteIds = (await admin.from("quotes").select("id").eq("user_id", userId)).data?.map((q: any) => q.id) ?? [];
    await admin.from("jobs").delete().eq("user_id", userId);
    await admin.from("quote_items").delete().in("quote_id", quoteIds);
    await admin.from("quotes").delete().eq("user_id", userId);
    await admin.from("customers").delete().eq("user_id", userId);
    await admin.from("notifications").delete().eq("user_id", userId);
  } else {
    const { data: newUser } = await admin.auth.admin.createUser({ email: DEMO_EMAIL, password: DEMO_PASSWORD, email_confirm: true });
    userId = newUser.user!.id;
    console.log("✅ Created demo user:", userId);
  }

  await admin.from("profiles").upsert({
    id: userId,
    company_name: "Thompson's Landscaping & Maintenance",
    phone: "07700 900123",
    address: "42 Oak Lane", city: "Chester", state: "Cheshire", zip: "CH1 3AB",
    plan_tier: "enterprise",
    custom_ai_instructions: `Tree surgery = £80 per hour\nPatio cleaning = £5 per sqm\nWeed removal = £2 per sqm\nFencing = £60 per metre installed\nHedge trimming = £3 per metre\nWaste removal = £40 per load\nSkip hire = £180 per skip\nGeneral gardening labour = £45 per hour\nDecking installation = £100 per sqm\nPainting = £15 per sqm`,
    next_quote_number: 200,
  });

  // ========== 50 CUSTOMERS ==========
  const customers: any[] = [];
  const custData = [
    // Original 10
    { name: "James & Sarah Mitchell", email: "j.s.mitchell@email.co.uk", phone: "07700 111222", company: null, address: "12 Rose Avenue", city: "Chester", zip: "CH2 4PQ" },
    { name: "The Old Crown Pub", email: "manager@oldcrown.co.uk", phone: "01244 555666", company: "Old Crown Pub Ltd", address: "27 High Street", city: "Chester", zip: "CH1 1AA" },
    { name: "Bayside Renovations Ltd", email: "projects@baysidereno.co.uk", phone: "07700 333444", company: "Bayside Renovations Ltd", address: "Unit 3, Riverside Estate", city: "Chester", zip: "CH4 7EX" },
    { name: "Mrs. Patricia Williams", email: "pat.williams@icloud.com", phone: "01244 789012", company: null, address: "5 Elm Close", city: "Chester", zip: "CH3 5RT" },
    { name: "Oakwood Primary School", email: "facilities@oakwood.school.uk", phone: "01244 234567", company: "Oakwood Academy Trust", address: "Oakwood Road", city: "Chester", zip: "CH2 8NM" },
    { name: "Riverside Apartments", email: "management@riversideapts.co.uk", phone: "07700 555666", company: "Riverside Management Ltd", address: "Riverside Court", city: "Chester", zip: "CH1 2DE" },
    { name: "David Chen", email: "david.chen@gmail.com", phone: "07700 777888", company: null, address: "88 Mill Lane", city: "Chester", zip: "CH2 6JK" },
    { name: "Greenfield Estates", email: "maintenance@greenfieldestates.co.uk", phone: "01244 345678", company: "Greenfield Estates LLP", address: "14 Market Square", city: "Chester", zip: "CH1 3FG" },
    { name: "Cheshire Catering Co", email: "info@cheshirecatering.co.uk", phone: "01244 987654", company: "Cheshire Catering Ltd", address: "Unit 8, Chester Business Park", city: "Chester", zip: "CH4 9RF" },
    { name: "Mr. & Mrs. Harrison", email: "harrison.family@btinternet.com", phone: "07700 999000", company: null, address: "3 The Willows", city: "Chester", zip: "CH3 7LW" },
    // 40 New customers
    { name: "Rachel & Tom Bennett", email: "bennett.family@outlook.com", phone: "07711 223344", company: null, address: "22 Windsor Drive", city: "Chester", zip: "CH2 1AA" },
    { name: "Chester Cathedral", email: "facilities@chestercathedral.org", phone: "01244 878788", company: "Chester Cathedral Trust", address: "Cathedral Close", city: "Chester", zip: "CH1 2DY" },
    { name: "Meadowbank Care Home", email: "admin@meadowbankcare.co.uk", phone: "01244 123456", company: "Meadowbank Care Ltd", address: "Meadow Lane", city: "Chester", zip: "CH4 8RT" },
    { name: "Alex Porter", email: "alex.porter@live.co.uk", phone: "07722 445566", company: null, address: "45 Green Lane", city: "Chester", zip: "CH3 6RT" },
    { name: "Chester Retail Park", email: "operations@chesterretail.com", phone: "01244 998877", company: "Chester Retail Management Ltd", address: "Retail Park Way", city: "Chester", zip: "CH1 4BA" },
    { name: "St. Mary's Church", email: "vicar@stmaryschester.org", phone: "01244 556677", company: "St Mary's Parochial Church Council", address: "Church Road", city: "Chester", zip: "CH2 3AB" },
    { name: "Priya Sharma", email: "priya.s@icloud.com", phone: "07733 556677", company: null, address: "56 Park Avenue", city: "Chester", zip: "CH2 2CD" },
    { name: "Chester Scouts Group", email: "leader@chesterscouts.org.uk", phone: "07744 667788", company: "Chester Scout Association", address: "Scout Hut, Meadow Close", city: "Chester", zip: "CH4 7DF" },
    { name: "Claire & Steve Davies", email: "davies.fam@btinternet.com", phone: "01244 889900", company: null, address: "8 Beech Road", city: "Chester", zip: "CH3 8GH" },
    { name: "Chester Golf Club", email: "greens@chestergolf.co.uk", phone: "01244 667788", company: "Chester Golf Club Ltd", address: "Golf Course Lane", city: "Chester", zip: "CH2 4RS" },
    { name: "Maria Gonzalez", email: "maria.g@outlook.es", phone: "07755 778899", company: null, address: "15 Victoria Crescent", city: "Chester", zip: "CH1 5PQ" },
    { name: "Chester Veterinary Clinic", email: "practice@chestervets.co.uk", phone: "01244 234987", company: "Chester Vets Partnership", address: "56 Upper Northgate Street", city: "Chester", zip: "CH1 4EE" },
    { name: "Malcolm & Frances Reid", email: "mfreid@talktalk.net", phone: "07766 889900", company: null, address: "31 Kingsway", city: "Chester", zip: "CH2 1HH" },
    { name: "Chester Sports Centre", email: "management@chestersports.org", phone: "01244 345654", company: "Chester Leisure Trust", address: "Sports Centre Drive", city: "Chester", zip: "CH1 5NB" },
    { name: "Gemma & Paul Walker", email: "walker.house@icloud.com", phone: "07777 990011", company: null, address: "72 Oakfield Road", city: "Chester", zip: "CH3 9RT" },
    { name: "Aston Court Hotel", email: "gm@astoncourtchester.co.uk", phone: "01244 456789", company: "Aston Court Hospitality Ltd", address: "12 Eastgate Row", city: "Chester", zip: "CH1 1BX" },
    { name: "Kevin O'Brien", email: "kevin.obrien@live.ie", phone: "07788 001122", company: null, address: "42 Wellington Street", city: "Chester", zip: "CH1 3DA" },
    { name: "Dee Valley Housing Assoc", email: "property@deevalleyha.org.uk", phone: "01244 567890", company: "Dee Valley Housing Association", address: "Housing Office, River Lane", city: "Chester", zip: "CH4 8JT" },
    { name: "Samantha & Robert Frost", email: "frost.family@gmail.com", phone: "07799 112233", company: null, address: "14 Cedar Grove", city: "Chester", zip: "CH2 6RT" },
    { name: "Chester Masonic Hall", email: "secretary@chestermasons.org", phone: "01244 678901", company: "Chester Masonic Lodge Ltd", address: "Masonic Hall, Grosvenor Road", city: "Chester", zip: "CH1 2HJ" },
    { name: "Hannah Lewis", email: "hannah.lewis@sky.com", phone: "07800 223344", company: null, address: "90 Dee Banks", city: "Chester", zip: "CH3 5YU" },
    { name: "Shropshire Union Canal Trust", email: "estates@shroptontrust.org", phone: "01244 789012", company: "Shropshire Union Canal Trust", address: "Canal Wharf", city: "Chester", zip: "CH1 4LF" },
    { name: "Colin & Jean Matthews", email: "matthews.chez@icloud.com", phone: "07811 334455", company: null, address: "5 Cherry Tree Lane", city: "Chester", zip: "CH2 4YT" },
    { name: "Chester Community Centre", email: "manager@chestercommunity.org", phone: "01244 890123", company: "Chester Community Association", address: "Community Centre, School Lane", city: "Chester", zip: "CH1 5NZ" },
    { name: "Liam O'Connor", email: "liam.o@live.co.uk", phone: "07822 445566", company: null, address: "29 Sealand Road", city: "Chester", zip: "CH1 4RN" },
    { name: "Countess of Chester Hospital", email: "estates@nhs.net", phone: "01244 365000", company: "NHS Countess of Chester", address: "Liverpool Road", city: "Chester", zip: "CH2 1UL" },
    { name: "Fiona & Derek Yates", email: "yates.household@btinternet.com", phone: "07833 556677", company: null, address: "16 Rowan Close", city: "Chester", zip: "CH3 6TH" },
    { name: "Chester Business Centre", email: "facilities@chesterbusiness.co.uk", phone: "01244 234432", company: "Chester Business Park Ltd", address: "Enterprise House, Business Park", city: "Chester", zip: "CH4 9RF" },
    { name: "Margaret Taylor", email: "m.taylor@talktalk.net", phone: "07844 667788", company: null, address: "53 Victoria Road", city: "Chester", zip: "CH2 2SG" },
    { name: "Chester Methodist Church", email: "admin@chestermethodist.org", phone: "01244 345543", company: "Chester Methodist Church Trustees", address: "Methodist Church, St John's Road", city: "Chester", zip: "CH1 3BN" },
    { name: "Duncan MacLeod", email: "duncan.m@icloud.com", phone: "07855 778899", company: null, address: "7 Castle Street", city: "Chester", zip: "CH1 2DS" },
    { name: "Chester Academy", email: "facilities@chesteracademy.org", phone: "01244 456654", company: "Chester Academy Trust", address: "Academy Road", city: "Chester", zip: "CH4 7BN" },
    { name: "Natalie & Philip Grove", email: "grove.fam@home.co.uk", phone: "07866 889900", company: null, address: "21 Laburnum Drive", city: "Chester", zip: "CH2 5PL" },
    { name: "Chester Fire Station", email: "admin@cheshirefire.gov.uk", phone: "01244 567765", company: "Cheshire Fire & Rescue Service", address: "Fire Station, Green Lane", city: "Chester", zip: "CH1 4AW" },
    { name: "Timothy Weaver", email: "tim.weaver@outlook.com", phone: "07877 990011", company: null, address: "84 Hoole Road", city: "Chester", zip: "CH2 3SU" },
    { name: "Chester Funeral Home", email: "director@chesterfh.co.uk", phone: "01244 678876", company: "Chester Funeral Services Ltd", address: "Sadler Street", city: "Chester", zip: "CH1 3EE" },
    { name: "Emma & Jason Cooper", email: "cooper.homestead@gmail.com", phone: "07888 001122", company: null, address: "34 Cherry Garden Lane", city: "Chester", zip: "CH3 8AS" },
    { name: "Chester County Hall", email: "facilities@cheshire.gov.uk", phone: "01244 789987", company: "Cheshire West & Chester Council", address: "County Hall", city: "Chester", zip: "CH1 1SF" },
    { name: "University of Chester", email: "estates@chester.ac.uk", phone: "01244 890098", company: "University of Chester", address: "Parkgate Road", city: "Chester", zip: "CH1 4BJ" },
    { name: "Chris & Sophie Morgan", email: "morgan.renovation@icloud.com", phone: "07899 112233", company: null, address: "67 Lache Lane", city: "Chester", zip: "CH4 8JS" },
  ];

  for (const c of custData) {
    const { data } = await admin.from("customers").insert({ user_id: userId, ...c }).select().single();
    if (data) customers.push(data);
  }
  console.log(`✅ Created ${customers.length} customers`);

  // ========== QUOTES ==========
  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();
  const daysAgoDate = (d: number) => new Date(now.getTime() - d * 86400000).toISOString().slice(0, 10);
  const futureDays = (d: number) => new Date(now.getTime() + d * 86400000).toISOString().slice(0, 10);

  type JobDef = { title: string; date: string; start: string; end: string };
  type QuoteDef = { customer: number; status: string; items: { d: string; q: number; u: number }[]; notes: string | null; created: string; paid?: boolean; paidAt?: string | null; job?: JobDef };

  const quoteDefs: QuoteDef[] = [];

  // Generate quotes across 12 months for all 50 customers
  const services = [
    { items: [{ d: "Full garden maintenance — tidy & prune", q: 6, u: 45 }, { d: "Waste removal", q: 1, u: 40 }] },
    { items: [{ d: "Hedge trimming — front & back", q: 25, u: 3 }, { d: "Lawn mowing", q: 1, u: 35 }] },
    { items: [{ d: "Patio cleaning", q: 30, u: 5 }, { d: "Weed removal", q: 30, u: 2 }] },
    { items: [{ d: "Fence installation — 12 panels", q: 12, u: 60 }, { d: "Skip hire", q: 1, u: 180 }, { d: "Waste removal", q: 2, u: 40 }] },
    { items: [{ d: "Tree pruning — 3 trees", q: 4, u: 80 }, { d: "Waste removal (branches)", q: 2, u: 40 }] },
    { items: [{ d: "Pressure washing — driveway", q: 40, u: 4.5 }, { d: "Resanding", q: 40, u: 3.5 }] },
    { items: [{ d: "General gardening labour", q: 8, u: 45 }, { d: "Hedge trimming", q: 20, u: 3 }, { d: "Waste removal", q: 1, u: 40 }] },
    { items: [{ d: "Jet wash — patio and paths", q: 50, u: 4.5 }, { d: "Weed killer treatment", q: 1, u: 65 }] },
    { items: [{ d: "New decking installation", q: 12, u: 100 }, { d: "Skip hire", q: 1, u: 180 }] },
    { items: [{ d: "Tree surgery — crown reduction", q: 3, u: 80 }, { d: "Stump grinding", q: 1, u: 150 }] },
  ];

  let quoteNum = 1001;

  // Each customer gets 3-4 quotes spread over 12 months
  for (let ci = 0; ci < customers.length; ci++) {
    const numQuotes = 3 + Math.floor(Math.random() * 2);
    for (let qi = 0; qi < numQuotes; qi++) {
      const daysBack = Math.floor(Math.random() * 350) + 5;
      const svc = services[Math.floor(Math.random() * services.length)];
      const isPaid = Math.random() > 0.4;
      const isRecent = daysBack < 60;
      const status = isRecent && Math.random() > 0.5 ? "sent" : isPaid ? "accepted" : ["draft", "sent", "rejected"][Math.floor(Math.random() * 3)];

      if (quoteNum > 5000) continue;

      const created = daysAgo(daysBack);
      const def: QuoteDef = {
        customer: ci,
        status: status as string,
        items: svc.items,
        notes: null,
        created,
      };

      if (status === "accepted") {
        def.paid = Math.random() > 0.25;
        def.paidAt = def.paid ? daysAgo(Math.max(1, daysBack - Math.floor(Math.random() * 7) - 1)) : null;
        const jobTitle = svc.items[0].d.length > 40 ? svc.items[0].d.substring(0, 40) + "…" : svc.items[0].d;
        def.job = {
          title: `${jobTitle} — ${custData[ci].name.split(" — ")[0].split(" & ")[0].split(" Ltd")[0].trim()}`,
          date: daysAgoDate(Math.max(0, daysBack - Math.floor(Math.random() * 3))),
          start: ["08:00", "09:00", "07:30", "10:00"][Math.floor(Math.random() * 4)],
          end: ["14:00", "16:00", "17:00", "12:00"][Math.floor(Math.random() * 4)],
        };
      }

      quoteDefs.push(def);
      quoteNum++;
    }
  }

  // Insert all quotes
  let quoteCount = 0;
  for (const qd of quoteDefs) {
    const items = qd.items.map((it, idx) => ({ description: it.d, quantity: it.q, unit_price: it.u, sort_order: idx }));
    const subtotal = items.reduce((s, it) => s + it.quantity * it.unit_price, 0);
    const quoteNumber = `Q-${String(quoteCount + 1001).padStart(4, "0")}`;

    const { data: quote } = await admin.from("quotes").insert({
      user_id: userId,
      customer_id: customers[qd.customer].id,
      quote_number: quoteNumber,
      status: qd.status,
      notes: qd.notes,
      subtotal, total: subtotal,
      tax_rate: 0, tax_amount: 0,
      paid: qd.paid ?? false,
      paid_at: qd.paidAt ?? null,
      created_at: qd.created,
      updated_at: qd.created,
    }).select().single();
    if (!quote) continue;
    quoteCount++;

    await admin.from("quote_items").insert(items.map(it => ({ quote_id: quote.id, ...it })));

    if (qd.job && qd.status === "accepted") {
      const cust = customers[qd.customer];
      await admin.from("jobs").insert({
        user_id: userId, quote_id: quote.id, customer_id: cust.id, customer_name: cust.name,
        job_title: qd.job.title, job_date: qd.job.date, start_time: qd.job.start, end_time: qd.job.end,
        status: qd.job.date < daysAgoDate(0) ? "completed" : "scheduled",
        location: cust.address + ", " + cust.city,
      });
    }
  }
  console.log(`✅ Created ${quoteCount} quotes across ${customers.length} customers`);

  // Standalone jobs
  await admin.from("jobs").insert([
    { user_id: userId, customer_id: customers[20].id, customer_name: customers[20].name, job_title: "Maintenance visit — Meadowbank Care Home", job_date: futureDays(1), start_time: "09:00", end_time: "11:00", status: "scheduled" },
    { user_id: userId, customer_id: customers[32].id, customer_name: customers[32].name, job_title: "Garden tidy — Academy grounds", job_date: futureDays(3), start_time: "07:30", end_time: "15:00", status: "scheduled" },
    { user_id: userId, customer_id: customers[41].id, customer_name: customers[41].name, job_title: "Monthly check — University grounds", job_date: daysAgoDate(7), start_time: "08:00", end_time: "10:00", status: "completed" },
    { user_id: userId, customer_id: customers[25].id, customer_name: customers[25].name, job_title: "Grounds inspection — Hospital", job_date: futureDays(2), start_time: "09:00", end_time: "12:00", status: "scheduled" },
    { user_id: userId, customer_id: customers[14].id, customer_name: customers[14].name, job_title: "Retail park litter patrol", job_date: daysAgoDate(3), start_time: "06:00", end_time: "09:00", status: "completed" },
    { user_id: userId, customer_id: customers[29].id, customer_name: customers[29].name, job_title: "Church grounds maintenance", job_date: futureDays(4), start_time: "09:30", end_time: "14:00", status: "scheduled" },
  ]);
  console.log("✅ Created standalone jobs");

  // Notifications
  await admin.from("notifications").insert([
    { user_id: userId, type: "quote_accepted", quote_id: null, message: "Bennett family accepted your garden tidy quote", created_at: daysAgo(20) },
    { user_id: userId, type: "quote_accepted", quote_id: null, message: "Chester Cathedral accepted grounds maintenance quote", created_at: daysAgo(35) },
    { user_id: userId, type: "payment_received", quote_id: null, message: "Payment — Meadowbank Care Home £480", created_at: daysAgo(15) },
    { user_id: userId, type: "quote_rejected", quote_id: null, message: "Alex Porter rejected fence installation quote", created_at: daysAgo(10) },
    { user_id: userId, type: "quote_accepted", quote_id: null, message: "Priya Sharma accepted patio cleaning quote", created_at: daysAgo(5) },
    { user_id: userId, type: "payment_received", quote_id: null, message: "Payment — Chester Scouts £320", created_at: daysAgo(8) },
    { user_id: userId, type: "quote_accepted", quote_id: null, message: "Maria Gonzalez accepted hedge trimming quote", created_at: daysAgo(3) },
    { user_id: userId, type: "quote_accepted", quote_id: null, message: "Kevi O'Brien accepted tree surgery quote", created_at: daysAgo(7) },
    { user_id: userId, type: "payment_received", quote_id: null, message: "Payment — Chester Cathedral £890", created_at: daysAgo(30) },
    { user_id: userId, type: "quote_accepted", quote_id: null, message: "Chester Golf Club accepted greens maintenance", created_at: daysAgo(12) },
  ]);
  console.log("✅ Created notifications");

  console.log("\n🎉 Demo account ready!");
  console.log(`   Email: ${DEMO_EMAIL}`);
  console.log(`   Password: ${DEMO_PASSWORD}`);
  console.log(`   URL: https://quotecraft026.vercel.app`);
}

main().catch(console.error);
