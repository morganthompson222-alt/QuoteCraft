export async function parseApiError(response: Response): Promise<string> {
  try {
    const json = await response.json();
    const error = json?.error;
    if (typeof error === "string") return error;
    if (error && typeof error.message === "string") return error.message;
    if (typeof json?.message === "string") return json.message;
    return "Something went wrong.";
  } catch {
    return "Something went wrong.";
  }
}
