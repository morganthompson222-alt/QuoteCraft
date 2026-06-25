# JobStacker — Production Test Checklist

## Auth & Onboarding
- [ ] Sign up with new email — account creates successfully
- [ ] Login with existing account — redirects to dashboard
- [ ] Logout — clears session, returns to landing page
- [ ] Guided tour — appears for new accounts, highlights each page
- [ ] TOS/Privacy checkbox — required on signup form
- [ ] Terms & Privacy pages — load with full legal content
- [ ] "Create account" button disabled until form valid

## Dashboard
- [ ] Stats cards show correct values: customers, open quotes, revenue
- [ ] "Jobs next 3 days" card shows upcoming jobs
- [ ] Mini 3-day calendar renders correctly with green "Today" highlight
- [ ] Clicking calendar jobs navigates to Schedule page
- [ ] "New customer" and "New quote" buttons work

## Customers
- [ ] All customers visible (not paginated to 10)
- [ ] Real quote counts shown (not "0")
- [ ] Click customer row — expands to show details, jobs, quotes
- [ ] "New quote" button pre-fills customer
- [ ] "View quote" links open quote preview
- [ ] Edit customer — updates reflected on list
- [ ] Delete customer — confirmation dialog, deletes successfully
- [ ] Search customers — filters by name, company, email

## Quotes
- [ ] Create quote — selects customer, adds items, sets tax, saves
- [ ] Quote list — shows all quotes with correct status badges
- [ ] Scheduled column — shows "View in calendar" or "Schedule this job"
- [ ] Quote preview — loads with line items, totals, notes
- [ ] Status transitions work: draft → sent → accepted/rejected/expired
- [ ] Mark paid / unpaid toggle works
- [ ] Attach image — uploads and displays (3.5MB limit)

## Quote Actions: Send & Share
- [ ] Send button (draft quotes) — dropdown appears
- [ ] "Share link" — copies link AND marks quote as sent
- [ ] "Download PDF" — downloads PDF without changing status
- [ ] After PDF download in draft — "Mark as sent" button appears
- [ ] Share button — opens dropdown with WhatsApp, Email, SMS, Copy
- [ ] WhatsApp link — opens wa.me with correct quote link
- [ ] Email link — opens mailto with subject and body
- [ ] Native share — works on mobile
- [ ] Copy link — copies to clipboard, shows feedback

## PDF Exports
- [ ] Quote PDF — downloads with company name, phone, email (no address)
- [ ] Logo appears top-right in PDF (if uploaded)
- [ ] Status always shows "SENT" in PDF regardless of actual status
- [ ] Reminder PDF — "PAYMENT DUE" watermark diagonal, correct positioning
- [ ] Receipt PDF — "PAID" watermark, green styling, Date Paid field
- [ ] Sender info: company name, phone, email only (no address)

## Public Customer Page (/q/[id])
- [ ] Loads without authentication (logged out visitors)
- [ ] Shows company branding, quote details, all items and totals
- [ ] When status is "sent" — shows Accept / Decline buttons
- [ ] Click Accept — green "You have accepted" banner
- [ ] Click Decline — red "You have declined" banner
- [ ] When expired — shows "Expired" banner + "Request New Quote" button
- [ ] Click "Request New Quote" — creates notification for trader
- [ ] Attached image visible (if any)
- [ ] Notes visible in grey box
- [ ] Cannot accept/reject already-accepted quotes

## Calendar & Scheduling
- [ ] Monthly grid view renders correctly
- [ ] Grid/List toggle switches views
- [ ] Month navigation (arrows, Today button) works
- [ ] Completed jobs show in green chips on grid
- [ ] Cancelled jobs show in red chips on grid
- [ ] In-progress jobs show in yellow/amber
- [ ] Click job chip — detail modal opens
- [ ] Detail modal: customer, date, time, status, notes
- [ ] "View quote" button in detail modal navigates to quote
- [ ] List view: filter tabs (All/Scheduled/In Progress/Completed/Cancelled)
- [ ] List view: inline status change dropdown works
- [ ] List view: sorted soonest to furthest (ascending date)
- [ ] "+ New job" button opens JobModal
- [ ] JobModal: link to accepted quote dropdown
- [ ] JobModal: sets customer name, date, time, creates job
- [ ] Export .ics (paid plans) — downloads calendar file
- [ ] Export PDF (detail modal) — downloads job sheet

