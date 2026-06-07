# UI_SPEC.md

Frontend authoritative UI expectations.

Owner:
Agent A

Product:
QuoteCraft

Audience:
Small service businesses creating customer quotes, managing customer records, and exporting quote PDFs.

---

## Product UI Principles

- Clean SaaS interface with practical density.
- Mobile responsive across authentication, dashboard, customer, quote, and preview flows.
- Production-ready states for loading, empty, error, validation, and success.
- No placeholder junk in committed UI.
- Prefer simple reusable components over clever abstractions.
- API-backed views must tolerate request failure.

---

## Authentication UI

Login page must include:
- Email field.
- Password field.
- Submit button with loading state.
- Inline validation messages.
- API error message area.
- Responsive layout.

Auth UI must not hard-code backend behavior beyond SCHEMA.md.

---

## Dashboard UI

Dashboard should prioritize:
- Customer count.
- Open quotes.
- Recently updated quotes.
- Quick actions for creating customers and quotes.
- Clear empty states.

---

## Customer UI

Customer management should include:
- Customer list.
- Search/filter UI.
- Create/edit form.
- Delete confirmation UI.
- Loading and error states.

---

## Quote UI

Quote management should include:
- Quote list.
- Quote status display.
- Create/edit quote form.
- Line item editing UI.
- Totals display.
- PDF preview entry point.
- Loading and error states.

---

## PDF Preview UI

PDF preview should include:
- Quote summary.
- Customer details.
- Line items.
- Totals.
- Export/download action once supported by SCHEMA.md.

---

## User Profile UI

Profile page should allow the user to manage their account and company settings:

- Name and email display (read-only email).
- Company name, phone, address fields.
- Logo upload placeholder (file input for image).
- Default tax rate setting.
- Save button with loading state.
- Inline validation and API error display.
- Responsive layout matching settings page style.

This should be accessible from the sidebar Settings link, either as a tab or separate section.
