import { Resend } from "resend";

type SendQuoteEmailParams = {
  to: string;
  companyName: string;
  quoteNumber: string;
  customerName: string;
  total: number;
  currencySymbol: string;
  publicUrl: string;
};

function buildQuoteEmailHtml({
  companyName,
  quoteNumber,
  customerName,
  total,
  currencySymbol,
  publicUrl,
}: SendQuoteEmailParams): string {
  const formattedTotal = `${currencySymbol}${total.toFixed(2)}`;
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06)">
          <tr>
            <td style="padding:32px 32px 0;text-align:center">
              <div style="width:48px;height:48px;background:#047857;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px">
                <span style="color:#fff;font-size:22px;font-weight:800">JS</span>
              </div>
              <h1 style="font-size:22px;font-weight:700;color:#0f172a;margin:0 0 8px">You've received a quote</h1>
              <p style="font-size:15px;color:#64748b;margin:0 0 4px">${companyName} has prepared a quote for you</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;padding:20px">
                <tr>
                  <td style="padding-bottom:8px"><span style="font-size:13px;color:#64748b">Quote</span></td>
                  <td style="text-align:right;padding-bottom:8px"><span style="font-size:13px;color:#64748b">Customer</span></td>
                </tr>
                <tr>
                  <td><span style="font-size:18px;font-weight:700;color:#0f172a">${quoteNumber}</span></td>
                  <td style="text-align:right"><span style="font-size:18px;font-weight:700;color:#0f172a">${customerName}</span></td>
                </tr>
                <tr><td colspan="2" style="height:16px"></td></tr>
                <tr>
                  <td colspan="2" style="border-top:1px solid #e5e7eb;padding-top:16px;text-align:center">
                    <span style="font-size:13px;color:#64748b">Total</span><br>
                    <span style="font-size:28px;font-weight:800;color:#047857">${formattedTotal}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;text-align:center">
              <a href="${publicUrl}" style="display:inline-block;padding:14px 32px;background:#047857;color:#fff;font-size:15px;font-weight:700;text-decoration:none;border-radius:8px">View full quote</a>
              <p style="font-size:13px;color:#94a3b8;margin:12px 0 0">Review, accept, or decline online — no account needed.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#f8fafc;text-align:center">
              <p style="font-size:12px;color:#94a3b8;margin:0">Sent via <strong style="color:#64748b">JobStacker</strong></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendQuoteEmail(
  params: SendQuoteEmailParams,
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "quotes@jobstacker.app";

  if (!apiKey) {
    return { success: false, error: "Resend API key not configured" };
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: `JobStacker <${fromEmail}>`,
      to: params.to,
      subject: `Quote ${params.quoteNumber} from ${params.companyName}`,
      html: buildQuoteEmailHtml(params),
    });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    return { success: false, error: message };
  }
}
