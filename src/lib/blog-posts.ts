export type BlogCategory = "Leads" | "Quoting" | "Business Growth" | "Administration";

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  pillarSlug?: string;
  readTime: string;
  date: string;
  author: string;
  content: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "how-electricians-can-get-more-leads",
    title: "How Electricians in the UK Can Get More Leads (2026 Guide)",
    excerpt:
      "Stop relying on word of mouth alone. Practical ways electricians can generate a steady stream of new customers, from Google Maps to referrals and repeat business.",
    category: "Leads",
    pillarSlug: "leads-for-tradespeople",
    readTime: "5 min",
    date: "2026-06-20",
    author: "Morgan Thompson",
    content: [
      "Most electricians start their business through word of mouth. A friend needs a fusebox upgrade, a neighbour recommends you, and before you know it you've got enough work to keep you busy. But relying on word of mouth alone means your income is unpredictable. When referrals dry up, so does your pipeline.",
      "The most successful electricians treat lead generation as a system, not an accident. See the full <a href='/leads-for-tradespeople'>lead generation guide for tradespeople</a> for a complete breakdown of every channel.",
      "1. Make it easy for customers to find you online. When someone searches for 'electrician near me', Google shows three local results before anything else. Make sure your Google Business Profile is claimed, verified, and has recent photos and reviews. Respond to every review — good and bad — within 48 hours.",
      "2. Send professional quotes every time. A handwritten quote on a scrap of paper doesn't inspire confidence. Use <a href='/crm-for-electricians'>JobStacker for electricians</a> to send branded PDF quotes that look professional and include your company details, payment terms, and a clear breakdown of costs. Customers are far more likely to choose a tradesperson who looks organised.",
      "3. Ask for referrals at the right moment. The best time to ask for a referral is right after you've completed a job and the customer is happy. Not two weeks later when they've forgotten. JobStacker makes it easy to send a follow-up message after job completion.",
      "4. Follow up on every quote. Research shows that 80% of sales require at least five follow-up calls. Most tradespeople send one quote and never follow up. Use <a href='/electrician-lead-management-software'>lead management software</a> to track which quotes are outstanding and follow up after 3, 7, and 14 days.",
      "5. Build a referral network. Introduce yourself to estate agents, letting agents, and kitchen showrooms. These businesses regularly need reliable electricians they can recommend to their customers. Leave them a stack of business cards and a short intro about your services.",
      "Most tradespeople end up losing track of leads using notes or spreadsheets. Tools like JobStacker help centralise everything so nothing slips through. <a href='/signup'>Start free — no credit card needed.</a>",
    ],
  },
  {
    slug: "how-plumbers-can-stop-losing-customers",
    title: "How Plumbers in the UK Can Stop Losing Customers",
    excerpt:
      "Plumbing is a relationship business. Here's how to keep customers coming back instead of calling your competitors, with practical tips for UK plumbers.",
    category: "Leads",
    pillarSlug: "leads-for-tradespeople",
    readTime: "4 min",
    date: "2026-06-18",
    author: "Morgan Thompson",
    content: [
      "Plumbing businesses thrive on repeat customers. A homeowner who trusts you with their boiler service is likely to call you for their bathroom renovation, their leaky tap, and their emergency call-out. But one bad experience — or even just a forgettable one — and they'll try someone else next time.",
      "For a complete system, see the <a href='/leads-for-tradespeople'>lead generation guide for tradespeople</a>.",
      "1. Respond fast. When a customer calls about a burst pipe or a leaking boiler, speed is everything. If you're busy and can't answer, make sure your voicemail tells them when you'll call back. Return every enquiry within 2 hours, even if it's just to say 'I can come on Thursday.'",
      "2. Keep detailed customer records. When Mrs Jones calls about her boiler, you should be able to look up her address, the make and model of her boiler, when it was last serviced, and what work you did previously. <a href='/crm-for-plumbers'>JobStacker for plumbers</a> stores all of this so you don't have to remember it.",
      "3. Send reminders for annual services. Most homeowners forget when their boiler was last serviced. Set up reminders to send a friendly message when their annual service is due. This generates predictable, recurring work.",
      "4. Always follow up after a job. The day after you complete a job, send a text or email asking if everything is working properly. This small gesture builds trust and gives customers confidence that you care about your work.",
      "5. Make paying easy. Send professional invoices with clear payment terms. JobStacker lets you mark jobs as paid, generate receipts, and track who still owes. Customers appreciate clarity around pricing and payment.",
      "Most tradespeople end up losing track of leads using notes or spreadsheets. Tools like JobStacker help centralise everything so nothing slips through. <a href='/signup'>Start free — no credit card needed.</a>",
    ],
  },
  {
    slug: "how-to-price-electrical-work",
    title: "How to Price Electrical Work in the UK (2026 Rates Guide)",
    excerpt:
      "Getting your pricing right is the difference between profit and burnout. A complete guide to pricing electrical work, with example calculations and markups for UK electricians.",
    category: "Quoting",
    pillarSlug: "quoting-guide-for-tradespeople",
    readTime: "6 min",
    date: "2026-06-15",
    author: "Morgan Thompson",
    content: [
      "Pricing is the single most important skill in any trade business. Price too low and you work hard for no profit. Price too high and you lose jobs. Getting it right requires understanding your costs, your time, and your value. For a complete overview, read the <a href='/quoting-guide-for-tradespeople'>quoting guide for tradespeople</a>.",
      "For electricians, pricing typically falls into three categories: fixed price for defined jobs, day rate for larger projects, and call-out charge for emergency work. Most electricians use a mix of all three.",
      "Fixed price jobs — like fitting a new consumer unit or installing an EV charger — should account for materials, labour, and a contingency for unexpected issues. A good rule of thumb is to add 20% to your material costs to cover wastage and trips to the wholesaler.",
      "Day rates for larger projects should reflect your overheads. Don't forget to include van costs, insurance, training, tools, and admin time. Many electricians forget to account for the time spent quoting, buying materials, and doing paperwork.",
      "Call-out charges should be high enough to make emergency work worth your time. A typical UK call-out charge ranges from £60 to £120 depending on your area. Always be clear about what the call-out covers and what constitutes a separate charge.",
      "The best tool for getting pricing right is a proper quoting system. <a href='/quote-software'>JobStacker's quote software</a> lets you create itemised quotes with labour, materials, and markups — so you never forget to include a cost again. <a href='/signup'>Try it free.</a>",
    ],
  },
  {
    slug: "how-to-write-a-professional-plumbing-quote",
    title: "How to Write a Professional Plumbing Quote (UK Template)",
    excerpt:
      "A professional quote is your best sales tool. Learn what to include and how to format it for maximum acceptance rates as a UK plumber.",
    category: "Quoting",
    pillarSlug: "quoting-guide-for-tradespeople",
    readTime: "4 min",
    date: "2026-06-12",
    author: "Morgan Thompson",
    content: [
      "Your quote is often the first professional document a customer sees from your business. It's your opportunity to build trust, demonstrate competence, and differentiate yourself from competitors who send handwritten estimates on scrap paper. See the <a href='/quoting-guide-for-tradespeople'>complete quoting guide</a> for more detail.",
      "A professional plumbing quote should include: your company name, address, phone number, and logo at the top; the customer's name and address; a unique quote number for reference; a detailed breakdown of work to be done; itemised costs for labour, parts, and materials; the total price including VAT; payment terms; valid-until date; and your terms and conditions.",
      "Formatting matters. Use clear headings, consistent spacing, and a readable font. Group related items together. Show subtotals and totals clearly. A well-formatted quote can increase your acceptance rate by 30% or more.",
      "<a href='/quote-software'>JobStacker's quoting software</a> generates professional PDF quotes with all of these elements built in. Your company details, logo, and payment terms are included automatically. Just add the line items and send.",
      "The best quotes also include a clear call to action. Tell the customer what happens next: 'To accept this quote, click the link below and confirm. We'll schedule the work within 48 hours of your acceptance.'",
      "Most tradespeople end up losing track of quotes using paper or spreadsheets. Tools like JobStacker help centralise everything so nothing slips through. <a href='/signup'>Start free — no credit card needed.</a>",
    ],
  },
  {
    slug: "best-apps-for-tradespeople",
    title: "Best Apps for Tradespeople in the UK (2026)",
    excerpt:
      "Running a trade business means juggling customers, quotes, jobs, and finances. These are the best UK apps to make it easier.",
    category: "Business Growth",
    pillarSlug: "grow-trade-business",
    readTime: "5 min",
    date: "2026-06-10",
    author: "Morgan Thompson",
    content: [
      "Tradespeople wear many hats. You're the salesperson, the project manager, the accountant, the customer service team, and the person doing the actual work. The right apps can save you hours every week. For a complete system, see the <a href='/grow-trade-business'>guide to growing a trade business</a>.",
      "<a href='/trade-business-management-app'>JobStacker (that's us)</a> is the all-in-one solution for managing customers, quotes, jobs, and invoices. But there are other tools that pair well with it depending on your needs.",
      "For bookkeeping and accounting, Xero and FreeAgent are popular choices among UK tradespeople. They handle VAT returns, self-assessment, and bank reconciliation. JobStacker handles the quoting and scheduling, while your accounting software handles the tax side.",
      "For marketing and lead generation, Google Business Profile is essential. It's free and it's how most customers find local tradespeople. Keep your profile updated with photos, services, and responses to reviews.",
      "For communication, WhatsApp Business is surprisingly powerful. You can create quick quotes, send photos, and keep customer conversations organised with labels.",
      "For payment processing, SumUp and iZettle let you take card payments on site. JobStacker lets you mark jobs as paid and generate receipts, so you can track which payments are from card and which are from cash or bank transfer.",
      "The key is to find tools that work together rather than having ten disconnected apps. JobStacker can be your central hub for customer and job management, connected to your accounting and payment tools. <a href='/signup'>Start free — no credit card needed.</a>",
    ],
  },
  {
    slug: "how-to-grow-a-service-business",
    title: "How to Grow a Service Business in the UK (2026 System)",
    excerpt:
      "Growing a trade business isn't just about doing more work. It's about building systems that scale. A complete UK guide to growing without burning out.",
    category: "Business Growth",
    pillarSlug: "grow-trade-business",
    readTime: "7 min",
    date: "2026-06-08",
    author: "Morgan Thompson",
    content: [
      "Every tradesperson reaches a point where they have more work than they can handle alone. The temptation is to just work harder — longer hours, fewer days off, more jobs squeezed into each day. But that's a recipe for burnout, not growth. For a complete system, see the <a href='/grow-trade-business'>guide to growing a trade business</a>.",
      "Real growth comes from building systems. Here's a framework for scaling your trade business.",
      "System 1: Customer acquisition. Don't rely on word of mouth alone. Build multiple lead channels — Google Business Profile, recommendations from estate agents, repeat customer referrals, and a simple website. Track where each customer comes from so you know what's working.",
      "System 2: Quoting and sales. Create a standard quoting process. Every customer gets a professional quote within 24 hours, sent via <a href='/quote-software'>JobStacker's quoting software</a> with a share link they can accept online. Follow up on every quote that hasn't been accepted after 7 days.",
      "System 3: Job delivery. Standardise how you deliver each type of job. Create checklists for common jobs (boiler service, bathroom install, emergency call-out). Use JobStacker to track job status and customer communication.",
      "System 4: Financial management. Know your numbers — revenue, costs, profit per job, overheads, and tax liability. JobStacker's dashboard shows your revenue, outstanding quotes, and upcoming jobs at a glance.",
      "System 5: Team building. When you're ready to hire, document your processes first. Write down how you quote, how you schedule, how you communicate with customers. Then when you hire, they can follow your system instead of learning by trial and error.",
      "Most tradespeople end up losing track of their business using disconnected tools. JobStacker helps centralise everything so you can scale. <a href='/signup'>Start free — no credit card needed.</a>",
    ],
  },
  {
    slug: "how-to-manage-customers-without-spreadsheets",
    title: "How to Manage Customers Without Spreadsheets (UK Guide)",
    excerpt:
      "Spreadsheets are better than paper, but they're still not the right tool for managing a trade business. Here's what UK tradespeople should use instead.",
    category: "Administration",
    pillarSlug: "trade-business-administration",
    readTime: "4 min",
    date: "2026-06-05",
    author: "Morgan Thompson",
    content: [
      "Every tradesperson starts with a spreadsheet. A list of customers, some basic contact details, and maybe a column for notes. It works when you have 10 customers. When you have 50, it starts to creak. When you have 100, it breaks. See the <a href='/trade-business-administration'>trade business administration guide</a> for a complete system.",
      "Spreadsheets have fundamental problems for customer management: they're hard to search, easy to break, impossible to access on site, and they don't connect to your quoting or scheduling.",
      "A proper customer management system solves all of these problems. <a href='/crm-software'>JobStacker's CRM</a> stores every customer with their name, address, phone number, email, and full job history. You can search by any field, access it from your phone, and see every quote and job linked to that customer.",
      "The biggest advantage of a proper system is the connections it makes. When you create a quote for a customer, it's automatically linked to their record. When they accept, the job is scheduled. When the job is complete, you can mark it paid. Everything flows without re-typing information.",
      "If you're still using a spreadsheet, spend 30 minutes setting up JobStacker and adding your customers. You'll wonder why you didn't do it sooner. <a href='/signup'>Start free — no credit card needed.</a>",
    ],
  },
  {
    slug: "best-crm-for-tradespeople",
    title: "Best CRM for Tradespeople in the UK (2026)",
    excerpt:
      "Not all CRM software is created equal. Here's what UK tradespeople should look for and which options are worth considering.",
    category: "Administration",
    pillarSlug: "trade-business-administration",
    readTime: "5 min",
    date: "2026-06-03",
    author: "Morgan Thompson",
    content: [
      "CRM stands for Customer Relationship Management. In plain English, it's software that helps you manage your customer interactions. For tradespeople, a good CRM should do more than just store contact details — it should help you quote, schedule, invoice, and track every customer interaction. See the <a href='/trade-business-administration'>trade business administration guide</a>.",
      "Generic CRMs like HubSpot and Salesforce are designed for sales teams. They're overcomplicated for tradespeople and missing the specific features you need — like job scheduling, quoting with materials, and invoice tracking.",
      "A trade-specific CRM like <a href='/crm-software'>JobStacker</a> is built around how tradespeople actually work. You create a quote, the customer accepts, and the job appears on your calendar. You complete the job, mark it paid, and the customer record is updated. Everything flows naturally from one step to the next.",
      "When evaluating CRM options, look for: easy quoting with PDF export, job scheduling with calendar view, customer management with search, invoice and payment tracking, mobile access, and UK-specific features like GBP and VAT.",
      "JobStacker covers all of these. It's built for UK tradespeople and free to start. <a href='/signup'>Try it free.</a>",
    ],
  },
];
