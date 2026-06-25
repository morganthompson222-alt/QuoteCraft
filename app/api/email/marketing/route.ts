import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sanitizeString } from "@/lib/validation";
import { ApiError, errorResponse } from "@/lib/api-error";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "Unauthorized");

    const body = await request.json();
    const subject = sanitizeString(body.subject);
    const message = sanitizeString(body.message);

    if (!subject || !message) {
      throw new ApiError(400, "Subject and message are required");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_name")
      .eq("id", user.id)
      .single();

    const companyName = profile?.company_name ?? "Your tradesperson";

    const { data: customers } = await supabase
      .from("customers")
      .select("email, name")
      .eq("user_id", user.id)
      .not("email", "is", null)
      .not("email", "eq", "");

    if (!customers || customers.length === 0) {
      throw new ApiError(400, "No customers with email addresses");
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new ApiError(500, "Email service not configured");
    }

    const resend = new Resend(apiKey);
    const fromEmail = process.env.EMAIL_FROM || "marketing@jobstacker.app";

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f6f8">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden">
          <tr>
            <td style="padding:32px">
              <div style="width:48px;height:48px;background:#047857;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px">
                <span style="color:#fff;font-size:22px;font-weight:800">JS</span>
              </div>
              <div style="font-size:15px;color:#334155;line-height:1.7;white-space:pre-wrap">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#f8fafc;text-align:center;font-size:12px;color:#94a3b8">
              <p style="margin:0 0 4px">${companyName}</p>
              <p style="margin:0">To stop receiving emails, reply to this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const emails = customers.map((c) => ({ email: c.email, name: c.name }));

    for (const { email, name } of emails) {
      try {
        await resend.emails.send({
          from: `${companyName} <${fromEmail}>`,
          to: email,
          subject,
          html,
        });
      } catch {
        // continue sending to remaining customers
      }
    }

    return NextResponse.json({ success: true, sent: emails.length });
  } catch (error) {
    return errorResponse(error);
  }
}
