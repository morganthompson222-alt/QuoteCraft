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

    // Get all paid quotes with items (past 2 years)
    const { data: paidQuotes } = await supabase
      .from("quotes")
      .select("id, quote_items(description)")
      .eq("user_id", userId)
      .eq("paid", true);

    const items: string[] = [];
    for (const q of paidQuotes ?? []) {
      for (const item of (q.quote_items as any[]) ?? []) {
        const desc = (item.description ?? "").toLowerCase().trim();
        if (desc.length > 0) items.push(desc);
      }
    }

    // Normalize a service description for matching (fuzzy stem-like)
    function normalize(s: string): string {
      return s.toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    }

    function normalizeStem(s: string): string {
      // Remove common suffixes to improve matching: patio cleaning → patio clean
      return normalize(s).replace(/(ing|ings|ed|s|es)$/, "");
    }

    function matches(serviceWords: string[], item: string): boolean {
      const normItem = normalize(item);
      const stemItem = normalizeStem(item);
      for (const word of serviceWords) {
        const normWord = normalize(word);
        const stemWord = normalizeStem(word);
        // Check exact, normalized, and stemmed matches
        if (normItem === normWord) return true;
        if (stemItem.includes(stemWord) || stemWord.includes(stemItem)) return true;
        if (normItem.includes(normWord) || normWord.includes(normItem)) return true;
      }
      return false;
    }

    const costBreakdown: Array<{ service: string; perJobCost: number; jobCount: number; totalCost: number }> = [];

    for (const exp of recurring ?? []) {
      const service = (exp.linked_service as string).toLowerCase();
      const serviceWords = service.split(/\s+/).filter(w => w.length > 1);
      const matchCount = items.filter(item => matches(serviceWords, item)).length;

      if (matchCount > 0 || serviceWords.length === 0) {
        const count = matchCount || items.length || 1;
        const amount = Number(exp.amount ?? 0);
        costBreakdown.push({
          service: exp.linked_service as string,
          perJobCost: amount,
          jobCount: count,
          totalCost: amount * count,
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
