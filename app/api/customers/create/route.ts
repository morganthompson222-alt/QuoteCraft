import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  sanitizeOptionalEmail,
  sanitizeString,
  sanitizeOptionalString,
} from "@/lib/validation";
import { ApiError, errorResponse } from "@/lib/api-error";
import { enforcePlanLimit } from "@/lib/plan-enforcement";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new ApiError(401, "Unauthorized");

    await enforcePlanLimit(user.id, "create_customer");

    const body = await request.json();
    const name = sanitizeString(body.name);
    const email = sanitizeOptionalEmail(body.email);
    const phone = sanitizeOptionalString(body.phone);

    if (!email && !phone) {
      throw new ApiError(400, "Email or phone is required", "VALIDATION_ERROR");
    }

    const customer = {
      user_id: user.id,
      email,
      name,
      phone,
      company: sanitizeOptionalString(body.company),
      address: sanitizeOptionalString(body.address),
      city: sanitizeOptionalString(body.city),
      state: sanitizeOptionalString(body.state),
      zip: sanitizeOptionalString(body.zip),
    };

    const { data, error } = await supabase
      .from("customers")
      .insert(customer)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new ApiError(409, "A customer with this email already exists");
      }
      throw new ApiError(400, error.message);
    }

    return NextResponse.json({
      id: data.id,
      email: data.email,
      name: data.name,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