## Finance Hub (/finance)
- [ ] Loads with correct revenue, expenses, profit stats
- [ ] Charts render: line chart and bar chart
- [ ] Time selector: 3/6/12 months works
- [ ] Add expense — saves with category, amount, recurrence
- [ ] Per-job expenses with linked service — cost sync works
- [ ] AI accountant — answers questions using real financial data
- [ ] AI recognizes similar services (patio clean = patio cleaning)
- [ ] CSV export (paid plans) — downloads correctly
- [ ] Large numbers don't overflow containers
- [ ] Bar chart Y-axis scales correctly

## Revenue Dashboard (/revenue)
- [ ] 4 stat cards: lifetime, this month, last month, % change
- [ ] Month-over-month % shows correct colour (+green, -red)
- [ ] SVG line chart renders with gradient fill
- [ ] Bar chart toggle works
- [ ] Time selector: 3/6/12 months
- [ ] Empty state: "No revenue yet" message when no data
- [ ] CSV export (paid plans) — downloads correctly
- [ ] Current month always shown as default

## Service Catalogue
- [ ] Generate catalogue — creates text from quote history
- [ ] 12 templates in dropdown: Modern, Tradesperson, Luxury, etc.
- [ ] Template preview mini-card updates when switching
- [ ] 25 colour themes visible as swatches
- [ ] Colour change reflects on preview
- [ ] Download PDF — creates multi-page catalogue
- [ ] PDF uses selected template and colour
- [ ] Watermark on Free/Business tiers
- [ ] No watermark on Solo Pro/Growth/Enterprise
- [ ] AI Clean button — reformats instructions text

## Notifications
- [ ] Bell icon shows in top bar
- [ ] Unread count badge (red circle with number)
- [ ] Click bell — dropdown shows notifications
- [ ] Click notification — navigates to relevant quote/job
- [ ] Mark as read when opening dropdown
- [ ] Notifications created on: quote accepted, rejected, payment received

## Plans & Billing
- [ ] Plan cards show: Solo, Solo Pro, Business, Growth, Enterprise
- [ ] Solo Pro shows "Free until Sep 2026"
- [ ] Business/Growth/Enterprise show "Contact for info" buttons
- [ ] "Contact for info" opens mailto: link
- [ ] Test mode: plan switcher in settings works
- [ ] Sidebar shows current plan name

## Settings & Profile
- [ ] Logo upload — drag & drop, click to browse, 3.5MB limit
- [ ] Logo preview shows after upload
- [ ] Logo appears on PDFs after upload
- [ ] Profile fields: name, company, phone, address, tax rate, prefix
- [ ] AI pricing instructions — save and retrieve
- [ ] AI Clean button — cleans up messy pricing notes
- [ ] Service catalogue generate button works
- [ ] Template + colour + download controls visible in view mode

## Mobile/Responsive
- [ ] Calendar grid fits viewport (no horizontal overflow)
- [ ] Quote table wraps properly on small screens
- [ ] Customer list rows are tappable
- [ ] Navigation sidebar works on mobile
- [ ] Forms are usable with on-screen keyboard
- [ ] Charts are readable on small screens

## Cross-Feature Integration
- [ ] Mark quote accepted → job appears in calendar
- [ ] Mark job completed → status syncs to quote
- [ ] Mark quote paid → receipt PDF available, revenue updates
- [ ] Archive quote → hidden from active views
- [ ] Changing plan tier → limits update immediately
- [ ] Navigating between pages — fresh data loads on each visit
