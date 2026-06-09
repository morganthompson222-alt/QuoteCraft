import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ApiError, errorResponse } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "Unauthorized");

    const userId = user.id;

    // Get all per-job recurring expenses
    const { data: recurring } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .eq("recurrence", "per_job")
      .not("linked_service", "is", null);

    // Get all paid quotes with items
    const { data: paidQuotes } = await supabase
      .from("quotes")
      .select("id, quote_items(description)")
      .eq("user_id", userId)
      .eq("paid", true);

    const items: string[] = [];
    for (const q of paidQuotes ?? []) {
      for (const item of (q.quote_items as any[]) ?? []) {
        items.push((item.description ?? "").toLowerCase());
      }
    }

    // Match recurring expenses to completed jobs
    const costBreakdown: Array<{ service: string; perJobCost: number; jobCount: number; totalCost: number }> = [];

    for (const exp of recurring ?? []) {
      const service = (exp.linked_service as string).toLowerCase();
      const serviceWords = service.split(/\s+/).filter(w => w.length > 2);
      const matchCount = items.filter(item => {
        const itemLower = item.toLowerCase();
        for (const word of serviceWords) {
          if (itemLower.includes(word)) return true;
        }
        return false;
      }).length;

      if (matchCount > 0 || serviceWords.length === 0) {
        costBreakdown.push({
          service: exp.linked_service as string,
          perJobCost: exp.amount as number,
          jobCount: matchCount || items.length,
          totalCost: (exp.amount as number) * (matchCount || items.length),
        });
      }
    }

    const totalRecurringCost = costBreakdown.reduce((sum, c) => sum + c.totalCost, 0);

    return NextResponse.json({
      costBreakdown,
      totalRecurringCost,
      recurringCount: recurring?.length ?? 0,
      matchedJobs: paidQuotes?.length ?? 0,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
