import { ApiError } from "./api-error";

export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function requireBody(body: Record<string, unknown>, fields: string[]) {
  for (const field of fields) {
    if (body[field] === undefined || body[field] === null) {
      throw new ApiError(400, `Missing required field: ${field}`, "MISSING_FIELD");
    }
  }
}

export function sanitizeString(val: unknown): string {
  if (typeof val !== "string" || val.trim().length === 0) {
    throw new ApiError(400, "Invalid string value", "VALIDATION_ERROR");
  }
  return val.trim();
}

export function sanitizeEmail(val: unknown): string {
  const str = sanitizeString(val);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(str)) {
    throw new ApiError(400, "Invalid email format", "INVALID_FORMAT");
  }
  return str.toLowerCase();
}

export function sanitizeOptionalString(val: unknown): string | null {
  if (val === undefined || val === null) return null;
  if (typeof val !== "string") throw new ApiError(400, "Invalid string value", "VALIDATION_ERROR");
  const trimmed = val.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export function sanitizeOptionalEmail(val: unknown): string | null {
  if (val === undefined || val === null || val === "") return null;
  if (typeof val !== "string") throw new ApiError(400, "Invalid email format", "INVALID_FORMAT");
  const trimmed = val.trim();
  if (trimmed.length === 0) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    throw new ApiError(400, "Invalid email format", "INVALID_FORMAT");
  }
  return trimmed.toLowerCase();
}

export function sanitizeNumber(val: unknown, min = 0, max = 1_000_000): number {
  const num = Number(val);
  if (isNaN(num) || num < min || num > max) {
    throw new ApiError(400, `Number must be between ${min} and ${max}`, "VALIDATION_ERROR");
  }
  return num;
}

export function sanitizeOptionalNumber(
  val: unknown,
  min = 0,
  max = 1_000_000,
): number | null {
  if (val === undefined || val === null) return null;
  return sanitizeNumber(val, min, max);
}

export function sanitizeStringLength(val: unknown, minLen = 1, maxLen = 1000): string {
  const str = sanitizeString(val);
  if (str.length < minLen || str.length > maxLen) {
    throw new ApiError(
      400,
      `String must be between ${minLen} and ${maxLen} characters`,
      "VALIDATION_ERROR",
    );
  }
  return str;
}

export function sanitizeUuid(val: unknown): string {
  const str = sanitizeString(val);
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(str)) {
    throw new ApiError(400, "Invalid UUID format", "INVALID_FORMAT");
  }
  return str.toLowerCase();
}

export function sanitizeOptionalUuid(val: unknown): string | null {
  if (val === undefined || val === null) return null;
  return sanitizeUuid(val);
}

export function sanitizeArray<T>(
  val: unknown,
  itemValidator: (item: unknown) => T,
  minItems = 0,
  maxItems = 100,
): T[] {
  if (!Array.isArray(val)) {
    throw new ApiError(400, "Expected an array", "VALIDATION_ERROR");
  }
  if (val.length < minItems || val.length > maxItems) {
    throw new ApiError(
      400,
      `Array must have between ${minItems} and ${maxItems} items`,
      "VALIDATION_ERROR",
    );
  }
  return val.map(itemValidator);
}

export function sanitizeBoolean(val: unknown): boolean {
  if (typeof val === "boolean") return val;
  if (val === "true" || val === "1") return true;
  if (val === "false" || val === "0") return false;
  throw new ApiError(400, "Invalid boolean value", "VALIDATION_ERROR");
}

export function sanitizeEnum<T extends string>(val: unknown, allowed: readonly T[]): T {
  const str = sanitizeString(val);
  if (!allowed.includes(str as T)) {
    throw new ApiError(
      400,
      `Value must be one of: ${allowed.join(", ")}`,
      "VALIDATION_ERROR",
    );
  }
  return str as T;
}
