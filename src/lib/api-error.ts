export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const DEFAULT_MESSAGES: Record<number, string> = {
  400: "Bad request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not found",
  409: "Conflict",
  429: "Too many requests",
  500: "Internal server error",
};

export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    const statusCode = error.statusCode;
    return Response.json(
      {
        error: {
          message: error.message || DEFAULT_MESSAGES[statusCode] || "Unknown error",
          statusCode,
          code: error.code ?? undefined,
        },
      },
      { status: statusCode },
    );
  }

  console.error("Unhandled API error:", error);
  return Response.json(
    {
      error: {
        message: "Internal server error",
        statusCode: 500,
      },
    },
    { status: 500 },
  );
}
