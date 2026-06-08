/**
 * JobStacker Database Seed Script
 * Run: npx tsx scripts/seed.ts
 *
 * Requires:
 * - SUPABASE_SERVICE_ROLE_KEY set
 * - NEXT_PUBLIC_SUPABASE_URL set
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seed() {
  console.log("🌱 Seeding JobStacker demo data...\n");

  // Create demo user
  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email: "demo@jobstacker.app",
    password: "demo123456",
    email_confirm: true,
    user_metadata: { name: "Demo User" },
  });

  if (authError) {
    console.error("Failed to create demo user:", authError.message);
    process.exit(1);
  }

  const userId = authUser.user.id;
  console.log(`  ✅ Demo user created: demo@jobstacker.app / demo123456`);

  // Create profile
  await admin.from("profiles").upsert({
    id: userId,
    company_name: "Demo Builders Ltd",
    phone: "01234 567890",
    address: "123 High Street",
    city: "London",
    state: "Greater London",
    zip: "SW1A 1AA",
    default_tax_rate: 20,
    quote_prefix: "Q-",
    next_quote_number: 5,
  });

  console.log(`  ✅ Profile created: Demo Builders Ltd`);

  // Create customers
  const customers = [
    { name: "Alice Johnson", email: "alice@example.com", phone: "07700 100001", company: "Johnson Properties" },
    { name: "Bob Smith", email: "bob@example.com", phone: "07700 100002", company: "Smith & Co" },
    { name: "Carol Davis", email: "carol@example.com", phone: "07700 100003" },
    { name: "David Wilson", email: "david@example.com", phone: "07700 100004", company: "Wilson Homes" },
    { name: "Eve Martin", email: "eve@example.com", phone: "07700 100005" },
  ];

  const customerIds: string[] = [];

  for (const c of customers) {
    const { data } = await admin
      .from("customers")
      .insert({ user_id: userId, ...c })
      .select("id")
      .single();
    if (data) customerIds.push(data.id);
  }

  console.log(`  ✅ ${customers.length} customers created`);

  // Create quotes
  const quotesData = [
    { customerIdx: 0, status: "draft", items: [
      { description: "Garden fence installation (25m)", quantity: 1, unitPrice: 850 },
      { description: "Concrete fence posts", quantity: 10, unitPrice: 12 },
      { description: "Gravel board", quantity: 8, unitPrice: 8 },
    ]},
    { customerIdx: 1, status: "sent", items: [
      { description: "Kitchen refurbishment", quantity: 1, unitPrice: 4500 },
      { description: "Tiling (40sqm)", quantity: 40, unitPrice: 35 },
    ]},
    { customerIdx: 2, status: "accepted", items: [
      { description: "Bathroom renovation", quantity: 1, unitPrice: 3200 },
      { description: "New suite installation", quantity: 1, unitPrice: 850 },
    ]},
    { customerIdx: 0, status: "draft", items: [
      { description: "Patio laying (20sqm)", quantity: 20, unitPrice: 65 },
      { description: "Indian sandstone", quantity: 22, unitPrice: 28 },
    ]},
  ];

  for (let i = 0; i < quotesData.length; i++) {
    const q = quotesData[i];
    const quoteNumber = `Q-${String(i + 1).padStart(4, "0")}`;
    const subtotal = q.items.reduce((s, item) => s + item.quantity * item.unitPrice, 0);
    const taxRate = 20;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    const { data: quote } = await admin
      .from("quotes")
      .insert({
        user_id: userId,
        customer_id: customerIds[q.customerIdx],
        quote_number: quoteNumber,
        status: q.status,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total,
      })
      .select("id")
      .single();

    if (quote) {
      for (let j = 0; j < q.items.length; j++) {
        const item = q.items[j];
        await admin.from("quote_items").insert({
          quote_id: quote.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          amount: item.quantity * item.unitPrice,
          sort_order: j,
        });
      }
    }
  }

  console.log(`  ✅ ${quotesData.length} quotes created with line items`);
  console.log(`\n🎉 Seed complete!`);
  console.log(`\nLogin: demo@jobstacker.app / demo123456`);
}

seed().catch(console.error);
